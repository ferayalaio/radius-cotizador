import { fmtUSD, fmtPct } from '../utils/pricing'
import logo from '../assets/radius_logo.jpeg'

const TH = ({ children, right }) => (
  <th className={`whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-white/60 ${right ? 'text-right' : 'text-left'}`}>
    {children}
  </th>
)

const TD = ({ children, right, bold, orange, muted, mono }) => (
  <td className={`px-3 py-2 text-sm
    ${right ? 'text-right' : ''}
    ${bold ? 'font-bold' : ''}
    ${orange ? 'text-[#FF1B37] font-semibold' : muted ? 'text-slate-400' : 'text-[#1C1C1C]'}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#1C1C1C] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Radius" className="h-8 w-8 rounded-lg object-cover" />
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Rate Card Preview</p>
              <p className="text-white font-bold text-base mt-0.5 leading-none">Quote Summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {/* Params bar */}
        <div className="bg-[#F5F3F0] border-b border-slate-200 px-6 py-2.5 text-xs text-slate-500 flex gap-5 shrink-0">
          <span>Exchange: <strong className="text-[#1C1C1C]">MXN {params.tipoCambio}</strong></span>
          <span>Discount: <strong className="text-[#1C1C1C]">{(params.descuento * 100).toFixed(0)}%</strong></span>
          <span>Hrs/month: <strong className="text-[#1C1C1C]">{params.horasMes}</strong></span>
          <span>Date: <strong className="text-[#1C1C1C]">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="bg-[#1C1C1C] sticky top-0">
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
                <tr key={`${r.id}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F3F0]/60'}>
                  <TD muted>{i + 1}</TD>
                  <TD>
                    <span className="font-semibold text-[#1C1C1C]">{r.rol_comercial_us}</span>
                    {r.es_estimado && <span className="ml-1.5 text-amber-500 text-xs" title="Tasa estimada">⚠</span>}
                  </TD>
                  <TD>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${r.nivel === 'Senior' ? 'bg-[#1C1C1C] text-white'
                        : r.nivel === 'Mid' ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-500'}`}>
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
              <tr className="bg-[#1C1C1C]">
                <td colSpan={6} className="px-3 py-3 text-sm font-bold text-white/60 text-right uppercase tracking-widest">
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
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600
                hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg bg-[#FF1B37] px-5 py-2 text-sm font-semibold text-white
                hover:bg-[#e01530] transition-colors"
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
