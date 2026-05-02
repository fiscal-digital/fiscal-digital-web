import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  ogGenerateImageMetadata,
  ogGenerateStaticParams,
  renderOgImage,
  resolveLocale,
  type OgCopy,
} from '@/lib/og'

export const alt = 'Alertas — Fiscal Digital'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export const generateImageMetadata = () => ogGenerateImageMetadata(alt)
export const generateStaticParams = ogGenerateStaticParams

const COPY: OgCopy = {
  pt: {
    eyebrow: 'Alertas',
    title: 'Achados em diários oficiais — atualizados todo dia.',
    sub: 'Risco ≥ 60 e confiança ≥ 0.70. Sempre com fonte.',
  },
  en: {
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
