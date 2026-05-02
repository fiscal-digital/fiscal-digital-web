import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  ogGenerateImageMetadata,
  ogGenerateStaticParams,
  renderOgImage,
  resolveLocale,
  type OgCopy,
} from '@/lib/og'

export const alt = 'Manifesto — Fiscal Digital'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export const generateImageMetadata = () => ogGenerateImageMetadata(alt)
export const generateStaticParams = ogGenerateStaticParams

const COPY: OgCopy = {
  pt: {
    eyebrow: 'Manifesto',
    title: 'Por que fiscalizar municípios é o trabalho mais urgente.',
    sub: 'Princípios, método e limites do Fiscal Digital.',
  },
  en: {
    eyebrow: 'Manifesto',
    title: 'Why municipal oversight is the most urgent work.',
    sub: 'Fiscal Digital principles, method and limits.',
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
