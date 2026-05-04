import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import {
  CaretLeft,
  Buildings,
  Clock,
  ChartBar,
  CurrencyDollar,
  Tag,
  Gauge,
} from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { CITIES, getCityBySlug, regionOf, REGION_LABELS } from '@/lib/cities'
import { fetchAlertsWithTotal } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/findings'
import AlertsFeedClient from '@/components/AlertsFeedClient'
import ShareButton from '@/components/ShareButton'
import { getRiskLevel, getRiskLabel } from '@/lib/brand'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 60

// ISR: pré-renderiza todas as cidades active. dynamicParams é true (default) —
// slugs de cidades ainda não ativas também são aceitos on-demand via ISR.
export async function generateStaticParams() {
  const slugs = Object.values(CITIES)
    .filter((c) => c.active)
    .map((c) => c.slug)
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const city = getCityBySlug(slug)
  if (!city) return { title: 'Cidade — Fiscal Digital' }

  const isPt = locale === 'pt-br'
  const title = isPt
    ? `${city.name} (${city.uf}) — Alertas de Gastos Públicos · Fiscal Digital`
    : `${city.name} (${city.uf}) — Public Spending Alerts · Fiscal Digital`
  const description = isPt
    ? `Achados de fiscalização de gastos públicos em ${city.name}/${city.uf}. Cada alerta cita o diário oficial.`
    : `Public spending oversight findings in ${city.name}/${city.uf}. Every alert cites the official gazette.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/cidades/${slug}`,
      languages: { 'pt-br': `/pt-br/cidades/${slug}`, 'en-us': `/en-us/cidades/${slug}` },
    },
    openGraph: { title, description, type: 'website' },
  }
}

function riskBadgeClass(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'bg-risk-critical text-white'
  if (level === 'alert')    return 'bg-risk-alert text-brand-ink'
  if (level === 'low')      return 'bg-risk-low text-white'
  return 'bg-brand-gray text-white'
}

function riskAccentClass(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'border-risk-critical/30 bg-risk-critical/5'
  if (level === 'alert')    return 'border-risk-alert/30 bg-risk-alert/5'
  if (level === 'low')      return 'border-risk-low/30 bg-risk-low/5'
  return 'border-brand-gray/15 bg-brand-paper'
}

function formatCompactBrl(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`
  return `R$ ${value.toFixed(0)}`
}

export default async function CidadePage({ params }: Props) {
  const { locale, slug } = await params
  if (!routing.locales.includes(locale as 'pt-br' | 'en-us')) notFound()
  setRequestLocale(locale)

  const city = getCityBySlug(slug)
  if (!city) notFound()

  // Usa pageInfo.total (global) para KPIs — antes mostrava items.length (50,
  // limitado pela paginação default da API), divergindo do número real.
  const result = await fetchAlertsWithTotal({ city: city.cityId, size: 200 })
  const findings = result.items
  const region = regionOf(city.uf)
  const isPt = locale === 'pt-br'
  const lang: 'pt-br' | 'en-us' = isPt ? 'pt-br' : 'en-us'

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCount = result.total                 // total real (pageInfo.total)
  const totalValue = result.totalValue            // soma global de values
  const typesDetected = new Set(findings.map((f) => f.type)).size  // tipos visíveis no que carregou
  const avgRiskRaw =
    findings.length > 0 ? findings.reduce((s, f) => s + f.riskScore, 0) / findings.length : 0
  const avgRisk = Math.round(avgRiskRaw)
  const avgRiskLabel = findings.length > 0 ? getRiskLabel(avgRisk, lang) : ''

  const lastFinding = findings[0]
  const lastDateLabel = lastFinding
    ? formatDate(lastFinding.createdAt, lang)
    : (isPt ? 'Sem alertas' : 'No alerts')

  const secCounts = findings.reduce<Record<string, number>>((acc, f) => {
    if (f.secretaria) acc[f.secretaria] = (acc[f.secretaria] ?? 0) + 1
    return acc
  }, {})
  const topSec = Object.entries(secCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const t = {
    back: isPt ? 'Voltar' : 'Back',
    share: isPt ? 'Compartilhar' : 'Share',
    shareLabel: isPt ? `Compartilhar ${city.name}` : `Share ${city.name}`,
    shareText: isPt
      ? `Achados de fiscalização em ${city.name}/${city.uf}`
      : `Oversight findings in ${city.name}/${city.uf}`,
    statTotal: isPt ? 'Achados publicados' : 'Published findings',
    statValue: isPt ? 'Valor envolvido' : 'Total amount',
    statTypes: isPt ? 'Tipos detectados' : 'Types detected',
    statAvgRisk: isPt ? 'Risco médio' : 'Average risk',
    statLast: isPt ? 'Último alerta' : 'Last alert',
    statTopSec: isPt ? 'Secretaria mais frequente' : 'Top department',
    typesUnit: (n: number) =>
      isPt ? (n === 1 ? 'tipo' : 'tipos') : (n === 1 ? 'type' : 'types'),
    inactive: isPt
      ? 'Cidade mapeada, ainda sem cobertura ativa pelo Querido Diário.'
      : 'City mapped, no active coverage from Querido Diário yet.',
    region: isPt ? 'Região' : 'Region',
    state: isPt ? 'Estado' : 'State',
    valueEmpty: isPt ? 'sem valor monetário' : 'no monetary value',
  }

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Header */}
      <section className="bg-brand-teal px-6 py-16 text-brand-paper">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-amber hover:underline"
          >
            <CaretLeft size={14} weight="bold" />
            {t.back}
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                {city.name}
              </h1>
              <p className="mt-1 text-sm opacity-80">
                {t.state}: <span className="font-mono">{city.uf}</span>
                {region && (
                  <>
                    {' · '}
                    {t.region}: {REGION_LABELS[region][lang]}
                  </>
                )}
              </p>
              {!city.active && (
                <p className="mt-3 inline-block rounded-md border border-brand-amber/40 bg-brand-amber/10 px-3 py-1 text-xs">
                  {t.inactive}
                </p>
              )}
            </div>
            <ShareButton
              title={`${city.name} — Fiscal Digital`}
              text={t.shareText}
              label={t.shareLabel}
              locale={lang}
            />
          </div>
        </div>
      </section>

      {/* UH-WEB-013 — Big Numbers (4 KPIs + linha contextual). Omitido quando 0 findings. */}
      {totalCount > 0 && (
        <section className="border-b border-brand-gray/10 bg-white px-6 py-8">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={<ChartBar size={18} weight="bold" className="text-brand-teal" />}
                label={t.statTotal}
                value={String(totalCount)}
              />
              <KpiCard
                icon={<CurrencyDollar size={18} weight="bold" className="text-brand-teal" />}
                label={t.statValue}
                value={totalValue > 0 ? formatCompactBrl(totalValue) : '—'}
                hint={totalValue === 0 ? t.valueEmpty : undefined}
                title={
                  totalValue > 0
                    ? formatCurrency(totalValue, lang)
                    : undefined
                }
              />
              <KpiCard
                icon={<Tag size={18} weight="bold" className="text-brand-teal" />}
                label={t.statTypes}
                value={`${typesDetected} ${t.typesUnit(typesDetected)}`}
              />
              <KpiCard
                icon={<Gauge size={18} weight="bold" className="text-brand-teal" />}
                label={t.statAvgRisk}
                value={`${avgRisk} — ${avgRiskLabel}`}
                accentClass={riskAccentClass(avgRisk)}
                title={isPt
                  ? `Média ponderada das pontuações dos achados publicados em ${city.name}, escala 0–100. 80–100 = Alerta crítico; 60–79 = Alerta.`
                  : `Weighted average of the published findings' risk scores in ${city.name}, 0–100 scale. 80–100 = Critical alert; 60–79 = Alert.`}
              />
            </div>

            {/* Linha contextual — último alerta + secretaria (omitida se vazia) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-gray">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} weight="bold" className="text-brand-gray/60" />
                {t.statLast}:{' '}
                <span className="font-mono text-brand-ink">{lastDateLabel}</span>
              </span>
              {topSec && (
                <span className="inline-flex items-center gap-1.5">
                  <Buildings size={14} weight="bold" className="text-brand-gray/60" />
                  {t.statTopSec}:{' '}
                  <span className="font-medium text-brand-ink">{topSec}</span>
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Feed — AlertsFeedClient com cityId para filtrar por cidade */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <AlertsFeedClient locale={lang} cityId={city.cityId} hideKpis />
        </div>
      </section>
    </main>
  )
}

// ── KpiCard ────────────────────────────────────────────────────────────────
function KpiCard({
  icon,
  label,
  value,
  hint,
  title,
  accentClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  title?: string
  accentClass?: string
}) {
  const base = 'rounded-xl border p-4 transition-colors'
  const accent = accentClass ?? 'border-brand-gray/15 bg-brand-paper'
  return (
    <div className={`${base} ${accent}`} title={title}>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-gray">
        {icon}
        {label}
      </div>
      <p className="font-mono text-2xl font-bold tabular-nums text-brand-ink">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-xs text-brand-gray/70">{hint}</p>
      )}
    </div>
  )
}
