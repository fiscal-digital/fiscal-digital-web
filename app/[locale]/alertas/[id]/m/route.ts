import { fetchFindingById } from '@/lib/api'
import { findingToMarkdown } from '@/lib/markdown-views'
import { findingIdToSlug } from '@/lib/findings'
import { fetchAlerts } from '@/lib/api'
import { routing } from '@/i18n/routing'

/**
 * /[locale]/alertas/[id]/m — markdown view de um alerta individual.
 *
 * Espelho consumível por LLM do `/alertas/[id]` HTML. Mesmo conteúdo, formato
 * preferido por agentes (menos tokens, sem ruído visual).
 *
 * Path pattern (Blueprint AI SEO Onda 2 §5.2): inicialmente projetado como
 * `/alertas/[id].md` (sufixo .md). Next.js 16 catch-all do dynamic segment
 * `[id]` engole sufixos literais — `[id].md/route.ts` não é resolvido pelo
 * router. Trocado para path dedicado `/m` (subfolder). LLMs e tools podem
 * descobrir via Link header rel="alternate" type="text/markdown".
 *
 * Static export: `force-static` + `generateStaticParams` pré-renderiza os 50
 * findings mais recentes em build. dynamicParams=true permite ISR para os
 * restantes via Lambda (open-next).
 */

const SSG_LIMIT = 50

export const dynamic = 'force-static'
export const revalidate = 60
// dynamicParams=true (default): slugs além dos 50 pré-renderizados são gerados
// on-demand via ISR (open-next na Lambda). Static export puro sem ISR teria
// que ficar false, mas estamos em open-next que suporta ISR via lambda.
export const dynamicParams = true

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
