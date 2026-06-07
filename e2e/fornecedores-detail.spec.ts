/**
 * E2E — /pt-br/fornecedores/[cnpj]
 *
 * Testa a pagina de detalhe de fornecedor (ISR, revalidate=3600).
 * Usa KNOWN_CNPJ (CNPJ real existente nos alertas publicados em prod).
 *
 * Workers=1 obrigatorio (LRN-20260509-003) — evita throttle CloudFront.
 * Todos os testes sao READ-ONLY — nao criam findings nem modificam DDB.
 *
 * FIXME: usar test.describe.fixme() enquanto PR nao for deployado em prod.
 * Remover via follow-up PR apos deploy bem-sucedido da pagina completa.
 * (memory: feedback_e2e_new_feature_fixme.md)
 */
import { test, expect } from '@playwright/test'
import { ROUTES, KNOWN_CNPJ, waitForPageReady } from './helpers'

test.describe.fixme('Pagina de detalhe de fornecedor (/fornecedores/[cnpj])', () => {
  const URL = ROUTES.fornecedor(KNOWN_CNPJ)

  test('1. Pagina carrega para CNPJ conhecido', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await waitForPageReady(page)

    // URL correta
    await expect(page).toHaveURL(new RegExp(`/pt-br/fornecedores/${KNOWN_CNPJ}`))
  })

  test('2. Header renderiza CNPJ formatado', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await waitForPageReady(page)

    // CNPJ formatado (XX.XXX.XXX/XXXX-XX) no h1
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible({ timeout: 10_000 })
    // Formato: 40.329.940/0001-43
    await expect(h1).toContainText('40.329.940')
  })

  test('3. KPIs exibem contadores de alertas', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await waitForPageReady(page)

    // A secao de KPIs existe e tem ao menos 1 numero
    // Usa font-mono que e a classe dos valores dos KPIs
    const kpis = page.locator('dd.font-mono')
    const count = await kpis.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // O primeiro KPI (alertas publicados) deve ser >= 1
    const firstKpi = kpis.first()
    await expect(firstKpi).toBeVisible()
    const text = (await firstKpi.textContent()) ?? ''
    // Extrai numero do texto (pode ter formatacao monetaria ou so numero)
    const num = parseInt(text.replace(/\D/g, ''), 10)
    expect(num).toBeGreaterThanOrEqual(1)
  })

  test('4. ContractsTable tem ao menos 1 linha', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await waitForPageReady(page)

    // Tabela de contratos — verifica que ha linhas de dados (tbody tr)
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 10_000 })
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('5. CguSanctionsCard renderiza (sancionado ou limpo)', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await waitForPageReady(page)

    // O card CGU mostra status de sancoes ou mensagem "pendente"
    // Busca pelo texto de qualquer estado: limpo, sancionado ou pendente
    const cguSection = page.getByText(/sancoes cgu|sem sancoes|sancionado|pendente.*integracao/i).first()
    await expect(cguSection).toBeVisible({ timeout: 10_000 })
  })

  test('6. Link para Receita Federal esta presente', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await waitForPageReady(page)

    // Header tem link externo para receita.fazenda.gov.br
    const rfbLink = page.getByRole('link', { name: /receita federal/i })
    await expect(rfbLink).toBeVisible({ timeout: 10_000 })
    const href = await rfbLink.getAttribute('href')
    expect(href).toContain('receita')
  })

  test('7. Link "Voltar para alertas" navega para /alertas', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await waitForPageReady(page)

    const back = page.getByRole('link', { name: /voltar.*alertas/i })
    await expect(back).toBeVisible({ timeout: 10_000 })
    await back.click()
    await expect(page).toHaveURL(/\/pt-br\/alertas(\/)?(\?.*)?$/, { timeout: 10_000 })
  })

  test('8. Links da tabela apontam para /alertas/[slug]', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await waitForPageReady(page)

    // Pega o primeiro link de tipo (nome do finding) na tabela
    const firstTypeLink = page.locator('table tbody tr').first().getByRole('link').first()
    await expect(firstTypeLink).toBeVisible({ timeout: 10_000 })
    const href = await firstTypeLink.getAttribute('href')
    expect(href).toMatch(/\/pt-br\/alertas\/[A-Za-z0-9_-]+/)
  })

  test('9. Versao EN-US carrega (/en-us/fornecedores/[cnpj])', async ({ page }) => {
    const enUrl = `/en-us/fornecedores/${KNOWN_CNPJ}/`
    await page.goto(enUrl, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })

    // Header EN mostra "Supplier Profile"
    await expect(page.getByText(/supplier profile/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('10. CNPJ invalido retorna 404', async ({ page }) => {
    await page.goto('/pt-br/fornecedores/00000000000000/', { waitUntil: 'domcontentloaded' })
    // Next.js renderiza pagina not-found quando notFound() e chamado
    const status = page.getByText(/404|nao encontrada|not found/i).first()
    await expect(status).toBeVisible({ timeout: 10_000 })
  })
})
