'use client'

interface LimitSelectorProps {
  value: number
  onChange: (limit: number) => void
  options: number[]
}

export function LimitSelector({ value, onChange, options }: LimitSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
        Por página
      </label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
              value === opt
                ? 'bg-brand-teal text-brand-paper'
                : 'border border-brand-gray/25 bg-white text-brand-ink hover:bg-brand-gray/10'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
