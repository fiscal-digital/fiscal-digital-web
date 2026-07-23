import { test, expect } from '@playwright/test'
import {
  alertsResponseSchema,
  citiesResponseSchema,
  cityStatsSchema,
  costsResponseSchema,
  healthResponseSchema,
  statsResponseSchema,
} from '../lib/contracts.generated'

/**
 * Testes de contrato contra a API REAL (TST-010..014).
 *
 * O E2E do projeto já roda contra produção — é o lugar certo para detectar
 * drift de verdade: a API mudou de shape sem o contrato acompanhar? Estes
 * testes falham e o gate de PR barra antes do site quebrar em runtime.
 *
 * Read-only por design (só GET), alinhado à política de E2E do repo.
 *
 * Nota: os schemas NÃO usam .strict() aqui de propósito. O consumidor deve ser
 * tolerante a campo novo (o contrato do lado do engine é que trava isso, com
 * .strict() em packages/api/src/__tests__/contracts.test.ts). Aqui o que
 * importa é: todo campo que o web CONSOME continua vindo e com o tipo certo.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.fiscaldigital.org'

async function getJson(request: import('@playwright/test').APIRequestContext, path: string) {
  const res = await request.get(`${API}${path}`)
  expect(res.ok(), `${path} respondeu ${res.status()}`).toBe(true)
  return res.json()
}

function expectMatchesContract(
  name: string,
  schema: { safeParse: (v: unknown) => { success: boolean; error?: { issues: unknown[] } } },
  payload: unknown,
) {
  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    const issues = JSON.stringify(parsed.error?.issues?.slice(0, 8), null, 2)
    throw new Error(
      `${name} divergiu do contrato (@fiscal-digital/contracts).\n` +
      `Atualize packages/contracts no repo engine e rode o sync aqui.\n${issues}`,
    )
  }
}

test.describe('contrato da API pública', () => {
  test('GET /health casa com o contrato', async ({ request }) => {
    expectMatchesContract('/health', healthResponseSchema, await getJson(request, '/health'))
  })

  test('GET /cities casa com o contrato (inclui freshness)', async ({ request }) => {
    const body = await getJson(request, '/cities')
    expectMatchesContract('/cities', citiesResponseSchema, body)
    expect(Array.isArray(body) && body.length, '/cities deve retornar cidades').toBeGreaterThan(0)
  })

  test('GET /cities/{id}/stats casa com o contrato', async ({ request }) => {
    // Caxias do Sul — cidade de origem do MVP, sempre presente.
    expectMatchesContract('/cities/4305108/stats', cityStatsSchema, await getJson(request, '/cities/4305108/stats'))
  })

  test('GET /stats casa com o contrato', async ({ request }) => {
    expectMatchesContract('/stats', statsResponseSchema, await getJson(request, '/stats'))
  })

  test('GET /alerts casa com o contrato', async ({ request }) => {
    expectMatchesContract('/alerts', alertsResponseSchema, await getJson(request, '/alerts?size=20'))
  })

  test('GET /transparencia/costs casa com o contrato', async ({ request }) => {
    expectMatchesContract('/transparencia/costs', costsResponseSchema, await getJson(request, '/transparencia/costs?days=5'))
  })
})
