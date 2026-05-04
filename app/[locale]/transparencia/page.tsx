import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('transparencia_title') }
}

const SOURCE_KEYS = ['querido', 'receita', 'cgu'] as const
const FUTURE_SOURCE_KEYS = ['tse', 'tce', 'portal'] as const
const FLOW_STEPS = ['issue', 'discussion', 'pr', 'review', 'merge'] as const

export default async function TransparenciaPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'transparencia' })

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

      {/* Atalho para custos de operação */}
      <section className="bg-brand-paper px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${locale}/transparencia/custos`}
            className="flex flex-col gap-1 rounded-lg border border-brand-gray/20 bg-brand-paper p-6 transition hover:border-brand-amber sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-wider text-brand-amber">
                {t('costs_link_label')}
              </p>
              <p className="text-lg font-semibold text-brand-teal">
                {t('costs_link_title')}
              </p>
              <p className="mt-1 text-sm text-brand-gray">
                {t('costs_link_desc')}
              </p>
            </div>
            <span className="flex-shrink-0 font-mono text-sm text-brand-amber">
              {t('costs_link_cta')} →
            </span>
          </Link>
        </div>
      </section>

      {/* Critério de publicação */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('criteria_title')}
          </h2>
          <p className="mb-6 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('criteria_body')}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-brand-gray/20 bg-brand-paper p-6">
              <p className="mb-1 font-mono text-xs uppercase tracking-wider text-brand-amber">
                riskScore
              </p>
              <p className="text-3xl font-bold text-brand-teal">≥ 60</p>
              <p className="mt-2 text-sm text-brand-gray">
                {t('criteria_risk_desc')}
              </p>
            </div>
            <div className="rounded-lg border border-brand-gray/20 bg-brand-paper p-6">
              <p className="mb-1 font-mono text-xs uppercase tracking-wider text-brand-amber">
                confidence
              </p>
              <p className="text-3xl font-bold text-brand-teal">≥ 0.70</p>
              <p className="mt-2 text-sm text-brand-gray">
                {t('criteria_confidence_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fontes de dados */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('sources_title')}
          </h2>
          <p className="mb-8 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('sources_body')}
          </p>

          <h3 className="mb-4 text-lg font-semibold text-brand-ink">
            {t('sources_phase1_title')}
          </h3>
          <div className="mb-10 space-y-4">
            {SOURCE_KEYS.map((key) => (
              <article
                key={key}
                className="rounded-lg border border-brand-gray/20 bg-brand-paper p-5"
              >
                <h4 className="mb-1 font-semibold text-brand-ink">
                  {t(`source_${key}_name`)}
                </h4>
                <p className="text-sm leading-relaxed text-brand-gray">
                  {t(`source_${key}_body`)}
                </p>
              </article>
            ))}
          </div>

          <h3 className="mb-4 text-lg font-semibold text-brand-ink">
            {t('sources_phase2_title')}
          </h3>
          <div className="space-y-4">
            {FUTURE_SOURCE_KEYS.map((key) => (
              <article
                key={key}
                className="rounded-lg border border-dashed border-brand-gray/30 bg-brand-paper p-5"
              >
                <h4 className="mb-1 font-semibold text-brand-gray">
                  {t(`source_${key}_name`)}
                </h4>
                <p className="text-sm leading-relaxed text-brand-gray">
                  {t(`source_${key}_body`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Política de retratação */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('retraction_title')}
          </h2>
          <p className="mb-6 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('retraction_body_1')}
          </p>
          <p className="mb-6 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('retraction_body_2')}
          </p>

          <div className="rounded-lg border-l-4 border-brand-amber bg-brand-paper p-6 shadow-sm">
            <p className="font-semibold text-brand-ink">
              {t('retraction_quote')}
            </p>
          </div>
        </div>
      </section>

      {/* Modelo de contribuição */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('contrib_title')}
          </h2>
          <p className="mb-8 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('contrib_body')}
          </p>

          <ol className="mb-10 flex flex-wrap items-center gap-3 font-mono text-sm">
            {FLOW_STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="rounded-md bg-brand-teal px-3 py-1.5 text-brand-paper">
                  {t(`contrib_step_${step}`)}
                </span>
                {i < FLOW_STEPS.length - 1 && (
                  <span aria-hidden className="text-brand-gray">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>

          <h3 className="mb-3 text-lg font-semibold text-brand-ink">
            {t('contrib_pr_title')}
          </h3>
          <ul className="list-inside list-decimal space-y-2 text-base text-brand-ink">
            <li>{t('contrib_pr_req_1')}</li>
            <li>{t('contrib_pr_req_2')}</li>
            <li>{t('contrib_pr_req_3')}</li>
          </ul>

          <p className="mt-8 text-sm text-brand-gray">
            {t('contrib_repo_note')}{' '}
            <a
              href="https://github.com/fiscal-digital"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-brand-teal underline-offset-4 hover:underline"
            >
              github.com/fiscal-digital
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
