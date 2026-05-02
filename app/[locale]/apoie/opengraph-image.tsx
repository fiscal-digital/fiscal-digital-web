import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  ogGenerateImageMetadata,
  ogGenerateStaticParams,
  renderOgImage,
  resolveLocale,
  type OgCopy,
} from '@/lib/og'

export const alt = 'Apoie — Fiscal Digital'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export const generateImageMetadata = () => ogGenerateImageMetadata(alt)
export const generateStaticParams = ogGenerateStaticParams

const COPY: OgCopy = {
  pt: {
    eyebrow: 'Apoie',
    title: 'Independência custa dinheiro. E é barata.',
    sub: 'Apoie no Catarse — recorrente, transparente, deduzível.',
  },
  en: {
    eyebrow: 'Support us',
    title: 'Independence costs money. And it is cheap.',
    sub: 'Recurring support via Catarse — fully transparent.',
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
