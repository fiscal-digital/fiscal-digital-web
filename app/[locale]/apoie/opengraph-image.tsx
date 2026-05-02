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
export const alt = 'Apoie — Fiscal Digital'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

const COPY: OgCopy = {
  'pt-br': {
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
