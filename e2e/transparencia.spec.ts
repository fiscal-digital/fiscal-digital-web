import { test, expect } from '@playwright/test'
import { ROUTES } from './helpers'

test.describe('Transparência — custos', () => {
  test('1. Página de custos carrega', async ({ page }) => {
    await page.goto(ROUTES.custos)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
  })

  test('2. Mostra custo MTD em R$', async ({ page }) => {
    await page.goto(ROUTES.custos)
    // Algum valor monetário em R$
    await expect(page.getByText(/R\$/).first()).toBeVisible({ timeout: 10_000 })
  })

  test('3. Página de transparência (índice)', async ({ page }) => {
    await page.goto(ROUTES.transparencia)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
  })
})
