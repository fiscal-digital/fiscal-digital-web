import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('manifesto_title') }
}

const PRINCIPLE_KEYS = [
  'source',
  'factual',
  'transparent',
  'verifiable',
  'retraction',
] as const

const ECOSYSTEM_KEYS = ['serenata', 'querido', 'fiscal'] as const

export default async function ManifestoPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'manifesto' })

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Header */}
      <section className="bg-brand-teal px-6 py-16 text-brand-paper">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            Fiscal Digital
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-base opacity-80 sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('mission_title')}
          </h2>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('mission_body')}
          </p>
        </div>
      </section>

      {/* 5 Principles */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-2xl font-bold tracking-tight text-brand-teal">
            {t('principles_title')}
          </h2>
          <ol className="space-y-8">
            {PRINCIPLE_KEYS.map((key, i) => (
              <li key={key} className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-teal font-mono text-base font-bold text-brand-paper">
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-brand-ink">
                    {t(`principle_${key}_title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-gray sm:text-base">
                    {t(`principle_${key}_body`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('ecosystem_title')}
          </h2>
          <p className="mb-10 text-base leading-relaxed text-brand-gray">
            {t('ecosystem_intro')}
          </p>

          <div className="space-y-6">
            {ECOSYSTEM_KEYS.map((key) => (
              <article
                key={key}
                className="rounded-lg border border-brand-gray/20 bg-brand-paper p-6"
              >
                <h3 className="mb-1 text-lg font-semibold text-brand-ink">
                  {t(`ecosystem_${key}_name`)}
                </h3>
                <p className="mb-2 font-mono text-xs uppercase tracking-wider text-brand-amber">
                  {t(`ecosystem_${key}_scope`)}
                </p>
                <p className="text-sm leading-relaxed text-brand-gray sm:text-base">
                  {t(`ecosystem_${key}_body`)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-lg border-l-4 border-brand-amber bg-brand-paper p-6 shadow-sm">
            <p className="text-base font-semibold text-brand-ink">
              {t('ecosystem_position')}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-gray">
              {t('ecosystem_position_body')}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
