const LEVELS = ['Junior', 'Mid', 'Senior']

export default function ProfileSelector({ roles, filters, onFilter }) {
  const toggleLevel = (lvl) => {
    const next = filters.levels.includes(lvl)
      ? filters.levels.filter(l => l !== lvl)
      : [...filters.levels, lvl]
    if (next.length > 0) onFilter('levels', next)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#FF1B37]">
        Profile Selector
      </h2>
      <div className="flex flex-wrap items-end gap-6">
        {/* Role dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Role
          </label>
          <select
            value={filters.role}
            onChange={e => onFilter('role', e.target.value)}
            className="w-72 rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#1C1C1C]
              focus:border-[#FF1B37] focus:outline-none focus:ring-2 focus:ring-[#FF1B37]/20 transition-colors"
          >
            <option value="">— All roles —</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Level toggle buttons */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Level
          </label>
          <div className="flex gap-2">
            {LEVELS.map(lvl => {
              const active = filters.levels.includes(lvl)
              return (
                <button
                  key={lvl}
                  onClick={() => toggleLevel(lvl)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors
                    ${active
                      ? 'bg-[#FF1B37] text-white'
                      : 'border border-slate-200 bg-white text-slate-500 hover:border-[#FF1B37]/40 hover:text-[#FF1B37]'
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
