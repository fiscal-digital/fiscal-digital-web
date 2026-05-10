'use client'

import { Tag } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import { findingTypeLabel, FINDING_TYPE_FAMILIES } from '@/lib/findings'
import { LocationCombobox } from './LocationCombobox'
import { YearRangeSlider } from './YearRangeSlider'

export interface FilterUpdate {
  state?: string
  city?: string
  type?: string
  yearMin?: number
  yearMax?: number
}

interface FilterBarProps {
  state: string
  city: string
  type: string
  yearMin: number
  yearMax: number
  onFilterChange: (filters: FilterUpdate) => void
  allLabel: string
  hideLocation?: boolean
  locale?: 'pt-br' | 'en-us'
}

export function FilterBar({
  state,
  city,
  type,
  yearMin,
  yearMax,
  onFilterChange,
  allLabel,
  hideLocation,
  locale = 'pt-br',
}: FilterBarProps) {
  const t = useTranslations('alertas.toolbar')

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
      {!hideLocation && (
        <div className="flex-1 min-w-[220px] max-w-md">
          <LocationCombobox
            state={state}
            city={city}
            onChange={({ state: s, city: c }) => onFilterChange({ state: s, city: c })}
            allLabel={allLabel}
            placeholder={t('location.label')}
            searchPlaceholder={t('location.searchPlaceholder')}
            stateBadge={t('location.stateBadge')}
          />
        </div>
      )}

      <div className="flex flex-col gap-1 min-w-[200px]">
        <label htmlFor="filter-type" className="text-xs font-semibold uppercase tracking-wider text-brand-gray inline-flex items-center gap-1.5">
          <Tag size={12} weight="bold" />
          {t('type.label')}
        </label>
        <select
          id="filter-type"
          value={type}
          onChange={(e) => onFilterChange({ type: e.target.value })}
          className="rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="">{allLabel}</option>
          {FINDING_TYPE_FAMILIES.map((fam) => (
            <optgroup key={fam.key} label={fam.labels[locale]}>
              {fam.types.map((tp) => (
                <option key={tp} value={tp}>
                  {findingTypeLabel(tp, locale)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[240px] max-w-sm">
        <YearRangeSlider
          yearMin={yearMin}
          yearMax={yearMax}
          onChange={({ yearMin: ymin, yearMax: ymax }) =>
            onFilterChange({ yearMin: ymin, yearMax: ymax })
          }
          label={t('period.label')}
        />
      </div>
    </div>
  )
}
