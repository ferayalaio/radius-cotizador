import { fmtUSD, fmtPct } from '../utils/pricing'

const TH = ({ children, right }) => (
  <th
    className={`whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/60
      ${right ? 'text-right' : 'text-left'}`}
  >
    {children}
  </th>
)

const TD = ({ children, right, orange, mono }) => (
  <td
    className={`px-4 py-2.5 text-sm
      ${right ? 'text-right' : ''}
      ${orange ? 'font-semibold text-[#FF1B37]' : 'text-[#1C1C1C]'}
      ${mono ? 'font-mono' : ''}`}
  >
    {children}
  </td>
)

export default function ResultsTable({ rows, selectedItems, onToggle, onToggleAll, onSetQty }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
        No profiles match the current filters.
      </div>
    )
  }

  const allSelected = rows.every(r => selectedItems.has(r.id))
  const someSelected = rows.some(r => selectedItems.has(r.id))
  const totalSelected = selectedItems.size

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#1C1C1C]">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = !allSelected && someSelected }}
                  onChange={() => onToggleAll(rows)}
                  className="h-4 w-4 rounded cursor-pointer accent-[#FF1B37]"
                />
              </th>
              <TH>Role</TH>
              <TH>Level</TH>
              <TH right>Cost USD/hr</TH>
              <TH right>Sell USD/hr</TH>
              <TH right>Sell USD/mo</TH>
              <TH right>Margin %</TH>
              <TH right>Market USD/hr</TH>
              <TH right>Qty</TH>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {rows.map((r, i) => {
              const selected = selectedItems.has(r.id)
              const qty = selectedItems.get(r.id) ?? 1
              return (
                <tr
                  key={r.id}
                  className={`transition-colors hover:bg-[#FF1B37]/5 cursor-pointer
                    ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                    ${selected ? 'bg-[#FF1B37]/5!' : ''}`}
                  onClick={() => onToggle(r.id)}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggle(r.id)}
                      onClick={e => e.stopPropagation()}
                      className="h-4 w-4 rounded cursor-pointer accent-[#FF1B37]"
                    />
                  </td>
                  <TD>
                    <span className="font-semibold text-[#1C1C1C]">{r.rol_comercial_us}</span>
                    {r.es_estimado && (
                      <span
                        title="Estimated market rate — verify before sending"
                        className="ml-1.5 text-amber-500 cursor-help"
                      >
                        ⚠
                      </span>
                    )}
                  </TD>
                  <TD>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${r.nivel === 'Senior' ? 'bg-[#1C1C1C] text-white'
                        : r.nivel === 'Mid' ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-500'}`}>
                      {r.nivel}
                    </span>
                  </TD>
                  <TD right mono>{fmtUSD(r.costoUsdHr)}</TD>
                  <TD right mono orange={r.ajustadoPorPiso}>
                    {fmtUSD(r.precioVentaHr)}
                    {r.ajustadoPorPiso && (
                      <span title="Price adjusted by minimum margin floor" className="ml-1 text-[#FF1B37]/60 text-xs">↑</span>
                    )}
                  </TD>
                  <TD right mono orange={r.ajustadoPorPiso}>{fmtUSD(r.precioVentaMes, 0)}</TD>
                  <TD right mono>
                    <span className={r.margen >= 0.4 ? 'text-emerald-600' : 'text-amber-500'}>
                      {fmtPct(r.margen)}
                    </span>
                  </TD>
                  <TD right mono>{fmtUSD(r.tarifa_mercado_usd_hr)}</TD>
                  <td className="px-3 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                    {selected ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onSetQty(r.id, Math.max(1, qty - 1))}
                          className="w-6 h-6 rounded border border-slate-200 bg-white text-slate-500
                            hover:border-[#FF1B37] hover:text-[#FF1B37] text-sm font-bold leading-none
                            flex items-center justify-center transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={e => {
                            const v = parseInt(e.target.value, 10)
                            if (v >= 1) onSetQty(r.id, v)
                          }}
                          className="w-10 text-center border border-slate-200 rounded text-sm py-0.5
                            font-semibold text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#FF1B37]/20
                            focus:border-[#FF1B37]"
                        />
                        <button
                          onClick={() => onSetQty(r.id, qty + 1)}
                          className="w-6 h-6 rounded border border-slate-200 bg-white text-slate-500
                            hover:border-[#FF1B37] hover:text-[#FF1B37] text-sm font-bold leading-none
                            flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {rows.length} profile{rows.length !== 1 ? 's' : ''} shown
          {someSelected && ` · ${totalSelected} selected`}
        </span>
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="text-[#FF1B37]">■</span> Price adjusted by margin floor
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500">⚠</span> Estimated market rate
          </span>
        </div>
      </div>
    </div>
  )
}
