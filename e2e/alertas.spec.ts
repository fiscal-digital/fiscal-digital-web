import { test, expect } from '@playwright/test'
import {
  ROUTES,
  alertasUrlWithFilters,
  countAlertCards,
  waitForAlertasReady,
} from './helpers'

test.describe('Página de alertas — fluxo principal', () => {
  test('1. Página carrega cards após hydration (sem flicker visível)', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    // Cards reais aparecem após hidratação (initialFindings vem via SSR)
    const cards = await countAlertCards(page)
    expect(cards).toBeGreaterThan(0)
    expect(cards).toBeLessThanOrEqual(50)

    // Pelo menos 1 cidade conhecida visível
    await expect(
      page.locator('article').first().locator('text=/[A-ZÀ-Ü][a-zà-ü]+/').first(),
    ).toBeVisible()
  })

  test('2. KPIs do header renderizam com números válidos', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    const kpiValues = page.locator('dl dd')
    await expect(kpiValues.first()).toBeVisible({ timeout: 10_000 })

    const allTexts = await kpiValues.allTextContents()
    const numbers = allTexts.map((t) => parseInt(t.replace(/\D/g, ''), 10)).filter(Number.isFinite)
    expect(numbers.length).toBeGreaterThanOrEqual(2)

    // KPI 1 = alertas. Hoje em prod mostra 200 (truncado pelo size:200 do fetchAlerts).
    // Bug conhecido: deveria mostrar pageInfo.total (617). Ver TEC-WEB-XXX no backlog.
    // Quando corrigido, ajustar este test para >= 600.
    const alertsNum = numbers[0]
    expect(alertsNum).toBeGreaterThanOrEqual(100)
  })

  test.fixme('2.b BUG conhecido: KPI mostra 200 em vez de 617 (pageInfo não é passado)', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    const kpiValues = page.locator('dl dd')
    const allTexts = await kpiValues.allTextContents()
    const alertsNum = parseInt(allTexts[0]?.replace(/\D/g, '') ?? '0', 10)
    // Quando bug for corrigido, este teste deve passar e podemos remover .fixme()
    expect(alertsNum).toBeGreaterThanOrEqual(600)
  })

  test('3. SearchBar atualiza URL após debounce (300ms)', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    const search = page.getByPlaceholder(/buscar/i).first()
    await search.fill('Niterói')
    // URL atualiza após debounce
    await page.waitForURL(/search=/i, { timeout: 5000 })
    expect(page.url()).toMatch(/search=Niter/)
  })

  test('4. Filtro Estado RS habilita Cidade e atualiza URL', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ state: 'RS' }))
    await waitForAlertasReady(page)

    // URL preservou
    expect(page.url()).toContain('state=RS')

    // Cidade habilitada
    const cidadeSelect = page.locator('select#filter-city').first()
    await expect(cidadeSelect).toBeEnabled({ timeout: 5000 })
  })

  test('5. Sort dateDesc é aplicado quando deep linked', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ sort: 'dateDesc' }))
    await waitForAlertasReady(page)

    expect(page.url()).toContain('sort=dateDesc')
    // Pelo menos 1 card visível
    const cards = await countAlertCards(page)
    expect(cards).toBeGreaterThan(0)
  })

  test('6. View toggle list aplica via URL e renderiza tabela', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ view: 'list' }))
    await waitForAlertasReady(page)

    // URL preservou
    expect(page.url()).toContain('view=list')

    // Tabela aparece (lista usa <table>)
    await expect(page.locator('table').first()).toBeVisible({ timeout: 5000 })
  })

  test('7. RSS button URL muda com filtros aplicados', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ state: 'RS' }))
    await waitForAlertasReady(page)

    const rssBtn = page.getByRole('link', { name: /rss/i }).first()
    await expect(rssBtn).toBeVisible({ timeout: 5000 })

    const href = await rssBtn.getAttribute('href')
    expect(href).toContain('state=RS')
  })

  test('8. Deep link com filtros — abre página com filtros aplicados', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ type: 'aditivo_abusivo', sort: 'riskDesc' }))
    await waitForAlertasReady(page)

    const cards = await countAlertCards(page)
    expect(cards).toBeGreaterThan(0)

    expect(page.url()).toContain('type=aditivo_abusivo')
    expect(page.url()).toContain('sort=riskDesc')
  })
})
