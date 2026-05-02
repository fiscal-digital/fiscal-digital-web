import { getTranslations } from 'next-intl/server'
import { ArrowSquareOut } from '@phosphor-icons/react/ssr'
import { API_URL } from '@/lib/api'
import { getRiskLabel } from '@/lib/brand'

interface FeaturedFinding {
  id?: string
  type?: string
  cityId?: string
  city?: string
  state?: string
  riskScore?: number
  confidence?: number
  value?: number
  secretaria?: string
  legalBasis?: string
  narrative?: string
  source?: string
  createdAt?: string
}

interface ApiResponse {
  total?: number
  items?: FeaturedFinding[]
}

async function fetchFeatured(): Promise<FeaturedFinding | null> {
  try {
    const res = await fetch(`${API_URL}/alerts?limit=1`, {
      // ISR-style revalidation; static export ignora mas dev/preview respeitam.
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data: ApiResponse | FeaturedFinding[] = await res.json()
    const items = Array.isArray(data) ? data : data.items ?? []
    return items[0] ?? null
  } catch {
    return null
  }
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface Props {
  locale: string
}

export default async function FeaturedAlert({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.featured' })
  const tTypes = await getTranslations({ locale, namespace: 'alertas.types' })
  const tCard = await getTranslations({ locale, namespace: 'alertas.card' })
  const finding = await fetchFeatured()

  if (!finding) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-brand-gray/15 bg-white px-6 py-10 text-center shadow-sm">
        <p className="mb-2 text-2xl" aria-hidden="true">
          🕒
        </p>
        <p className="mb-1 font-semibold text-brand-ink">{t('empty_title')}</p>
        <p className="text-sm text-brand-gray">{t('empty_desc')}</p>
      </div>
    )
  }

  const typeLabel = (() => {
    if (!finding.type) return ''
    try {
      return tTypes(finding.type as Parameters<typeof tTypes>[0])
    } catch {
      return finding.type
    }
  })()

  const riskScore = finding.riskScore ?? 0
  const riskLabel = getRiskLabel(riskScore, locale === 'en' ? 'en' : 'pt')

  return (
    <article className="mx-auto max-w-3xl rounded-xl border border-brand-gray/15 bg-white p-6 shadow-md">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {typeLabel && (
          <span className="rounded-pill bg-brand-danger/10 px-2.5 py-0.5 text-xs font-semibold text-brand-danger">
            {typeLabel}
          </span>
        )}
        <span className="rounded-pill bg-brand-teal px-2.5 py-0.5 text-xs font-semibold text-brand-paper">
          {tCard('riskScore')} {riskScore} — {riskLabel}
        </span>
      </div>

      {(finding.city || finding.state) && (
        <p className="mb-3 text-sm font-semibold text-brand-ink">
          {finding.city}
          {finding.state ? <> · <span className="text-brand-gray">{finding.state}</span></> : null}
        </p>
      )}

      {finding.narrative && (
        <p className="mb-4 text-base leading-relaxed text-brand-ink">
          {finding.narrative}
        </p>
      )}

      <dl className="mb-5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-brand-gray">
        {finding.value != null && (
          <div className="flex gap-1">
            <dt className="font-medium">{tCard('value')}:</dt>
            <dd className="font-mono">{formatCurrency(finding.value)}</dd>
          </div>
        )}
        {finding.secretaria && (
          <div className="flex gap-1">
            <dt className="font-medium">{tCard('secretaria')}:</dt>
            <dd>{finding.secretaria}</dd>
          </div>
        )}
        {finding.legalBasis && (
          <div className="flex gap-1">
            <dt className="font-medium">Base legal:</dt>
            <dd>{finding.legalBasis}</dd>
          </div>
        )}
        {finding.createdAt && (
          <div className="flex gap-1">
            <dt className="font-medium">{tCard('date')}:</dt>
            <dd className="font-mono">{formatDate(finding.createdAt, locale)}</dd>
          </div>
        )}
      </dl>

      {finding.source && (
        <div className="flex items-center justify-end border-t border-brand-gray/10 pt-4">
          <a
            href={finding.source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-1.5 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
          >
            {tCard('source')}
            <ArrowSquareOut size={12} weight="bold" />
          </a>
        </div>
      )}
    </article>
  )
}
