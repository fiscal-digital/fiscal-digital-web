import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CaretLeft, RssSimple, Buildings, Clock, ChartBar } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { CITIES, getCityBySlug, regionOf, REGION_LABELS, type City } from '@/lib/cities'
import { fetchAlerts, API_URL } from '@/lib/api'
import { findingTypeLabel, findingIdToSlug, formatCurrency, formatDate } from '@/lib/findings'
import { getRiskLevel } from '@/lib/brand'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

// SSG: gera páginas para TODAS as cidades active (mesmo sem findings ainda).
// A home exibe 50 cidades; cada link precisa abrir uma página real, mesmo que
// vazia ("Sem alertas detectados ainda" já é tratado abaixo). Filtrar por
// findingsCount>0 deixava 44 cidades com 404. Quando passar de ~200 cidades,
// reavaliar para evitar build lento.
// Fonte canônica de cidades: lib/cities (build-time, sempre disponível).
// API /cities é hint de findings, mas não bloqueia geração das páginas.
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

  const isPt = locale === 'pt'
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
      languages: { pt: `/pt/cidades/${slug}`, en: `/en/cidades/${slug}` },
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

export default async function CidadePage({ params }: Props) {
  const { locale, slug } = await params
  if (!routing.locales.includes(locale as 'pt' | 'en')) notFound()
  setRequestLocale(locale)

  const city = getCityBySlug(slug)
  if (!city) notFound()

  const findings = await fetchAlerts({ city: city.cityId, limit: 200 })
  const region = regionOf(city.uf)
  const isPt = locale === 'pt'

  // Stats
  const totalCount = findings.length
  const lastFinding = findings[0]
  const lastDateLabel = lastFinding
    ? formatDate(lastFinding.createdAt, locale as 'pt' | 'en')
    : (isPt ? 'Sem alertas' : 'No alerts')
  // Top secretaria
  const secCounts = findings.reduce<Record<string, number>>((acc, f) => {
    if (f.secretaria) acc[f.secretaria] = (acc[f.secretaria] ?? 0) + 1
    return acc
  }, {})
  const topSec = Object.entries(secCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const t = {
    back: isPt ? 'Voltar' : 'Back',
    rss: isPt ? 'RSS desta cidade' : 'City RSS feed',
    statTotal: isPt ? 'Achados publicados' : 'Published findings',
    statLast: isPt ? 'Último alerta' : 'Last alert',
    statTopSec: isPt ? 'Secretaria mais frequente' : 'Top department',
    feedTitle: isPt ? 'Achados em ' + city.name : 'Findings in ' + city.name,
    empty: isPt
      ? `Sem alertas detectados em ${city.name} ainda.`
      : `No alerts detected in ${city.name} yet.`,
    emptyDesc: isPt
      ? 'Os Fiscais monitoram diariamente o diário oficial. Volte em breve.'
      : 'The Fiscals monitor the official gazette daily. Check back soon.',
    inactive: isPt
      ? 'Cidade mapeada, ainda sem cobertura ativa pelo Querido Diário.'
      : 'City mapped, no active coverage from Querido Diário yet.',
    region: isPt ? 'Região' : 'Region',
    state: isPt ? 'Estado' : 'State',
  }

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Header */}
      <section className="bg-brand-teal px-6 py-12 text-brand-paper">
        <div className="mx-auto max-w-5xl">
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
                    {t.region}: {REGION_LABELS[region][locale as 'pt' | 'en']}
                  </>
                )}
              </p>
              {!city.active && (
                <p className="mt-3 inline-block rounded-md border border-brand-amber/40 bg-brand-amber/10 px-3 py-1 text-xs">
                  {t.inactive}
                </p>
              )}
            </div>
            <a
              href={`${API_URL}/rss?city=${city.cityId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-amber px-3 py-2 text-xs font-semibold text-brand-ink transition-opacity hover:opacity-90"
            >
              <RssSimple size={14} weight="fill" />
              {t.rss}
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-brand-gray/10 bg-white px-6 py-8">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          <StatCard
            icon={<ChartBar size={18} weight="bold" className="text-brand-teal" />}
            label={t.statTotal}
            value={String(totalCount)}
          />
          <StatCard
            icon={<Clock size={18} weight="bold" className="text-brand-teal" />}
            label={t.statLast}
            value={lastDateLabel}
          />
          <StatCard
            icon={<Buildings size={18} weight="bold" className="text-brand-teal" />}
            label={t.statTopSec}
            value={topSec}
            mono={topSec !== '—'}
          />
        </div>
      </section>

      {/* Feed */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-brand-ink">
            {t.feedTitle}
          </h2>
          {findings.length === 0 ? (
            <div className="rounded-xl border border-brand-gray/15 bg-white px-6 py-12 text-center">
              <p className="font-semibold text-brand-ink">{t.empty}</p>
              <p className="mt-2 text-sm text-brand-gray">{t.emptyDesc}</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {findings.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/${locale}/alertas/${findingIdToSlug(f.id)}`}
                    className="block rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(f.riskScore)}`}>
                        {isPt ? 'Risco' : 'Risk'} {f.riskScore}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
                        {findingTypeLabel(f.type, locale as 'pt' | 'en')}
                      </span>
                    </div>
                    {f.narrative && (
                      <p className="mb-3 line-clamp-3 text-sm text-brand-gray">
                        {f.narrative.replace(/[#*]/g, '').trim()}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-gray">
                      {f.value != null && (
                        <span className="font-mono">{formatCurrency(f.value, locale as 'pt' | 'en')}</span>
                      )}
                      {f.secretaria && <span>{f.secretaria}</span>}
                      <span className="ml-auto font-mono">{formatDate(f.createdAt, locale as 'pt' | 'en')}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-brand-gray/15 bg-brand-paper p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-gray">
        {icon}
        {label}
      </div>
      <p className={`text-lg font-bold text-brand-ink ${mono ? 'font-mono text-base' : ''}`}>
        {value}
      </p>
    </div>
  )
}
