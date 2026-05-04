import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import FiscalCard, { type FiscalCardProps, type FiscalId } from '@/components/FiscalCard'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('fiscais_title'),
    description: t('fiscais_description'),
  }
}

// Criteria and exclusion counts per fiscal
const FISCAL_COUNTS: Record<FiscalId, { criteria: number; exclusions: number }> = {
  geral:        { criteria: 0, exclusions: 0 },
  licitacoes:   { criteria: 3, exclusions: 2 },
  contratos:    { criteria: 3, exclusions: 2 },
  fornecedores: { criteria: 2, exclusions: 2 },
  pessoal:      { criteria: 2, exclusions: 3 },
  nepotismo:    { criteria: 1, exclusions: 4 },
  publicidade:  { criteria: 2, exclusions: 3 },
  locacao:      { criteria: 2, exclusions: 2 },
  diarias:      { criteria: 2, exclusions: 2 },
  convenios:    { criteria: 2, exclusions: 3 },
}

const SPECIALIZED: FiscalId[] = [
  'licitacoes',
  'contratos',
  'fornecedores',
  'pessoal',
  'nepotismo',
  'publicidade',
  'locacao',
  'diarias',
  'convenios',
]

export default async function FiscaisPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'fiscais' })

  const sharedLabels = {
    criteriaLabel:         t('label_criteria'),
    exclusionsLabel:       t('label_exclusions'),
    legalLabel:            t('label_legal'),
    thresholdsLabel:       t('label_thresholds'),
    thMetric:              t('label_th_metric'),
    thValue:               t('label_th_value'),
    elevatedConfidenceLabel: t('label_confidence_elevated'),
  }

  function buildCard(id: FiscalId): FiscalCardProps {
    const { criteria: nCriteria, exclusions: nExclusions } = FISCAL_COUNTS[id]

    const criteria: string[] = Array.from({ length: nCriteria }, (_, i) =>
      t(`${id}.criteria_${i + 1}` as Parameters<typeof t>[0])
    )
    const exclusions: string[] = Array.from({ length: nExclusions }, (_, i) =>
      t(`${id}.exclusion_${i + 1}` as Parameters<typeof t>[0])
    )

    return {
      id,
      name:      t(`${id}.name`      as Parameters<typeof t>[0]),
      role:      t(`${id}.role`      as Parameters<typeof t>[0]),
      criteria,
      exclusions,
      legal:     t(`${id}.legal`     as Parameters<typeof t>[0]),
      thresholds: [
        {
          metric: t(`${id}.threshold_riskscore`     as Parameters<typeof t>[0]),
          value:  t(`${id}.threshold_riskscore_val` as Parameters<typeof t>[0]),
        },
        {
          metric: t(`${id}.threshold_confidence`     as Parameters<typeof t>[0]),
          value:  t(`${id}.threshold_confidence_val` as Parameters<typeof t>[0]),
        },
        {
          metric: t(`${id}.threshold_reference`     as Parameters<typeof t>[0]),
          value:  t(`${id}.threshold_reference_val` as Parameters<typeof t>[0]),
        },
      ],
      ...sharedLabels,
    }
  }

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Hero */}
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

      {/* Fiscal Geral — orquestrador */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            {t('label_orchestrator')}
          </p>
          <article className="rounded-xl border border-brand-teal/30 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-teal text-brand-paper">
                {/* TreeStructure icon — inlined SVG to keep server component without extra import */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                  <path d="M160,80a32,32,0,1,0-40,31V128H72a8,8,0,0,0-8,8v16H48a32,32,0,1,0,0,16H64v16a8,8,0,0,0,8,8h48v16.94a32,32,0,1,0,16,0V192h48a8,8,0,0,0,8-8V136a8,8,0,0,0-8-8H136v-17A32.06,32.06,0,0,0,160,80ZM48,192a16,16,0,1,1,16,16A16,16,0,0,1,48,192ZM128,48a16,16,0,1,1-16,16A16,16,0,0,1,128,48ZM112,224a16,16,0,1,1,16,16A16,16,0,0,1,112,224Zm72-40H80V144h104Z"/>
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-brand-ink">{t('geral.name')}</h2>
                <p className="mt-1 text-sm text-brand-gray">{t('geral.role')}</p>
                <p className="mt-4 text-sm leading-relaxed text-brand-ink">{t('geral.description')}</p>
                <p className="mt-4 border-t border-brand-gray/10 pt-3 text-xs leading-relaxed text-brand-gray">
                  <span className="font-semibold uppercase tracking-wide">{t('label_legal')}:</span>{' '}
                  {t('geral.legal')}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Grid dos 9 Fiscais especializados */}
      <section className="border-t border-brand-gray/10 px-6 pb-16 pt-12">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            {t('label_specialized')}
          </p>

          <div className="space-y-3">
            {SPECIALIZED.map((id) => (
              <FiscalCard key={id} {...buildCard(id)} />
            ))}
          </div>

          {/* Agentes operacionais — categoria distinta dos fiscais de fiscalização legal */}
          <p className="mb-4 mt-12 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            {t('label_operational')}
          </p>
          <article className="rounded-xl border border-brand-teal/30 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-teal text-brand-paper">
                {/* CurrencyDollar icon — inline SVG (server component) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                  <path d="M152,120H136V56h8a32,32,0,0,1,32,32,8,8,0,0,0,16,0,48.05,48.05,0,0,0-48-48h-8V24a8,8,0,0,0-16,0V40h-8a48,48,0,0,0,0,96h8v64H104a32,32,0,0,1-32-32,8,8,0,0,0-16,0,48.05,48.05,0,0,0,48,48h16v16a8,8,0,0,0,16,0V216h16a48,48,0,0,0,0-96Zm-40,0a32,32,0,0,1,0-64h8v64Zm40,80H136V136h16a32,32,0,0,1,0,64Z"/>
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-brand-ink">{t('custos.name')}</h2>
                <p className="mt-1 text-sm text-brand-gray">{t('custos.role')}</p>
                <p className="mt-4 text-sm leading-relaxed text-brand-ink">{t('custos.description')}</p>
                <p className="mt-4 border-t border-brand-gray/10 pt-3 text-xs leading-relaxed text-brand-gray">
                  <span className="font-semibold uppercase tracking-wide">{t('custos.threshold_label')}:</span>{' '}
                  {t('custos.threshold_value')}
                </p>
                <p className="mt-3">
                  <Link
                    href={`/${locale}/transparencia/custos`}
                    className="font-mono text-sm text-brand-teal underline-offset-4 hover:underline"
                  >
                    {t('custos.cta')} →
                  </Link>
                </p>
              </div>
            </div>
          </article>

          <p className="mt-8 text-sm text-brand-gray">
            {locale === 'pt'
              ? 'Critérios completos e histórico de calibração em'
              : 'Full criteria and calibration history at'}{' '}
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
