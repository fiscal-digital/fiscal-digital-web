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
  limit?: number
} = {}): Promise<ApiFinding[]> {
  const qs = new URLSearchParams()
  if (params.city)  qs.set('city', params.city)
  if (params.state) qs.set('state', params.state)
  if (params.type)  qs.set('type', params.type)
  if (params.limit) qs.set('limit', String(params.limit))

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
