import { NextRequest, NextResponse } from 'next/server'
import { fetchAlerts } from '@/lib/api'
import type { ApiFinding } from '@/lib/findings'

export const revalidate = 3600

export interface SupplierProfile {
  cnpj: string
  /** Total de contratos/alertas encontrados */
  alertCount: number
  /** Soma dos valores dos alertas */
  totalValue: number
  /** Distribuicao por secretaria: { [secretaria]: valorTotal } */
  bySecretaria: Record<string, number>
  /** Alertas ordenados desc por data */
  alerts: ApiFinding[]
  /** Tipos de finding agrupados */
  byType: Record<string, number>
  /** Cidades onde o fornecedor aparece */
  cities: string[]
}

/**
 * GET /api/suppliers/[cnpj]
 *
 * Agrega dados do fornecedor a partir dos alertas publicos.
 * Usa fetchAlerts (que chama a Lambda API publica) filtrado por CNPJ.
 *
 * Nao requer credenciais AWS adicionais — mesma role do /api/alerts.
 * Cache revalidado a cada 1h (revalidate=3600).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> },
) {
  const { cnpj } = await params
  const cleanCnpj = cnpj.replace(/\D/g, '')

  if (cleanCnpj.length !== 14) {
    return NextResponse.json({ error: 'CNPJ invalido' }, { status: 400 })
  }

  // Busca todos os alertas para extrair os do fornecedor.
  // Limite alto (200) cobre a maioria dos cenarios — se a base crescer
  // muito, este endpoint precisara de filtro CNPJ na Lambda.
  const allAlerts = await fetchAlerts({ size: 200 })
  const supplierAlerts = allAlerts.filter(
    (f) => f.cnpj?.replace(/\D/g, '') === cleanCnpj,
  )

  if (supplierAlerts.length === 0) {
    return NextResponse.json({ error: 'Fornecedor nao encontrado' }, { status: 404 })
  }

  // Agrega metricas
  const totalValue = supplierAlerts.reduce((acc, f) => acc + (f.value ?? 0), 0)

  const bySecretaria: Record<string, number> = {}
  for (const f of supplierAlerts) {
    const sec = f.secretaria ?? 'Nao informada'
    bySecretaria[sec] = (bySecretaria[sec] ?? 0) + (f.value ?? 0)
  }

  const byType: Record<string, number> = {}
  for (const f of supplierAlerts) {
    byType[f.type] = (byType[f.type] ?? 0) + 1
  }

  const cities = Array.from(new Set(supplierAlerts.map((f) => `${f.city}/${f.state}`)))

  // Ordena desc por data de criacao
  const alerts = [...supplierAlerts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const profile: SupplierProfile = {
    cnpj: cleanCnpj,
    alertCount: supplierAlerts.length,
    totalValue,
    bySecretaria,
    alerts,
    byType,
    cities,
  }

  return NextResponse.json(profile, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  })
}
