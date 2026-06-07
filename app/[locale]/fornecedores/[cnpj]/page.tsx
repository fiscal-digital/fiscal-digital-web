import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { fetchAlerts } from '@/lib/api'
import { findingIdToSlug } from '@/lib/findings'
import { buildSupplierOrganizationJsonLd } from '@/lib/llms-txt'
import SupplierHeader from '@/components/SupplierHeader'
import SupplierRfbCard from '@/components/SupplierRfbCard'
import SupplierCguCard from '@/components/SupplierCguCard'
import SupplierContractsTable from '@/components/SupplierContractsTable'
import SupplierSecretariaDonut from '@/components/SupplierSecretariaDonut'
import SupplierAlertsTimeline from '@/components/SupplierAlertsTimeline'

export const revalidate = 3600

type Props = {
  params: Promise<{ locale: string; cnpj: string }>
}

/**
 * SSG seed: gera params para CNPJs ja vistos em findings publicados.
 *
 * API /alerts ja expoe `cnpj` denormalizado. CNPJs fora do top 200
 * caem em ISR on-demand — aceitavel para v1.
 */
export async function generateStaticParams() {
  const findings = await fetchAlerts({ limit: 200 })
  const cnpjs = Array.from(
    new Set(
      findings
        .map((f) => f.cnpj?.replace(/\D/g, ''))
        .filter((s): s is string => !!s && s.length === 14),
    ),
  )
  return routing.locales.flatMap((locale) =>
    cnpjs.map((cnpj) => ({ locale, cnpj })),
  )
}

function formatCnpj(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length !== 14) return raw
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, cnpj } = await params
  const isPt = locale === 'pt-br'
  const formatted = formatCnpj(cnpj)
  const title = isPt
    ? `Fornecedor ${formatted} — Fiscal Digital`
    : `Supplier ${formatted} — Fiscal Digital`
  return {
    title,
    description: isPt
      ? `Perfil do fornecedor CNPJ ${formatted}: historico de contratos publicos, alertas e concentracao por secretaria.`
      : `Supplier profile CNPJ ${formatted}: public contract history, alerts and department concentration.`,
  }
}

export default async function FornecedorPage({ params }: Props) {
  const { locale, cnpj } = await params
  if (!routing.locales.includes(locale as 'pt-br' | 'en-us')) notFound()
  setRequestLocale(locale)

  const loc = locale as 'pt-br' | 'en-us'
  const cleanCnpj = cnpj.replace(/\D/g, '')

  // Busca todos os alertas e filtra pelo CNPJ
  const allFindings = await fetchAlerts({ size: 200 })
  const supplierFindings = allFindings
    .filter((f) => f.cnpj?.replace(/\D/g, '') === cleanCnpj)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (supplierFindings.length === 0) notFound()

  // Agrega metricas a partir dos alertas disponiveis
  const totalValue = supplierFindings.reduce((acc, f) => acc + (f.value ?? 0), 0)

  const bySecretaria: Record<string, number> = {}
  for (const f of supplierFindings) {
    const sec = f.secretaria ?? (loc === 'pt-br' ? 'Nao informada' : 'Not specified')
    bySecretaria[sec] = (bySecretaria[sec] ?? 0) + (f.value ?? 0)
  }

  const orgJsonLd = buildSupplierOrganizationJsonLd({
    locale: loc,
    cnpj: cleanCnpj,
    findingsCount: supplierFindings.length,
    findings: supplierFindings.map((f) => ({
      id: f.id,
      type: f.type,
      city: f.city,
    })),
  })

  const isPt = loc === 'pt-br'
  const kpiLabels = {
    alerts: isPt ? 'Alertas publicados' : 'Published alerts',
    totalValue: isPt ? 'Valor total envolvido' : 'Total amount involved',
    cities: isPt ? 'Cidades' : 'Cities',
  }

  const cities = Array.from(
    new Set(supplierFindings.map((f) => `${f.city}/${f.state}`)),
  )

  const _findingIdToSlug = findingIdToSlug

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* JSON-LD SSR para crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Header */}
      <SupplierHeader cnpj={cleanCnpj} locale={loc} />

      {/* KPIs */}
      <section className="border-b border-brand-gray/10 bg-white px-6 py-5">
        <div className="mx-auto max-w-3xl">
          <dl className="grid grid-cols-3 divide-x divide-brand-gray/10">
            <KpiItem label={kpiLabels.alerts} value={String(supplierFindings.length)} />
            <KpiItem
              label={kpiLabels.totalValue}
              value={
                totalValue > 0
                  ? totalValue.toLocaleString(isPt ? 'pt-BR' : 'en-US', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0,
                    })
                  : '-'
              }
            />
            <KpiItem label={kpiLabels.cities} value={String(cities.length)} />
          </dl>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* RFB Card — dados pendentes de integracao direta */}
          <SupplierRfbCard locale={loc} />

          {/* CGU Card — dados pendentes de integracao direta */}
          <SupplierCguCard locale={loc} />

          {/* Donut de secretarias (so quando houver valores) */}
          {Object.keys(bySecretaria).length > 0 && totalValue > 0 && (
            <SupplierSecretariaDonut locale={loc} bySecretaria={bySecretaria} />
          )}

          {/* Tabela de contratos/alertas */}
          <SupplierContractsTable locale={loc} alerts={supplierFindings} limit={20} />

          {/* Timeline */}
          <SupplierAlertsTimeline locale={loc} alerts={supplierFindings} />
        </div>
      </section>
    </main>
  )
}

function KpiItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 text-center first:pl-0 last:pr-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-brand-gray">{label}</dt>
      <dd className="mt-1 font-mono text-lg font-bold text-brand-ink">{value}</dd>
    </div>
  )
}
