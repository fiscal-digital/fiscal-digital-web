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
    await firstLink.click()

    // Aguarda página carregar
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })

    // Voltar para alertas — link sempre presente
    await expect(page.getByRole('link', { name: /voltar.*alertas/i }).first()).toBeVisible()

    // Compartilhar — ShareButton (label "Compartilhar este alerta")
    await expect(page.locator('[aria-label*="Compartilhar"]').first()).toBeVisible()

    // Querido Diário ou Diário oficial — link para fonte
    await expect(page.getByText(/querido diário|diário oficial/i).first()).toBeVisible()
  })

  test('3. Voltar do detalhe para listagem', async ({ page }) => {
    await page.goto(ROUTES.alertas)
    await waitForAlertasReady(page)

    const firstLink = page.getByRole('link', { name: /ver alerta completo/i }).first()
    await firstLink.click()
    await expect(page).toHaveURL(/\/pt-br\/alertas\/[^/]+\/?$/)

    // Click "Voltar para alertas" — qualquer link com esse aria/label leva pra listagem
    const back = page.getByRole('link', { name: /voltar.*alertas/i }).first()
    await back.click()

    // Algum URL que comece com /pt-br/alertas (exata ou /pt-br/)
    await expect(page).toHaveURL(/\/pt-br\/(alertas\/?)?$/)
  })
})
