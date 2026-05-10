import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle, Sparkle, Clock, ArrowRight, ChartLineUp } from '@phosphor-icons/react/dist/ssr'

type Props = {
  params: Promise<{ locale: string }>
}

type CardStatus = 'now' | 'recent' | 'next'

interface EvolutionCard {
  key:
    | 'supplier_index'
    | 'golden_set'
    | 'infra'
    | 'perf'
    | 'search'
    | 'coverage'
  status: CardStatus
}

// Ordem visual: agora primeiro, depois entregas recentes, depois próximas frentes.
const CARDS: EvolutionCard[] = [
  { key: 'supplier_index', status: 'now' },
  { key: 'golden_set',     status: 'now' },
  { key: 'search',         status: 'recent' },
  { key: 'perf',           status: 'recent' },
  { key: 'infra',          status: 'recent' },
  { key: 'coverage',       status: 'next' },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const isPt = locale === 'pt-br'
  const path = isPt ? '/pt-br/evolucao' : '/en-us/evolucao'
  return {
    title: t('evolucao_title'),
    description: t('evolucao_description'),
    alternates: {
      canonical: path,
      languages: {
        'pt-br': '/pt-br/evolucao',
        'en-us': '/en-us/evolucao',
        'x-default': '/pt-br/evolucao',
      },
    },
    openGraph: {
      title: t('evolucao_title'),
      description: t('evolucao_description'),
      url: path,
      locale: isPt ? 'pt_BR' : 'en_US',
    },
  }
}

function StatusBadge({ status, labels }: { status: CardStatus; labels: { now: string; recent: string; next: string } }) {
  if (status === 'now') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-amber/15 px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
        <Sparkle size={12} weight="fill" className="text-brand-amber" />
        {labels.now}
      </span>
    )
  }
  if (status === 'recent') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-semibold text-brand-teal">
        <CheckCircle size={12} weight="fill" />
        {labels.recent}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-gray/15 px-2.5 py-0.5 text-xs font-semibold text-brand-gray">
      <Clock size={12} weight="fill" />
      {labels.next}
    </span>
  )
}

export default async function EvolucaoPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'evolucao' })

  const statusLabels = {
    now: locale === 'pt-br' ? 'Em construção' : 'In progress',
    recent: locale === 'pt-br' ? 'Entregue' : 'Shipped',
    next: locale === 'pt-br' ? 'Próximo' : 'Next',
  }

  const sectionTitle = (status: CardStatus): string => {
    if (status === 'now') return t('section_now_title')
    if (status === 'recent') return t('section_recent_title')
    return t('section_next_title')
  }

  const sectionSubtitle = (status: CardStatus): string => {
    if (status === 'now') return t('section_now_subtitle')
    if (status === 'recent') return t('section_recent_subtitle')
    return t('section_next_subtitle')
  }

  const groupedCards: Record<CardStatus, EvolutionCard[]> = {
    now: CARDS.filter((c) => c.status === 'now'),
    recent: CARDS.filter((c) => c.status === 'recent'),
    next: CARDS.filter((c) => c.status === 'next'),
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

      {/* Por que importa */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-brand-teal">
            {t('intro_title')}
          </h2>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('intro_body')}
          </p>
        </div>
      </section>

      {/* Cards por seção (now → recent → next) */}
      {(['now', 'recent', 'next'] as const).map((status) => (
        <section key={status} className="border-t border-brand-gray/10 px-6 py-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-brand-teal">
                {sectionTitle(status)}
              </h2>
              <p className="text-sm text-brand-gray">{sectionSubtitle(status)}</p>
            </div>
            <div className="space-y-4">
              {groupedCards[status].map((card) => (
                <article
                  key={card.key}
                  className="rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-brand-ink">
                      {t(`cards.${card.key}_title` as Parameters<typeof t>[0])}
                    </h3>
                    <StatusBadge status={card.status} labels={statusLabels} />
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-brand-ink sm:text-base">
                    {t(`cards.${card.key}_what` as Parameters<typeof t>[0])}
                  </p>
                  <p className="mb-3 text-sm leading-relaxed text-brand-gray sm:text-base">
                    {t(`cards.${card.key}_why` as Parameters<typeof t>[0])}
                  </p>
                  <p className="border-t border-brand-gray/10 pt-3 font-mono text-xs text-brand-gray">
                    {t(`cards.${card.key}_metric` as Parameters<typeof t>[0])}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Como medimos */}
      <section className="border-t border-brand-gray/10 px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
              <ChartLineUp size={22} weight="regular" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-brand-teal">
              {t('method_title')}
            </h2>
          </div>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('method_body')}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/${locale}/transparencia/custos`}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-teal/30 bg-white px-4 py-2 text-sm font-semibold text-brand-teal transition-colors hover:bg-brand-teal/5"
            >
              {t('method_cta_metrics')}
              <ArrowRight size={14} weight="bold" />
            </Link>
            <Link
              href={`/${locale}/alertas`}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-teal/30 bg-white px-4 py-2 text-sm font-semibold text-brand-teal transition-colors hover:bg-brand-teal/5"
            >
              {t('method_cta_alerts')}
              <ArrowRight size={14} weight="bold" />
            </Link>
            <a
              href="https://github.com/fiscal-digital"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-teal/30 bg-white px-4 py-2 text-sm font-semibold text-brand-teal transition-colors hover:bg-brand-teal/5"
            >
              {t('method_cta_code')}
              <ArrowRight size={14} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* Apoie */}
      <section className="border-t border-brand-gray/10 bg-brand-teal/5 px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-brand-teal">
            {t('support_title')}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('support_body')}
          </p>
          <div className="pt-2">
            <a
              href="https://www.catarse.me/fiscaldigitalbr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-amber px-5 py-2.5 text-sm font-semibold text-brand-ink transition-opacity hover:opacity-90"
            >
              {t('support_cta')}
              <ArrowRight size={14} weight="bold" />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
