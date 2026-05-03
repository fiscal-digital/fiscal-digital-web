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
