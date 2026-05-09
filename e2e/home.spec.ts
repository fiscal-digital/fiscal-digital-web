import { test, expect } from '@playwright/test'
import { ROUTES } from './helpers'

test.describe('Home — fluxo principal', () => {
  test('1. Home carrega com hero + tagline', async ({ page }) => {
    await page.goto(ROUTES.home)

    // Hero h1 com tagline (varia por locale, mas sempre tem h1)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })

    // CTA principal: "Ver alertas"
    await expect(page.getByRole('link', { name: /ver alertas/i }).first()).toBeVisible()

    // CTA secundário: "Apoiar projeto"
    await expect(page.getByRole('link', { name: /apoiar projeto/i }).first()).toBeVisible()
  })

  test('2. CTA "Ver alertas" navega para /alertas', async ({ page }) => {
    await page.goto(ROUTES.home)
    // Busca link específico para /pt-br/alertas/ (evita pegar nav do header)
    const cta = page.locator('a[href*="/pt-br/alertas"]').first()
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/pt-br\/alertas\/?$/, { timeout: 10_000 })
  })

  test('3. CTA "Apoiar projeto" navega para /apoie', async ({ page }) => {
    await page.goto(ROUTES.home)
    await page.getByRole('link', { name: /apoiar projeto/i }).first().click()
    await expect(page).toHaveURL(/\/pt-br\/apoie\/?$/)
  })

  test('4. HeroStats renderiza KPIs', async ({ page }) => {
    await page.goto(ROUTES.home)

    // HeroStats tem 4 KPIs (Achados / Diários / Cidades / Custo)
    // Texto característico: "Achados publicados" ou label equivalente
    await expect(page.getByText(/achados publicados|published findings/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/diários|gazettes/i).first()).toBeVisible()
  })

  test('5. Lang toggle PT-BR ↔ EN-US preserva rota', async ({ page }) => {
    await page.goto(ROUTES.home)
    // SiteNav tem aria-label "Mudar idioma para EN-US"
    await page.getByRole('link', { name: /mudar idioma|switch language/i }).first().click()
    await expect(page).toHaveURL(/\/en-us\/?$/, { timeout: 10_000 })
  })
})
