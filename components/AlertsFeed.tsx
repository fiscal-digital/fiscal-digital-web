'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Warning, WarningCircle, Bell, CurrencyDollar, MapPin } from '@phosphor-icons/react'
import { useAlertsQueryParams } from '@/lib/hooks/useAlertsQueryParams'
import { API_URL } from '@/lib/api'
import { findingTypeLabel, FINDING_TYPE_LABELS } from '@/lib/findings'
import { SearchBar } from './SearchBar'
import { AlertsToolbar } from './AlertsToolbar'
import { MobileFilterButton } from './MobileFilterButton'
import { FilterBottomSheet } from './FilterBottomSheet'
import { AlertsGrid } from './AlertsGrid'
import { AlertsList } from './AlertsList'
import { PaginationControls } from './PaginationControls'

// ── Types ────────────────────────────────────────────────────────────────────

export interface Finding {
  id: string
  type: string
  cityId: string
  city: string
  state: string
  riskScore: number
  confidence: number
  value?: number
  secretaria?: string
  cnpj?: string
  contractNumber?: string
  legalBasis?: string
  narrative?: string
  source: string
  createdAt: string
  evidence?: Array<{ source: string; excerpt: string; date: string }>
}

interface PageInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
  totalValue: number
  citiesCount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCompactBrl(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`
  return `R$ ${value.toFixed(0)}`
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function matchesSearch(finding: Finding, query: string): boolean {
  if (!query) return true
  const normalized = normalizeText(query)

  const fieldsToSearch = [
    finding.city,
    finding.cnpj || '',
    finding.contractNumber || '',
    finding.narrative || '',
    finding.secretaria || '',
    findingTypeLabel(finding.type, 'pt'),
  ]

  return fieldsToSearch.some((f) => normalizeText(f).includes(normalized))
}

function applySorting(findings: Finding[], sortBy: string): Finding[] {
  const sorted = [...findings]
  const getGazetteDate = (f: Finding): number => {
    const gazetteDate = f.evidence?.[0]?.date
    return gazetteDate ? new Date(gazetteDate).getTime() : 0
  }
  switch (sortBy) {
    case 'riskDesc':
      return sorted.sort((a, b) => b.riskScore - a.riskScore)
    case 'riskAsc':
      return sorted.sort((a, b) => a.riskScore - b.riskScore)
    case 'dateDesc':
      return sorted.sort((a, b) => getGazetteDate(b) - getGazetteDate(a))
    case 'dateAsc':
      return sorted.sort((a, b) => getGazetteDate(a) - getGazetteDate(b))
    case 'valueDesc':
      return sorted.sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    case 'valueAsc':
      return sorted.sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
    default:
      return sorted
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-brand-gray/15 bg-white p-5">
      <div className="mb-3 flex gap-2">
        <div className="h-5 w-28 rounded-pill bg-brand-gray/15" />
        <div className="h-5 w-16 rounded-pill bg-brand-gray/10" />
      </div>
      <div className="mb-2 h-4 w-3/4 rounded bg-brand-gray/15" />
      <div className="mb-1 h-3 w-full rounded bg-brand-gray/10" />
      <div className="h-3 w-5/6 rounded bg-brand-gray/10" />
      <div className="mt-4 flex justify-between">
        <div className="h-3 w-20 rounded bg-brand-gray/10" />
        <div className="h-3 w-24 rounded bg-brand-gray/10" />
      </div>
    </div>
  )
}

// ── KPI Bar ───────────────────────────────────────────────────────────────────

interface KpiBarProps {
  pageInfo: PageInfo | null
  fallback: Finding[]
  locale: 'pt' | 'en'
  t: ReturnType<typeof useTranslations<'alertas'>>
}

function KpiBar({ pageInfo, fallback, locale, t }: KpiBarProps) {
  const stats = useMemo(() => {
    if (pageInfo) {
      return {
        count: pageInfo.total,
        totalValue: pageInfo.totalValue,
        cities: pageInfo.citiesCount,
      }
    }
    const totalValue = fallback.reduce((sum, f) => sum + (f.value ?? 0), 0)
    const cities = new Set(fallback.map((f) => f.cityId)).size
    return { count: fallback.length, totalValue, cities }
  }, [pageInfo, fallback])

  if (stats.count === 0) return null

  return (
    <dl className="mb-6 grid gap-3 sm:grid-cols-3">
      <KpiCard
        icon={<Bell size={18} weight="bold" className="text-brand-teal" />}
        label={t('kpi.alerts')}
        value={stats.count.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US')}
      />
      <KpiCard
        icon={<CurrencyDollar size={18} weight="bold" className="text-brand-teal" />}
        label={t('kpi.totalValue')}
        value={stats.totalValue > 0 ? formatCompactBrl(stats.totalValue) : '—'}
      />
      <KpiCard
        icon={<MapPin size={18} weight="bold" className="text-brand-teal" />}
        label={t('kpi.cities')}
        value={stats.cities.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US')}
      />
    </dl>
  )
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-gray/15 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <dt className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-gray">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="font-mono text-3xl font-bold text-brand-ink tabular-nums sm:text-4xl">{value}</dd>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface AlertsFeedProps {
  locale: string
}

export default function AlertsFeed({ locale }: AlertsFeedProps) {
  const t = useTranslations('alertas')
  const lang: 'pt' | 'en' = locale === 'en' ? 'en' : 'pt'
  const pathname = usePathname()

  const { params, setParams } = useAlertsQueryParams()

  const [findings, setFindings] = useState<Finding[]>([])
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Fetch findings
  useEffect(() => {
    setLoading(true)
    setError(false)

    const controller = new AbortController()
    const qs = new URLSearchParams()
    if (params.state) qs.set('state', params.state)
    if (params.city) qs.set('city', params.city)
    if (params.type) qs.set('type', params.type)

    const url = `${API_URL}/alerts${qs.size > 0 ? `?${qs.toString()}` : ''}`

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Finding[] | { items?: Finding[]; pageInfo?: PageInfo }) => {
        const items = Array.isArray(data) ? data : data.items ?? []
        setFindings(items)
        setPageInfo(Array.isArray(data) ? null : data.pageInfo ?? null)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(true)
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [params.state, params.city, params.type])

  // Filter, sort, paginate
  const filtered = useMemo(() => {
    let result = findings.filter((f) => {
      if (!matchesSearch(f, params.search)) return false
      // Filter by gazette year (evidence[0] is the primary source)
      if (f.evidence?.[0]?.date) {
        const gazetteYear = parseInt(f.evidence[0].date.split('-')[0], 10)
        if (gazetteYear < params.yearMin || gazetteYear > params.yearMax) return false
      }
      return true
    })
    result = applySorting(result, params.sort)
    return result
  }, [findings, params.search, params.yearMin, params.yearMax, params.sort])

  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / params.limit)
  const start = (params.page - 1) * params.limit
  const pageItems = filtered.slice(start, start + params.limit)

  const typeLabel = (type: string): string => {
    return findingTypeLabel(type, lang)
  }

  return (
    <div>
      {/* KPIs */}
      {!loading && !error && <KpiBar pageInfo={pageInfo} fallback={findings} locale={lang} t={t} />}

      {/* Desktop Toolbar */}
      <div className="mb-6 hidden sm:block">
        <AlertsToolbar
          search={params.search}
          filters={{
            state: params.state,
            city: params.city,
            type: params.type,
            yearMin: params.yearMin,
            yearMax: params.yearMax,
          }}
          sort={params.sort}
          limit={params.limit}
          view={params.view}
          onSearchChange={(s) => setParams({ search: s, page: 1 })}
          onFilterChange={(f) => setParams({ ...f, page: 1 })}
          onSortChange={(s) => setParams({ sort: s })}
          onLimitChange={(l) => setParams({ limit: l, page: 1 })}
          onViewChange={(v) => setParams({ view: v })}
          stateFilter={params.state}
        />
      </div>

      {/* Mobile Toolbar */}
      <div className="mb-6 flex gap-2 sm:hidden">
        <SearchBar
          value={params.search}
          onChange={(s) => setParams({ search: s, page: 1 })}
          placeholder="Buscar..."
        />
        <MobileFilterButton onClick={() => setShowMobileFilters(true)} />
      </div>

      <FilterBottomSheet
        isOpen={showMobileFilters}
        filters={{
          state: params.state,
          city: params.city,
          type: params.type,
          yearMin: params.yearMin,
          yearMax: params.yearMax,
        }}
        onFilterChange={(f) => {
          setParams({ ...f, page: 1 })
          setShowMobileFilters(false)
        }}
        onClose={() => setShowMobileFilters(false)}
      />

      {/* Loading */}
      {loading && (
        <div>
          <p className="sr-only">{t('loading')}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-6 py-12 text-center">
          <WarningCircle size={40} className="text-brand-danger" />
          <p className="text-brand-ink">{t('error')}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-brand-paper transition-opacity hover:opacity-90"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && findings.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-gray/15 bg-brand-paper px-6 py-12 text-center">
          <Warning size={40} className="text-brand-amber" />
          <p className="font-semibold text-brand-ink">{t('empty')}</p>
          <p className="text-sm text-brand-gray">{t('empty_desc')}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && findings.length > 0 && (
        <>
          {params.view === 'grid' ? (
            <AlertsGrid findings={pageItems} typeLabel={typeLabel} />
          ) : (
            <AlertsList findings={pageItems} typeLabel={typeLabel} />
          )}

          {/* Pagination */}
          <PaginationControls
            page={params.page}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={params.limit}
            onPageChange={(p) => setParams({ page: p })}
          />
        </>
      )}
    </div>
  )
}
