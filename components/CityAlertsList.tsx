'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'
import { findingIdToSlug, findingTypeLabel, formatCurrency, formatDate } from '@/lib/findings'
import { getRiskLevel } from '@/lib/brand'

/**
 * Feed de alertas de uma cidade — client-side fetch ao API real, sem
 * depender de SSG cache. Substitui o feed estático em /cidades/[slug]
 * que ficava com dados velhos do momento do build.
 */

interface Finding {
  id: string
  type: string
  riskScore: number
  value?: number
  secretaria?: string
  narrative?: string
  createdAt: string
}

interface Props {
  cityId: string
  cityName: string
  locale: 'pt' | 'en'
}

function riskBadgeClass(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'bg-risk-critical text-white'
  if (level === 'alert')    return 'bg-risk-alert text-brand-ink'
  if (level === 'low')      return 'bg-risk-low text-white'
  return 'bg-brand-gray text-white'
}

const labels = {
  'pt': {
    loading: 'Carregando alertas…',
    empty: (city: string) => `Sem alertas detectados em ${city} ainda.`,
    emptyDesc: 'Os Fiscais monitoram diariamente o diário oficial. Volte em breve.',
    error: 'Não foi possível carregar os alertas no momento.',
    riskLabel: 'Risco',
  },
  en: {
    loading: 'Loading alerts…',
    empty: (city: string) => `No alerts detected in ${city} yet.`,
    emptyDesc: 'The Fiscals monitor the official gazette daily. Check back soon.',
    error: 'Unable to load alerts at this time.',
    riskLabel: 'Risk',
  },
}

export default function CityAlertsList({ cityId, cityName, locale }: Props) {
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const t = labels[locale]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch(`${API_URL}/alerts?city=${cityId}&size=200`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { items?: Finding[] }) => {
        if (cancelled) return
        setFindings(data.items ?? [])
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [cityId])

  if (loading) {
    return (
      <ul className="grid gap-4 sm:grid-cols-2" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="animate-pulse rounded-xl border border-brand-gray/15 bg-white p-5">
            <div className="mb-2 flex gap-2">
              <div className="h-5 w-16 rounded-pill bg-brand-gray/15" />
              <div className="h-5 w-32 rounded-pill bg-brand-gray/10" />
            </div>
            <div className="mb-1 h-3 w-full rounded bg-brand-gray/10" />
            <div className="h-3 w-5/6 rounded bg-brand-gray/10" />
          </li>
        ))}
      </ul>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-brand-gray/15 bg-white px-6 py-12 text-center">
        <p className="text-sm text-brand-gray">{t.error}</p>
      </div>
    )
  }

  if (findings.length === 0) {
    return (
      <div className="rounded-xl border border-brand-gray/15 bg-white px-6 py-12 text-center">
        <p className="font-semibold text-brand-ink">{t.empty(cityName)}</p>
        <p className="mt-2 text-sm text-brand-gray">{t.emptyDesc}</p>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {findings.map((f) => (
        <li key={f.id}>
          <Link
            href={`/${locale}/alertas/${findingIdToSlug(f.id)}`}
            prefetch
            className="block rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(f.riskScore)}`}>
                {t.riskLabel} {f.riskScore}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
                {findingTypeLabel(f.type, locale)}
              </span>
            </div>
            {f.narrative && (
              <p className="mb-3 line-clamp-3 text-sm text-brand-gray">
                {f.narrative.replace(/[#*]/g, '').trim()}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-gray">
              {f.value != null && (
                <span className="font-mono">{formatCurrency(f.value, locale)}</span>
              )}
              {f.secretaria && <span>{f.secretaria}</span>}
              <span className="ml-auto font-mono">{formatDate(f.createdAt, locale)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
