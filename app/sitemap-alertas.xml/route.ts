import { fetchAlerts } from '@/lib/api'
import { findingIdToSlug } from '@/lib/findings'

/**
 * /sitemap-alertas.xml — sitemap especializado de alertas individuais.
 *
 * Sitemap principal (`/sitemap.xml`) lista apenas as páginas estáticas
 * (raiz, cidades, manifesto, etc.). Aqui declaramos cada alerta publicado
 * com `<lastmod>` para crawlers de IA enumerarem o corpus completo.
 *
 * Limite: 50.000 URLs por sitemap (Google). Hoje ~180 findings — folgado.
 * Quando crescer (>40k), particionar em `/sitemap-alertas-1.xml`, etc.
 *
 * Blueprint AI SEO Onda 2 §5.5.
 */

const SITE = 'https://fiscaldigital.org'
const SAFE_LIMIT = 40_000

export const dynamic = 'force-static'
export const revalidate = 3600

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(): Promise<Response> {
  // Pega o máximo permitido pela API (200 por chamada). Hoje cobre 100% do
  // corpus (~180 findings). Quando crescer para milhares, ajustar para
  // paginação ou cursor.
  const findings = await fetchAlerts({ size: 200 })

  if (findings.length > SAFE_LIMIT) {
    console.warn(
      `[sitemap-alertas] ${findings.length} findings excede SAFE_LIMIT=${SAFE_LIMIT}. ` +
      'Particionar em múltiplos sitemaps antes de bater o cap do Google (50k).'
    )
  }

  const entries: string[] = []
  for (const f of findings) {
    const lastmod = f.createdAt ? f.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
    const slug = findingIdToSlug(f.id)
    for (const locale of ['pt-br', 'en-us'] as const) {
      const url = `${SITE}/${locale}/alertas/${slug}`
      entries.push(`  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="pt-br" href="${escapeXml(`${SITE}/pt-br/alertas/${slug}`)}"/>
    <xhtml:link rel="alternate" hreflang="en-us" href="${escapeXml(`${SITE}/en-us/alertas/${slug}`)}"/>
  </url>`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
