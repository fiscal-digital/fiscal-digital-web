'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowSquareOut, ArrowRight, Warning, WarningCircle, Bell, CurrencyDollar, MapPin, RssSimple } from '@phosphor-icons/react'
import { getRiskLevel, getRiskLabel } from '@/lib/brand'
import { API_URL } from '@/lib/api'
import { FINDING_TYPE_LABELS, findingIdToSlug } from '@/lib/findings'

// pageInfo global vindo do /alerts — KPIs usam isso (não a lista local de items
// que pode estar paginada/filtrada).
interface PageInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
  totalValue: number
  citiesCount: number
}

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
  pageInfo: PageInfo | null
  fallback: Finding[]
  locale: 'pt-br' | 'en'
  t: ReturnType<typeof useTranslations<'alertas'>>
}

/**
 * KpiBar — números globais (sobre o conjunto inteiro filtrado, não só a página
 * visível). Usa pageInfo do API; cai em fallback computado dos items se a API
 * antiga ainda estiver respondendo sem pageInfo.
 *
 * Layout: 3 cards horizontais com ícone + label + valor grande. Mobile empilha.
 */
function KpiBar({ pageInfo, fallback, locale, t }: KpiBarProps) {
  const stats = useMemo(() => {
    if (pageInfo) {
      return {
        count: pageInfo.total,
        totalValue: pageInfo.totalValue,
        cities: pageInfo.citiesCount,
      }
    }
    // Fallback: API antiga sem pageInfo
    const totalValue = fallback.reduce((sum, f) => sum + (f.value ?? 0), 0)
    const cities = new Set(fallback.map(f => f.cityId)).size
    return { count: fallback.length, totalValue, cities }
  }, [pageInfo, fallback])

  if (stats.count === 0) return null

  return (
    <dl className="mb-6 grid gap-3 sm:grid-cols-3">
      <KpiCard
        icon={<Bell size={18} weight="bold" className="text-brand-teal" />}
        label={t('kpi.alerts')}
        value={stats.count.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US')}
      />
      <KpiCard
        icon={<CurrencyDollar size={18} weight="bold" className="text-brand-teal" />}
        label={t('kpi.totalValue')}
        value={stats.totalValue > 0 ? formatCompactBrl(stats.totalValue) : '—'}
      />
      <KpiCard
        icon={<MapPin size={18} weight="bold" className="text-brand-teal" />}
        label={t('kpi.cities')}
        value={stats.cities.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US')}
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
      <dd className="font-mono text-3xl font-bold text-brand-ink tabular-nums sm:text-4xl">
        {value}
      </dd>
    </div>
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
  const detailHref = `/${locale}/alertas/${findingIdToSlug(finding.id)}`
  const gazetteDate = finding.evidence?.[0]?.date

  // Card limpo, hierarquia: tipo+risco | cidade·secretaria | valor (se houver)
  // | narrativa truncada elegante | rodapé com data + CTA. Sem badge "Backfill"
  // — o que importa para o usuário é a data do diário (mostrada no rodapé).
  return (
    <article className="group relative flex flex-col rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm transition-shadow hover:border-brand-teal/40 hover:shadow-md">
      <Link
        href={detailHref}
        aria-label={`${typeLabel(finding.type)} — ${finding.city}`}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
      >
        <span className="sr-only">{t('card.viewFull')}</span>
      </Link>

      {/* Linha 1: tipo + risco */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClass(finding.type)}`}>
          {typeLabel(finding.type)}
        </span>
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}>
          {t('card.riskScore')} {finding.riskScore}
        </span>
      </div>

      {/* Linha 2: cidade · secretaria · contrato (compacto) */}
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
        <span className="font-semibold text-brand-ink">{finding.city}</span>
        <span className="font-mono text-xs text-brand-gray">{finding.state}</span>
        {finding.secretaria && (
          <>
            <span aria-hidden="true" className="text-brand-gray/40">·</span>
            <span className="text-xs text-brand-gray">{finding.secretaria}</span>
          </>
        )}
        {finding.contractNumber && (
          <>
            <span aria-hidden="true" className="text-brand-gray/40">·</span>
            <span className="font-mono text-xs text-brand-gray">
              {locale === 'pt-br' ? 'Contrato ' : 'Contract '}{finding.contractNumber}
            </span>
          </>
        )}
      </div>

      {/* Valor em destaque quando relevante */}
      {finding.value != null && (
        <p className="mb-3 font-mono text-base font-bold text-brand-ink">
          {formatCurrency(finding.value, locale)}
        </p>
      )}

      {/* Narrativa truncada — line-clamp-3 com balance pra quebrar bem */}
      {finding.narrative && (
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-brand-gray text-pretty">
          {finding.narrative.replace(/[#*]/g, '').replace(/\s+/g, ' ').trim()}
        </p>
      )}

      {/* Rodapé: data do diário (referência cidadã) · confidence pequeno · CTA */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-brand-gray/10 pt-3">
        <div className="flex flex-col gap-0.5 text-xs text-brand-gray">
          {gazetteDate && (
            <span>
              {locale === 'pt-br' ? 'Diário: ' : 'Gazette: '}
              <span className="font-mono text-brand-ink">{formatDate(gazetteDate, locale)}</span>
            </span>
          )}
          <span className="text-brand-gray/70">
            {t('card.confidence')}: {Math.round(finding.confidence * 100)}%
          </span>
        </div>
        <Link
          href={detailHref}
          className="relative z-20 inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
        >
          {t('card.viewFull')}
          <ArrowRight size={12} weight="bold" />
        </Link>
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
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
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
      .then((data: Finding[] | { items?: Finding[]; pageInfo?: PageInfo }) => {
        const items = Array.isArray(data) ? data : (data.items ?? [])
        setFindings(items)
        setPageInfo(Array.isArray(data) ? null : (data.pageInfo ?? null))
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
      {!loading && !error && <KpiBar pageInfo={pageInfo} fallback={findings} locale={lang} t={t} />}

      {/* Toolbar — filtros + RSS subscribe (substituiu sidebar lateral que
          desperdiçava espaço imenso na direita). Sticky em scroll. */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-brand-gray/15 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
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

        {/* RSS subscribe — vira link compacto na toolbar */}
        <a
          href={`${API_URL}/rss${stateFilter ? `?state=${stateFilter}` : ''}${typeFilter ? `${stateFilter ? '&' : '?'}type=${typeFilter}` : ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-amber/40 bg-brand-amber/10 px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-amber/20"
        >
          <RssSimple size={14} weight="fill" className="text-brand-amber" />
          {lang === 'pt-br' ? 'Assinar RSS' : 'Subscribe RSS'}
        </a>
      </div>

      {/* Content */}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
