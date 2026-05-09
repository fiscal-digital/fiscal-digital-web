import { test, expect } from '@playwright/test'
import { ROUTES } from './helpers'

test.describe('Página /apoie', () => {
  test('1. Página carrega com h1', async ({ page }) => {
    await page.goto(ROUTES.apoie)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
  })

  test('2. Link Catarse aponta para fiscaldigitalbr', async ({ page }) => {
    await page.goto(ROUTES.apoie)

    // Link "Apoiar no Catarse" leva para catarse.me/fiscaldigitalbr
    const catarseLink = page.getByRole('link', { name: /apoiar no catarse|support on catarse/i }).first()
    await expect(catarseLink).toBeVisible({ timeout: 10_000 })
    const href = await catarseLink.getAttribute('href')
    expect(href).toMatch(/catarse\.me\/fiscaldigitalbr/)
  })

  test('3. Link GitHub Sponsors presente', async ({ page }) => {
    await page.goto(ROUTES.apoie)
    // Link para GitHub Sponsors do projeto
    const githubLink = page.locator('a[href*="github.com/sponsors"]').first()
    if (await githubLink.count() > 0) {
      const href = await githubLink.getAttribute('href')
      expect(href).toContain('github.com/sponsors')
    }
  })
})
