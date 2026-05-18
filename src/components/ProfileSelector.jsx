const LEVELS = ['Junior', 'Mid', 'Senior']

export default function ProfileSelector({ roles, filters, onFilter }) {
  const toggleLevel = (lvl) => {
    const next = filters.levels.includes(lvl)
      ? filters.levels.filter(l => l !== lvl)
      : [...filters.levels, lvl]
    if (next.length > 0) onFilter('levels', next)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-900">
        Profile Selector
      </h2>
      <div className="flex flex-wrap items-end gap-6">
        {/* Role dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Role
          </label>
          <select
            value={filters.role}
            onChange={e => onFilter('role', e.target.value)}
            className="w-72 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">— All roles —</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Level toggle buttons */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Level
          </label>
          <div className="flex gap-2">
            {LEVELS.map(lvl => {
              const active = filters.levels.includes(lvl)
              return (
                <button
                  key={lvl}
                  onClick={() => toggleLevel(lvl)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors
                    ${active
                      ? 'bg-blue-900 text-white'
                      : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {lvl}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
