import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { fetchCosts, type CostDaily, type CostMonthly } from '../../../../lib/api'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('transparencia_custos_title') }
}

// ISR: revalida a cada 1h. FiscalCustos roda 1×/dia (06:00 UTC) — 1h é
// cadência saudável para refletir o snapshot novo sem lag perceptível.
export const revalidate = 3600

const BRAND_PALETTE = ['#0F4C5C', '#E36414', '#9A8C98', '#5F0F40', '#FB8B24', '#1B998B', '#A8DADC', '#457B9D']

function formatBrl(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  })
}

function shortServiceName(service: string): string {
  return service
    .replace(/^Amazon\s+/, '')
    .replace(/^AWS\s+/, '')
    .replace(/\s+\(.*\)$/, '')
}

// ── Donut SVG (sem libs) ────────────────────────────────────────────────────

function Donut({ services, totalBrl, locale }: { services: { service: string; brl: number }[]; totalBrl: number; locale: string }) {
  const size = 220
  const radius = 90
  const strokeWidth = 28
  const circumference = 2 * Math.PI * radius
  const filtered = services.filter(s => s.brl > 0)
  const sum = filtered.reduce((a, b) => a + b.brl, 0) || 1

  let cumulative = 0
  const segments = filtered.map((s, idx) => {
    const fraction = s.brl / sum
    const offset = cumulative * circumference
    const length = fraction * circumference
    cumulative += fraction
    return {
      key: s.service,
      color: BRAND_PALETTE[idx % BRAND_PALETTE.length]!,
      length,
      offset,
    }
  })

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribuição de custos por serviço AWS">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        {segments.map(s => (
          <circle
            key={s.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${s.length} ${circumference - s.length}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle" className="fill-brand-teal" style={{ fontSize: 22, fontWeight: 700 }}>
          {formatBrl(totalBrl, locale)}
        </text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" className="fill-brand-gray" style={{ fontSize: 12 }}>
          MTD
        </text>
      </svg>
      <ul className="flex flex-col gap-2 text-sm">
        {filtered.slice(0, 8).map((s, idx) => (
          <li key={s.service} className="flex items-center gap-3">
            <span
              className="inline-block h-3 w-3 flex-shrink-0 rounded-sm"
              style={{ backgroundColor: BRAND_PALETTE[idx % BRAND_PALETTE.length] }}
              aria-hidden
            />
            <span className="flex-1 font-mono text-xs text-brand-ink">{shortServiceName(s.service)}</span>
            <span className="font-mono text-xs text-brand-gray">{formatBrl(s.brl, locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Sparkline SVG (sem libs) ────────────────────────────────────────────────

function Sparkline({ daily, locale }: { daily: CostDaily[]; locale: string }) {
  if (daily.length < 2) return null
  const w = 800
  const h = 160
  const padding = 24
  const max = Math.max(...daily.map(d => d.totalBrl), 0.01)
  const stepX = (w - padding * 2) / Math.max(daily.length - 1, 1)
  const points = daily.map((d, i) => ({
    x: padding + i * stepX,
    y: padding + (h - padding * 2) * (1 - d.totalBrl / max),
    d,
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const fillPath = `${path} L ${points.at(-1)!.x.toFixed(1)} ${h - padding} L ${padding} ${h - padding} Z`

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Variação diária de custo nos últimos dias">
      <path d={fillPath} fill="#0F4C5C" fillOpacity={0.08} />
      <path d={path} fill="none" stroke="#0F4C5C" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) =>
        i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2) ? (
          <g key={p.d.date}>
            <circle cx={p.x} cy={p.y} r={3} fill="#E36414" />
            <text x={p.x} y={h - 6} textAnchor="middle" className="fill-brand-gray" style={{ fontSize: 10 }}>
              {formatDate(p.d.date, locale)}
            </text>
          </g>
        ) : null,
      )}
    </svg>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function CustosPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'transparencia_custos' })
  const tT = await getTranslations({ locale, namespace: 'transparencia' })

  const data = await fetchCosts(30)
  const monthly: CostMonthly | null = data.monthly
  const hasData = monthly !== null || data.daily.length > 0

  const deltaPct = monthly?.deltaPct ?? null
  const deltaSeverity = deltaPct !== null && Math.abs(deltaPct) >= 20 ? 'high' : 'normal'

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Hero */}
      <section className="bg-brand-teal px-6 py-16 text-brand-paper">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            {tT('title')}
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-base opacity-80 sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Big numbers */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          {!hasData && (
            <div className="rounded-lg border border-brand-gray/20 bg-brand-paper p-8 text-center">
              <p className="text-sm text-brand-gray">{t('empty_state')}</p>
            </div>
          )}

          {hasData && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-brand-gray/20 bg-brand-paper p-6">
                  <p className="mb-1 font-mono text-xs uppercase tracking-wider text-brand-amber">
                    {t('mtd_label')}
                  </p>
                  <p className="text-3xl font-bold text-brand-teal">
                    {monthly ? formatBrl(monthly.mtdBrl, locale) : '—'}
                  </p>
                  <p className="mt-2 text-sm text-brand-gray">{t('mtd_desc')}</p>
                </div>
                <div className="rounded-lg border border-brand-gray/20 bg-brand-paper p-6">
                  <p className="mb-1 font-mono text-xs uppercase tracking-wider text-brand-amber">
                    {t('projected_label')}
                  </p>
                  <p className="text-3xl font-bold text-brand-teal">
                    {monthly ? formatBrl(monthly.projectedBrl, locale) : '—'}
                  </p>
                  <p className="mt-2 text-sm text-brand-gray">{t('projected_desc')}</p>
                </div>
                <div className="rounded-lg border border-brand-gray/20 bg-brand-paper p-6">
                  <p className="mb-1 font-mono text-xs uppercase tracking-wider text-brand-amber">
                    {t('delta_label')}
                  </p>
                  <p className={`text-3xl font-bold ${deltaSeverity === 'high' ? 'text-brand-amber' : 'text-brand-teal'}`}>
                    {deltaPct === null ? '—' : `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%`}
                  </p>
                  <p className="mt-2 text-sm text-brand-gray">
                    {deltaSeverity === 'high' ? t('delta_alert') : t('delta_desc')}
                  </p>
                </div>
              </div>

              {/* PTAX + last update */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-brand-gray">
                {monthly && (
                  <span>
                    <span className="font-mono uppercase tracking-wider">PTAX</span>
                    {' · '}
                    {formatBrl(monthly.ptaxBrl, locale).replace('R$', 'R$').replace(/\s/, ' ')} / USD
                  </span>
                )}
                {data.updatedAt && (
                  <span>
                    {t('updated_at')}: {new Date(data.updatedAt).toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { timeZone: 'America/Sao_Paulo' })} (BRT)
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Donut por serviço */}
      {monthly && monthly.byService.length > 0 && (
        <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-brand-teal">
              {t('breakdown_title')}
            </h2>
            <p className="mb-8 text-base leading-relaxed text-brand-ink sm:text-lg">
              {t('breakdown_body')}
            </p>
            <div className="rounded-lg border border-brand-gray/20 bg-brand-paper p-6 sm:p-8">
              <Donut
                services={monthly.byService.map(s => ({ service: s.service, brl: s.brl }))}
                totalBrl={monthly.mtdBrl}
                locale={locale}
              />
            </div>
          </div>
        </section>
      )}

      {/* Sparkline 30d */}
      {data.daily.length >= 2 && (
        <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-brand-teal">
              {t('trend_title')}
            </h2>
            <p className="mb-8 text-base leading-relaxed text-brand-ink sm:text-lg">
              {t('trend_body', { days: data.daily.length })}
            </p>
            <div className="rounded-lg border border-brand-gray/20 bg-brand-paper p-6">
              <Sparkline daily={data.daily} locale={locale} />
            </div>
          </div>
        </section>
      )}

      {/* Metodologia */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('method_title')}
          </h2>
          <p className="mb-4 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('method_body_1')}
          </p>
          <p className="mb-4 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('method_body_2')}
          </p>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('method_body_3')}
          </p>
        </div>
      </section>
    </main>
  )
}
