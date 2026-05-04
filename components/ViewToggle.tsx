'use client'

import { List, GridFour } from '@phosphor-icons/react'
import type { ViewOption } from '@/lib/hooks/useAlertsQueryParams'

interface ViewToggleProps {
  value: ViewOption
  onChange: (view: ViewOption) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
        Visualizar
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onChange('grid')}
          className={`rounded-md p-2 transition-colors ${
            value === 'grid'
              ? 'bg-brand-teal text-brand-paper'
              : 'border border-brand-gray/25 bg-white text-brand-ink hover:bg-brand-gray/10'
          }`}
          title="Visualização em grid"
          aria-label="Visualização em grid"
        >
          <GridFour size={16} weight="bold" />
        </button>
        <button
          onClick={() => onChange('list')}
          className={`rounded-md p-2 transition-colors ${
            value === 'list'
              ? 'bg-brand-teal text-brand-paper'
              : 'border border-brand-gray/25 bg-white text-brand-ink hover:bg-brand-gray/10'
          }`}
          title="Visualização em lista"
          aria-label="Visualização em lista"
        >
          <List size={16} weight="bold" />
        </button>
      </div>
    </div>
  )
}
