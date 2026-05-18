export default function ParameterPanel({ params, onChange }) {
  const field = (label, key, min, max, step, suffix) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={params[key]}
          onChange={e => onChange(key, Number(e.target.value))}
          className="w-28 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
    </div>
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-900">
        Parameters
      </h2>
      <div className="flex flex-wrap gap-6">
        {field('Exchange Rate MXN/USD', 'tipoCambio', 1, 100, 0.5, 'MXN per USD')}
        {field('Discount vs. Market', 'descuento', 0, 60, 1, '%')}
        {field('Hours / Month', 'horasMes', 80, 240, 8, 'hrs')}
      </div>
    </div>
  )
}
