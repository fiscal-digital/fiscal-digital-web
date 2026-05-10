'use client'

import { X } from '@phosphor-icons/react'
import { CITIES } from '@/lib/cities'
import { findingTypeLabel } from '@/lib/findings'
import type { FilterUpdate } from './FilterBar'

interface AlertsAppliedFiltersProps {
  state: string
  city: string
  type: string
  yearMin: number
  yearMax: number
  defaultYearMin: number
  defaultYearMax: number
  onChange: (next: FilterUpdate) => void
  onClearAll: () => void
  locale: 'pt-br' | 'en-us'
  labels: {
    title: string
    clearAll: string
  }
}

interface Chip {
  key: string
  label: string
  onRemove: () => void
}

export function AlertsAppliedFilters({
  state,
  city,
  type,
  yearMin,
  yearMax,
  defaultYearMin,
  defaultYearMax,
  onChange,
  onClearAll,
  locale,
  labels,
}: AlertsAppliedFiltersProps) {
  const chips: Chip[] = []

  if (city) {
    const c = Object.values(CITIES).find((c) => c.cityId === city)
    chips.push({
      key: 'city',
      label: c ? `${c.name} (${c.uf})` : city,
      onRemove: () => onChange({ city: '' }),
    })
  } else if (state) {
    chips.push({
      key: 'state',
      label: state,
      onRemove: () => onChange({ state: '' }),
    })
  }

  if (type) {
    chips.push({
      key: 'type',
      label: findingTypeLabel(type, locale),
      onRemove: () => onChange({ type: '' }),
    })
  }

  if (yearMin !== defaultYearMin || yearMax !== defaultYearMax) {
    chips.push({
      key: 'years',
      label: yearMin === yearMax ? `${yearMin}` : `${yearMin}–${yearMax}`,
      onRemove: () => onChange({ yearMin: defaultYearMin, yearMax: defaultYearMax }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" data-testid="alerts-applied-filters">
      <span className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
        {labels.title}
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-pill bg-brand-teal/10 px-2.5 py-1 text-xs font-semibold text-brand-teal"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="rounded p-0.5 hover:bg-brand-teal/20 focus:outline-none focus:ring-1 focus:ring-brand-teal"
            aria-label={`Remover filtro ${chip.label}`}
          >
            {/* pointer-events-none no ícone para que clicks centro-alinhados
                do Playwright caiam no <button> e não no SVG path. */}
            <X size={11} weight="bold" className="pointer-events-none" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs font-semibold text-brand-teal underline hover:text-brand-teal/80"
      >
        {labels.clearAll}
      </button>
    </div>
  )
}
