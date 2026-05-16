import { fetchFindingById } from '@/lib/api'
import { findingToMarkdown } from '@/lib/markdown-views'
import { findingIdToSlug } from '@/lib/findings'
import { fetchAlerts } from '@/lib/api'
import { routing } from '@/i18n/routing'

/**
 * /[locale]/alertas/[id].md — markdown view de um alerta individual.
 *
 * Espelho consumível por LLM do `/alertas/[id]` HTML. Mesmo conteúdo, formato
 * preferido por agentes (menos tokens, sem ruído visual).
 *
 * Blueprint AI SEO Onda 2 §5.2: padrão de URL `.md` sufixo.
 *
 * Static export: `force-static` + `generateStaticParams` pré-renderiza os 50
 * findings mais recentes em build. Findings além disso fallback para 404
 * (esperado em static export sem dynamicParams).
 */

const SSG_LIMIT = 50

export const dynamic = 'force-static'
export const revalidate = 60
export const dynamicParams = false

export async function generateStaticParams() {
  const findings = await fetchAlerts({ size: SSG_LIMIT })
  const ids = findings.map((f) => findingIdToSlug(f.id))
  return routing.locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ locale: string; id: string }> },
): Promise<Response> {
  const { locale, id } = await context.params
  if (!routing.locales.includes(locale as 'pt-br' | 'en-us')) {
    return new Response('Not found', { status: 404 })
  }

  const finding = await fetchFindingById(id)
  if (!finding) {
    return new Response('Not found', { status: 404 })
  }

  const md = findingToMarkdown(finding, locale as 'pt-br' | 'en-us')
  return new Response(md, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
      'X-License': 'CC-BY-4.0',
      'X-Source': 'queridodiario.ok.org.br',
      'X-Attribution': 'Fiscal Digital (fiscaldigital.org)',
      Link: '<https://fiscaldigital.org>; rel="canonical", <https://creativecommons.org/licenses/by/4.0/>; rel="license"',
    },
  })
}
