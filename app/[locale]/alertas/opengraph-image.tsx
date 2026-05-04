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
export const alt = 'Alertas — Fiscal Digital'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

const COPY: OgCopy = {
  'pt-br': {
    eyebrow: 'Alertas',
    title: 'Achados em diários oficiais — atualizados todo dia.',
    sub: 'Risco ≥ 60 e confiança ≥ 0.70. Sempre com fonte.',
  },
  'en-us': {
    eyebrow: 'Alerts',
    title: 'Findings from official gazettes — updated daily.',
    sub: 'Risk ≥ 60 and confidence ≥ 0.70. Always with source.',
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
