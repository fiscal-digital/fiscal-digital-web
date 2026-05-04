import { cache } from 'react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CaretLeft } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { fetchAlerts, fetchFindingById } from '@/lib/api'
import { findingIdToSlug, findingTypeLabel } from '@/lib/findings'
import FindingDetail from '@/components/FindingDetail'
import ShareButton from '@/components/ShareButton'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

// ISR: pré-renderiza top 50 mais recentes em build-time.
// Findings além desse conjunto são gerados on-demand via ISR (dynamicParams: true — default).
// revalidate=300 → stale-while-revalidate de 5 min para todos (pré e on-demand).
const SSG_LIMIT = 50

export const revalidate = 60

// cache() de React evita chamar a API 3x por request (generateStaticParams,
// generateMetadata e o componente principal fazem fetch do mesmo endpoint).
const getCachedAlerts = cache(async () => fetchAlerts({ size: SSG_LIMIT }))

export async function generateStaticParams() {
  const findings = await getCachedAlerts()
  const ids = findings.map((f) => findingIdToSlug(f.id))
  return routing.locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params

  // GetItem O(1) por slug — funciona para qualquer finding publicado, não só
  // os primeiros 200 (limite da paginação /alerts).
  const finding = await fetchFindingById(id)

  if (!finding) {
    return { title: locale === 'pt-br' ? 'Alerta — Fiscal Digital' : 'Alert — Fiscal Digital' }
  }

  const typeLabel = findingTypeLabel(finding.type, locale as 'pt-br' | 'en-us')
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
  if (!routing.locales.includes(locale as 'pt-br' | 'en-us')) notFound()
  setRequestLocale(locale)

  // GetItem O(1) por slug — substitui o padrão antigo `fetchAlerts.find()`
  // que falhava pra findings além do cap de 200 da paginação.
  const finding = await fetchFindingById(id)

  if (!finding) notFound()

  const t = {
    'pt-br': {
      back: 'Voltar para alertas',
      shareLabel: 'Compartilhar este alerta',
      shareTitle: 'Compartilhar',
      foundInSource: 'Achado pela engine do Fiscal Digital com base no diário oficial publicado pela Prefeitura.',
    },
    'en-us': {
      back: 'Back to alerts',
      shareLabel: 'Share this alert',
      shareTitle: 'Share',
      foundInSource: 'Detected by the Fiscal Digital engine based on the official gazette published by the City Hall.',
    },
  }[locale as 'pt-br' | 'en-us']

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Header strip */}
      <section className="bg-brand-teal px-6 py-12 text-brand-paper">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${locale}/alertas`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-amber hover:underline"
          >
            <CaretLeft size={14} weight="bold" />
            {t.back}
          </Link>
          <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {findingTypeLabel(finding.type, locale as 'pt-br' | 'en-us')} — {finding.city}
          </h1>
          <p className="mt-2 text-sm opacity-70">{t.foundInSource}</p>
        </div>
      </section>

      {/* Detail content */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <FindingDetail finding={finding} locale={locale as 'pt-br' | 'en-us'} />

          {/* Share */}
          <div className="mt-10 flex items-center justify-between border-t border-brand-gray/10 pt-6">
            <p className="text-xs text-brand-gray">{t.shareTitle}</p>
            <ShareButton
              title={`${findingTypeLabel(finding.type, locale as 'pt-br' | 'en-us')} — ${finding.city}`}
              text={(finding.narrative ?? '').slice(0, 200)}
              label={t.shareLabel}
              locale={locale as 'pt-br' | 'en-us'}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
