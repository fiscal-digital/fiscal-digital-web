import { type Page, expect } from '@playwright/test'

/**
 * Helpers compartilhados pelos testes E2E do Fiscal Digital.
 *
 * Convenções:
 *  - URLs sempre relativas (baseURL no config)
 *  - Aguardar `networkidle` apenas quando estritamente necessário (lento)
 *  - Preferir auto-wait do Playwright (`expect().toBeVisible()`) — não usar `waitForTimeout`
 */

export const ROUTES = {
  home: '/pt-br/',
  alertas: '/pt-br/alertas/',
  alertasEn: '/en-us/alertas/',
  cidade: (slug: string) => `/pt-br/cidades/${slug}/`,
  alertaDetalhe: (slug: string) => `/pt-br/alertas/${slug}/`,
} as const

/** Filtros aplicáveis na URL de /alertas. */
export interface AlertasFilters {
  search?: string
  state?: string
  city?: string
  type?: string
  yearMin?: number
  yearMax?: number
  sort?: 'dateDesc' | 'dateAsc' | 'riskDesc' | 'riskAsc' | 'valueDesc' | 'valueAsc'
  view?: 'grid' | 'list'
  limit?: 20 | 30 | 50
  page?: number
}

/** Monta URL de /alertas com filtros como query params. */
export function alertasUrlWithFilters(filters: AlertasFilters): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === '') continue
    params.set(k, String(v))
  }
  const qs = params.toString()
  return qs ? `${ROUTES.alertas}?${qs}` : ROUTES.alertas
}

/**
 * Aguarda a página de alertas estar pronta (cards renderizados, sem skeleton).
 * Como agora usamos SSR initial findings (LRN-20260506-001), os cards já estão
 * no HTML estático — esta função apenas valida que o conteúdo está visível.
 */
export async function waitForAlertasReady(page: Page) {
  // Header da página deve estar visível
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
  // Pelo menos 1 card de finding ou estado de erro/empty
  // (qualquer um dos 3 indica que a página resolveu)
  await page.waitForSelector('article, [role="alert"], .empty-state', {
    state: 'visible',
    timeout: 10_000,
  })
}

/**
 * Conta cards visíveis no grid/list. Espera-se que cada card seja um <article>.
 */
export async function countAlertCards(page: Page): Promise<number> {
  return page.locator('article').count()
}

/**
 * Extrai os números dos KPIs do header (Alertas / Valor / Cidades).
 * Retorna o texto bruto de cada KPI — caller faz assertions.
 */
export async function readKpis(page: Page): Promise<{ alerts: string; value: string; cities: string | null }> {
  const kpiCards = page.locator('dl dd.font-mono')
  await expect(kpiCards.first()).toBeVisible({ timeout: 5000 })

  const all = await kpiCards.allTextContents()
  return {
    alerts: all[0]?.trim() ?? '',
    value: all[1]?.trim() ?? '',
    cities: all[2]?.trim() ?? null, // pode ser null em modo cidade (hideCities)
  }
}

/**
 * Slug derivado de finding ID (base64url do ID).
 * Mesma lógica de `findingIdToSlug` em lib/findings.ts.
 */
export function findingIdToSlug(id: string): string {
  return Buffer.from(id, 'utf-8').toString('base64url')
}
