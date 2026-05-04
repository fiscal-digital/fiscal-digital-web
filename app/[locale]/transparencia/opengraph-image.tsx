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
export const alt = 'Transparência — Fiscal Digital'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

const COPY: OgCopy = {
  'pt': {
    eyebrow: 'Transparência',
    title: 'Cada real recebido, cada real gasto — em público.',
    sub: 'Contas, custos de operação e relatórios do projeto.',
  },
  en: {
    eyebrow: 'Transparency',
    title: 'Every dollar in, every dollar out — in public.',
    sub: 'Project accounts, operating costs and reports.',
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
