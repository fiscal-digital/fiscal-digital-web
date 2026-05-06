import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import AlertsFeedClient from '@/components/AlertsFeedClient'
import { fetchAlerts } from '@/lib/api'
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

  // SSR/ISR: fetch findings no servidor para hydration sem flash de skeleton.
  // Sem isso, o cliente monta com loading=true → fetch → setLoading(false)
  // criando cascata visual ("piscar até estabilizar"). Com isso, HTML estático
  // já chega com cards renderizados e React hidrata sem trocar UI.
  // Tolera falha (fetchAlerts retorna [] em erro) — feed vazio melhor que
  // build quebrado.
  const initialFindings = (await fetchAlerts({ size: 200 })) as unknown as Finding[]

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
          <AlertsFeedClient locale={locale} initialFindings={initialFindings} />
        </div>
      </section>
    </main>
  )
}
