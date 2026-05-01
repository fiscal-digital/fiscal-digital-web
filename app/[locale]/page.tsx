import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('home_title') }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <main>
      {/* Hero */}
      <section className="flex min-h-dvh items-center justify-center bg-brand-teal px-6 text-brand-paper">
        <div className="max-w-3xl text-center">
          <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-brand-amber">
            Fiscal Digital
          </p>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            {t('tagline')}
          </h1>
          <p className="mb-10 text-lg opacity-70 sm:text-xl">
            {t('subtitle')}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="#alertas"
              className="rounded-lg bg-brand-amber px-6 py-3 font-semibold text-brand-ink transition-opacity hover:opacity-90"
            >
              {t('cta_alertas')}
            </a>
            <a
              href="#apoie"
              className="rounded-lg border border-brand-paper/40 px-6 py-3 font-semibold transition-opacity hover:opacity-90"
            >
              {t('cta_apoie')}
            </a>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="bg-brand-paper px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-brand-teal">
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

      {/* Ecossistema */}
      <section id="ecossistema" className="border-t border-brand-gray/10 bg-brand-paper px-6 py-24">
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

      {/* Apoie */}
      <section id="apoie" className="bg-brand-teal px-6 py-24 text-brand-paper">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            {t('section_support')}
          </h2>
          <p className="mb-10 text-lg opacity-70">
            {t('support_desc')}
          </p>
          <a
            href="https://www.catarse.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-brand-amber px-8 py-4 font-semibold text-brand-ink transition-opacity hover:opacity-90"
          >
            {t('support_cta')}
          </a>
        </div>
      </section>
    </main>
  )
}
