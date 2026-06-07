import Link from 'next/link'
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr'
import type { ApiFinding } from '@/lib/findings'
import { findingIdToSlug, findingTypeLabel, formatCurrency, formatDate } from '@/lib/findings'
import { getRiskLevel } from '@/lib/brand'

interface Props {
  locale: 'pt-br' | 'en-us'
  alerts: ApiFinding[]
  /** Maximo de linhas exibidas (default 20) */
  limit?: number
}

const t = {
  'pt-br': {
    title: 'Contratos e Alertas',
    date: 'Data',
    secretaria: 'Secretaria',
    type: 'Tipo',
    value: 'Valor',
    risco: 'Risco',
    source: 'Fonte',
    noData: 'Nenhum alerta publicado para este fornecedor ainda.',
    viewAlert: 'Ver alerta',
    viewSource: 'Ver diario',
  },
  'en-us': {
    title: 'Contracts and Alerts',
    date: 'Date',
    secretaria: 'Department',
    type: 'Type',
    value: 'Amount',
    risco: 'Risk',
    source: 'Source',
    noData: 'No alerts published for this supplier yet.',
    viewAlert: 'View alert',
    viewSource: 'View gazette',
  },
} as const

function riskBadge(score: number) {
  const level = getRiskLevel(score)
  const cls =
    level === 'critical'
      ? 'bg-brand-danger/15 text-brand-danger'
      : level === 'alert'
        ? 'bg-brand-amber/20 text-brand-ink'
        : 'bg-brand-gray/10 text-brand-gray'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>
      {score}
    </span>
  )
}

export default function SupplierContractsTable({ locale, alerts, limit = 20 }: Props) {
  const tx = t[locale]
  const rows = alerts.slice(0, limit)

  return (
    <div className="rounded-xl border border-brand-gray/15 bg-white">
      <h2 className="border-b border-brand-gray/10 px-5 py-3 text-sm font-bold uppercase tracking-wider text-brand-gray">
        {tx.title}
        {alerts.length > limit && (
          <span className="ml-2 text-xs font-normal text-brand-gray/60">
            ({limit}/{alerts.length})
          </span>
        )}
      </h2>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-brand-gray">
          {tx.noData}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-brand-gray/10 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">
                <th className="px-5 py-3">{tx.date}</th>
                <th className="px-5 py-3">{tx.type}</th>
                <th className="px-5 py-3">{tx.secretaria}</th>
                <th className="px-5 py-3">{tx.value}</th>
                <th className="px-5 py-3">{tx.risco}</th>
                <th className="px-5 py-3 sr-only">{tx.source}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray/8">
              {rows.map((f) => (
                <tr key={f.id} className="hover:bg-brand-paper/60 transition-colors">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-brand-gray">
                    {formatDate(f.createdAt, locale)}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/${locale}/alertas/${findingIdToSlug(f.id)}`}
                      className="font-semibold text-brand-teal hover:underline"
                    >
                      {findingTypeLabel(f.type, locale)}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-brand-gray">
                    {f.secretaria ?? '-'}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-brand-ink">
                    {f.value != null ? formatCurrency(f.value, locale) : '-'}
                  </td>
                  <td className="px-5 py-3">
                    {riskBadge(f.riskScore)}
                  </td>
                  <td className="px-5 py-3">
                    <a
                      href={f.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={tx.viewSource}
                      className="inline-flex items-center text-brand-gray hover:text-brand-teal"
                    >
                      <ArrowSquareOut size={14} weight="bold" className="pointer-events-none" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
