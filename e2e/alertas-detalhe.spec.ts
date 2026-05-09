import { test, expect } from '@playwright/test'
import { ROUTES, waitForAlertasReady } from './helpers'

test.describe('Navegação alertas → detalhe', () => {
  test('1. Click em "Ver alerta completo" navega para o detalhe', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    // Pegar URL do primeiro link "Ver alerta completo"
    const link = page.getByRole('link', { name: /ver alerta completo/i }).first()
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^\/pt-br\/alertas\//)

    // Clicar e validar navegação
    await link.click()
    await expect(page).toHaveURL(/\/pt-br\/alertas\/[^/]+\/?$/)
  })

  test('2. Página de detalhe tem estrutura completa', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)
    const firstLink = page.getByRole('link', { name: /ver alerta completo/i }).first()
    const href = await firstLink.getAttribute('href')
    expect(href).toMatch(/^\/pt-br\/alertas\//)

    // Aguarda URL state hook do AlertsFeed terminar router.push(?page=1)
    // antes de navegar — evita ERR_ABORTED por nav. concorrente.
    await page.waitForTimeout(2000)

    // Navega direto para o detalhe
    await page.goto(href!, { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/pt-br\/alertas\/[^/]+\/?$/, { timeout: 10_000 })

    // Aguarda página de detalhe carregar
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })

    // Voltar para alertas — link sempre presente no header do detalhe
    await expect(page.getByRole('link', { name: /voltar.*alertas/i }).first()).toBeVisible({ timeout: 10_000 })

    // Compartilhar — ShareButton (label "Compartilhar este alerta")
    await expect(page.locator('[aria-label*="Compartilhar"]').first()).toBeVisible()

    // Querido Diário ou Diário oficial — link para fonte
    await expect(page.getByText(/querido diário|diário oficial/i).first()).toBeVisible()
  })

  test('3. Voltar do detalhe para listagem', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    const firstLink = page.getByRole('link', { name: /ver alerta completo/i }).first()
    const href = await firstLink.getAttribute('href')
    expect(href).toMatch(/^\/pt-br\/alertas\//)

    // Aguarda URL state hook estabilizar antes de navegar (evita ERR_ABORTED)
    await page.waitForTimeout(2000)

    // Navega direto (sem race com URL state hook)
    await page.goto(href!, { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/pt-br\/alertas\/[^/]+\/?$/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })

    // Click "Voltar para alertas"
    const back = page.getByRole('link', { name: /voltar.*alertas/i }).first()
    await expect(back).toBeVisible({ timeout: 10_000 })
    await back.click()

    // URL volta para /pt-br/alertas (com query string opcional ?page=1 do URL state hook)
    await expect(page).toHaveURL(/\/pt-br\/alertas\/(\?.*)?$/, { timeout: 10_000 })
  })
})
