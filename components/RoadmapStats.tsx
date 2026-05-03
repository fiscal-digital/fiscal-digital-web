'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { API_URL } from '@/lib/api'

// Schema da API /stats — espelha packages/api/src/index.ts StatsResponse.
// Custo já vem em BRL (moeda única do projeto, não traduzida).
interface ApiStats {
  totalGazettesProcessed?: number | null
  totalFindings?: number
  estimatedCostBrl?: number
  lastFindingAt?: string | null
}

function Skeleton() {
  return <div className="h-6 w-32 animate-pulse rounded bg-brand-gray/15" />
}

function StatRow({
  label,
  value,
  loading,
  mono,
}: {
  label: string
  value: string
  loading: boolean
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b border-brand-gray/10 py-3 last:border-0">
      <span className="text-sm text-brand-gray">{label}</span>
      {loading ? (
        <Skeleton />
      ) : (
        <span
          className={`text-sm font-semibold text-brand-ink ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </span>
      )}
    </div>
  )
}

export default function RoadmapStats() {
  const t = useTranslations('roadmap')
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    fetch(`${API_URL}/stats`, { signal: controller.signal })
      .then((res) => {
        if (res.status === 404) return null
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ApiStats>
      })
      .then((data) => {
        if (cancelled) return
        setStats(data ?? {})
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
      })
      .finally(() => {
        clearTimeout(timeout)
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  function formatNumber(n: number) {
    return n.toLocaleString('pt-BR')
  }

  function formatBrl(n: number) {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatDate(iso: string | undefined) {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  const costBrl = stats?.estimatedCostBrl ?? 0

  if (error) {
    return (
      <p className="text-sm text-brand-gray italic">{t('costs_live_error')}</p>
    )
  }

  return (
    <div className="rounded-lg border border-brand-gray/20 bg-brand-paper">
      <StatRow
        label={t('costs_live_gazettes')}
        value={formatNumber(stats?.totalGazettesProcessed ?? 0)}
        loading={loading}
        mono
      />
      <StatRow
        label={t('costs_live_alerts')}
        value={formatNumber(stats?.totalFindings ?? 0)}
        loading={loading}
        mono
      />
      <StatRow
        label={t('costs_live_cost')}
        value={formatBrl(costBrl)}
        loading={loading}
        mono
      />
      <StatRow
        label={t('costs_live_last_run')}
        value={formatDate(stats?.lastFindingAt ?? undefined)}
        loading={loading}
      />
    </div>
  )
}
