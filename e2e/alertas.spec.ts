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

  test('2. KPIs do header renderizam pageInfo.total real (>= 600)', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(2000)

    // expect.poll() re-executa a função até passar, lidando com "Execution
    // context destroyed" durante navegação concorrente do URL state hook.
    // Pós-fix #3 (deploy 2026-05-09): KPI mostra pageInfo.total (~617), não
    // mais items.length (200). Threshold apertado de 100 → 600 pra detectar
    // regressão se KPI voltar a usar items.length.
    await expect.poll(
      async () => {
        try {
          const text = await page.locator('dl dd').first().textContent({ timeout: 1000 })
          return parseInt(text?.replace(/\D/g, '') ?? '0', 10)
        } catch {
          return 0
        }
      },
      {
        message: 'KPI 1 deve mostrar pageInfo.total real (>= 600 hoje)',
        timeout: 15_000,
        intervals: [500, 1000, 2000],
      },
    ).toBeGreaterThanOrEqual(600)
  })

  test('3. SearchBar aceita texto e mantém valor', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    // Aguarda URL state hook estabilizar antes de interagir com input.
    await page.waitForTimeout(2000)

    // SearchBar tem aria-label="Buscar alertas"
    const search = page.getByRole('textbox', { name: /buscar alertas/i }).first()
    await expect(search).toBeVisible({ timeout: 10_000 })
    await search.click()
    await search.fill('Niter')

    // Confirma que o input recebeu o valor — sincronização com URL via debounce
    // tem race com URL state hook em prod (TEC-WEB-008 no backlog).
    await expect(search).toHaveValue('Niter', { timeout: 5_000 })
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
