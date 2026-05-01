import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://fiscaldigital.org'),
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
}

// Root layout mínimo — [locale]/layout.tsx fornece <html lang> + <body>
// Seguindo padrão next-intl App Router para static export
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
