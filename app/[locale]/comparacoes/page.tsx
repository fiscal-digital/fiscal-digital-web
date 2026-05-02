import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CaretLeft, ChartBar } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { fetchAlerts } from '@/lib/api'
import { findingTypeLabel } from '@/lib/findings'
import { slugForCityId } from '@/lib/cities'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isPt = locale === 'pt-br'
  return {
    title: isPt
      ? 'Comparações entre cidades — Fiscal Digital'
      : 'City comparisons — Fiscal Digital',
    description: isPt
      ? 'Rankings e tendências dos achados de fiscalização de gastos públicos por cidade, tipo e período.'
      : 'Rankings and trends of public spending oversight findings by city, type and period.',
  }
}

/**
 * SSG: dados são processados no build a partir do snapshot da API.
 * Não usa 'use client' — gráficos são SVG/CSS puros, leem do server. Próximo
 * rebuild atualiza os números.
 *
 * Nota: o briefing mencionou client; optei por server alinhado ao guardrail
 * do CLAUDE.md ("use client SOMENTE onde há interatividade real"). Calculations
 * puras não justificam 200KB de bundle JS extra para mobile 3G.
 */
export default async function ComparacoesPage({ params }: Props) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'pt-br' | 'en')) notFound()
  setRequestLocale(locale)

  const findings = await fetchAlerts({ limit: 200 })
  const isPt = locale === 'pt-br'

  // ── Aggregations ────────────────────────────────────────────────────────
  const byCity = new Map<string, { name: string; uf: string; cityId: string; count: number; sumRisk: number }>()
  const byType = new Map<string, number>()
  // last 30 days bucket by date YYYY-MM-DD
  const today = new Date()
  const buckets: { date: string; label: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const date = d.toISOString().slice(0, 10)
    buckets.push({ date, label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, count: 0 })
  }
  const bucketIdx = new Map(buckets.map((b, i) => [b.date, i]))

  for (const f of findings) {
    const key = f.cityId
    const cur = byCity.get(key) ?? { name: f.city, uf: f.state, cityId: f.cityId, count: 0, sumRisk: 0 }
    cur.count++
    cur.sumRisk += f.riskScore
    byCity.set(key, cur)

    byType.set(f.type, (byType.get(f.type) ?? 0) + 1)

    const date = f.createdAt.slice(0, 10)
    const idx = bucketIdx.get(date)
    if (idx !== undefined) buckets[idx].count++
  }

  const topByCount = [...byCity.values()].sort((a, b) => b.count - a.count).slice(0, 10)
  const topByAvg = [...byCity.values()]
    .map((c) => ({ ...c, avg: c.sumRisk / Math.max(c.count, 1) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)
  const typeStats = [...byType.entries()].map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
  const totalTypes = typeStats.reduce((acc, x) => acc + x.count, 0) || 1

  const t = {
    back: isPt ? 'Voltar' : 'Back',
    title: isPt ? 'Comparações entre cidades' : 'City comparisons',
    subtitle: isPt
      ? 'Rankings e tendências dos achados publicados pelos Fiscais.'
      : 'Rankings and trends of findings published by the Fiscal agents.',
    rankCount: isPt ? 'Top 10 cidades por número de achados' : 'Top 10 cities by findings count',
    rankAvg: isPt ? 'Top 10 cidades por risco médio' : 'Top 10 cities by average risk score',
    typeDist: isPt ? 'Distribuição por tipo de achado' : 'Distribution by finding type',
    trend30: isPt ? 'Tendência — últimos 30 dias' : 'Trend — last 30 days',
    empty: isPt
      ? 'Sem dados suficientes para comparar. Aguarde mais publicações.'
      : 'Not enough data to compare. Wait for more publications.',
    asOf: isPt ? 'Snapshot de' : 'Snapshot from',
    findings: isPt ? 'achados' : 'findings',
    avgRisk: isPt ? 'Risco médio' : 'Avg risk',
  }

  const snapshotDate = new Date().toLocaleDateString(isPt ? 'pt-BR' : 'en-US')

  return (
    <main className="min-h-dvh bg-brand-paper">
      <section className="bg-brand-teal px-6 py-12 text-brand-paper">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-amber hover:underline"
          >
            <CaretLeft size={14} weight="bold" />
            {t.back}
          </Link>
          <h1 className="mt-4 flex items-center gap-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            <ChartBar size={28} weight="bold" className="text-brand-amber" />
            {t.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm opacity-70">{t.subtitle}</p>
          <p className="mt-3 text-xs opacity-60">
            {t.asOf} <span className="font-mono">{snapshotDate}</span> · {findings.length} {t.findings}
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl space-y-12">
          {findings.length === 0 ? (
            <div className="rounded-xl border border-brand-gray/15 bg-white px-6 py-12 text-center">
              <p className="text-brand-gray">{t.empty}</p>
            </div>
          ) : (
            <>
              {/* Top by count */}
              <Section title={t.rankCount}>
                <Bars
                  rows={topByCount.map((c) => ({
                    label: `${c.name}/${c.uf}`,
                    href: `/${locale}/cidades/${slugForCityId(c.cityId)}`,
                    value: c.count,
                    valueLabel: `${c.count}`,
                  }))}
                  max={topByCount[0]?.count ?? 1}
                />
              </Section>

              {/* Top by avg risk */}
              <Section title={t.rankAvg}>
                <Bars
                  rows={topByAvg.map((c) => ({
                    label: `${c.name}/${c.uf}`,
                    href: `/${locale}/cidades/${slugForCityId(c.cityId)}`,
                    value: c.avg,
                    valueLabel: c.avg.toFixed(1),
                  }))}
                  max={100}
                  variant="risk"
                />
              </Section>

              {/* Type distribution */}
              <Section title={t.typeDist}>
                <Bars
                  rows={typeStats.map((x) => ({
                    label: findingTypeLabel(x.type, locale as 'pt-br' | 'en'),
                    value: (x.count / totalTypes) * 100,
                    valueLabel: `${x.count} (${Math.round((x.count / totalTypes) * 100)}%)`,
                  }))}
                  max={100}
                />
              </Section>

              {/* 30d trend sparkline */}
              <Section title={t.trend30}>
                <Sparkline buckets={buckets} />
              </Section>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

// ── Visual primitives ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold tracking-tight text-brand-ink">{title}</h2>
      <div className="rounded-xl border border-brand-gray/15 bg-white p-5">{children}</div>
    </div>
  )
}

interface BarRow {
  label: string
  value: number
  valueLabel: string
  href?: string
}

function Bars({
  rows,
  max,
  variant = 'default',
}: {
  rows: BarRow[]
  max: number
  variant?: 'default' | 'risk'
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-brand-gray">—</p>
  }
  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const pct = Math.min(100, (r.value / Math.max(max, 1)) * 100)
        const barColor =
          variant === 'risk'
            ? r.value >= 80
              ? 'bg-risk-critical'
              : r.value >= 60
                ? 'bg-risk-alert'
                : r.value >= 30
                  ? 'bg-risk-low'
                  : 'bg-brand-gray'
            : 'bg-brand-teal'

        const labelEl = r.href ? (
          <Link href={r.href} className="text-brand-ink hover:underline">
            {r.label}
          </Link>
        ) : (
          <span className="text-brand-ink">{r.label}</span>
        )

        return (
          <li key={r.label}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium">{labelEl}</span>
              <span className="font-mono text-brand-gray">{r.valueLabel}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-gray/10">
              <div
                className={`h-full ${barColor}`}
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Sparkline({ buckets }: { buckets: { date: string; label: string; count: number }[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count))
  const w = 600
  const h = 80
  const stepX = w / Math.max(1, buckets.length - 1)
  const pts = buckets.map((b, i) => {
    const x = i * stepX
    const y = h - (b.count / max) * (h - 4) - 2
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const path = `M ${pts.join(' L ')}`
  const total = buckets.reduce((acc, b) => acc + b.count, 0)

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between text-xs text-brand-gray">
        <span>{buckets[0]?.label}</span>
        <span className="font-mono">total: {total}</span>
        <span>{buckets[buckets.length - 1]?.label}</span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-20 w-full text-brand-teal"
        preserveAspectRatio="none"
        role="img"
        aria-label="30-day trend"
      >
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
        {buckets.map((b, i) => (
          <circle
            key={b.date}
            cx={i * stepX}
            cy={h - (b.count / max) * (h - 4) - 2}
            r={b.count > 0 ? 2 : 0}
            fill="currentColor"
          />
        ))}
      </svg>
    </div>
  )
}
