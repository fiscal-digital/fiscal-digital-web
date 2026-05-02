import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import StatsCounter from '@/components/StatsCounter'
import HeroStats from '@/components/HeroStats'
import FourFiscais from '@/components/FourFiscais'
import FeaturedAlert from '@/components/FeaturedAlert'
import CitiesMap from '@/components/CitiesMap'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const isPt = locale === 'pt'
  const path = isPt ? '/pt' : '/en'
  return {
    title: t('home_title'),
    description: t('home_description'),
    alternates: {
      canonical: path,
      languages: {
        pt: '/pt',
        en: '/en',
        'x-default': '/pt',
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
              <a
                href={`/${locale}/alertas`}
                className="inline-block rounded-md bg-brand-amber px-6 py-3 font-semibold text-brand-ink transition-opacity hover:opacity-90"
              >
                {t('cta_alertas')}
              </a>
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
      <section
        id="ecossistema"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_ecosystem')}
          </h2>
          <p className="mb-12 text-brand-gray">
            {t('ecosystem_desc')}
          </p>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            {[
              { name: 'Serenata de Amor', url: 'https://serenata.ai', desc: 'Federal (CEAP)' },
              { name: 'Querido Diário', url: 'https://queridodiario.ok.org.br', desc: 'Municipal (dados abertos)' },
              { name: 'Fiscal Digital', url: '#', desc: 'Municipal (alertas)' },
            ].map((p) => (
              <a
                key={p.name}
                href={p.url}
                target={p.url !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex flex-col rounded-lg border border-brand-gray/20 px-6 py-4 text-center transition-shadow hover:shadow-md"
              >
                <span className="font-semibold text-brand-ink">{p.name}</span>
                <span className="text-xs text-brand-gray">{p.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Open source */}
      <section
        id="open-source"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_open_source')}
          </h2>
          <p className="mb-8 text-brand-gray">{t('open_source.desc')}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://github.com/fiscal-digital"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-ink px-6 py-3 font-semibold text-brand-paper transition-opacity hover:opacity-90"
            >
              {t('open_source.cta_github')}
              <span aria-hidden="true">→</span>
            </a>
            <span
              className="inline-flex items-center gap-2 rounded-pill border border-brand-gray/25 px-3 py-1.5 text-xs text-brand-gray"
              aria-label={t('open_source.license_label')}
            >
              <span className="font-mono font-semibold text-brand-teal">MIT</span>
              <span>·</span>
              <span>{t('open_source.license_label')}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 10. Newsletter (mailto-only sem provider) */}
      <section
        id="newsletter"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_newsletter')}
          </h2>
          <p className="mb-8 text-brand-gray">{t('newsletter.desc')}</p>
          <a
            href="https://github.com/fiscal-digital/fiscal-digital/issues/new?labels=newsletter&title=Inscrever+na+newsletter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-brand-teal px-6 py-3 font-semibold text-brand-paper transition-opacity hover:opacity-90"
          >
            {t('newsletter.cta')}
          </a>
        </div>
      </section>

      {/* 11. Contribua */}
      <section
        id="contribua"
        className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_contribute')}
          </h2>
          <p className="text-brand-gray">
            {t('contribute_desc')}
          </p>
        </div>
      </section>
    </main>
  )
}
