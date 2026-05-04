import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const SITE_URL = 'https://fiscaldigital.org'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Fiscal Digital',
    default: 'Fiscal Digital — Fiscalização autônoma de gastos públicos',
  },
  description:
    'Agentes autônomos que leem diários oficiais municipais e transformam dados públicos em alertas verificáveis.',
  openGraph: {
    siteName: 'Fiscal Digital',
    type: 'website',
    images: [{ url: '/brand/social/github-social-preview.png', width: 1280, height: 640 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@FiscalDigitalBR',
  },
  icons: {
    icon: [
      { url: '/brand/logo/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/logo/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: { url: '/brand/logo/favicon-256.png', sizes: '256x256' },
  },
}

// JSON-LD Organization — schema.org/Organization
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Fiscal Digital',
  alternateName: 'FiscalDigital',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo/wordmark.png`,
  description:
    'Agente autônomo de fiscalização de gastos públicos municipais no Brasil. Transforma diários oficiais em alertas verificáveis.',
  foundingDate: '2026',
  sameAs: [
    'https://twitter.com/FiscalDigitalBR',
    'https://github.com/fiscal-digital',
  ],
  knowsAbout: [
    'Brazilian municipal public spending',
    'Open government data',
    'Civic technology',
    'Querido Diário',
  ],
  areaServed: {
    '@type': 'Country',
    name: 'Brazil',
  },
}

// JSON-LD WebSite — schema.org/WebSite com SearchAction
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Fiscal Digital',
  description:
    'Fiscalização autônoma de gastos públicos municipais no Brasil — alertas verificáveis com fonte citada.',
  inLanguage: ['pt-BR', 'en'],
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/pt/alertas?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

// Root layout mínimo — [locale]/layout.tsx fornece <html lang> + <body>
// Seguindo padrão next-intl App Router para static export
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="ld-org"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {children}
    </>
  )
}
