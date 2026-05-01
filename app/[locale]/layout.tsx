import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { inter, jetbrainsMono } from '@/lib/fonts'
import { routing } from '@/i18n/routing'

type Locale = (typeof routing.locales)[number]

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isPt = locale === 'pt'
  return {
    alternates: {
      canonical: isPt ? '/pt' : '/en',
      languages: { pt: '/pt', en: '/en' },
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  // Habilita renderização estática para esta locale (output: 'export' compatível)
  setRequestLocale(locale)

  const messages = await getMessages({ locale })

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-brand-paper font-sans text-brand-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
