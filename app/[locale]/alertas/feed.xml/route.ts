import { API_URL } from '@/lib/api'

/**
 * RSS feed endpoint.
 *
 * Em static export (`output: 'export'`), Route Handlers só funcionam
 * com `dynamic = 'force-static'` — o handler é executado em build-time
 * e o XML retornado é gravado como arquivo estático.
 *
 * Limitação aceita: query strings (filtros por estado/tipo) NÃO funcionam
 * em static export. Para filtros, o usuário consome diretamente a API:
 *   https://<api>/rss?state=RS
 *
 * O feed estático aqui é o agregado completo — refrescado a cada build
 * (cache 60s nos headers honra a vida útil entre rebuilds incrementais
 * em CDN intermediária).
 */

export const dynamic = 'force-static'
export const revalidate = 60

// Pré-render para cada locale
export function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'en' }]
}

export async function GET() {
  try {
    const upstream = await fetch(`${API_URL}/rss`, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
      // Em build-time, Next aplica revalidate como TTL de cache
      next: { revalidate: 60 },
    })

    if (!upstream.ok) {
      return new Response(emptyFeed(`upstream ${upstream.status}`), {
        status: 200,
        headers: rssHeaders(),
      })
    }

    const xml = await upstream.text()
    return new Response(xml, {
      status: 200,
      headers: rssHeaders(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    // Fallback: feed vazio bem formado para não quebrar leitores RSS
    return new Response(emptyFeed(message), {
      status: 200,
      headers: rssHeaders(),
    })
  }
}

function rssHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
  }
}

function emptyFeed(reason: string): string {
  const now = new Date().toUTCString()
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Fiscal Digital — Alertas</title>
    <link>https://fiscaldigital.org</link>
    <description>Alertas automáticos de fiscalização de gastos públicos municipais. (feed temporariamente indisponível: ${escapeXml(reason)})</description>
    <language>pt-BR</language>
    <lastBuildDate>${now}</lastBuildDate>
  </channel>
</rss>`
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;'
  )
}
