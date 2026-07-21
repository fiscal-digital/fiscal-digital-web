import { API_URL } from './api'

// UH-WEB-020 — freshness de cobertura por cidade.
// A API expõe o watermark de coleta do collector (engine PR #120): a indexação
// do Querido Diário estagna por município sem aviso, e o site não pode exibir
// painel estagnado como se estivesse atual (verificabilidade pública).

export type DataStatus = 'atualizada' | 'estagnada' | 'sem-dados'

export interface CityFreshness {
  cityId: string
  findingsCount: number
  lastGazetteDate: string | null
  staleDays: number | null
  dataStatus: DataStatus
}

/** Tom visual do status — puro para unit test. */
export function freshnessTone(status: DataStatus): 'ok' | 'warn' | 'muted' {
  if (status === 'estagnada') return 'warn'
  if (status === 'sem-dados') return 'muted'
  return 'ok'
}

/**
 * Busca `/cities` (inclui freshness + findingsCount) e indexa por cityId.
 * Tolerante a falha — API fora durante build degrada para mapa vazio
 * (UI omite o badge; nunca quebra a página).
 */
export async function fetchCitiesFreshness(): Promise<Map<string, CityFreshness>> {
  try {
    const res = await fetch(`${API_URL}/cities`, { next: { revalidate: 300 } })
    if (!res.ok) return new Map()
    const data = (await res.json()) as Array<Partial<CityFreshness>>
    return new Map(
      data
        .filter((c): c is Partial<CityFreshness> & { cityId: string } => typeof c.cityId === 'string')
        .map((c) => [
          c.cityId,
          {
            cityId: c.cityId,
            findingsCount: c.findingsCount ?? 0,
            lastGazetteDate: c.lastGazetteDate ?? null,
            staleDays: c.staleDays ?? null,
            dataStatus: (c.dataStatus as DataStatus | undefined) ?? 'sem-dados',
          },
        ]),
    )
  } catch {
    return new Map()
  }
}
