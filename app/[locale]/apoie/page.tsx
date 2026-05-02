import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('apoie_title') }
}

const COST_KEYS = ['llm', 'aws', 'domain'] as const

export default async function ApoiePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'apoie' })

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

      {/* Por que apoiar */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-5">
          <h2 className="text-2xl font-bold tracking-tight text-brand-teal">
            {t('why_title')}
          </h2>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('why_body_1')}
          </p>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('why_body_2')}
          </p>
        </div>
      </section>

      {/* Catarse */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg bg-brand-teal p-8 text-brand-paper sm:p-10">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-brand-amber">
              {t('catarse_label')}
            </p>
            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
              {t('catarse_title')}
            </h2>
            <p className="mb-6 text-base leading-relaxed opacity-80 sm:text-lg">
              {t('catarse_body')}
            </p>
            <p className="mb-8 text-sm leading-relaxed opacity-70">
              {t('catarse_model')}
            </p>
            <a
              href="https://www.catarse.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-brand-amber px-8 py-4 font-semibold text-brand-ink transition-opacity hover:opacity-90"
            >
              {t('catarse_cta')}
            </a>
          </div>
        </div>
      </section>

      {/* GitHub Sponsors */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('github_title')}
          </h2>
          <p className="mb-8 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('github_body')}
          </p>
          <a
            href="https://github.com/sponsors/fiscal-digital"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg border border-brand-teal px-6 py-3 font-semibold text-brand-teal transition-opacity hover:opacity-80"
          >
            {t('github_cta')}
          </a>
        </div>
      </section>

      {/* Transparência financeira */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('finance_title')}
          </h2>
          <p className="mb-6 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('finance_body_1')}
          </p>
          <p className="mb-10 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('finance_body_2')}
          </p>

          <h3 className="mb-4 text-lg font-semibold text-brand-ink">
            {t('costs_title')}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {COST_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-lg border border-brand-gray/20 bg-brand-paper p-5"
              >
                <p className="mb-1 font-mono text-xs uppercase tracking-wider text-brand-amber">
                  {t(`cost_${key}_label`)}
                </p>
                <p className="text-base font-semibold text-brand-ink">
                  {t(`cost_${key}_value`)}
                </p>
                <p className="mt-2 text-sm text-brand-gray">
                  {t(`cost_${key}_desc`)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-lg border-l-4 border-brand-teal bg-brand-paper p-6 shadow-sm">
            <p className="text-base text-brand-ink">
              {t('finance_quote')}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
