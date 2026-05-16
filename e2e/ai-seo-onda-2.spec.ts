import { test, expect } from '@playwright/test'
import { findingIdToSlug } from '../lib/findings'

/**
 * AI SEO Onda 2 — cobertura E2E.
 *
 * Onda 2 deployada em prod em 2026-05-16. Valida:
 *   - /dados retornando 200 com JSON-LD Dataset
 *   - /alertas/[id].md retornando 200 com text/markdown
 *   - /pt-br/alertas/feed.json retornando 200 com JSON Feed válido
 *   - /sitemap-alertas.xml retornando 200 com <url> entries
 *   - /.well-known/ai-plugin.json retornando 200 com schema válido
 *   - /.well-known/openapi.json retornando 302 para api.fiscaldigital.org
 */

test.describe('AI SEO Onda 2 — discovery files', () => {
  test('1. /pt-br/dados retorna 200 com JSON-LD Dataset', async ({ page }) => {
    await page.goto('/pt-br/dados')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Múltiplos JSON-LD scripts no head (Organization, WebSite, Dataset).
    // Coleta todos e procura o Dataset via JSON.parse em vez de filter
    // (hasText busca string literal — falha por espaçamento do JSON.stringify).
    const ldTexts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const dataset = ldTexts.map((t) => {
      try { return JSON.parse(t) } catch { return null }
    }).find((ld) => ld?.['@type'] === 'Dataset')
    expect(dataset, 'JSON-LD Dataset deve existir').toBeTruthy()
    expect(dataset.license).toContain('creativecommons.org')
    expect(Array.isArray(dataset.distribution)).toBe(true)
    expect(dataset.distribution.length).toBeGreaterThanOrEqual(3)
  })

  test('2. /pt-br/alertas/<slug>/m retorna 200 com text/markdown', async ({ request }) => {
    // Pega ID real de um alerta via API pública e converte para slug base64url.
    // Path /m em vez de sufixo .md (Next.js 16 não resolve [id].md/route.ts).
    const apiRes = await request.get('https://api.fiscaldigital.org/alerts?size=1')
    const apiJson = await apiRes.json()
    const firstId = apiJson.items?.[0]?.id
    expect(firstId).toBeTruthy()
    const slug = findingIdToSlug(firstId)

    const res = await request.get(`/pt-br/alertas/${slug}/m`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('text/markdown')
    const md = await res.text()
    expect(md).toContain('# ')
    expect(md).toContain('CC-BY-4.0')
    expect(md).toContain('Querido Diário')
  })

  test('3. /pt-br/alertas/feed.json retorna JSON Feed 1.1 válido', async ({ request }) => {
    const res = await request.get('/pt-br/alertas/feed.json')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('application/feed+json')
    const feed = await res.json()
    expect(feed.version).toBe('https://jsonfeed.org/version/1.1')
    expect(feed.title).toContain('Fiscal Digital')
    expect(Array.isArray(feed.items)).toBe(true)
    expect(feed.items.length).toBeGreaterThan(0)
    expect(feed._fiscal_digital?.license).toBe('CC-BY-4.0')
  })

  test('4. /sitemap-alertas.xml lista alertas com lastmod', async ({ request }) => {
    const res = await request.get('/sitemap-alertas.xml')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('xml')
    const xml = await res.text()
    expect(xml).toContain('<urlset')
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/)
    const urlCount = (xml.match(/<url>/g) ?? []).length
    expect(urlCount).toBeGreaterThan(0)
  })

  test('5. /.well-known/ai-plugin.json retorna manifest válido', async ({ request }) => {
    const res = await request.get('/.well-known/ai-plugin.json')
    expect(res.status()).toBe(200)
    const manifest = await res.json()
    expect(manifest.schema_version).toBe('v1')
    expect(manifest.api?.type).toBe('openapi')
    expect(manifest.api?.url).toContain('openapi.json')
  })

  test('6. /.well-known/openapi.json redireciona para API canônica', async ({ request }) => {
    // maxRedirects: 0 evita seguir o redirect — queremos validar o 302 cru
    const res = await request.get('/.well-known/openapi.json', { maxRedirects: 0 })
    expect(res.status()).toBe(302)
    expect(res.headers()['location']).toContain('api.fiscaldigital.org/openapi.json')
  })

  test('7. /pt-br/cidades/<slug> contém JSON-LD Place', async ({ page }) => {
    await page.goto('/pt-br/cidades/caxias-do-sul')
    const ldTexts = await page.locator('script[type="application/ld+json"]').allTextContents()
    const place = ldTexts.map((t) => {
      try { return JSON.parse(t) } catch { return null }
    }).find((ld) => ld?.['@type'] === 'City')
    expect(place, 'JSON-LD City deve existir').toBeTruthy()
    expect(place.name).toBe('Caxias do Sul')
    expect(place.addressCountry).toBe('BR')
  })
})
