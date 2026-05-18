import { useState, useMemo } from 'react'
import data from '../radius_perfiles.json'
import { calcRow } from './utils/pricing'
import { exportPdf } from './utils/exportPdf'
import ParameterPanel from './components/ParameterPanel'
import ProfileSelector from './components/ProfileSelector'
import ResultsTable from './components/ResultsTable'
import QuotePreview from './components/QuotePreview'

const DEFAULT_PARAMS = {
  tipoCambio: data.meta.parametros_default.tipo_cambio_mxn_usd,
  descuento: data.meta.parametros_default.descuento_vs_mercado * 100,
  horasMes: data.meta.parametros_default.horas_laborales_mes,
}

const ALL_ROLES = [...new Set(data.perfiles.map(p => p.rol_comercial_us))].sort()

export default function App() {
  const [rawParams, setRawParams] = useState(DEFAULT_PARAMS)
  const [filters, setFilters] = useState({
    role: '',
    bloque: '',
    levels: ['Junior', 'Mid', 'Senior'],
  })
  // Map<id, qty> — tracks selection and per-profile headcount
  const [selectedItems, setSelectedItems] = useState(new Map())
  const [showPreview, setShowPreview] = useState(false)

  const params = useMemo(() => ({
    tipoCambio: rawParams.tipoCambio,
    descuento: rawParams.descuento / 100,
    horasMes: rawParams.horasMes,
  }), [rawParams])

  const rows = useMemo(() => {
    return data.perfiles
      .filter(p => {
        if (filters.role && p.rol_comercial_us !== filters.role) return false
        if (filters.bloque && p.bloque !== filters.bloque) return false
        if (!filters.levels.includes(p.nivel)) return false
        return true
      })
      .map(p => calcRow(p, params))
  }, [filters, params])

  const handleParamChange = (key, val) => setRawParams(prev => ({ ...prev, [key]: val }))
  const handleFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))

  const toggleRow = (id) => {
    setSelectedItems(prev => {
      const next = new Map(prev)
      next.has(id) ? next.delete(id) : next.set(id, 1)
      return next
    })
  }

  const setQty = (id, qty) => {
    setSelectedItems(prev => {
      const next = new Map(prev)
      next.set(id, qty)
      return next
    })
  }

  const toggleAll = (visibleRows) => {
    const allSelected = visibleRows.every(r => selectedItems.has(r.id))
    setSelectedItems(prev => {
      const next = new Map(prev)
      if (allSelected) {
        visibleRows.forEach(r => next.delete(r.id))
      } else {
        visibleRows.forEach(r => { if (!next.has(r.id)) next.set(r.id, 1) })
      }
      return next
    })
  }

  const handleDownload = () => {
    const exportRows = buildExportRows()
    exportPdf(exportRows, params)
  }

  const buildExportRows = () => {
    // All rows across all profiles (not just visible), filtered by selection
    const allRows = data.perfiles.map(p => calcRow(p, params))
    if (selectedItems.size > 0) {
      return allRows
        .filter(r => selectedItems.has(r.id))
        .map(r => ({ ...r, qty: selectedItems.get(r.id) }))
    }
    return rows.map(r => ({ ...r, qty: 1 }))
  }

  const canPreview = selectedItems.size > 0 || rows.length > 0
  const selectedCount = selectedItems.size

  return (
    <div className="min-h-screen bg-slate-100">
      {showPreview && (
        <QuotePreview
          rows={data.perfiles.map(p => calcRow(p, params))}
          selectedItems={selectedItems.size > 0 ? selectedItems : new Map(rows.map(r => [r.id, 1]))}
          params={params}
          onClose={() => setShowPreview(false)}
          onDownload={() => { handleDownload(); setShowPreview(false) }}
        />
      )}

      {/* Top nav */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold tracking-tight">RADIUS</span>
            <span className="mx-3 text-blue-400">|</span>
            <span className="text-sm text-blue-200 font-medium">US Nearshore Staffing · Rate Card Builder</span>
          </div>
          <div className="text-xs text-blue-300">
            {data.meta.total_perfiles} profiles loaded
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Parameters */}
        <ParameterPanel params={rawParams} onChange={handleParamChange} />

        {/* Selector */}
        <ProfileSelector roles={ALL_ROLES} filters={filters} onFilter={handleFilter} />

        {/* Results header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-700">
            Results
            <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              {rows.length}
            </span>
          </h2>

          <button
            onClick={() => setShowPreview(true)}
            disabled={!canPreview}
            className="flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white shadow
              hover:bg-blue-800 active:bg-blue-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {selectedCount > 0
              ? `Preview Quote (${selectedCount} selected)`
              : 'Preview Quote (all visible)'}
          </button>
        </div>

        {/* Table */}
        <ResultsTable
          rows={rows}
          selectedItems={selectedItems}
          onToggle={toggleRow}
          onToggleAll={toggleAll}
          onSetQty={setQty}
        />
      </main>
    </div>
  )
}
