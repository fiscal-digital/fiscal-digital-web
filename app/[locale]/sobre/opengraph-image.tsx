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
export const alt = 'Sobre — Fiscal Digital'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

const COPY: OgCopy = {
  'pt-br': {
    eyebrow: 'Sobre',
    title: 'Quem está por trás do Fiscal Digital.',
    sub: 'Time, parceiros e ecossistema cívico.',
  },
  en: {
    eyebrow: 'About',
    title: 'Who is behind Fiscal Digital.',
    sub: 'Team, partners and civic ecosystem.',
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
