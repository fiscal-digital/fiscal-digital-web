import { test, expect } from '@playwright/test'
import { ROUTES, alertasUrlWithFilters, waitForAlertasReady } from './helpers'

/**
 * E2E da nova toolbar de Alertas (Direção A — Refinamento incremental).
 *
 * Cobertura:
 *  - LocationCombobox: abre, busca, seleciona estado, seleciona cidade, limpa
 *  - Tipo agrupado: optgroups visíveis no select
 *  - YearRangeSlider: thumbs com role=slider e aria-valuenow corretos
 *  - AlertsPrefsButton: abre popover, muda Por Página e Visualizar
 *  - AlertsAppliedFilters: chips aparecem, removem, "Limpar tudo" reseta
 *  - Compat URL: deep-links existentes continuam funcionando
 *
 * Roda contra prod read-only. Workers=1 (LRN-20260509-003).
 *
 * IMPORTANTE: `waitForTimeout(2000)` após `waitForAlertasReady` é obrigatório
 * antes de qualquer click/navegação. AlertsFeed dispara router.push na hidratação
 * via useAlertsQueryParams + SearchBar.useEffect — sem o waitForTimeout, clicks
 * dão "Execution context was destroyed" / ERR_ABORTED. Ver feedback_e2e_url_state_race.md.
 */

const URL_RACE_WAIT = 2000

test.describe('Alertas toolbar — Refinamento incremental', () => {
  test('1. Location combobox abre com busca e popula UFs + cidades', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const locationButton = page.getByRole('button', { name: /todas/i }).first()
    await expect(locationButton).toBeVisible({ timeout: 5000 })
    await locationButton.click()

    // Input de busca dentro do combobox
    const searchInput = page.getByPlaceholder(/buscar estado ou cidade/i)
    await expect(searchInput).toBeVisible({ timeout: 5000 })

    // Listbox com opções (UFs + cidades)
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()
    const options = listbox.getByRole('option')
    expect(await options.count()).toBeGreaterThan(20)
  })

  test('2. Selecionar estado RS via combobox atualiza URL', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const locationButton = page.getByRole('button', { name: /todas/i }).first()
    await locationButton.click()

    const searchInput = page.getByPlaceholder(/buscar estado ou cidade/i)
    await searchInput.fill('RS')

    // Opção do estado RS — accessible name inclui badge "UF" + valor "RS"
    // (comportamento de role=option quando conteúdo tem múltiplos spans).
    const rsOption = page.getByRole('option', { name: /UF\s+RS/i }).first()
    await expect(rsOption).toBeVisible({ timeout: 5000 })
    await rsOption.click()

    // URL ganha state=RS — pode haver race com URL state hook
    await expect.poll(() => page.url(), { timeout: 5_000 }).toContain('state=RS')
  })

  test('3. Tipo agrupado tem optgroups visíveis', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const typeSelect = page.locator('select#filter-type')
    await expect(typeSelect).toBeVisible({ timeout: 5000 })

    // Conta optgroups (mínimo 6 famílias declaradas)
    const optgroups = typeSelect.locator('optgroup')
    expect(await optgroups.count()).toBe(6)

    // Famílias esperadas
    const labels = await optgroups.evaluateAll((els) =>
      els.map((el) => (el as HTMLOptGroupElement).label),
    )
    expect(labels).toContain('Licitações & Contratos')
    expect(labels).toContain('Fornecedores')
    expect(labels).toContain('Pessoal')
  })

  test('4. YearRangeSlider tem dois thumbs com aria-valuenow', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const sliders = page.getByRole('slider')
    expect(await sliders.count()).toBe(2)

    const minThumb = sliders.first()
    const maxThumb = sliders.last()

    // Defaults: 2021 e ano corrente
    await expect(minThumb).toHaveAttribute('aria-valuenow', '2021')
    const maxNow = await maxThumb.getAttribute('aria-valuenow')
    expect(parseInt(maxNow ?? '0', 10)).toBeGreaterThanOrEqual(2026)
  })

  test('5. YearRangeSlider responde a teclado (ArrowRight no thumb min)', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const minThumb = page.getByRole('slider', { name: /ano de in[ií]cio/i })
    await minThumb.focus()
    await minThumb.press('ArrowRight')

    await expect(minThumb).toHaveAttribute('aria-valuenow', '2022')
  })

  test('6. Popover de preferências abre e mostra Por Página + Visualizar', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const prefsBtn = page.getByRole('button', { name: /prefer[eê]ncias/i })
    await expect(prefsBtn).toBeVisible({ timeout: 5000 })
    await prefsBtn.click()

    const dialog = page.getByRole('dialog', { name: /prefer[eê]ncias/i })
    await expect(dialog).toBeVisible()

    // Grupos visíveis
    await expect(dialog.getByRole('group', { name: /por p[áa]gina/i })).toBeVisible()
    await expect(dialog.getByRole('group', { name: /visualizar/i })).toBeVisible()
  })

  test('7. Mudar limite via popover reflete na URL', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    await page.getByRole('button', { name: /prefer[eê]ncias/i }).click()

    const dialog = page.getByRole('dialog', { name: /prefer[eê]ncias/i })
    await dialog.getByRole('button', { name: '50' }).click()

    await expect(page).toHaveURL(/limit=50/, { timeout: 3000 })
  })

  test('8. Mudar visualização para Lista via popover reflete na URL', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    await page.getByRole('button', { name: /prefer[eê]ncias/i }).click()

    const dialog = page.getByRole('dialog', { name: /prefer[eê]ncias/i })
    await dialog.getByRole('button', { name: /lista/i }).click()

    await expect(page).toHaveURL(/view=list/, { timeout: 3000 })
  })

  test('9. Chip de filtro aplicado aparece quando state está na URL', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ state: 'RS' }))
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const chips = page.getByTestId('alerts-applied-filters')
    await expect(chips).toBeVisible({ timeout: 5000 })
    await expect(chips).toContainText('RS')
  })

  // Tests 10 e 11 dependem do fix `pointer-events-none` no <X> SVG (esta PR
  // mesmo). Como E2E roda contra prod e o fix ainda não foi deployado, os
  // tests ficam .fixme neste PR. Follow-up PR remove o .fixme após o deploy.
  // Pattern: feedback_e2e_two_pr_pattern.md.
  test.fixme('10. Chip removível via × limpa o filtro da URL', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ state: 'RS' }))
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const chips = page.getByTestId('alerts-applied-filters')
    const removeBtn = chips.getByRole('button', { name: /remover filtro RS/i })
    await removeBtn.click()

    await expect.poll(() => page.url(), { timeout: 8_000 }).not.toContain('state=RS')
  })

  test.fixme('11. "Limpar tudo" reseta múltiplos filtros', async ({ page }) => {
    await page.goto(alertasUrlWithFilters({ state: 'RS', type: 'aditivo_abusivo' }))
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    const chips = page.getByTestId('alerts-applied-filters')
    await expect(chips).toBeVisible({ timeout: 5000 })

    await chips.getByRole('button', { name: /limpar tudo/i }).click()

    await expect.poll(() => page.url(), { timeout: 8_000 }).not.toContain('state=RS')
    await expect.poll(() => page.url(), { timeout: 8_000 }).not.toContain('type=aditivo_abusivo')
  })

  test('12. Deep link com filtros antigos continua funcionando', async ({ page }) => {
    // Compatibilidade: link compartilhado antes da mudança ainda renderiza
    await page.goto(alertasUrlWithFilters({ state: 'RS', limit: 50, view: 'list' }))
    await waitForAlertasReady(page)
    await page.waitForTimeout(URL_RACE_WAIT)

    expect(page.url()).toContain('state=RS')
    expect(page.url()).toContain('limit=50')
    expect(page.url()).toContain('view=list')

    // Lista renderiza tabela (view=list usa <table> com <tr>, não <article>)
    await expect(page.locator('table').first()).toBeVisible({ timeout: 5000 })
    const rows = await page.locator('table tbody tr').count()
    expect(rows).toBeGreaterThan(0)
  })
})
