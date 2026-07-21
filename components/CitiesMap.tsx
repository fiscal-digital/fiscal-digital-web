import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import {
  type Region,
  REGION_LABELS,
  citiesByRegion,
  activeCount,
  totalCount,
  type City,
} from '@/lib/cities'
import { fetchCitiesFreshness, freshnessTone } from '@/lib/freshness'
import { formatDate } from '@/lib/findings'

const REGION_ORDER: Region[] = ['SE', 'S', 'NE', 'CO', 'N']

interface Props {
  locale: string
}

// UH-WEB-020: fetch consolidado em lib/freshness.ts — mesma chamada /cities
// traz findingsCount + freshness (lastGazetteDate/staleDays/dataStatus).

export default async function CitiesMap({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.cities' })
  const grouped = citiesByRegion()
  const activeN = activeCount()
  const totalN = totalCount()
  const lang: 'pt-br' | 'en-us' = locale === 'en-us' ? 'en-us' : 'pt-br'

  // UH-WEB-014 — busca stats de findings por cidade do /cities API
  // UH-WEB-020 — a mesma resposta traz freshness por cidade
  const freshnessMap = await fetchCitiesFreshness()
  const statsMap = new Map(
    [...freshnessMap.values()].map((c) => [c.cityId, c.findingsCount]),
  )
  const allCities: City[] = Object.values(grouped).flat()
  const withStats = allCities.map((c) => ({
    city: c,
    findings: statsMap.get(c.cityId) ?? 0,
    freshness: freshnessMap.get(c.cityId) ?? null,
  }))

  // Top 3 cidades com findings > 0 (para destaque)
  const topCities = [...withStats]
    .filter((x) => x.findings > 0)
    .sort((a, b) => b.findings - a.findings)
    .slice(0, 3)

  // Total de findings por região
  const regionStats = REGION_ORDER.map((region) => {
    const cities = grouped[region] ?? []
    const findings = cities.reduce(
      (sum, c) => sum + (statsMap.get(c.cityId) ?? 0),
      0,
    )
    return { region, citiesCount: cities.length, findings }
  }).filter((r) => r.citiesCount > 0)

  // Para o grid completo: ordena por findings desc, depois nome asc
  const sortedAll = [...withStats].sort((a, b) => {
    if (b.findings !== a.findings) return b.findings - a.findings
    return a.city.name.localeCompare(b.city.name, lang === 'pt-br' ? 'pt-BR' : 'en-US')
  })

  const findingsLabel = (n: number): string =>
    n === 1 ? t('findings_one') : t('findings_other', { count: n })

  return (
    <div className="space-y-10">
      <p className="text-center text-sm text-brand-gray">
        {t('summary', { active: activeN, total: totalN })}
      </p>

      {/* CAMADA 1 — Cidades em destaque (top 3 por findings) */}
      {topCities.length > 0 && (
        <section aria-labelledby="top-cities-title">
          <div className="mb-4 text-center">
            <h3
              id="top-cities-title"
              className="mb-1 text-xl font-bold tracking-tight text-brand-ink"
            >
              {t('top_title')}
            </h3>
            <p className="text-sm text-brand-gray">{t('top_subtitle')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {topCities.map(({ city, findings }, i) => (
              <Link
                key={city.cityId}
                href={`/${locale}/cidades/${city.slug}`}
                className="group flex flex-col gap-3 rounded-xl bg-brand-teal p-5 text-brand-paper shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs font-semibold text-brand-amber">
                    #{i + 1}
                  </span>
                  <span className="font-mono text-xs text-brand-paper/60">
                    {city.uf}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-balance text-lg font-bold leading-tight">
                    {city.name}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="font-mono text-3xl font-bold tabular-nums">
                      {findings}
                    </p>
                    <p className="text-xs text-brand-paper/70">
                      {findingsLabel(findings).replace(/^\d+\s/, '')}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-amber transition-transform group-hover:translate-x-0.5">
                    {t('see_city')}
                    <ArrowRight size={12} weight="bold" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CAMADA 2 — Chips por região (cobertura agregada) */}
      <section aria-label={t('top_title')}>
        <div className="flex flex-wrap justify-center gap-2">
          {regionStats.map(({ region, citiesCount, findings }) => (
            <div
              key={region}
              className="flex items-center gap-2 rounded-pill border border-brand-gray/20 bg-white px-3 py-1.5 text-xs"
            >
              <span className="font-semibold uppercase tracking-wider text-brand-teal">
                {REGION_LABELS[region][lang]}
              </span>
              <span className="text-brand-gray">·</span>
              <span className="text-brand-gray">
                {t('region_summary', {
                  cities: citiesCount,
                  findings: findings === 0 ? t('no_findings_yet') : findingsLabel(findings),
                })}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CAMADA 3 — Grid completo de pills (todas as cidades) */}
      <section aria-labelledby="all-cities-title">
        <h3
          id="all-cities-title"
          className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand-gray"
        >
          {t('all_cities')}
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedAll.map(({ city, findings, freshness }) => (
            <li key={city.cityId}>
              <Link
                href={`/${locale}/cidades/${city.slug}`}
                className={`group flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  city.active
                    ? 'border-brand-gray/15 bg-white hover:border-brand-teal/40 hover:bg-brand-paper'
                    : 'border-brand-gray/10 bg-brand-paper/50 opacity-60 hover:opacity-90'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {/* UH-WEB-020: dot âmbar quando a cobertura da cidade ativa
                      está estagnada no Querido Diário (>7 dias sem gazette) */}
                  <span
                    aria-hidden="true"
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      !city.active
                        ? 'bg-brand-gray/30'
                        : freshness && freshnessTone(freshness.dataStatus) === 'warn'
                          ? 'bg-brand-amber'
                          : 'bg-brand-success'
                    }`}
                    title={
                      !city.active
                        ? t('badge_planned_alt')
                        : freshness && freshnessTone(freshness.dataStatus) === 'warn' && freshness.lastGazetteDate
                          ? t('stale_tooltip', { date: formatDate(freshness.lastGazetteDate, lang) })
                          : t('badge_active_alt')
                    }
                  />
                  <span className="truncate text-brand-ink group-hover:text-brand-teal">
                    {city.name}
                  </span>
                  <span className="font-mono text-xs text-brand-gray">{city.uf}</span>
                </span>
                {findings > 0 && (
                  <span className="shrink-0 rounded-pill bg-brand-amber/15 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-ink">
                    {findings}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Legenda */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-brand-gray">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-brand-success"
            />
            {t('legend_active')}
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-brand-gray/30"
            />
            {t('legend_planned')}
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-4 w-4 items-center justify-center rounded-pill bg-brand-amber/15 px-1 py-0 text-center font-mono text-[10px] font-semibold leading-4 text-brand-ink"
            >
              N
            </span>
            {lang === 'pt-br' ? 'Achados publicados' : 'Published findings'}
          </span>
        </div>
      </section>
    </div>
  )
}
