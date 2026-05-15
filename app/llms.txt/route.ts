import { buildLlmsTxt } from '@/lib/llms-txt'

/**
 * /llms.txt — índice canônico para LLMs e crawlers agênticos.
 *
 * Padrão: https://llmstxt.org. Entry point oficial que Claude, ChatGPT,
 * Perplexity e similares buscam para descobrir o site sem percorrer HTML.
 *
 * Em static export (`output: 'export'`), Route Handlers só funcionam com
 * `dynamic = 'force-static'` — handler é executado em build-time e o
 * texto retornado é gravado como arquivo estático servido pelo S3+CloudFront.
 */

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET(): Promise<Response> {
  return new Response(buildLlmsTxt(), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
