'use client'

import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import { getRiskLevel, getRiskLabel } from '@/lib/brand'
import { findingIdToSlug } from '@/lib/findings'
import type { Finding } from './AlertsFeed'

interface FindingCardProps {
  finding: Finding
  typeLabel: (type: string) => string
  t: ReturnType<typeof useTranslations<'alertas'>>
  locale: 'pt' | 'en'
}

function formatCurrency(value: number, locale: 'pt' | 'en'): string {
  return value.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(iso: string, locale: 'pt' | 'en'): string {
  const d = new Date(iso)
  return d.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function riskBadgeClass(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'bg-risk-critical text-white'
  if (level === 'alert') return 'bg-risk-alert text-brand-ink'
  if (level === 'low') return 'bg-risk-low text-white'
  return 'bg-brand-gray text-white'
}

function typeBadgeClass(type: string): string {
  const red = ['dispensa_irregular', 'fracionamento', 'cnpj_jovem', 'inexigibilidade_sem_justificativa', 'nepotismo_indicio']
  const orange = ['aditivo_abusivo', 'prorrogacao_excessiva', 'concentracao_fornecedor', 'pico_nomeacoes', 'rotatividade_anormal', 'publicidade_eleitoral']
  if (red.includes(type)) return 'bg-brand-danger/10 text-brand-danger'
  if (orange.includes(type)) return 'bg-brand-amber/15 text-brand-ink'
  return 'bg-brand-gray/10 text-brand-gray'
}

export function FindingCard({ finding, typeLabel, t, locale }: FindingCardProps) {
  const detailHref = `/${locale}/alertas/${findingIdToSlug(finding.id)}`
  const gazetteDate = finding.evidence?.[0]?.date

  return (
    <article className="group relative flex flex-col rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm transition-shadow hover:border-brand-teal/40 hover:shadow-md">
      <Link
        href={detailHref}
        aria-label={`${typeLabel(finding.type)} — ${finding.city}`}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
      >
        <span className="sr-only">{t('card.viewFull')}</span>
      </Link>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClass(finding.type)}`}>
          {typeLabel(finding.type)}
        </span>
        <span
          className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}
          title={locale === 'en'
            ? `Risk score ${finding.riskScore}/100`
            : `Pontuação de risco ${finding.riskScore}/100`}
        >
          {getRiskLabel(finding.riskScore, locale)}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
        <span className="font-semibold text-brand-ink">{finding.city}</span>
        <span className="font-mono text-xs text-brand-gray">{finding.state}</span>
        {finding.secretaria && (
          <>
            <span aria-hidden="true" className="text-brand-gray/40">
              ·
            </span>
            <span className="text-xs text-brand-gray">{finding.secretaria}</span>
          </>
        )}
        {finding.contractNumber && (
          <>
            <span aria-hidden="true" className="text-brand-gray/40">
              ·
            </span>
            <span className="font-mono text-xs text-brand-gray">
              {locale === 'pt' ? 'Contrato ' : 'Contract '}
              {finding.contractNumber}
            </span>
          </>
        )}
      </div>

      {finding.value != null && (
        <p className="mb-3 font-mono text-base font-bold text-brand-ink">{formatCurrency(finding.value, locale)}</p>
      )}

      {finding.narrative && (
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-brand-gray text-pretty">
          {finding.narrative.replace(/[#*]/g, '').replace(/\s+/g, ' ').trim()}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-brand-gray/10 pt-3">
        <div className="flex flex-col gap-0.5 text-xs text-brand-gray">
          {gazetteDate && (
            <span>
              {locale === 'pt' ? 'Diário: ' : 'Gazette: '}
              <span className="font-mono text-brand-ink">{formatDate(gazetteDate, locale)}</span>
            </span>
          )}
          <span className="text-brand-gray/70">
            {t('card.confidence')}: {Math.round(finding.confidence * 100)}%
          </span>
        </div>
        <Link
          href={detailHref}
          className="relative z-20 inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
        >
          {t('card.viewFull')}
          <ArrowRight size={12} weight="bold" />
        </Link>
      </div>
    </article>
  )
}
