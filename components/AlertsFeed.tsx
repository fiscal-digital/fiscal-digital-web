'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getRiskLevel, getRiskLabel } from '@/lib/brand'
import { API_URL } from '@/lib/api'
import { ArrowSquareOut, Warning, WarningCircle } from '@phosphor-icons/react'

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
  legalBasis?: string
  narrative?: string
  source: string
  createdAt: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BR_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

const ALERT_TYPES = [
  'dispensa_irregular',
  'fracionamento',
  'aditivo_abusivo',
  'prorrogacao_excessiva',
  'cnpj_jovem',
  'concentracao_fornecedor',
  'pico_nomeacoes',
  'rotatividade_anormal',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

// Risk badge colors using Tailwind classes based on brand scale
function riskBadgeClass(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'bg-risk-critical text-white'
  if (level === 'alert')    return 'bg-risk-alert text-brand-ink'
  if (level === 'low')      return 'bg-risk-low text-white'
  return 'bg-brand-gray text-white'
}

// Type badge colors: red for critical fraud types, orange for excessive types
function typeBadgeClass(type: string): string {
  const red = ['dispensa_irregular', 'fracionamento', 'cnpj_jovem']
  const orange = ['aditivo_abusivo', 'prorrogacao_excessiva', 'concentracao_fornecedor']
  if (red.includes(type)) return 'bg-brand-danger/10 text-brand-danger'
  if (orange.includes(type)) return 'bg-brand-amber/15 text-brand-ink'
  return 'bg-brand-gray/10 text-brand-gray'
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

// ── Finding Card ──────────────────────────────────────────────────────────────

interface CardProps {
  finding: Finding
  typeLabel: (type: string) => string
  t: ReturnType<typeof useTranslations<'alertas'>>
  locale: string
}

function FindingCard({ finding, typeLabel, t, locale }: CardProps) {
  const riskLabel = getRiskLabel(finding.riskScore, locale as 'pt-br' | 'en')

  return (
    <article className="rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header: badges */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClass(finding.type)}`}>
          {typeLabel(finding.type)}
        </span>
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}>
          {t('card.riskScore')} {finding.riskScore} — {riskLabel}
        </span>
      </div>

      {/* City + state */}
      <p className="mb-2 text-sm font-semibold text-brand-ink">
        {finding.city} · <span className="text-brand-gray">{finding.state}</span>
      </p>

      {/* Narrative */}
      {finding.narrative && (
        <p className="mb-3 text-sm leading-relaxed text-brand-gray">
          {truncate(finding.narrative, 150)}
        </p>
      )}

      {/* Metadata row */}
      <dl className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-gray">
        {finding.value != null && (
          <div className="flex gap-1">
            <dt className="font-medium">{t('card.value')}:</dt>
            <dd className="font-mono">{formatCurrency(finding.value)}</dd>
          </div>
        )}
        {finding.secretaria && (
          <div className="flex gap-1">
            <dt className="font-medium">{t('card.secretaria')}:</dt>
            <dd>{finding.secretaria}</dd>
          </div>
        )}
        {finding.legalBasis && (
          <div className="flex gap-1">
            <dt className="font-medium">Base legal:</dt>
            <dd>{finding.legalBasis}</dd>
          </div>
        )}
        <div className="flex gap-1">
          <dt className="font-medium">{t('card.date')}:</dt>
          <dd className="font-mono">{formatDate(finding.createdAt)}</dd>
        </div>
      </dl>

      {/* Footer: source link + confidence */}
      <div className="flex items-center justify-between border-t border-brand-gray/10 pt-3">
        <span className="text-xs text-brand-gray">
          {t('card.confidence')}: {Math.round(finding.confidence * 100)}%
        </span>
        <a
          href={finding.source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-1.5 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
        >
          {t('card.source')}
          <ArrowSquareOut size={12} weight="bold" />
        </a>
      </div>
    </article>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface AlertsFeedProps {
  locale: string
}

export default function AlertsFeed({ locale }: AlertsFeedProps) {
  const t = useTranslations('alertas')

  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [stateFilter, setStateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const fetchAlerts = () => {
    setLoading(true)
    setError(false)

    const params = new URLSearchParams()
    if (stateFilter) params.set('state', stateFilter)
    if (typeFilter) params.set('type', typeFilter)

    const url = `${API_URL}/alerts${params.size > 0 ? `?${params.toString()}` : ''}`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Finding[] | { items?: Finding[] }) => {
        const items = Array.isArray(data) ? data : (data.items ?? [])
        setFindings(items)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  // Refetch when filters change
  useEffect(() => {
    fetchAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter, typeFilter])

  const typeLabel = (type: string): string => {
    // Use translation if key exists, fall back to raw type
    const key = `types.${type}` as Parameters<typeof t>[0]
    try {
      return t(key)
    } catch {
      return type
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-state" className="text-xs font-semibold text-brand-gray uppercase tracking-wider">
            {t('filters.state')}
          </label>
          <select
            id="filter-state"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          >
            <option value="">{t('filters.all')}</option>
            {BR_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-type" className="text-xs font-semibold text-brand-gray uppercase tracking-wider">
            {t('filters.type')}
          </label>
          <select
            id="filter-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          >
            <option value="">{t('filters.all')}</option>
            {ALERT_TYPES.map((type) => (
              <option key={type} value={type}>{typeLabel(type)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div>
          <p className="sr-only">{t('loading')}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-6 py-12 text-center">
          <WarningCircle size={40} className="text-brand-danger" />
          <p className="text-brand-ink">{t('error')}</p>
          <button
            onClick={fetchAlerts}
            className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-brand-paper transition-opacity hover:opacity-90"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {!loading && !error && findings.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-gray/15 bg-brand-paper px-6 py-12 text-center">
          <Warning size={40} className="text-brand-amber" />
          <p className="font-semibold text-brand-ink">{t('empty')}</p>
          <p className="text-sm text-brand-gray">{t('empty_desc')}</p>
        </div>
      )}

      {!loading && !error && findings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {findings.map((f) => (
            <FindingCard
              key={f.id}
              finding={f}
              typeLabel={typeLabel}
              t={t}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  )
}
