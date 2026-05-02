'use client'

import { useEffect, useState } from 'react'
import { API_URL } from '@/lib/api'

const USD_TO_BRL = 5.4

interface StatsApiResponse {
  totalFindings: number
  totalGazettesProcessed: number | null
  estimatedCostUsd: number
}

interface Props {
  locale: string
}

const labels = {
  'pt-br': {
    findings: 'Achados publicados',
    gazettes: 'Diários analisados',
    cost: 'Custo operacional total',
  },
  en: {
    findings: 'Published findings',
    gazettes: 'Gazettes analyzed',
    cost: 'Total operational cost',
  },
}

function fmt(n: number, k: number): string {
  if (k >= 1000) return `${(k / 1000).toFixed(0)}k`
  return String(n)
}

export default function HeroStats({ locale }: Props) {
  const [stats, setStats] = useState<StatsApiResponse | null>(null)
  const lang = locale === 'en' ? 'en' : 'pt-br'
  const l = labels[lang]

  useEffect(() => {
    fetch(`${API_URL}/stats`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: StatsApiResponse | null) => setStats(d))
      .catch(() => {})
  }, [])

  const gazettes = stats?.totalGazettesProcessed ?? 0
  const findings = stats?.totalFindings ?? 0
  const costBrl = Math.round((stats?.estimatedCostUsd ?? 0) * USD_TO_BRL)

  const items = [
    {
      key: 'findings',
      value: stats ? String(findings) : null,
      label: l.findings,
    },
    {
      key: 'gazettes',
      value: stats ? fmt(gazettes, gazettes) : null,
      label: l.gazettes,
    },
    {
      key: 'cost',
      value: stats ? `R$ ${costBrl}` : null,
      label: l.cost,
    },
  ]

  return (
    <div className="rounded-xl border border-brand-paper/15 bg-brand-paper/10 p-6">
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.key}>
            {item.value == null ? (
              <div className="mb-1 h-8 w-20 animate-pulse rounded bg-brand-paper/20" />
            ) : (
              <p className="font-mono text-3xl font-bold tabular-nums text-brand-paper">
                {item.value}
              </p>
            )}
            <p className="text-xs text-brand-paper/60">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
