'use client'

import { RssSimple } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import { SearchBar } from './SearchBar'
import { FilterBar, type FilterUpdate } from './FilterBar'
import { SortDropdown } from './SortDropdown'
import { AlertsPrefsButton } from './AlertsPrefsButton'
import { API_URL } from '@/lib/api'
import type { SortOption, ViewOption } from '@/lib/hooks/useAlertsQueryParams'

interface AlertsToolbarProps {
  search: string
  filters: { state: string; city: string; type: string; yearMin: number; yearMax: number }
  sort: SortOption
  limit: number
  view: ViewOption
  onSearchChange: (search: string) => void
  onFilterChange: (filters: FilterUpdate) => void
  onSortChange: (sort: SortOption) => void
  onLimitChange: (limit: number) => void
  onViewChange: (view: ViewOption) => void
  stateFilter: string
  hideLocation?: boolean
  locale?: 'pt-br' | 'en-us'
}

const SORT_OPTIONS_PT: Array<{ label: string; value: SortOption }> = [
  { label: 'Mais recentes', value: 'dateDesc' },
  { label: 'Mais antigos', value: 'dateAsc' },
  { label: 'Risco (alto→baixo)', value: 'riskDesc' },
  { label: 'Risco (baixo→alto)', value: 'riskAsc' },
  { label: 'Valor (alto→baixo)', value: 'valueDesc' },
  { label: 'Valor (baixo→alto)', value: 'valueAsc' },
]

const SORT_OPTIONS_EN: Array<{ label: string; value: SortOption }> = [
  { label: 'Most recent', value: 'dateDesc' },
  { label: 'Oldest', value: 'dateAsc' },
  { label: 'Risk (high→low)', value: 'riskDesc' },
  { label: 'Risk (low→high)', value: 'riskAsc' },
  { label: 'Value (high→low)', value: 'valueDesc' },
  { label: 'Value (low→high)', value: 'valueAsc' },
]

const LIMIT_OPTIONS = [20, 30, 50]

export function AlertsToolbar({
  search,
  filters,
  sort,
  limit,
  view,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onLimitChange,
  onViewChange,
  hideLocation,
  locale = 'pt-br',
}: AlertsToolbarProps) {
  const t = useTranslations('alertas.toolbar')

  const rssUrl = (() => {
    const p = new URLSearchParams()
    if (filters.city) p.set('city', filters.city)
    else if (filters.state) p.set('state', filters.state)
    if (filters.type) p.set('type', filters.type)
    return `${API_URL}/rss${p.size > 0 ? `?${p.toString()}` : ''}`
  })()

  const sortOptions = locale === 'en-us' ? SORT_OPTIONS_EN : SORT_OPTIONS_PT

  return (
    <div className="space-y-3">
      {/* Linha 1 — Busca + RSS + Preferências */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <SearchBar value={search} onChange={onSearchChange} placeholder={t('search.placeholder')} />
        </div>
        <a
          href={rssUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-amber/40 bg-brand-amber/10 px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-amber/20"
          aria-label={t('rss.aria')}
        >
          <RssSimple size={14} weight="fill" className="text-brand-amber" />
          {t('rss.label')}
        </a>
        <AlertsPrefsButton
          limit={limit}
          view={view}
          onLimitChange={onLimitChange}
          onViewChange={onViewChange}
          limitOptions={LIMIT_OPTIONS}
          labels={{
            button: t('prefs.button'),
            perPage: t('prefs.perPage'),
            view: t('prefs.view'),
            grid: t('prefs.grid'),
            list: t('prefs.list'),
          }}
        />
      </div>

      {/* Linha 2 — Filtros + Ordenar */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-brand-gray/15 bg-white p-4 shadow-sm">
        <FilterBar
          state={filters.state}
          city={filters.city}
          type={filters.type}
          yearMin={filters.yearMin}
          yearMax={filters.yearMax}
          onFilterChange={onFilterChange}
          allLabel={t('common.all')}
          hideLocation={hideLocation}
          locale={locale}
        />

        <SortDropdown value={sort} onChange={onSortChange} options={sortOptions} label={t('sort.label')} />
      </div>
    </div>
  )
}
