import { fmtUSD, fmtPct } from '../utils/pricing'

const TH = ({ children, right }) => (
  <th className={`whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-blue-100 ${right ? 'text-right' : 'text-left'}`}>
    {children}
  </th>
)

const TD = ({ children, right, bold, orange, muted, mono }) => (
  <td className={`px-3 py-2 text-sm
    ${right ? 'text-right' : ''}
    ${bold ? 'font-bold' : ''}
    ${orange ? 'text-orange-600 font-semibold' : muted ? 'text-slate-400' : 'text-slate-700'}
    ${mono ? 'font-mono' : ''}`}>
    {children}
  </td>
)

export default function QuotePreview({ rows, selectedItems, params, onClose, onDownload }) {
  const quoteRows = rows
    .filter(r => selectedItems.has(r.id))
    .map(r => ({ ...r, qty: selectedItems.get(r.id) }))

  const grandTotal = quoteRows.reduce((sum, r) => sum + r.precioVentaMes * r.qty, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-900 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">RADIUS · Rate Card Preview</p>
            <p className="text-white font-bold text-lg mt-0.5">Quote Summary</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Params bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 text-xs text-slate-500 flex gap-5 shrink-0">
          <span>Exchange: <strong className="text-slate-700">MXN {params.tipoCambio}</strong></span>
          <span>Discount: <strong className="text-slate-700">{(params.descuento * 100).toFixed(0)}%</strong></span>
          <span>Hrs/month: <strong className="text-slate-700">{params.horasMes}</strong></span>
          <span>Date: <strong className="text-slate-700">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="bg-blue-900 sticky top-0">
              <tr>
                <TH>#</TH>
                <TH>Role</TH>
                <TH>Level</TH>
                <TH right>Qty</TH>
                <TH right>Sell USD/hr</TH>
                <TH right>Sell USD/mo</TH>
                <TH right>Total USD/mo</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quoteRows.map((r, i) => (
                <tr key={`${r.id}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <TD muted>{i + 1}</TD>
                  <TD>
                    <span className="font-medium text-slate-800">{r.rol_comercial_us}</span>
                    {r.es_estimado && <span className="ml-1.5 text-amber-500 text-xs" title="Tasa estimada">⚠</span>}
                  </TD>
                  <TD>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium
                      ${r.nivel === 'Senior' ? 'bg-blue-100 text-blue-800'
                        : r.nivel === 'Mid' ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'}`}>
                      {r.nivel}
                    </span>
                  </TD>
                  <TD right bold>{r.qty}</TD>
                  <TD right mono orange={r.ajustadoPorPiso}>{fmtUSD(r.precioVentaHr)}</TD>
                  <TD right mono orange={r.ajustadoPorPiso}>{fmtUSD(r.precioVentaMes, 0)}</TD>
                  <TD right mono bold>{fmtUSD(r.precioVentaMes * r.qty, 0)}</TD>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-900">
                <td colSpan={7} className="px-3 py-3 text-sm font-bold text-white text-right uppercase tracking-wide">
                  Grand Total / Month
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold text-white text-base">
                  {fmtUSD(grandTotal, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400">
            {quoteRows.length} profile{quoteRows.length !== 1 ? 's' : ''}
            {' · '}
            {quoteRows.reduce((s, r) => s + r.qty, 0)} person{quoteRows.reduce((s, r) => s + r.qty, 0) !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
