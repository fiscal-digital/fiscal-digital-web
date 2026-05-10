'use client'

import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'
import { getRiskLevel, getRiskLabel } from '@/lib/brand'
import { findingIdToSlug } from '@/lib/findings'
import type { Finding } from './AlertsFeed'

interface FindingRowProps {
  finding: Finding
  typeLabel: (type: string) => string
  locale: 'pt-br' | 'en-us'
}

function riskBadgeClass(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'bg-risk-critical text-white'
  if (level === 'alert') return 'bg-risk-alert text-brand-ink'
  if (level === 'low') return 'bg-risk-low text-white'
  return 'bg-brand-gray text-white'
}

export function FindingRow({ finding, typeLabel, locale }: FindingRowProps) {
  const detailHref = `/${locale}/alertas/${findingIdToSlug(finding.id)}`

  return (
    <tr className="border-b border-brand-gray/15 hover:bg-brand-gray/5 transition-colors">
      <td className="min-w-[140px] px-4 py-3 text-sm font-semibold text-brand-ink">{typeLabel(finding.type)}</td>
      <td className="min-w-[100px] px-4 py-3 text-sm text-brand-gray">{finding.city}</td>
      <td className="min-w-[120px] px-4 py-3 text-sm">
        <span
          className={`inline-block whitespace-nowrap rounded-pill px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}
          title={locale === 'en-us'
            ? `Risk score ${finding.riskScore}/100`
            : `Pontuação de risco ${finding.riskScore}/100`}
        >
          {getRiskLabel(finding.riskScore, locale)}
        </span>
      </td>
      <td className="min-w-[120px] px-4 py-3 text-sm font-mono text-brand-ink">
        {finding.value != null
          ? `R$ ${finding.value.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US')}`
          : '—'}
      </td>
      <td className="min-w-[300px] px-4 py-3 text-sm text-brand-gray">
        {finding.narrative ? finding.narrative.replace(/[#*]/g, '').substring(0, 150) : '—'}
      </td>
      <td className="min-w-[70px] px-4 py-3 text-right">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:opacity-75 transition-opacity"
        >
          Ver <ArrowRight size={12} weight="bold" />
        </Link>
      </td>
    </tr>
  )
}
