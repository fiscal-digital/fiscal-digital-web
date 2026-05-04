import Link from 'next/link'
import { ArrowSquareOut, Buildings, Gavel, Calendar, Hash, Scales, CaretDown } from '@phosphor-icons/react/dist/ssr'
import { getRiskLevel, getRiskLabel } from '@/lib/brand'
import {
  type ApiFinding,
  findingTypeLabel,
  formatCurrency,
  formatDate,
} from '@/lib/findings'
import { slugForCityId } from '@/lib/cities'
import PdfPreview from './PdfPreview'

/**
 * FindingDetail — Server component reutilizável.
 *
 * Hierarquia visual (UH-WEB-003 — Progressive Disclosure):
 *  1. Impacto      — valor + cidade + risco (destaque grande)
 *  2. Narrativa    — TL;DR factual (texto)
 *  3. Detalhes     — CNPJ, contrato, base legal, datas (collapsed via <details>)
 *  4. Fonte        — PDF preview / link externo
 *
 * Stub-tolerante: campos ausentes são silenciosamente omitidos.
 */

function riskBadgeClass(score: number): string {
  const level = getRiskLevel(score)
  if (level === 'critical') return 'bg-risk-critical text-white'
  if (level === 'alert')    return 'bg-risk-alert text-brand-ink'
  if (level === 'low')      return 'bg-risk-low text-white'
  return 'bg-brand-gray text-white'
}

function typeBadgeClass(type: string): string {
  const red = ['dispensa_irregular', 'fracionamento', 'cnpj_jovem', 'inexigibilidade_sem_justificativa']
  const orange = ['aditivo_abusivo', 'prorrogacao_excessiva', 'concentracao_fornecedor', 'pico_nomeacoes', 'rotatividade_anormal']
  if (red.includes(type)) return 'bg-brand-danger/10 text-brand-danger'
  if (orange.includes(type)) return 'bg-brand-amber/15 text-brand-ink'
  return 'bg-brand-gray/10 text-brand-gray'
}

interface FindingDetailProps {
  finding: ApiFinding
  locale: 'pt' | 'en'
  showPdf?: boolean
  hideCity?: boolean
}

export default function FindingDetail({
  finding,
  locale,
  showPdf = true,
  hideCity = false,
}: FindingDetailProps) {
  const isPt = locale === 'pt'
  const riskLabel = getRiskLabel(finding.riskScore, locale)
  const evidence = finding.evidence?.[0]
  const cityHref = `/${locale}/cidades/${slugForCityId(finding.cityId)}`
  const hasValue = finding.value != null
  const hasMetadata = Boolean(
    finding.cnpj || finding.contractNumber || finding.legalBasis || finding.secretaria || finding.createdAt,
  )

  // UH-WEB-001 — quando gap entre data do diário (evidence[0].date) e a detecção
  // (createdAt) > 30d, sinalizamos que o fato é anterior (análise retrospectiva).
  // Em vez de jargão "backfill", mostramos a data do diário direto — auto-explicativo.
  const gazetteDate = evidence?.date
  const detectedAt = finding.createdAt
  const gapDays = (() => {
    if (!gazetteDate || !detectedAt) return 0
    try {
      const g = new Date(gazetteDate).getTime()
      const d = new Date(detectedAt).getTime()
      return Math.floor((d - g) / 86400000)
    } catch {
      return 0
    }
  })()
  const isHistorical = gapDays > 30
  const gazetteDateLabel = (() => {
    if (!gazetteDate) return ''
    try {
      const d = new Date(gazetteDate)
      return d.toLocaleDateString(isPt ? 'pt-BR' : 'en-US', {
        month: 'short',
        year: 'numeric',
      }).replace('.', '')
    } catch {
      return ''
    }
  })()

  return (
    <article className="space-y-6">
      {/* Badges header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${typeBadgeClass(finding.type)}`}>
          {findingTypeLabel(finding.type, locale)}
        </span>
        <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}>
          {isPt ? 'Risco' : 'Risk'} {finding.riskScore} — {riskLabel}
        </span>
        <span className="rounded-pill bg-brand-gray/10 px-3 py-1 text-xs font-semibold text-brand-gray">
          {isPt ? 'Confiança' : 'Confidence'} {Math.round(finding.confidence * 100)}%
        </span>
        {isHistorical && gazetteDateLabel && (
          <span
            className="rounded-pill border border-brand-gray/25 bg-brand-paper px-3 py-1 text-xs font-semibold text-brand-gray"
            title={isPt
              ? `Documento publicado em ${gazetteDate ? new Date(gazetteDate).toLocaleDateString('pt-BR') : ''}. Identificado pela análise retrospectiva do diário oficial.`
              : `Document published on ${gazetteDate ? new Date(gazetteDate).toLocaleDateString('en-US') : ''}. Detected by retrospective analysis of the official gazette.`}
          >
            {isPt ? `Diário de ${gazetteDateLabel}` : `Gazette from ${gazetteDateLabel}`}
          </span>
        )}
      </div>

      {/* NÍVEL 1 — IMPACTO (valor + entidade) */}
      <section
        aria-label={isPt ? 'Impacto do achado' : 'Finding impact'}
        className="rounded-xl border border-brand-gray/15 bg-white p-5 sm:p-6"
      >
        {hasValue && (
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
              {isPt ? 'Valor envolvido' : 'Amount involved'}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-brand-ink sm:text-3xl">
              {formatCurrency(finding.value!, locale)}
            </p>
          </div>
        )}

        {!hideCity && (
          <p className="text-sm text-brand-ink">
            <Link
              href={cityHref}
              className="font-semibold underline-offset-2 hover:underline"
            >
              {finding.city}
            </Link>
            <span className="ml-1 font-mono text-xs text-brand-gray">· {finding.state}</span>
            {finding.secretaria && (
              <span className="ml-1 text-brand-gray"> · {finding.secretaria}</span>
            )}
          </p>
        )}
      </section>

      {/* NÍVEL 2 — NARRATIVA (TL;DR) */}
      {finding.narrative && (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-line text-base leading-relaxed text-brand-ink">
            {finding.narrative
              .split('\n')
              .filter(line => !/^\*{1,2}[^*\n]+\*{1,2}$/.test(line.trim()))
              .filter(line => !/^#{1,6}\s/.test(line))
              .join('\n')
              .replace(/\*\*(.+?)\*\*/g, '$1')
              .replace(/\*(.+?)\*/g, '$1')
              .replace(/\n{3,}/g, '\n\n')
              .trim()
            }
          </p>
        </div>
      )}

      {/* NÍVEL 3 — DETALHES TÉCNICOS (collapsed) */}
      {hasMetadata && (
        <details className="group rounded-xl border border-brand-gray/15 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl p-4 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-paper">
            <span>{isPt ? 'Detalhes técnicos e base legal' : 'Technical details and legal basis'}</span>
            <CaretDown
              size={16}
              weight="bold"
              className="text-brand-gray transition-transform group-open:rotate-180"
            />
          </summary>
          <dl className="grid gap-4 border-t border-brand-gray/10 p-5 sm:grid-cols-2">
            {finding.cnpj && (
              <MetaRow icon={<Hash size={16} weight="bold" />} label="CNPJ">
                <Link
                  href={`/${locale}/fornecedores/${finding.cnpj.replace(/\D/g, '')}`}
                  className="font-mono text-brand-teal underline-offset-2 hover:underline"
                >
                  {finding.cnpj}
                </Link>
              </MetaRow>
            )}
            {finding.contractNumber && (
              <MetaRow icon={<Gavel size={16} weight="bold" />} label={isPt ? 'Contrato' : 'Contract'}>
                <span className="font-mono">{finding.contractNumber}</span>
              </MetaRow>
            )}
            {finding.legalBasis && (
              <MetaRow icon={<Scales size={16} weight="bold" />} label={isPt ? 'Base legal' : 'Legal basis'}>
                {renderLegalBasis(finding.legalBasis, isPt)}
              </MetaRow>
            )}
            {finding.secretaria && (
              <MetaRow icon={<Buildings size={16} weight="bold" />} label={isPt ? 'Secretaria' : 'Department'}>
                {finding.secretaria}
              </MetaRow>
            )}
            {gazetteDate && (
              <MetaRow icon={<Calendar size={16} weight="bold" />} label={isPt ? 'Diário oficial' : 'Official gazette'}>
                <span className="font-mono">{formatDate(gazetteDate, locale)}</span>
              </MetaRow>
            )}
            <MetaRow icon={<Calendar size={16} weight="bold" />} label={isPt ? 'Detectado em' : 'Detected on'}>
              <span className="font-mono">{formatDate(finding.createdAt, locale)}</span>
            </MetaRow>
          </dl>
        </details>
      )}

      {/* FONTE — PDF preview */}
      {showPdf && (
        <PdfPreview
          source={finding.source}
          cachedPdfUrl={finding.cachedPdfUrl}
          pdfProxyUrl={finding.pdfProxyUrl}
          excerpt={evidence?.excerpt}
          date={evidence?.date}
          locale={locale}
        />
      )}

      {!showPdf && (
        <a
          href={finding.source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
        >
          {isPt ? 'Ver fonte' : 'View source'}
          <ArrowSquareOut size={12} weight="bold" />
        </a>
      )}
    </article>
  )
}

/**
 * UH-WEB-004 — Accordion no legalBasis.
 *
 * Quando o texto contém um separador (`. ` ou `; `), a primeira parte vira
 * label visível ("Lei 14.133/2021, Art. 75") e o resto vira detalhe expansível
 * via <details>/<summary>. Sem separador, exibe inline (texto curto).
 */
function renderLegalBasis(text: string, isPt: boolean): React.ReactNode {
  const trimmed = text.trim()
  const splitMatch = trimmed.match(/^([^.;]{1,80}[.;])\s+(.+)$/s)
  if (!splitMatch) return trimmed

  const head = splitMatch[1].replace(/[.;]$/, '')
  const tail = splitMatch[2]

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-1 text-brand-ink hover:text-brand-teal">
        <span>{head}</span>
        <CaretDown
          size={12}
          weight="bold"
          className="text-brand-gray transition-transform group-open:rotate-180"
        />
        <span className="ml-1 text-xs text-brand-gray">
          ({isPt ? 'ver completo' : 'show more'})
        </span>
      </summary>
      <p className="mt-1 text-sm leading-relaxed text-brand-gray">{tail}</p>
    </details>
  )
}

interface MetaRowProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

function MetaRow({ icon, label, children }: MetaRowProps) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-brand-gray">{icon}</span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-brand-gray">{label}</dt>
        <dd className="mt-0.5 text-brand-ink">{children}</dd>
      </div>
    </div>
  )
}
