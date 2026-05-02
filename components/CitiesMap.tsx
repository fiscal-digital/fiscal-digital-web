import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import {
  type Region,
  REGION_LABELS,
  citiesByRegion,
  activeCount,
  totalCount,
} from '@/lib/cities'

const REGION_ORDER: Region[] = ['S', 'SE', 'CO', 'NE', 'N']

interface Props {
  locale: string
}

export default async function CitiesMap({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.cities' })
  const grouped = citiesByRegion()
  const activeN = activeCount()
  const totalN = totalCount()
  const lang = locale === 'en' ? 'en' : 'pt'

  return (
    <div>
      <p className="mb-10 text-center text-sm text-brand-gray">
        {t('summary', { active: activeN, total: totalN })}
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {REGION_ORDER.map((region) => {
          const cities = grouped[region]
          if (cities.length === 0) return null
          return (
            <div
              key={region}
              className="rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-3 flex items-baseline justify-between border-b border-brand-gray/10 pb-2">
                <span className="text-sm font-semibold uppercase tracking-wider text-brand-teal">
                  {REGION_LABELS[region][lang]}
                </span>
                <span className="font-mono text-xs text-brand-gray">
                  {cities.length}
                </span>
              </h3>
              <ul className="flex flex-col gap-1.5">
                {cities.map((city) => (
                  <li key={city.cityId}>
                    <Link
                      href={`/${locale}/cidades/${city.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm text-brand-ink transition-colors hover:bg-brand-paper"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                            city.active ? 'bg-brand-success' : 'bg-brand-gray/30'
                          }`}
                          title={
                            city.active
                              ? t('badge_active_alt')
                              : t('badge_planned_alt')
                          }
                        />
                        <span className="group-hover:text-brand-teal">
                          {city.name}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-brand-gray">
                        {city.uf}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-brand-gray">
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
      </div>
    </div>
  )
}
