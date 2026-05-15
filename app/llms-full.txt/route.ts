import { fetchAlerts } from '@/lib/api'
import { buildLlmsFullTxt } from '@/lib/llms-txt'

/**
 * /llms-full.txt — versão extensa do índice com os 50 alertas mais recentes
 * embedados em markdown puro. Reduz round-trips para LLMs que querem absorver
 * o corpus sem percorrer a API.
 *
 * Em static export, gerado em build-time. Refrescado a cada rebuild.
 */

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET(): Promise<Response> {
  const findings = await fetchAlerts({ size: 50 })
  return new Response(buildLlmsFullTxt(findings), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
