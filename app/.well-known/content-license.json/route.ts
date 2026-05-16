/**
 * /.well-known/content-license.json — declaração estruturada de licença
 * para AI Preferences (proposta IETF). Espelha o conteúdo do
 * `public/.well-known/content-license.json` que foi convertido em Route
 * Handler porque arquivos em `public/` não estão sendo propagados pelo
 * open-next para o S3 origin (LRN-20260516-001).
 */

const CONTENT_LICENSE = {
  license: 'CC-BY-4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  attribution: 'Fiscal Digital (https://fiscaldigital.org)',
  sourceData: {
    name: 'Querido Diário',
    url: 'https://queridodiario.ok.org.br',
    publisher: 'Open Knowledge Brasil',
    license: 'CC-BY-4.0',
  },
  permissions: {
    training: 'allowed',
    commercial: 'allowed',
    derivatives: 'allowed',
  },
  requirements: ['attribution'],
  contact: 'lineu@fiscaldigital.org',
  updated: '2026-05-15',
}

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify(CONTENT_LICENSE, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
