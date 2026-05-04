'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { API_URL } from '@/lib/api'

// /stats fornece volume (gazettes + findings + lastFindingAt).
// Custo NÃO vem do /stats (estimatedCostBrl é teórico, só inferência LLM).
// Custo real vem de /transparencia/costs/mtd (FiscalCustos), mesma fonte que
// HeroStats e /transparencia/custos consomem. Single source of truth.
interface ApiStats {
  totalGazettesProcessed?: number | null
  totalFindings?: number
  lastFindingAt?: string | null
}

interface CostMtd {
  currency: 'BRL'
  lifetimeBrl: number
  mtdBrl: number
  updatedAt: string | null
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
  const [cost, setCost] = useState<CostMtd | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    Promise.allSettled([
      fetch(`${API_URL}/stats`, { signal: controller.signal }).then((res) => {
        if (res.status === 404) return null
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ApiStats>
      }),
      fetch(`${API_URL}/transparencia/costs/mtd`, { signal: controller.signal }).then((res) => {
        if (res.status === 503 || res.status === 404) return null
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<CostMtd>
      }),
    ])
      .then(([statsRes, costRes]) => {
        if (cancelled) return
        if (statsRes.status === 'fulfilled') setStats(statsRes.value ?? {})
        if (costRes.status === 'fulfilled') setCost(costRes.value)
        if (statsRes.status === 'rejected' && costRes.status === 'rejected') {
          setError(true)
        }
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

  const lifetimeBrl = cost?.lifetimeBrl ?? 0
  const mtdBrl = cost?.mtdBrl ?? 0

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
        label={t('costs_live_mtd')}
        value={formatBrl(mtdBrl)}
        loading={loading}
        mono
      />
      <StatRow
        label={t('costs_live_cost')}
        value={formatBrl(lifetimeBrl)}
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
