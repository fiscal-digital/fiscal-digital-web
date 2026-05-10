import type { ApiAlertsResponse, ApiFinding } from './findings'

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://7vvbdbxwfz4h57j7dfk65wpux40gqayb.lambda-url.us-east-1.on.aws'

// Conversão USD→BRL agora é responsabilidade do backend (único lugar).
// Site recebe estimatedCostBrl direto — moeda única, não traduzida.

/**
 * Fetch alerts em build-time (server-side, dentro de generateStaticParams /
 * pages). Tolerante a falha — se a API estiver fora durante o build, retorna
 * lista vazia e o site builda com páginas estáticas mínimas.
 *
 * NÃO usar isso em client component — para client, ver fetch direto em
 * `AlertsFeed.tsx`.
 */
export async function fetchAlerts(params: {
  city?: string
  state?: string
  type?: string
  /** Tamanho da página (default API: 50). Use para warm cache em SSG. */
  size?: number
  /** @deprecated use `size`. Mantido para retrocompat — mapeado para size. */
  limit?: number
} = {}): Promise<ApiFinding[]> {
  const qs = new URLSearchParams()
  if (params.city)  qs.set('city', params.city)
  if (params.state) qs.set('state', params.state)
  if (params.type)  qs.set('type', params.type)
  const size = params.size ?? params.limit
  if (size) qs.set('size', String(size))

  const url = `${API_URL}/alerts${qs.size ? `?${qs}` : ''}`

  try {
    const res = await fetch(url, {
      // SSG: cache durante o build inteiro (Next 15+ semantics)
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      console.warn(`[fetchAlerts] HTTP ${res.status} for ${url}`)
      return []
    }
    const data = (await res.json()) as ApiAlertsResponse | ApiFinding[]
    return Array.isArray(data) ? data : (data.items ?? [])
  } catch (err) {
    console.warn(`[fetchAlerts] failed: ${(err as Error).message}`)
    return []
  }
}

/**
 * Single finding por slug (base64url do `pk` FINDING#...).
 * Usa endpoint `GET /alerts/{slug}` da API com GetItem O(1) — substitui o
 * padrão antigo "fetchAlerts({size:1000}).find()" que só funcionava pros
 * primeiros N findings (cap de 200 da API). Detail page agora resolve
 * qualquer ID válido sem percorrer paginação.
 *
 * Retorna `null` em 404 (gate de publicação não atendido OU finding inexistente).
 */
export async function fetchFindingById(slug: string): Promise<ApiFinding | null> {
  if (!slug) return null
  const url = `${API_URL}/alerts/${encodeURIComponent(slug)}`
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    })
    if (res.status === 404) return null
    if (!res.ok) {
      console.warn(`[fetchFindingById] HTTP ${res.status} for ${url}`)
      return null
    }
    return (await res.json()) as ApiFinding
  } catch (err) {
    console.warn(`[fetchFindingById] failed: ${(err as Error).message}`)
    return null
  }
}

/**
 * Fetch com pageInfo global — para casos onde precisamos do total real,
 * não só dos items paginados. Ex: KPI "Achados publicados" na página de
 * cidade deve mostrar pageInfo.total (192), não items.length (50).
 */
export interface AlertsResult {
  items: ApiFinding[]
  total: number
  totalValue: number
  citiesCount: number
}

export async function fetchAlertsWithTotal(params: {
  city?: string
  state?: string
  type?: string
  size?: number
} = {}): Promise<AlertsResult> {
  const qs = new URLSearchParams()
  if (params.city)  qs.set('city', params.city)
  if (params.state) qs.set('state', params.state)
  if (params.type)  qs.set('type', params.type)
  if (params.size)  qs.set('size', String(params.size))

  const url = `${API_URL}/alerts${qs.size ? `?${qs}` : ''}`
  const empty: AlertsResult = { items: [], total: 0, totalValue: 0, citiesCount: 0 }

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return empty
    const data = (await res.json()) as ApiAlertsResponse
    const pi = data.pageInfo
    return {
      items: data.items ?? [],
      total: pi?.total ?? data.items?.length ?? 0,
      totalValue: pi?.totalValue ?? 0,
      citiesCount: pi?.citiesCount ?? 0,
    }
  } catch {
    return empty
  }
}

// ── Custos (UH-OPS-001 — FiscalCustos) ──────────────────────────────────────

export interface CostServiceBreakdown {
  service: string
  usd: number
  brl: number
}

export interface CostDaily {
  date: string
  totalBrl: number
  totalUsd: number
  byService: CostServiceBreakdown[]
  ptaxBrl: number
}

export interface CostMonthly {
  month: string
  mtdUsd: number
  mtdBrl: number
  projectedUsd: number
  projectedBrl: number
  prevMonthBrl: number | null
  deltaPct: number | null
  byService: CostServiceBreakdown[]
  ptaxBrl: number
  capturedAt: string
}

export interface CostsResponse {
  currency: 'BRL'
  days: number
  updatedAt: string | null
  monthly: CostMonthly | null
  daily: CostDaily[]
}

const EMPTY_COSTS: CostsResponse = {
  currency: 'BRL',
  days: 30,
  updatedAt: null,
  monthly: null,
  daily: [],
}

export interface StatsResponse {
  totalFindings: number
  totalGazettesProcessed: number | null
  findingsByFiscal: Record<string, number>
  findingsByCity?: Array<{ cityId: string; name: string; count: number }>
}

const EMPTY_STATS: StatsResponse = {
  totalFindings: 0,
  totalGazettesProcessed: 0,
  findingsByFiscal: {},
}

/**
 * Stats agregados — usado em SSG das páginas /fiscais e Home. Tolera falha
 * (retorna estrutura vazia para evitar quebra de build).
 */
export async function fetchStats(): Promise<StatsResponse> {
  try {
    const res = await fetch(`${API_URL}/stats`, { next: { revalidate: 60 } })
    if (!res.ok) return EMPTY_STATS
    return (await res.json()) as StatsResponse
  } catch {
    return EMPTY_STATS
  }
}

export async function fetchCosts(days = 30): Promise<CostsResponse> {
  const url = `${API_URL}/transparencia/costs?days=${days}`
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return EMPTY_COSTS
    return (await res.json()) as CostsResponse
  } catch {
    return EMPTY_COSTS
  }
}
