'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { API_URL } from '@/lib/api'
import { activeCount, totalCount } from '@/lib/cities'

interface Stats {
  gazettes?: number
  findings?: number
  cities?: number
  costBrl?: number
}

function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR')
}

function formatBrl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StatCard({
  value,
  label,
  loading,
}: {
  value: string
  label: string
  loading: boolean
}) {
  return (
    <div className="rounded-xl border border-brand-gray/15 bg-white px-5 py-6 text-center shadow-sm">
      {loading ? (
        <div className="mx-auto mb-2 h-9 w-24 animate-pulse rounded bg-brand-gray/15" />
      ) : (
        <p className="mb-1 font-mono text-3xl font-bold text-brand-teal sm:text-4xl">
          {value}
        </p>
      )}
      <p className="text-xs uppercase tracking-wider text-brand-gray">
        {label}
      </p>
    </div>
  )
}

export default function StatsCounter() {
  const t = useTranslations('home.stats')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch(`${API_URL}/stats`)
      .then((res) => {
        // 404 = endpoint ainda não publicado pela Frente F. Trata como vazio.
        if (res.status === 404) return null
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
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
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Fallback de cidades vem sempre do lib/cities (verificável em build).
  const citiesActive = stats?.cities ?? activeCount()
  const citiesTotal = totalCount()

  if (error && !stats) {
    return (
      <div className="rounded-xl border border-brand-gray/15 bg-white px-6 py-8 text-center">
        <p className="mb-1 text-sm font-semibold text-brand-ink">
          {t('error_title')}
        </p>
        <p className="text-sm text-brand-gray">{t('error_desc')}</p>
        <p className="mt-4 font-mono text-2xl font-bold text-brand-teal">
          {citiesActive} / {citiesTotal}
        </p>
        <p className="text-xs uppercase tracking-wider text-brand-gray">
          {t('cities')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        loading={loading}
        value={formatNumber(stats?.gazettes ?? 0)}
        label={t('gazettes')}
      />
      <StatCard
        loading={loading}
        value={formatNumber(stats?.findings ?? 0)}
        label={t('findings')}
      />
      <StatCard
        loading={loading}
        value={`${citiesActive}${citiesTotal > citiesActive ? ` / ${citiesTotal}` : ''}`}
        label={t('cities')}
      />
      <StatCard
        loading={loading}
        value={formatBrl(stats?.costBrl ?? 0)}
        label={t('cost')}
      />
    </div>
  )
}
