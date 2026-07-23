import { API_URL } from './api'

// UH-WEB-020 — freshness de cobertura por cidade.
// A API expõe o watermark de coleta do collector (engine PR #120): a indexação
// do Querido Diário estagna por município sem aviso, e o site não pode exibir
// painel estagnado como se estivesse atual (verificabilidade pública).

// TST-010..014: derivado do contrato em vez de redeclarado. `CityFreshness` era
// um subset manual de 5 dos 11 campos de /cities; agora é o tipo do contrato.
export type { DataStatus, City as CityFreshness } from './contracts.generated'
import { citiesResponseSchema } from './contracts.generated'
import type { DataStatus, City as CityFreshness } from './contracts.generated'

/** Tom visual do status — puro para unit test. */
export function freshnessTone(status: DataStatus): 'ok' | 'warn' | 'muted' {
  if (status === 'estagnada') return 'warn'
  if (status === 'sem-dados') return 'muted'
  return 'ok'
}

/**
 * Busca `/cities` e indexa por cityId.
 *
 * TST-010..014: a resposta é VALIDADA em runtime contra o schema do contrato,
 * não apenas tipada. Se a API mudar de shape, isso aparece aqui (warn) em vez
 * de virar `undefined` silencioso lá na frente — que foi exatamente como
 * `confidence` e `source` divergiram sem ninguém notar.
 *
 * Tolerante a falha por design: API fora ou contrato divergente degradam para
 * mapa vazio (a UI omite o badge; a página nunca quebra).
 */
export async function fetchCitiesFreshness(): Promise<Map<string, CityFreshness>> {
  try {
    const res = await fetch(`${API_URL}/cities`, { next: { revalidate: 300 } })
    if (!res.ok) return new Map()

    const parsed = citiesResponseSchema.safeParse(await res.json())
    if (!parsed.success) {
      console.warn('[contracts] /cities divergiu do contrato:', parsed.error.issues.slice(0, 3))
      return new Map()
    }

    return new Map(parsed.data.map((c) => [c.cityId, c]))
  } catch {
    return new Map()
  }
}
