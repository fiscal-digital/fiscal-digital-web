/**
 * /.well-known/openapi.json — convenção well-known apontando para o spec
 * OpenAPI 3.1 da API pública.
 *
 * Usamos redirect 302 (não mirror inline) para evitar duplicação. O spec
 * canônico fica em https://api.fiscaldigital.org/openapi.json — gerado pela
 * Lambda (PR irmão da Onda 2 no repo fiscal-digital).
 *
 * Blueprint AI SEO Onda 2 §3 Item 1 + 8.
 */

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET(): Promise<Response> {
  return new Response(null, {
    status: 302,
    headers: {
      Location: 'https://api.fiscaldigital.org/openapi.json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
