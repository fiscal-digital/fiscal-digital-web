import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'

/**
 * 404 customizada bilíngue.
 *
 * Server component — renderizada estaticamente por locale.
 * Em static export, Next.js gera /pt/404.html e /en/404.html
 * que CloudFront serve em respostas 404.
 *
 * WCAG: heading h1 único, dois CTAs claros (home + alertas),
 * contraste brand-ink sobre brand-paper (16.7:1 — AAA).
 */
type Params = Promise<{ locale: string }>

export default async function NotFound({ params }: { params?: Params }) {
  // Em not-found, params pode não existir (rota raiz). Default para PT.
  const locale = (await params)?.locale ?? 'pt'
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'notFound' })

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center"
    >
      <p className="font-mono text-sm text-brand-amber">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-brand-teal sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-4 max-w-xl text-base text-brand-gray">{t('description')}</p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center rounded-md bg-brand-teal px-5 py-2.5 text-sm font-semibold text-brand-paper transition-opacity hover:opacity-90"
        >
          {t('cta_home')}
        </Link>
        <Link
          href={`/${locale}/alertas`}
          className="inline-flex items-center justify-center rounded-md border border-brand-teal/30 px-5 py-2.5 text-sm font-semibold text-brand-teal transition-colors hover:bg-brand-teal/5"
        >
          {t('cta_alerts')}
        </Link>
      </div>
    </main>
  )
}
