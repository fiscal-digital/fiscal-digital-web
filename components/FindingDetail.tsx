import Link from 'next/link'
import { ArrowSquareOut, Buildings, Gavel, Calendar, CurrencyDollar, Hash, Scales } from '@phosphor-icons/react/dist/ssr'
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
 * Renderiza todos os campos disponíveis de um finding em formato detalhado.
 * Usado nas páginas: /alertas/[id], /cidades/[slug] (versão compacta opcional),
 * /fornecedores/[cnpj], /secretarias/[id].
 *
 * Stub-tolerante: campos ausentes (cnpj, contractNumber, evidence completo)
 * são silenciosamente omitidos — Frente F está expandindo a API.
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
  locale: 'pt-br' | 'en'
  /** Mostrar preview do PDF? Default: true. */
  showPdf?: boolean
  /** Esconder header com cidade (útil quando já está em página de cidade). */
  hideCity?: boolean
}

export default function FindingDetail({
  finding,
  locale,
  showPdf = true,
  hideCity = false,
}: FindingDetailProps) {
  const riskLabel = getRiskLabel(finding.riskScore, locale)
  const evidence = finding.evidence?.[0]
  const cityHref = `/${locale}/cidades/${slugForCityId(finding.cityId)}`

  return (
    <article className="space-y-6">
      {/* Badges header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${typeBadgeClass(finding.type)}`}>
          {findingTypeLabel(finding.type, locale)}
        </span>
        <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}>
          {locale === 'pt-br' ? 'Risco' : 'Risk'} {finding.riskScore} — {riskLabel}
        </span>
        <span className="rounded-pill bg-brand-gray/10 px-3 py-1 text-xs font-semibold text-brand-gray">
          {locale === 'pt-br' ? 'Confiança' : 'Confidence'} {Math.round(finding.confidence * 100)}%
        </span>
      </div>

      {/* City link */}
      {!hideCity && (
        <p className="text-sm text-brand-gray">
          <Link
            href={cityHref}
            className="font-semibold text-brand-ink underline-offset-2 hover:underline"
          >
            {finding.city}
          </Link>
          <span className="ml-1 font-mono text-xs">· {finding.state}</span>
        </p>
      )}

      {/* Narrative */}
      {finding.narrative && (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-line text-base leading-relaxed text-brand-ink">
            {finding.narrative
              // Remove linhas que são apenas títulos LLM (ex: **Achado de Fiscalização**)
              .split('\n')
              .filter(line => !/^\*{1,2}[^*\n]+\*{1,2}$/.test(line.trim()))
              .filter(line => !/^#{1,6}\s/.test(line))
              .join('\n')
              // Remove markdown restante inline
              .replace(/\*\*(.+?)\*\*/g, '$1')
              .replace(/\*(.+?)\*/g, '$1')
              .replace(/\n{3,}/g, '\n\n')
              .trim()
            }
          </p>
        </div>
      )}

      {/* Metadata grid */}
      <dl className="grid gap-4 rounded-xl border border-brand-gray/15 bg-white p-5 sm:grid-cols-2">
        {finding.value != null && (
          <MetaRow icon={<CurrencyDollar size={16} weight="bold" />} label={locale === 'pt-br' ? 'Valor' : 'Value'}>
            <span className="font-mono">{formatCurrency(finding.value, locale)}</span>
          </MetaRow>
        )}
        {finding.secretaria && (
          <MetaRow icon={<Buildings size={16} weight="bold" />} label={locale === 'pt-br' ? 'Secretaria' : 'Department'}>
            {finding.secretaria}
          </MetaRow>
        )}
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
          <MetaRow icon={<Gavel size={16} weight="bold" />} label={locale === 'pt-br' ? 'Contrato' : 'Contract'}>
            <span className="font-mono">{finding.contractNumber}</span>
          </MetaRow>
        )}
        {finding.legalBasis && (
          <MetaRow icon={<Scales size={16} weight="bold" />} label={locale === 'pt-br' ? 'Base legal' : 'Legal basis'}>
            {finding.legalBasis}
          </MetaRow>
        )}
        <MetaRow icon={<Calendar size={16} weight="bold" />} label={locale === 'pt-br' ? 'Detectado em' : 'Detected on'}>
          <span className="font-mono">{formatDate(finding.createdAt, locale)}</span>
        </MetaRow>
      </dl>

      {/* PDF preview */}
      {showPdf && (
        <PdfPreview
          source={finding.source}
          cachedPdfUrl={finding.cachedPdfUrl}
          excerpt={evidence?.excerpt}
          date={evidence?.date}
          locale={locale}
        />
      )}

      {/* Source link (always visible as fallback) */}
      {!showPdf && (
        <a
          href={finding.source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
        >
          {locale === 'pt-br' ? 'Ver fonte' : 'View source'}
          <ArrowSquareOut size={12} weight="bold" />
        </a>
      )}
    </article>
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

