import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import {
  Database,
  Rss,
  Code,
  FileText,
  Scales,
  ArrowSquareOut,
} from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { fetchAlertsWithTotal } from '@/lib/api'
import { buildDatasetJsonLd } from '@/lib/llms-txt'

type Props = {
  params: Promise<{ locale: string }>
}

export const revalidate = 3600

const API_PUBLIC = 'https://api.fiscaldigital.org'
const SITE = 'https://fiscaldigital.org'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isPt = locale === 'pt-br'
  return {
    title: isPt
      ? 'Dataset Fiscal Digital — Alertas verificáveis sob CC-BY-4.0'
      : 'Fiscal Digital Dataset — Verifiable alerts under CC-BY-4.0',
    description: isPt
      ? 'Corpus aberto de alertas de fiscalização autônoma de gastos públicos municipais brasileiros. Licença CC-BY-4.0. Acessível via RSS, API REST e Markdown.'
      : 'Open corpus of alerts from autonomous oversight of Brazilian municipal public spending. CC-BY-4.0 license. Accessible via RSS, REST API and Markdown.',
  }
}

export default async function DadosPage({ params }: Props) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'pt-br' | 'en-us')) notFound()
  setRequestLocale(locale)

  const data = await fetchAlertsWithTotal({ size: 1 })
  const totalFindings = data.total
  const citiesCount = data.citiesCount
  const lastFindingAt = data.items[0]?.createdAt ?? null

  const datasetJsonLd = buildDatasetJsonLd({
    locale: locale as 'pt-br' | 'en-us',
    totalFindings,
    citiesCount,
    lastFindingAt,
  })

  const t = TEXTS[locale as 'pt-br' | 'en-us']

  const distributions = [
    {
      icon: Rss,
      title: t.distRssTitle,
      description: t.distRssDesc,
      url: `${API_PUBLIC}/rss`,
      format: 'application/rss+xml',
    },
    {
      icon: Code,
      title: t.distApiTitle,
      description: t.distApiDesc,
      url: `${API_PUBLIC}/alerts`,
      format: 'application/json',
    },
    {
      icon: FileText,
      title: t.distMdTitle,
      description: t.distMdDesc,
      url: `${SITE}/llms-full.txt`,
      format: 'text/markdown',
    },
  ]

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* JSON-LD inline (script HTML5 — não next/script). next/script com
          strategy=beforeInteractive injeta lazy via streaming RSC, então crawlers
          que não rodam JS (curl, Common Crawl bot legacy) não veem no SSR puro. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-brand-teal px-6 py-16 text-brand-paper">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            <Database size={14} weight="bold" className="mr-1 inline align-text-bottom" />
            {t.eyebrow}
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
            {t.title}
          </h1>
          <p className="max-w-2xl text-base opacity-80 sm:text-lg">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-brand-gray/10 bg-brand-paper px-6 py-10">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          <Stat label={t.statTotal} value={totalFindings.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US')} />
          <Stat label={t.statCities} value={citiesCount.toString()} />
          <Stat label={t.statLastUpdate} value={lastFindingAt ? new Date(lastFindingAt).toLocaleDateString(locale === 'pt-br' ? 'pt-BR' : 'en-US') : '—'} />
        </div>
      </section>

      {/* Distributions */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-brand-teal">
            {t.distTitle}
          </h2>
          <p className="mb-8 text-sm text-brand-gray">{t.distSubtitle}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {distributions.map(({ icon: Icon, title, description, url, format }) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-lg border border-brand-gray/15 bg-white p-5 transition hover:border-brand-teal hover:shadow-sm"
              >
                <Icon size={28} weight="duotone" className="mb-3 text-brand-teal" />
                <h3 className="mb-1 font-semibold text-brand-ink">{title}</h3>
                <p className="mb-3 text-sm text-brand-gray">{description}</p>
                <code className="mt-auto text-xs text-brand-gray">{format}</code>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* License + citation */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            <Scales size={24} weight="duotone" className="mr-2 inline align-text-bottom text-brand-teal" />
            {t.licenseTitle}
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-brand-ink">
            <p>
              {t.licenseP1}{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-teal underline hover:text-brand-teal/80"
              >
                CC-BY-4.0
                <ArrowSquareOut size={12} weight="bold" className="ml-0.5 inline" />
              </a>
              .
            </p>
            <p>{t.licenseP2}</p>
            <div className="rounded-md bg-brand-gray/5 p-4 font-mono text-sm">
              {t.citationExample}
            </div>
            <p className="text-sm text-brand-gray">
              {t.basedOn}{' '}
              <a
                href="https://queridodiario.ok.org.br"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-brand-teal"
              >
                Querido Diário/OKFN
                <ArrowSquareOut size={12} weight="bold" className="ml-0.5 inline" />
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Methodology link */}
      <section className="bg-brand-teal/5 px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-teal">
            {t.methodologyEyebrow}
          </p>
          <p className="mb-6 text-base text-brand-ink">{t.methodologyDesc}</p>
          <Link
            href={`/${locale}/fiscais`}
            className="inline-flex items-center gap-2 rounded-md bg-brand-teal px-5 py-2.5 text-sm font-semibold text-brand-paper hover:bg-brand-teal/90"
          >
            {t.methodologyCta}
          </Link>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-3xl font-bold tracking-tight text-brand-teal">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-brand-gray">{label}</p>
    </div>
  )
}

const TEXTS = {
  'pt-br': {
    eyebrow: 'Dataset aberto',
    title: 'Dataset Fiscal Digital',
    subtitle:
      'Corpus de alertas verificáveis de fiscalização autônoma de gastos públicos municipais. Atualizado diariamente. Licença CC-BY-4.0.',
    statTotal: 'Alertas publicáveis',
    statCities: 'Cidades cobertas',
    statLastUpdate: 'Última atualização',
    distTitle: 'Como acessar',
    distSubtitle: 'Três formas de consumir o corpus, alinhadas com diferentes ferramentas.',
    distRssTitle: 'Feed RSS',
    distRssDesc: 'Atualizações em tempo real. Compatível com qualquer leitor RSS ou Newsboat, Inoreader, Feedly.',
    distApiTitle: 'API REST',
    distApiDesc: 'JSON paginado com filtros por cidade, estado e tipo. Decorada com headers de citação (X-Source, X-License).',
    distMdTitle: 'Markdown completo',
    distMdDesc: 'Corpus em markdown auto-contido, otimizado para consumo por LLMs e agentes de IA.',
    licenseTitle: 'Licença e atribuição',
    licenseP1: 'Os dados estão sob licença',
    licenseP2: 'Você pode usar, redistribuir e adaptar livremente, desde que cite a fonte.',
    citationExample:
      'Fiscal Digital (fiscaldigital.org). Alertas de fiscalização autônoma de gastos públicos municipais. CC-BY-4.0.',
    basedOn: 'Dados derivados de diários oficiais municipais publicados via',
    methodologyEyebrow: 'Metodologia',
    methodologyDesc: 'Entenda como os 10 agentes Fiscais detectam padrões nos diários oficiais.',
    methodologyCta: 'Ver os 10 Fiscais',
  },
  'en-us': {
    eyebrow: 'Open dataset',
    title: 'Fiscal Digital Dataset',
    subtitle:
      'Corpus of verifiable alerts from autonomous oversight of Brazilian municipal public spending. Updated daily. CC-BY-4.0 license.',
    statTotal: 'Publishable alerts',
    statCities: 'Cities covered',
    statLastUpdate: 'Last update',
    distTitle: 'How to access',
    distSubtitle: 'Three ways to consume the corpus, aligned with different tools.',
    distRssTitle: 'RSS feed',
    distRssDesc: 'Real-time updates. Compatible with any RSS reader (Newsboat, Inoreader, Feedly).',
    distApiTitle: 'REST API',
    distApiDesc: 'Paginated JSON with filters by city, state and type. Decorated with citation headers (X-Source, X-License).',
    distMdTitle: 'Full markdown',
    distMdDesc: 'Self-contained markdown corpus optimized for LLMs and AI agents.',
    licenseTitle: 'License and attribution',
    licenseP1: 'The data is licensed under',
    licenseP2: 'You may use, redistribute and adapt freely as long as the source is cited.',
    citationExample:
      'Fiscal Digital (fiscaldigital.org). Autonomous oversight alerts of Brazilian municipal public spending. CC-BY-4.0.',
    basedOn: 'Data derived from municipal official gazettes published via',
    methodologyEyebrow: 'Methodology',
    methodologyDesc: 'Learn how the 10 Fiscal agents detect patterns in official gazettes.',
    methodologyCta: 'Meet the 10 Fiscals',
  },
}
