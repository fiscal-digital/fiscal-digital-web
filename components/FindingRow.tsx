'use client'

import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'
import { getRiskLevel } from '@/lib/brand'
import { findingIdToSlug } from '@/lib/findings'
import type { Finding } from './AlertsFeed'

interface FindingRowProps {
  finding: Finding
  typeLabel: (type: string) => string
  locale: 'pt' | 'en'
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
      <td className="px-4 py-3 text-sm font-semibold text-brand-ink">{typeLabel(finding.type)}</td>
      <td className="px-4 py-3 text-sm text-brand-gray">{finding.city}</td>
      <td className="px-4 py-3 text-sm">
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}>
          {finding.riskScore}
        </span>
      </td>
      {finding.value != null && (
        <td className="px-4 py-3 text-sm font-mono text-brand-ink">
          R$ {finding.value.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US')}
        </td>
      )}
      <td className="px-4 py-3 text-sm text-brand-gray line-clamp-1">
        {finding.narrative ? finding.narrative.replace(/[#*]/g, '').substring(0, 100) + '…' : '—'}
      </td>
      <td className="px-4 py-3 text-right">
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
