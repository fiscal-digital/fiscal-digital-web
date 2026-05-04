import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import AlertsFeedClient from '@/components/AlertsFeedClient'
import ShareButton from '@/components/ShareButton'

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
  const lang: 'pt-br' | 'en-us' = locale === 'en-us' ? 'en-us' : 'pt-br'
  const isPt = lang === 'pt-br'

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Page header — compacto, full width. ShareButton à direita (mesmo
          padrão da página de cidade — UX uniforme). */}
      <section className="bg-brand-teal px-6 py-16 text-brand-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl text-base opacity-75 sm:text-lg">
              {t('subtitle')}
            </p>
          </div>
          <ShareButton
            title={isPt ? 'Alertas — Fiscal Digital' : 'Alerts — Fiscal Digital'}
            text={
              isPt
                ? 'Achados de fiscalização de gastos públicos publicados pelos Fiscais.'
                : 'Public spending oversight findings published by the Fiscal Agents.'
            }
            label={isPt ? 'Compartilhar página de alertas' : 'Share alerts page'}
            locale={lang}
          />
        </div>
      </section>

      {/* Feed full width — KPIs + toolbar (filtros + RSS) + grid 3-4 colunas
          gerenciados internamente pelo AlertsFeedClient. Removida sidebar lateral
          que desperdiçava espaço — RSS virou item da toolbar. */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <AlertsFeedClient locale={locale} />
        </div>
      </section>
    </main>
  )
}
