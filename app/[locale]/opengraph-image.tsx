import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  ogGenerateStaticParams,
  renderOgImage,
  resolveLocale,
  type OgCopy,
} from '@/lib/og'

export const dynamic = 'force-static'
export const generateStaticParams = ogGenerateStaticParams
export const alt = 'Fiscal Digital — Fiscalização autônoma de gastos públicos'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

const COPY: OgCopy = {
  'pt-br': {
    eyebrow: 'Fiscal Digital',
    title: 'Fiscalização autônoma de gastos públicos',
    sub: 'Cada alerta cita o diário oficial. fiscaldigital.org',
  },
  'en-us': {
    eyebrow: 'Fiscal Digital',
    title: 'Autonomous oversight of Brazilian municipal spending',
    sub: 'Every alert cites its source. fiscaldigital.org',
  },
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return renderOgImage(COPY[resolveLocale(locale)])
}
