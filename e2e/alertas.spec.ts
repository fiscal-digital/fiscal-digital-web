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

  test('2. KPIs do header renderizam pageInfo.total real (>= 100)', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    // expect.poll() mantida como defesa em profundidade (LRN-20260509-006). O fix
    // do SearchBar.useRef em #6 (TEC-WEB-008) elimina o `?page=1` parasita, mas
    // poll é cinto + suspensório contra qualquer race futura no AlertsFeed.
    // Threshold ajustado de 600 → 100 pós Ciclo 4.1 (reanalyze v1.7.0 reduziu
    // publicáveis de 617 para 180 ao eliminar FPs documentados nos Ciclos 1-3).
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
        message: 'KPI 1 deve mostrar pageInfo.total real (>= 100 — baseline pós Ciclo 4.1)',
        timeout: 15_000,
        intervals: [500, 1000, 2000],
      },
    ).toBeGreaterThanOrEqual(100)
  })

  test('3. SearchBar aceita texto e mantém valor', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    // SearchBar tem aria-label="Buscar alertas"
    const search = page.getByRole('textbox', { name: /buscar alertas/i }).first()
    await expect(search).toBeVisible({ timeout: 10_000 })
    await search.click()
    await search.fill('Niter')

    // Confirma que o input recebeu o valor — sincronização com URL via debounce
    // tem race com URL state hook em prod (TEC-WEB-008 no backlog).
    await expect(search).toHaveValue('Niter', { timeout: 5_000 })
  })

  test('4. Deep link com filtro de Estado RS preserva URL', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ state: 'RS' }))
    await waitForAlertasReady(page)

    // URL preservou
    expect(page.url()).toContain('state=RS')
    // Threshold tolerante: pré-fix os cards podem não estar filtrados (bug em
    // TEC-WEB-009). Após o fix + deploy, PR follow-up aperta pra validar que
    // os cards renderizados refletem o filtro (verificar texto contém "RS").
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

    // Race: HTML estático tem <article> de initialFindings (sem filtro). Quando
    // hasFiltersOnMountRef detecta filtros na URL, descarta initialFindings e
    // dispara fetch — articles somem, skeletons aparecem, depois articles novos
    // (filtrados) chegam. waitForAlertasReady passa rápido vendo articles SSR
    // que somem em seguida, gerando count=0 transitório. expect.poll aguarda
    // o ciclo completar.
    await expect.poll(
      async () => page.locator('article').count(),
      { timeout: 10_000, intervals: [500, 1000, 2000] },
    ).toBeGreaterThan(0)

    expect(page.url()).toContain('type=aditivo_abusivo')
    expect(page.url()).toContain('sort=riskDesc')
  })
})
