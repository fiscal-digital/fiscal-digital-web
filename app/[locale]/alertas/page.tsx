import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import AlertsFeedClient from '@/components/AlertsFeedClient'
import { fetchAlertsWithTotal } from '@/lib/api'
import type { Finding } from '@/components/AlertsFeed'

export const revalidate = 60

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const isPt = locale === 'pt-br'
  const path = isPt ? '/pt-br/alertas' : '/en-us/alertas'
  return {
    title: t('alertas_title'),
    description: t('alertas_description'),
    alternates: {
      canonical: path,
      languages: {
        'pt-br': '/pt-br/alertas',
        'en-us': '/en-us/alertas',
        'x-default': '/pt-br/alertas',
      },
    },
    openGraph: {
      title: t('alertas_title'),
      description: t('alertas_description'),
      url: path,
      locale: isPt ? 'pt_BR' : 'en_US',
    },
  }
}

export default async function AlertasPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'alertas' })

  // SSR/ISR: fetch findings + pageInfo no servidor para hydration sem flash.
  // Antes (LRN-20260506-001) usava fetchAlerts → só items, sem total. KPI
  // mostrava items.length=200 em vez do total real (~180 pós Ciclo 4.1).
  // fetchAlertsWithTotal expõe pageInfo.total, totalValue e citiesCount —
  // KPI agora reflete o universo todo, não só a primeira página.
  const result = await fetchAlertsWithTotal({ size: 200 })
  const initialFindings = result.items as unknown as Finding[]
  const initialPageInfo = {
    total: result.total,
    totalValue: result.totalValue,
    citiesCount: result.citiesCount,
    // Campos de paginação não usados no KpiBar mas exigidos pela interface
    page: 1,
    pageSize: result.items.length,
    totalPages: Math.max(1, Math.ceil(result.total / Math.max(1, result.items.length))),
  }

  return (
    <main className="min-h-dvh bg-brand-paper">
      <section className="bg-brand-teal px-6 py-16 text-brand-paper">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-base opacity-75 sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <AlertsFeedClient
            locale={locale}
            initialFindings={initialFindings}
            initialPageInfo={initialPageInfo}
          />
        </div>
      </section>
    </main>
  )
}
