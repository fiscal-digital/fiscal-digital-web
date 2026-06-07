import Link from 'next/link'
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr'
import type { ApiFinding } from '@/lib/findings'
import { findingIdToSlug, findingTypeLabel, formatCurrency, formatDate } from '@/lib/findings'
import { getRiskLevel } from '@/lib/brand'

interface Props {
  locale: 'pt-br' | 'en-us'
  alerts: ApiFinding[]
}

const t = {
  'pt-br': {
    title: 'Linha do Tempo',
    noData: 'Nenhum alerta publicado para este fornecedor ainda.',
    viewAlert: 'Ver alerta',
    source: 'Diario oficial',
  },
  'en-us': {
    title: 'Timeline',
    noData: 'No alerts published for this supplier yet.',
    viewAlert: 'View alert',
    source: 'Official gazette',
  },
} as const

function riskDotColor(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'bg-brand-danger'
  if (level === 'alert') return 'bg-brand-amber'
  if (level === 'low') return 'bg-brand-success'
  return 'bg-brand-gray'
}

function riskTextColor(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'text-brand-danger'
  if (level === 'alert') return 'text-brand-ink'
  return 'text-brand-gray'
}

export default function SupplierAlertsTimeline({ locale, alerts }: Props) {
  const tx = t[locale]

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-brand-gray/15 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-gray">{tx.title}</h2>
        <p className="text-sm text-brand-gray">{tx.noData}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-brand-gray/15 bg-white p-5">
      <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-brand-gray">{tx.title}</h2>

      <ol className="relative border-l border-brand-gray/20 pl-6 space-y-6">
        {alerts.map((f) => (
          <li key={f.id} className="relative">
            {/* Dot */}
            <span
              className={`absolute -left-[1.45rem] top-1.5 h-3 w-3 rounded-full border-2 border-white ${riskDotColor(f.riskScore)}`}
              aria-hidden="true"
            />

            {/* Data */}
            <time className="block text-xs font-mono text-brand-gray">
              {formatDate(f.createdAt, locale)}
            </time>

            {/* Tipo */}
            <Link
              href={`/${locale}/alertas/${findingIdToSlug(f.id)}`}
              className={`mt-0.5 block text-sm font-semibold hover:underline ${riskTextColor(f.riskScore)}`}
            >
              {findingTypeLabel(f.type, locale)}
            </Link>

            {/* Meta */}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-brand-gray">
              {f.secretaria && <span>{f.secretaria}</span>}
              {f.value != null && (
                <span className="font-mono">{formatCurrency(f.value, locale)}</span>
              )}
              <span className="font-semibold">
                {locale === 'pt-br' ? 'Risco' : 'Risk'} {f.riskScore}
              </span>
            </div>

            {/* Fonte */}
            <a
              href={f.source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-brand-gray/60 hover:text-brand-teal"
            >
              <ArrowSquareOut size={11} weight="bold" className="pointer-events-none" />
              {tx.source}
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
