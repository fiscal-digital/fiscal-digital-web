'use client'

import { useEffect, useState } from 'react'
import { API_URL } from '@/lib/api'
import { activeCount, totalCount } from '@/lib/cities'

// Mesma API que StatsCounter — números devem bater entre Hero e seção "Em números".
// Antes este componente lia estimatedCostUsd (removido do backend ao mover
// conversão para BRL único). Resultado: mostrava "R$ 0".
interface StatsApiResponse {
  totalFindings: number
  totalGazettesProcessed: number | null
  estimatedCostBrl: number
}

interface Props {
  locale: string
}

const labels = {
  'pt-br': {
    findings: 'Achados publicados',
    gazettes: 'Diários analisados',
    cities: 'Cidades monitoradas',
    cost: 'Custo operacional total',
  },
  en: {
    findings: 'Published findings',
    gazettes: 'Gazettes analyzed',
    cities: 'Cities monitored',
    cost: 'Total operational cost',
  },
}

function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR')
}

function formatBrl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

  const citiesActive = activeCount()
  const citiesTotal = totalCount()
  const citiesValue = citiesTotal > citiesActive
    ? `${citiesActive} / ${citiesTotal}`
    : String(citiesActive)

  const items = [
    {
      key: 'findings',
      value: stats ? formatNumber(stats.totalFindings ?? 0) : null,
      label: l.findings,
    },
    {
      key: 'gazettes',
      value: stats ? formatNumber(stats.totalGazettesProcessed ?? 0) : null,
      label: l.gazettes,
    },
    {
      key: 'cities',
      value: citiesValue,
      label: l.cities,
    },
    {
      key: 'cost',
      value: stats ? formatBrl(stats.estimatedCostBrl ?? 0) : null,
      label: l.cost,
    },
  ]

  return (
    <div className="rounded-xl border border-brand-paper/15 bg-brand-paper/10 p-6">
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.key}>
            {item.value == null ? (
              <div className="mb-1 h-8 w-32 animate-pulse rounded bg-brand-paper/20" />
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
