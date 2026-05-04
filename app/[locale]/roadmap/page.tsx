import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { CheckCircle, Circle, Spinner } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import RoadmapStats from '@/components/RoadmapStats'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('roadmap_title'),
    description: t('roadmap_description'),
  }
}

type TimelineStatus = 'done' | 'active' | 'planned'

interface TimelineItem {
  labelKey: string
  dateKey: string
  descKey: string
  status: TimelineStatus
}

const TIMELINE_ITEMS: TimelineItem[] = [
  { labelKey: 'step0_label', dateKey: 'step0_date', descKey: 'step0_desc', status: 'done' },
  { labelKey: 'sprint1_label', dateKey: 'sprint1_date', descKey: 'sprint1_desc', status: 'done' },
  { labelKey: 'sprint2_label', dateKey: 'sprint2_date', descKey: 'sprint2_desc', status: 'done' },
  { labelKey: 'sprint3_label', dateKey: 'sprint3_date', descKey: 'sprint3_desc', status: 'done' },
  { labelKey: 'sprint4_label', dateKey: 'sprint4_date', descKey: 'sprint4_desc', status: 'done' },
  { labelKey: 'sprint5_label', dateKey: 'sprint5_date', descKey: 'sprint5_desc', status: 'active' },
  { labelKey: 'sprint6_label', dateKey: 'sprint6_date', descKey: 'sprint6_desc', status: 'planned' },
]

const INFRA_TABLE = [
  {
    component: 'Análise de gazettes (extração)',
    service: 'AWS Bedrock',
    cost: '~R$ 0,27 por 1.000 gazettes',
  },
  {
    component: 'Geração de narrativas',
    service: 'AWS Bedrock',
    cost: '~R$ 4,44 por 1.000 alertas',
  },
  {
    component: 'Armazenamento',
    service: 'AWS DynamoDB + S3',
    cost: '< R$ 10',
  },
  {
    component: 'Site',
    service: 'AWS CloudFront',
    cost: '< R$ 5',
  },
  {
    component: 'Limite configurado',
    service: 'AWS Budget',
    cost: 'R$ 115 alerta / R$ 115 bloqueio',
    highlight: true,
  },
]

const INFRA_TABLE_EN = [
  {
    component: 'Gazette analysis (extraction)',
    service: 'AWS Bedrock',
    cost: '~R$ 0.27 per 1,000 gazettes',
  },
  {
    component: 'Narrative generation',
    service: 'AWS Bedrock',
    cost: '~R$ 4.44 per 1,000 alerts',
  },
  {
    component: 'Storage',
    service: 'AWS DynamoDB + S3',
    cost: '< R$ 10',
  },
  {
    component: 'Site',
    service: 'AWS CloudFront',
    cost: '< R$ 5',
  },
  {
    component: 'Configured limit',
    service: 'AWS Budget',
    cost: 'R$ 115 alert / R$ 115 block',
    highlight: true,
  },
]

function StatusBadge({ status, labels }: { status: TimelineStatus; labels: { done: string; active: string; planned: string } }) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2 py-0.5 text-xs font-semibold text-brand-teal">
        <CheckCircle size={12} weight="fill" />
        {labels.done}
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-amber/20 px-2 py-0.5 text-xs font-semibold text-brand-ink">
        <Spinner size={12} weight="bold" />
        {labels.active}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-gray/10 px-2 py-0.5 text-xs font-semibold text-brand-gray">
      <Circle size={12} weight="regular" />
      {labels.planned}
    </span>
  )
}

export default async function RoadmapPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'roadmap' })

  const statusLabels = {
    done: t('status_done'),
    active: t('status_active'),
    planned: t('status_planned'),
  }

  const infraTable = locale === 'pt' ? INFRA_TABLE : INFRA_TABLE_EN

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

      {/* Seção 1 — Passo 0: a provocação */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-brand-teal">
            {t('origin_title')}
          </h2>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
              {t('origin_p1')}
            </p>
            <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
              {t('origin_p2')}{' '}
              <a
                href="https://serenata.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-teal underline underline-offset-2 hover:opacity-80"
              >
                Serenata de Amor
              </a>{' '}
              {t('origin_p2_mid')}{' '}
              <a
                href="https://queridodiario.ok.org.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-teal underline underline-offset-2 hover:opacity-80"
              >
                Querido Diário
              </a>{' '}
              {t('origin_p2_end')}
            </p>
            <p className="border-l-4 border-brand-amber bg-brand-paper py-3 pl-5 text-base italic leading-relaxed text-brand-ink sm:text-lg">
              {t('origin_p3')}
            </p>
            <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
              {t('origin_p4')}
            </p>
            <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
              {t('origin_p5')}
            </p>
          </div>
        </div>
      </section>

      {/* Seção 2 — Linha do tempo */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-2xl font-bold tracking-tight text-brand-teal">
            {t('timeline_title')}
          </h2>

          <ol className="relative border-l-2 border-brand-gray/20 pl-8 space-y-10">
            {TIMELINE_ITEMS.map((item) => (
              <li key={item.labelKey} className="relative">
                {/* Dot */}
                <span
                  className={`absolute -left-[2.6rem] flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    item.status === 'done'
                      ? 'border-brand-teal bg-brand-teal'
                      : item.status === 'active'
                        ? 'border-brand-amber bg-brand-amber'
                        : 'border-brand-gray/40 bg-brand-paper'
                  }`}
                >
                  {item.status === 'done' && (
                    <CheckCircle size={12} weight="fill" className="text-brand-paper" />
                  )}
                </span>

                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-brand-ink">
                      {t(`timeline_items.${item.labelKey}`)}
                    </h3>
                    <p className="font-mono text-xs text-brand-gray">
                      {t(`timeline_items.${item.dateKey}`)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} labels={statusLabels} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-brand-gray">
                  {t(`timeline_items.${item.descKey}`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Seção 3 — Cobertura atual */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-brand-teal">
            {t('coverage_title')}
          </h2>
          <ul className="space-y-3 text-base text-brand-ink">
            {[
              t('coverage_cities'),
              t('coverage_origin'),
              t('coverage_pipeline'),
              t('coverage_next'),
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                <span className="leading-relaxed text-brand-ink">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Seção 4 — Custos e sustentabilidade */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-12">
          <h2 className="text-2xl font-bold tracking-tight text-brand-teal">
            {t('costs_title')}
          </h2>

          {/* 4A — Ao vivo (client) */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-brand-ink">
              {t('costs_live_title')}
            </h3>
            <RoadmapStats />
          </div>

          {/* 4B — Modelo de infraestrutura (estático) */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-brand-ink">
              {t('costs_infra_title')}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-brand-gray/20">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-teal text-brand-paper">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('costs_infra_component')}</th>
                    <th className="px-4 py-3 font-semibold">{t('costs_infra_service')}</th>
                    <th className="px-4 py-3 font-semibold">{t('costs_infra_cost')}</th>
                  </tr>
                </thead>
                <tbody>
                  {infraTable.map((row, i) => (
                    <tr
                      key={row.component}
                      className={
                        row.highlight
                          ? 'bg-brand-amber/10 font-semibold'
                          : i % 2 === 0
                            ? 'bg-brand-paper'
                            : 'bg-brand-gray/5'
                      }
                    >
                      <td className="px-4 py-3 text-brand-ink">{row.component}</td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-gray">{row.service}</td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-ink">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-brand-gray">
              {t('costs_infra_note')}
            </p>
          </div>

          {/* 4C — Modelo de captação */}
          <div className="rounded-lg border-l-4 border-brand-amber bg-brand-paper p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-brand-ink">
              {t('costs_funding_title')}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-brand-gray sm:text-base">
              {t('costs_funding_body')}
            </p>
            <Link
              href={`/${locale}/apoie`}
              className="inline-block rounded-md bg-brand-amber px-4 py-2 text-sm font-semibold text-brand-ink transition-opacity hover:opacity-90"
            >
              {t('costs_funding_cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Seção 5 — Avaliações em curso */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('eval_title')}
          </h2>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('eval_body')}
          </p>
        </div>
      </section>
    </main>
  )
}
