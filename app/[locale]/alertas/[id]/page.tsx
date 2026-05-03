import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CaretLeft } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { fetchAlerts } from '@/lib/api'
import { findingIdToSlug, slugToFindingId, findingTypeLabel } from '@/lib/findings'
import FindingDetail from '@/components/FindingDetail'
import ShareButton from './ShareButton'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

// SSG: pré-renderiza até 2000 findings mais recentes em build-time.
// IDs fora desse conjunto retornam 404 (dynamicParams: false). Reanalyze
// gerou 1.286+ publicáveis hoje. Solução definitiva é INF-WEB-001 (ISR);
// até lá, mantemos limite alto + rebuild do site após cada reanalyze.
const SSG_LIMIT = 2000

export async function generateStaticParams() {
  const findings = await fetchAlerts({ limit: SSG_LIMIT })
  const ids = findings.map((f) => findingIdToSlug(f.id))
  return routing.locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const findingId = slugToFindingId(id)
  const findings = await fetchAlerts({ limit: SSG_LIMIT })
  const finding = findings.find((f) => f.id === findingId)

  if (!finding) {
    return { title: locale === 'pt-br' ? 'Alerta — Fiscal Digital' : 'Alert — Fiscal Digital' }
  }

  const typeLabel = findingTypeLabel(finding.type, locale as 'pt-br' | 'en')
  const title = `[${typeLabel}] em ${finding.city} — Fiscal Digital`
  const description = (finding.narrative ?? finding.legalBasis ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150)

  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function AlertaPage({ params }: Props) {
  const { locale, id } = await params
  if (!routing.locales.includes(locale as 'pt-br' | 'en')) notFound()
  setRequestLocale(locale)

  const findingId = slugToFindingId(id)
  const findings = await fetchAlerts({ limit: SSG_LIMIT })
  const finding = findings.find((f) => f.id === findingId)

  if (!finding) notFound()

  const t = {
    'pt-br': {
      back: 'Voltar para alertas',
      shareLabel: 'Compartilhar este alerta',
      shareTitle: 'Compartilhar',
      foundInSource: 'Achado pela engine do Fiscal Digital com base no diário oficial publicado pela Prefeitura.',
    },
    en: {
      back: 'Back to alerts',
      shareLabel: 'Share this alert',
      shareTitle: 'Share',
      foundInSource: 'Detected by the Fiscal Digital engine based on the official gazette published by the City Hall.',
    },
  }[locale as 'pt-br' | 'en']

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Header strip */}
      <section className="bg-brand-teal px-6 py-10 text-brand-paper">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${locale}/alertas`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-amber hover:underline"
          >
            <CaretLeft size={14} weight="bold" />
            {t.back}
          </Link>
          <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {findingTypeLabel(finding.type, locale as 'pt-br' | 'en')} — {finding.city}
          </h1>
          <p className="mt-2 text-sm opacity-70">{t.foundInSource}</p>
        </div>
      </section>

      {/* Detail content */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <FindingDetail finding={finding} locale={locale as 'pt-br' | 'en'} />

          {/* Share */}
          <div className="mt-10 flex items-center justify-between border-t border-brand-gray/10 pt-6">
            <p className="text-xs text-brand-gray">{t.shareTitle}</p>
            <ShareButton
              title={`${findingTypeLabel(finding.type, locale as 'pt-br' | 'en')} — ${finding.city}`}
              text={(finding.narrative ?? '').slice(0, 200)}
              label={t.shareLabel}
              locale={locale as 'pt-br' | 'en'}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
