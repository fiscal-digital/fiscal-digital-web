import { fetchAlerts } from '@/lib/api'
import { findingTypeLabel, formatCurrency, findingIdToSlug } from '@/lib/findings'
import { routing } from '@/i18n/routing'

/**
 * /[locale]/alertas/feed.json — JSON Feed 1.1
 *
 * Formato JSON-nativo paralelo ao RSS, preferido por agentes de IA modernos
 * (mais barato de parsear que XML). Spec: https://jsonfeed.org/version/1.1
 *
 * Em static export, gerado em build-time via Route Handler `force-static`.
 * Mesmo padrão do feed.xml.
 *
 * Blueprint AI SEO Onda 2 §5.4: coexiste com o RSS, não substitui.
 */

const SITE = 'https://fiscaldigital.org'

export const dynamic = 'force-static'
export const revalidate = 60

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ locale: string }> },
): Promise<Response> {
  const { locale } = await context.params
  if (!routing.locales.includes(locale as 'pt-br' | 'en-us')) {
    return new Response(JSON.stringify({ error: 'invalid_locale' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
  const lang = locale as 'pt-br' | 'en-us'
  const isPt = lang === 'pt-br'

  const findings = await fetchAlerts({ size: 50 })
  const feedUrl = `${SITE}/${locale}/alertas/feed.json`
  const homePageUrl = `${SITE}/${locale}/alertas`

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: isPt
      ? 'Fiscal Digital — Alertas'
      : 'Fiscal Digital — Alerts',
    home_page_url: homePageUrl,
    feed_url: feedUrl,
    description: isPt
      ? 'Alertas autônomos de fiscalização de gastos públicos municipais. Fonte: Querido Diário/OKFN. Licença CC-BY-4.0.'
      : 'Autonomous alerts on Brazilian municipal public spending. Source: Querido Diário/OKFN. License CC-BY-4.0.',
    icon: `${SITE}/brand/logo/favicon.png`,
    favicon: `${SITE}/brand/logo/favicon.png`,
    language: isPt ? 'pt-BR' : 'en-US',
    authors: [
      {
        name: 'Fiscal Digital',
        url: SITE,
      },
    ],
    items: findings.map((f) => {
      const typeLabel = findingTypeLabel(f.type, lang)
      const slug = findingIdToSlug(f.id)
      const url = `${SITE}/${locale}/alertas/${slug}`
      const valueStr = f.value ? ` (${formatCurrency(f.value, lang)})` : ''
      return {
        id: url,
        url,
        external_url: f.source || undefined,
        title: `${typeLabel} — ${f.city}${valueStr}`,
        content_text: f.narrative ?? '',
        date_published: f.createdAt,
        tags: [
          f.type,
          f.state,
          f.city,
          ...(f.fiscalId ? [f.fiscalId] : []),
        ].filter(Boolean),
        _fiscal_digital: {
          city_id: f.cityId,
          state: f.state,
          type: f.type,
          fiscal_id: f.fiscalId,
          risk_score: f.riskScore,
          confidence: f.confidence,
          value_brl: f.value,
          cnpj: f.cnpj,
          contract_number: f.contractNumber,
          secretaria: f.secretaria,
          legal_basis: f.legalBasis,
          querido_diario_url: f.source,
          markdown_url: `${SITE}/${locale}/alertas/${slug}.md`,
        },
      }
    }),
    _fiscal_digital: {
      license: 'CC-BY-4.0',
      license_url: 'https://creativecommons.org/licenses/by/4.0/',
      attribution: 'Fiscal Digital (fiscaldigital.org), com base em dados do Querido Diário/OKFN',
      source_data: 'https://queridodiario.ok.org.br',
    },
  }

  return new Response(JSON.stringify(feed, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      'X-License': 'CC-BY-4.0',
      'X-Source': 'queridodiario.ok.org.br',
      'X-Attribution': 'Fiscal Digital (fiscaldigital.org)',
    },
  })
}
