'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowSquareOut, ArrowRight, Warning, WarningCircle } from '@phosphor-icons/react'
import { getRiskLevel, getRiskLabel } from '@/lib/brand'
import { API_URL } from '@/lib/api'
import { FINDING_TYPE_LABELS, findingIdToSlug } from '@/lib/findings'

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
  // BUG-WEB-004 / UH-WEB-008: API expõe evidence[].date — usado para detectar backfill
  evidence?: Array<{ source: string; excerpt: string; date: string }>
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BR_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

// BUG-WEB-004: lista de tipos vem do source de verdade (lib/findings).
// Antes era array hardcoded de 8; hoje cobre os 18 tipos catalogados.
const ALERT_TYPES = Object.keys(FINDING_TYPE_LABELS)

const BACKFILL_GAP_DAYS = 30

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number, locale: 'pt-br' | 'en'): string {
  return value.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatCompactBrl(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`
  return `R$ ${value.toFixed(0)}`
}

function formatDate(iso: string, locale: 'pt-br' | 'en'): string {
  const d = new Date(iso)
  return d.toLocaleDateString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

function gapDaysBetween(gazetteIso?: string, detectedIso?: string): number {
  if (!gazetteIso || !detectedIso) return 0
  try {
    const g = new Date(gazetteIso).getTime()
    const d = new Date(detectedIso).getTime()
    return Math.floor((d - g) / 86400000)
  } catch {
    return 0
  }
}

function riskBadgeClass(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'bg-risk-critical text-white'
  if (level === 'alert')    return 'bg-risk-alert text-brand-ink'
  if (level === 'low')      return 'bg-risk-low text-white'
  return 'bg-brand-gray text-white'
}

function typeBadgeClass(type: string): string {
  const red = ['dispensa_irregular', 'fracionamento', 'cnpj_jovem', 'inexigibilidade_sem_justificativa', 'nepotismo_indicio']
  const orange = ['aditivo_abusivo', 'prorrogacao_excessiva', 'concentracao_fornecedor', 'pico_nomeacoes', 'rotatividade_anormal', 'publicidade_eleitoral']
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

// ── KPIs ──────────────────────────────────────────────────────────────────────

interface KpiBarProps {
  findings: Finding[]
  locale: 'pt-br' | 'en'
  t: ReturnType<typeof useTranslations<'alertas'>>
}

function KpiBar({ findings, locale, t }: KpiBarProps) {
  const stats = useMemo(() => {
    const totalValue = findings.reduce((sum, f) => sum + (f.value ?? 0), 0)
    const cities = new Set(findings.map(f => f.cityId)).size
    return { count: findings.length, totalValue, cities }
  }, [findings])

  if (stats.count === 0) return null

  return (
    <dl className="mb-6 grid gap-3 rounded-xl border border-brand-gray/15 bg-white p-4 sm:grid-cols-3">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
          {t('kpi.alerts')}
        </dt>
        <dd className="mt-1 font-mono text-2xl font-bold text-brand-ink tabular-nums">
          {stats.count}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
          {t('kpi.totalValue')}
        </dt>
        <dd className="mt-1 font-mono text-2xl font-bold text-brand-ink tabular-nums">
          {stats.totalValue > 0 ? formatCompactBrl(stats.totalValue) : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
          {t('kpi.cities')}
        </dt>
        <dd className="mt-1 font-mono text-2xl font-bold text-brand-ink tabular-nums">
          {stats.cities}
        </dd>
      </div>
    </dl>
  )
}

// ── Finding Card ──────────────────────────────────────────────────────────────

interface CardProps {
  finding: Finding
  typeLabel: (type: string) => string
  t: ReturnType<typeof useTranslations<'alertas'>>
  locale: 'pt-br' | 'en'
}

function FindingCard({ finding, typeLabel, t, locale }: CardProps) {
  const riskLabel = getRiskLabel(finding.riskScore, locale)
  const detailHref = `/${locale}/alertas/${findingIdToSlug(finding.id)}`

  // UH-WEB-008: backfill quando gap entre data do diário e detecção > 30 dias
  const gazetteDate = finding.evidence?.[0]?.date
  const isBackfill = gapDaysBetween(gazetteDate, finding.createdAt) > BACKFILL_GAP_DAYS

  return (
    <article className="group relative flex flex-col rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* BUG-WEB-003: card inteiro vira link clicável para a página de detalhe.
          Usamos overlay invisível em vez de wrapper <Link> para preservar
          links internos no footer (PDF, fornecedor) sem nesting de <a>. */}
      <Link
        href={detailHref}
        aria-label={`${typeLabel(finding.type)} — ${finding.city}`}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
      >
        <span className="sr-only">{t('card.viewFull')}</span>
      </Link>

      {/* Header: badges */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClass(finding.type)}`}>
          {typeLabel(finding.type)}
        </span>
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}>
          {t('card.riskScore')} {finding.riskScore} — {riskLabel}
        </span>
        {isBackfill && (
          <span
            className="rounded-pill border border-brand-gray/25 bg-brand-paper px-2.5 py-0.5 text-xs font-semibold text-brand-gray"
            title={
              locale === 'pt-br'
                ? 'Diário oficial é anterior — achado detectado em backfill histórico'
                : 'Official gazette predates detection — historical backfill'
            }
          >
            {t('card.backfill')}
          </span>
        )}
      </div>

      {/* City + state */}
      <p className="mb-1 text-sm font-semibold text-brand-ink">
        {finding.city} · <span className="text-brand-gray">{finding.state}</span>
      </p>

      {/* Subtítulo desambiguador — secretaria + contrato + CNPJ formatado */}
      {(finding.secretaria || finding.contractNumber || finding.cnpj) && (
        <p className="mb-2 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-brand-gray">
          {finding.secretaria && (
            <span className="font-semibold text-brand-ink">{finding.secretaria}</span>
          )}
          {finding.contractNumber && (
            <span className="font-mono">
              <span className="text-brand-gray/70">{locale === 'pt-br' ? 'Contrato ' : 'Contract '}</span>
              {finding.contractNumber}
            </span>
          )}
          {finding.cnpj && (
            <span className="font-mono text-brand-gray/80">{finding.cnpj}</span>
          )}
        </p>
      )}

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
            <dd className="font-mono">{formatCurrency(finding.value, locale)}</dd>
          </div>
        )}
        {finding.legalBasis && (
          <div className="flex gap-1">
            <dt className="font-medium">{locale === 'pt-br' ? 'Base legal' : 'Legal basis'}:</dt>
            <dd>{finding.legalBasis}</dd>
          </div>
        )}
        <div className="flex gap-1">
          <dt className="font-medium">{t('card.date')}:</dt>
          <dd className="font-mono">{formatDate(finding.createdAt, locale)}</dd>
        </div>
      </dl>

      {/* Footer: confidence + actions
          BUG-WEB-003: ação primária = página de detalhe; PDF é secundário */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-brand-gray/10 pt-3">
        <span className="text-xs text-brand-gray">
          {t('card.confidence')}: {Math.round(finding.confidence * 100)}%
        </span>
        <div className="relative z-20 flex items-center gap-3">
          <a
            href={finding.source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-gray hover:text-brand-teal"
          >
            {t('card.viewGazette')}
            <ArrowSquareOut size={11} weight="bold" />
          </a>
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-1.5 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
          >
            {t('card.viewFull')}
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
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
  const lang: 'pt-br' | 'en' = locale === 'en' ? 'en' : 'pt-br'

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

  useEffect(() => {
    fetchAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateFilter, typeFilter])

  const typeLabel = (type: string): string => {
    const key = `types.${type}` as Parameters<typeof t>[0]
    try {
      return t(key)
    } catch {
      return type
    }
  }

  return (
    <div>
      {/* UH-WEB-010: KPIs agregados — total alertas, valor envolvido, cidades distintas */}
      {!loading && !error && <KpiBar findings={findings} locale={lang} t={t} />}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-state" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
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
          <label htmlFor="filter-type" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
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
              locale={lang}
            />
          ))}
        </div>
      )}
    </div>
  )
}
