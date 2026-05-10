import { test, expect, devices } from '@playwright/test'
import { ROUTES, waitForAlertasReady } from './helpers'

test.use({ ...devices['Pixel 7'] })

test.describe('Página de alertas — mobile', () => {
  test('1. Toolbar mobile mostra SearchBar + botão Filtros', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    // SearchBar visível
    await expect(page.getByRole('textbox', { name: /buscar/i }).first()).toBeVisible()

    // Botão "Filtros" (MobileFilterButton) visível em mobile
    await expect(page.getByRole('button', { name: /filtros/i }).first()).toBeVisible()
  })

  test('2. Bottom sheet abre ao clicar Filtros', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    // Antes do click — botão Fechar filtros não existe
    expect(await page.getByRole('button', { name: /fechar filtros/i }).count()).toBe(0)

    await page.getByRole('button', { name: /abrir filtros/i }).click()

    // Após click — botão "Fechar filtros" aparece (só existe no bottom sheet)
    await expect(page.getByRole('button', { name: /fechar filtros/i })).toBeVisible({ timeout: 5000 })
  })

  test('3. Fechar bottom sheet via X', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    await page.getByRole('button', { name: /abrir filtros/i }).click()
    const closeBtn = page.getByRole('button', { name: /fechar filtros/i })
    await expect(closeBtn).toBeVisible({ timeout: 5000 })

    await closeBtn.click()
    await expect(closeBtn).not.toBeVisible({ timeout: 5000 })
  })

  test('4. Sem overflow horizontal em viewport 375', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    // Verifica scroll horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

    // Sem overflow: scrollWidth deve ser <= clientWidth (com tolerância de 1px)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
