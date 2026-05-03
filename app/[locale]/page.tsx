import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import StatsCounter from '@/components/StatsCounter'
import HeroStats from '@/components/HeroStats'
import FourFiscais from '@/components/FourFiscais'
import FeaturedAlert from '@/components/FeaturedAlert'
import CitiesMap from '@/components/CitiesMap'
import EcosystemSection from '@/components/home/EcosystemSection'
import OpenSourceSection from '@/components/home/OpenSourceSection'
import NewsletterSection from '@/components/home/NewsletterSection'
import ContributeSection from '@/components/home/ContributeSection'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const isPt = locale === 'pt-br'
  const path = isPt ? '/pt-br' : '/en'
  return {
    title: t('home_title'),
    description: t('home_description'),
    alternates: {
      canonical: path,
      languages: {
        'pt-br': '/pt-br',
        en: '/en',
        'x-default': '/pt-br',
      },
    },
    openGraph: {
      title: t('home_title'),
      description: t('home_description'),
      url: path,
      locale: isPt ? 'pt_BR' : 'en_US',
    },
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'home' })
  return (
    <main>
      {/* 1. Hero — layout assimétrico duas colunas */}
      <section className="bg-brand-teal px-6 py-24 text-brand-paper sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-5">
            {/* Coluna texto — 3/5 */}
            <div className="lg:col-span-3">
              <h1 className="mb-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {t('tagline')}
              </h1>
              <p className="mb-8 text-base leading-relaxed opacity-75 sm:text-lg">
                {t('subtitle')}
              </p>
              <Link
                href={`/${locale}/alertas`}
                prefetch
                className="inline-block rounded-md bg-brand-amber px-6 py-3 font-semibold text-brand-ink transition-opacity hover:opacity-90"
              >
                {t('cta_alertas')}
              </Link>
            </div>

            {/* Coluna stats ao vivo — 2/5 */}
            <div className="lg:col-span-2">
              <HeroStats locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. O problema */}
      <section id="problema" className="bg-brand-paper px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_problem')}
          </h2>
          <p className="text-lg leading-relaxed text-brand-gray">
            {t('problem_desc')}
          </p>
        </div>
      </section>

      {/* 3. Indicadores ao vivo */}
      <section
        id="indicadores"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
              {t('section_indicators')}
            </h2>
            <p className="text-sm text-brand-gray">{t('indicators_desc')}</p>
          </div>
          <StatsCounter />
        </div>
      </section>

      {/* 4. O que fiscalizamos (4 Fiscais) */}
      <section
        id="fiscais"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
              {t('section_fiscais')}
            </h2>
            <p className="text-sm text-brand-gray">{t('fiscais_desc')}</p>
          </div>
          <FourFiscais locale={locale} />
        </div>
      </section>

      {/* 5. Alerta em destaque */}
      <section
        id="destaque"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
              {t('section_featured')}
            </h2>
            <p className="text-sm text-brand-gray">{t('featured_desc')}</p>
          </div>
          <FeaturedAlert locale={locale} />
        </div>
      </section>

      {/* 6. Como funciona */}
      <section
        id="como-funciona"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_how')}
          </h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {(['collect', 'analyze', 'alert'] as const).map((step, i) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal font-mono text-lg font-bold text-brand-paper">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold text-brand-ink">
                  {t(`step_${step}`)}
                </h3>
                <p className="text-sm leading-relaxed text-brand-gray">
                  {t(`step_${step}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Cobertura — mapa de cidades */}
      <section
        id="cobertura"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
              {t('section_cities')}
            </h2>
            <p className="text-sm text-brand-gray">{t('cities_desc')}</p>
          </div>
          <CitiesMap locale={locale} />
        </div>
      </section>

      {/* 8. Ecossistema */}
      <EcosystemSection locale={locale} />

      {/* 9. Open source */}
      <OpenSourceSection locale={locale} />

      {/* 10. Newsletter — captura via API /newsletter */}
      <NewsletterSection locale={locale} />

      {/* 11. Contribua */}
      <ContributeSection locale={locale} />
    </main>
  )
}
