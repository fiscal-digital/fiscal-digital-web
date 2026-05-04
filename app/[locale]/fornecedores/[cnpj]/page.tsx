import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CaretLeft, Buildings, Hash, WarningCircle } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { fetchAlerts } from '@/lib/api'
import { findingIdToSlug, findingTypeLabel, formatCurrency, formatDate } from '@/lib/findings'

type Props = {
  params: Promise<{ locale: string; cnpj: string }>
}

/**
 * SSG seed: gera params para CNPJs já vistos em findings publicados.
 *
 * API /alerts já expõe `cnpj` denormalizado (Frente F entregue 2026-05-02).
 * `fetchAlerts` retorna até 200 findings (limite default da Lambda); CNPJs
 * que aparecem fora desse top 200 caem em 404. Aceitável para v1.0 — a
 * lista cresce à medida que findings ficam mais ricos.
 */
export async function generateStaticParams() {
  const findings = await fetchAlerts({ limit: 200 })
  const cnpjs = Array.from(new Set(
    findings.map((f) => f.cnpj?.replace(/\D/g, '')).filter((s): s is string => !!s && s.length === 14),
  ))
  return routing.locales.flatMap((locale) =>
    cnpjs.map((cnpj) => ({ locale, cnpj })),
  )
}

function formatCnpj(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length !== 14) return raw
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, cnpj } = await params
  const isPt = locale === 'pt'
  const formatted = formatCnpj(cnpj)
  const title = isPt
    ? `Fornecedor ${formatted} — Fiscal Digital`
    : `Supplier ${formatted} — Fiscal Digital`
  return { title, description: isPt
    ? `Perfil do fornecedor CNPJ ${formatted}: contratos públicos, alertas e sanções.`
    : `Supplier profile CNPJ ${formatted}: public contracts, alerts and sanctions.` }
}

export default async function FornecedorPage({ params }: Props) {
  const { locale, cnpj } = await params
  if (!routing.locales.includes(locale as 'pt' | 'en')) notFound()
  setRequestLocale(locale)

  const isPt = locale === 'pt'
  const cleanCnpj = cnpj.replace(/\D/g, '')
  const findings = await fetchAlerts({ limit: 200 })
  const supplierFindings = findings.filter((f) => f.cnpj?.replace(/\D/g, '') === cleanCnpj)

  const t = {
    back: isPt ? 'Voltar' : 'Back',
    title: isPt ? 'Perfil do Fornecedor' : 'Supplier Profile',
    cnpjLabel: 'CNPJ',
    stubTitle: isPt
      ? 'Perfil completo em breve'
      : 'Full profile coming soon',
    stubDesc: isPt
      ? 'A integração com Receita Federal (razão social, situação cadastral, data de abertura) e CGU (sanções CEIS/CNEP) está em desenvolvimento. Por enquanto exibimos os alertas em que este CNPJ aparece.'
      : 'Integration with Brazilian Federal Revenue (company name, status, founding date) and CGU (CEIS/CNEP sanctions) is under development. For now we list alerts mentioning this CNPJ.',
    alertsTitle: isPt ? 'Alertas envolvendo este CNPJ' : 'Alerts mentioning this CNPJ',
    empty: isPt
      ? 'Nenhum alerta publicado para este CNPJ ainda.'
      : 'No alerts published for this CNPJ yet.',
    razao: isPt ? 'Razão social' : 'Company name',
    situacao: isPt ? 'Situação cadastral' : 'Status',
    abertura: isPt ? 'Data de abertura' : 'Founding date',
    sancoes: isPt ? 'Sanções CGU' : 'CGU sanctions',
    pendingField: isPt ? 'Pendente — aguardando integração' : 'Pending — awaiting integration',
  }

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Header */}
      <section className="bg-brand-teal px-6 py-12 text-brand-paper">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-amber hover:underline"
          >
            <CaretLeft size={14} weight="bold" />
            {t.back}
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            {t.title}
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            <Hash size={24} weight="bold" className="text-brand-amber" />
            <span className="font-mono">{formatCnpj(cleanCnpj)}</span>
          </h1>
        </div>
      </section>

      {/* Stub notice */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-brand-amber/40 bg-brand-amber/10 p-5">
            <div className="mb-2 flex items-center gap-2">
              <WarningCircle size={18} weight="fill" className="text-brand-amber" />
              <h2 className="font-semibold text-brand-ink">{t.stubTitle}</h2>
            </div>
            <p className="text-sm text-brand-gray">{t.stubDesc}</p>
          </div>

          {/* Pending fields */}
          <dl className="mt-6 grid gap-3 rounded-xl border border-brand-gray/15 bg-white p-5 sm:grid-cols-2">
            <PendingRow icon={<Buildings size={14} weight="bold" />} label={t.razao} value={t.pendingField} />
            <PendingRow icon={<Buildings size={14} weight="bold" />} label={t.situacao} value={t.pendingField} />
            <PendingRow icon={<Buildings size={14} weight="bold" />} label={t.abertura} value={t.pendingField} />
            <PendingRow icon={<Buildings size={14} weight="bold" />} label={t.sancoes} value={t.pendingField} />
          </dl>

          {/* Findings list */}
          <h2 className="mt-10 mb-4 text-lg font-bold tracking-tight text-brand-ink">
            {t.alertsTitle}
          </h2>
          {supplierFindings.length === 0 ? (
            <div className="rounded-xl border border-brand-gray/15 bg-white px-6 py-10 text-center text-sm text-brand-gray">
              {t.empty}
            </div>
          ) : (
            <ul className="space-y-3">
              {supplierFindings.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/${locale}/alertas/${findingIdToSlug(f.id)}`}
                    className="block rounded-xl border border-brand-gray/15 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-brand-ink">
                        {findingTypeLabel(f.type, locale as 'pt' | 'en')}
                      </span>
                      <span className="text-brand-gray">·</span>
                      <span className="text-brand-gray">{f.city}/{f.state}</span>
                      <span className="ml-auto font-mono text-brand-gray">
                        {formatDate(f.createdAt, locale as 'pt' | 'en')}
                      </span>
                    </div>
                    {f.value != null && (
                      <p className="font-mono text-sm text-brand-ink">
                        {formatCurrency(f.value, locale as 'pt' | 'en')}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

function PendingRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-gray">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm italic text-brand-gray/80">{value}</dd>
    </div>
  )
}
