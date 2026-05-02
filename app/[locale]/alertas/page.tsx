import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import AlertsFeed from '@/components/AlertsFeed'
import RssSubscribe from '@/components/RssSubscribe'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const isPt = locale === 'pt'
  const path = isPt ? '/pt/alertas' : '/en/alertas'
  return {
    title: t('alertas_title'),
    description: t('alertas_description'),
    alternates: {
      canonical: path,
      languages: {
        pt: '/pt/alertas',
        en: '/en/alertas',
        'x-default': '/pt/alertas',
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

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Page header */}
      <section className="bg-brand-teal px-6 py-16 text-brand-paper">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            Fiscal Digital
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-base opacity-70 sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Feed */}
            <div>
              <AlertsFeed locale={locale} />
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <RssSubscribe />
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
