import { test, expect } from '@playwright/test'
import { ROUTES } from './helpers'

/**
 * AI SEO Onda 1 — cobertura E2E.
 *
 * NOTA: marcado como `test.describe.fixme` enquanto o PR não foi mergeado.
 * Os arquivos /llms.txt, /ai.txt, /.well-known/content-license.json e o
 * robots.txt expandido só existem em prod após o deploy. Remover o fixme
 * via PR follow-up assim que `https://fiscaldigital.org/llms.txt` responder
 * 200. Padrão estabelecido no projeto (memória feedback_e2e_new_feature_fixme).
 */

test.describe.fixme('AI SEO — discovery files', () => {
  test('1. /llms.txt retorna 200 com conteúdo canônico', async ({ request }) => {
    const res = await request.get('/llms.txt')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('text/plain')
    const body = await res.text()
    expect(body).toContain('# Fiscal Digital')
    expect(body).toContain('CC-BY-4.0')
    expect(body).toContain('Querido Diário')
    expect(body).toContain('https://api.fiscaldigital.org/alerts')
  })

  test('2. /llms-full.txt retorna 200 e inclui alertas recentes', async ({ request }) => {
    const res = await request.get('/llms-full.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('# Fiscal Digital')
    expect(body).toContain('## Alertas recentes')
  })

  test('3. /ai.txt declara CC-BY-4.0 + atribuição', async ({ request }) => {
    const res = await request.get('/ai.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('Content-License: CC-BY-4.0')
    expect(body).toContain('Attribution-Required')
    expect(body).toContain('Fiscal Digital')
  })

  test('4. /.well-known/content-license.json é JSON válido com licença', async ({ request }) => {
    const res = await request.get('/.well-known/content-license.json')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.license).toBe('CC-BY-4.0')
    expect(json.sourceData?.name).toBe('Querido Diário')
    expect(json.permissions?.training).toBe('allowed')
  })

  test('5. /robots.txt lista AI crawlers nomeados', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    // Wildcard + 17 AI crawlers nomeados = pelo menos 18 entradas User-agent
    const matches = body.match(/User-Agent:/gi) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(18)
    // Bots críticos presentes
    expect(body).toMatch(/GPTBot/i)
    expect(body).toMatch(/ClaudeBot/i)
    expect(body).toMatch(/PerplexityBot/i)
    expect(body).toMatch(/Google-Extended/i)
    expect(body).toMatch(/CCBot/i)
  })
})

test.describe.fixme('AI SEO — JSON-LD Report em alerta', () => {
  test('1. página de alerta inclui <script type="application/ld+json"> com @type Report', async ({ page, request }) => {
    // Pega ID de um alerta real da API pública
    const alertsRes = await request.get('https://api.fiscaldigital.org/alerts?size=1')
    expect(alertsRes.ok()).toBeTruthy()
    const alertsJson = await alertsRes.json()
    const firstId = alertsJson.items?.[0]?.id
    expect(firstId, 'API deve retornar pelo menos um alerta').toBeTruthy()

    await page.goto(ROUTES.alertaDetalhe(firstId))

    // Localiza o JSON-LD do Report (id começa com `ld-report-`)
    const ldScript = await page.locator('script[type="application/ld+json"]').filter({ hasText: '"@type":"Report"' }).first()
    await expect(ldScript).toHaveCount(1)

    const ldContent = await ldScript.textContent()
    expect(ldContent).toBeTruthy()
    const parsed = JSON.parse(ldContent!)
    expect(parsed['@type']).toBe('Report')
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed.license).toContain('creativecommons.org')
    expect(parsed.author?.['@id']).toContain('fiscaldigital.org')
    expect(parsed.publisher?.['@id']).toContain('fiscaldigital.org')
  })
})
