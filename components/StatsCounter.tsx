'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { API_URL } from '@/lib/api'
import { activeCount, totalCount } from '@/lib/cities'

interface StatsApiResponse {
  totalFindings: number
  totalGazettesProcessed: number | null
  lastFindingAt: string | null
  uptimeDays: number
}

interface CostMtdResponse {
  currency: 'BRL'
  lifetimeBrl: number
}

function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR')
}

function formatBrl(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef(0)
  const targetRef = useRef(target)

  useEffect(() => {
    fromRef.current = value
    targetRef.current = target
    startRef.current = null
    let raf = 0
    const tick = (ts: number) => {
      if (startRef.current == null) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(1, elapsed / durationMs)
      const eased = easeOutCubic(progress)
      const next = fromRef.current + (targetRef.current - fromRef.current) * eased
      setValue(next)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}

function StatCard({
  target,
  label,
  loading,
  format,
}: {
  target: number
  label: string
  loading: boolean
  format: (n: number) => string
}) {
  const animated = useCountUp(target)
  return (
    <div className="rounded-xl border border-brand-gray/15 bg-white px-5 py-6 text-center shadow-sm">
      {loading ? (
        <div className="mx-auto mb-2 h-9 w-24 animate-pulse rounded bg-brand-gray/15" />
      ) : (
        <p className="mb-1 font-mono text-3xl font-bold text-brand-teal sm:text-4xl tabular-nums">
          {format(Math.round(animated))}
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
  const [stats, setStats] = useState<StatsApiResponse | null>(null)
  const [cost, setCost] = useState<CostMtdResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch(`${API_URL}/stats`, { cache: 'no-store' })
        .then((res) => {
          if (res.status === 404) return null
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .catch(() => null),
      fetch(`${API_URL}/transparencia/costs/mtd`, { cache: 'no-store' })
        .then((res) => {
          if (res.status === 503) return null
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .catch(() => null),
    ])
      .then(([statsData, costData]) => {
        if (cancelled) return
        setStats(statsData ?? null)
        setCost(costData ?? null)
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

  const citiesActive = activeCount()
  const citiesTotal = totalCount()

  const gazettes = stats?.totalGazettesProcessed ?? 0
  const findings = stats?.totalFindings ?? 0
  const costBrl = cost?.lifetimeBrl ?? 0

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
        target={gazettes}
        format={formatNumber}
        label={t('gazettes')}
      />
      <StatCard
        loading={loading}
        target={findings}
        format={formatNumber}
        label={t('findings')}
      />
      <StatCard
        loading={loading}
        target={citiesActive}
        format={(n) => (citiesTotal > citiesActive ? `${n} / ${citiesTotal}` : `${n}`)}
        label={t('cities')}
      />
      <StatCard
        loading={loading}
        target={costBrl}
        format={formatBrl}
        label={t('cost')}
      />
    </div>
  )
}
