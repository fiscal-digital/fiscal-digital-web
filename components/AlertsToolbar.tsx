'use client'

import { RssSimple } from '@phosphor-icons/react'
import { SearchBar } from './SearchBar'
import { FilterBar } from './FilterBar'
import { SortDropdown } from './SortDropdown'
import { LimitSelector } from './LimitSelector'
import { ViewToggle } from './ViewToggle'
import { API_URL } from '@/lib/api'
import type { SortOption, ViewOption } from '@/lib/hooks/useAlertsQueryParams'

interface AlertsToolbarProps {
  search: string
  filters: { state: string; city: string; type: string; riskMin: number; riskMax: number }
  sort: SortOption
  limit: number
  view: ViewOption
  onSearchChange: (search: string) => void
  onFilterChange: (filters: any) => void
  onSortChange: (sort: SortOption) => void
  onLimitChange: (limit: number) => void
  onViewChange: (view: ViewOption) => void
  stateFilter: string
}

const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: 'Mais recentes', value: 'dateDesc' },
  { label: 'Mais antigos', value: 'dateAsc' },
  { label: 'Risco (alto→baixo)', value: 'riskDesc' },
  { label: 'Risco (baixo→alto)', value: 'riskAsc' },
  { label: 'Valor (alto→baixo)', value: 'valueDesc' },
  { label: 'Valor (baixo→alto)', value: 'valueAsc' },
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
  stateFilter,
}: AlertsToolbarProps) {
  const rssUrl = (() => {
    const p = new URLSearchParams()
    if (filters.city) p.set('city', filters.city)
    else if (filters.state) p.set('state', filters.state)
    if (filters.type) p.set('type', filters.type)
    return `${API_URL}/rss${p.size > 0 ? `?${p.toString()}` : ''}`
  })()

  return (
    <div className="space-y-4">
      {/* Row 1: Search */}
      <SearchBar value={search} onChange={onSearchChange} placeholder="Buscar por CNPJ, contrato, fornecedor..." />

      {/* Row 2: Filters + Sort + Limit + View + RSS */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-brand-gray/15 bg-white p-4 shadow-sm">
        <FilterBar
          state={filters.state}
          city={filters.city}
          type={filters.type}
          riskMin={filters.riskMin}
          riskMax={filters.riskMax}
          onFilterChange={onFilterChange}
          allLabel="Todas"
        />

        <div className="flex gap-3">
          <SortDropdown value={sort} onChange={onSortChange} options={SORT_OPTIONS} />
          <LimitSelector value={limit} onChange={onLimitChange} options={LIMIT_OPTIONS} />
          <ViewToggle value={view} onChange={onViewChange} />
        </div>

        {/* RSS */}
        <a
          href={rssUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-amber/40 bg-brand-amber/10 px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-amber/20"
        >
          <RssSimple size={14} weight="fill" className="text-brand-amber" />
          Assinar RSS
        </a>
      </div>
    </div>
  )
}
