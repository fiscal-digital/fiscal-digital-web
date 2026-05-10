'use client'

import { CaretDown } from '@phosphor-icons/react'
import type { SortOption } from '@/lib/hooks/useAlertsQueryParams'

interface SortDropdownProps {
  value: SortOption
  onChange: (sort: SortOption) => void
  options: Array<{ label: string; value: SortOption }>
  label?: string
}

export function SortDropdown({ value, onChange, options, label = 'Ordenar' }: SortDropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="sort-dropdown" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
        {label}
      </label>
      <div className="relative">
        <select
          id="sort-dropdown"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="appearance-none rounded-md border border-brand-gray/25 bg-white px-3 py-2 pr-8 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <CaretDown
          size={12}
          weight="bold"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-gray"
        />
      </div>
    </div>
  )
}
