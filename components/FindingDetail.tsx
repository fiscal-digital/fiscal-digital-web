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

// Critério gatilho específico de cada Fiscal — uma frase factual por tipo,
// com referência legal. Usado na seção "Como interpretamos" para responder
// "por que esse alerta apareceu".
function triggerCriterion(type: string, isPt: boolean): string {
  const map: Record<string, { 'pt-br': string; 'en-us': string }> = {
    dispensa_irregular: {
      'pt-br': 'Dispensa de licitação acima do teto legal sem justificativa adequada (Lei 14.133/2021, Art. 75).',
      'en-us': 'Bidding waiver above legal cap without adequate justification (Law 14.133/2021, Art. 75).',
    },
    fracionamento: {
      'pt-br': 'Múltiplas dispensas ao mesmo fornecedor em 12 meses cuja soma ultrapassa o limite legal (Lei 14.133/2021, Art. 75, §1º).',
      'en-us': 'Multiple waivers to the same supplier within 12 months exceeding the legal cap (Law 14.133/2021, Art. 75, §1).',
    },
    aditivo_abusivo: {
      'pt-br': 'Aditivo de valor acima de 25% do contrato original (50% no caso de reformas) — Lei 14.133/2021, Art. 125, §1º, I.',
      'en-us': 'Amendment above 25% of original contract value (50% for renovations) — Law 14.133/2021, Art. 125, §1, I.',
    },
    prorrogacao_excessiva: {
      'pt-br': 'Sucessivas prorrogações de contrato contínuo ultrapassando o teto decenal (Lei 14.133/2021, Art. 107).',
      'en-us': 'Successive extensions of continuous contract beyond the 10-year cap (Law 14.133/2021, Art. 107).',
    },
    cnpj_jovem: {
      'pt-br': 'Empresa com menos de 6 meses de abertura na data da contratação — indicativo de empresa sem histórico operacional.',
      'en-us': 'Company opened less than 6 months before contract date — indicating no operational history.',
    },
    concentracao_fornecedor: {
      'pt-br': 'Mesmo fornecedor concentra mais de 40% do gasto de uma secretaria em 12 meses.',
      'en-us': 'Single supplier concentrates more than 40% of a department\'s spending in 12 months.',
    },
    pico_nomeacoes: {
      'pt-br': 'Volume anormalmente alto de nomeações em janela eleitoral (≥3 atos por gazette; ≥7 fora) — Lei 9.504/97.',
      'en-us': 'Abnormally high volume of appointments during electoral window (≥3 acts per gazette; ≥7 outside) — Law 9.504/97.',
    },
    inexigibilidade_sem_justificativa: {
      'pt-br': 'Contratação por inexigibilidade sem fundamentação adequada de exclusividade ou notória especialização.',
      'en-us': 'Contract by non-bidding without adequate justification of exclusivity or notable specialization.',
    },
    convenio_sem_chamamento: {
      'pt-br': 'Termo de fomento/colaboração com OSC sem registro de chamamento público prévio (Lei 13.019/2014, Art. 24).',
      'en-us': 'Partnership with NGO without record of prior public call (Law 13.019/2014, Art. 24).',
    },
    repasse_recorrente_osc: {
      'pt-br': 'Repasses recorrentes à mesma OSC sem renovação formal do termo de parceria.',
      'en-us': 'Recurring transfers to the same NGO without formal renewal of the partnership.',
    },
    diaria_irregular: {
      'pt-br': 'Pagamento de diária acima do limite indiciário OU em fim de semana/feriado sem justificativa (Lei 8.112/90, Art. 58, por analogia).',
      'en-us': 'Per diem payment above indicative cap OR on weekends/holidays without justification (Law 8.112/90, Art. 58, by analogy).',
    },
    publicidade_eleitoral: {
      'pt-br': 'Contratação de publicidade institucional na janela vedada (3 meses antes da eleição até 31/12) — Lei 9.504/97, Art. 73, VI, "b".',
      'en-us': 'Institutional advertising during forbidden window (3 months before election through Dec 31) — Law 9.504/97, Art. 73, VI, "b".',
    },
    locacao_sem_justificativa: {
      'pt-br': 'Locação por inexigibilidade sem fundamento técnico de necessidade específica (Lei 14.133/2021, Art. 74, III).',
      'en-us': 'Lease by non-bidding without technical justification of specific need (Law 14.133/2021, Art. 74, III).',
    },
    nepotismo_indicio: {
      'pt-br': 'Coincidência de sobrenome incomum entre cargo comissionado e autoridade nomeante (STF Súmula Vinculante 13).',
      'en-us': 'Coincidence of uncommon surname between commissioned position and appointing authority (STF Binding Precedent 13).',
    },
    cnpj_situacao_irregular: {
      'pt-br': 'Empresa contratada com situação cadastral irregular na Receita Federal na data do contrato.',
      'en-us': 'Contracted company with irregular registration status at Federal Revenue on contract date.',
    },
    fornecedor_sancionado: {
      'pt-br': 'Empresa contratada consta na lista do CGU (CEIS/CNEP) como sancionada na data do contrato.',
      'en-us': 'Contracted company listed in CGU sanctions register (CEIS/CNEP) on contract date.',
    },
    rotatividade_anormal: {
      'pt-br': 'Padrão de exonerações e nomeações em volume estatisticamente anormal para a secretaria.',
      'en-us': 'Pattern of dismissals and appointments at statistically abnormal volume for the department.',
    },
    padrao_recorrente: {
      'pt-br': '≥3 achados envolvendo o mesmo CNPJ em janela de 12 meses, identificados pelo Fiscal Geral cross-gazette.',
      'en-us': '≥3 findings involving the same CNPJ within 12 months, detected by the General Fiscal across gazettes.',
    },
  }
  const entry = map[type]
  if (!entry) {
    return isPt
      ? 'Critério detalhado documentado em /fiscais.'
      : 'Detailed criterion documented at /fiscais.'
  }
  return isPt ? entry['pt-br'] : entry['en-us']
}

interface FindingDetailProps {
  finding: ApiFinding
  locale: 'pt-br' | 'en-us'
  showPdf?: boolean
  hideCity?: boolean
}

export default function FindingDetail({
  finding,
  locale,
  showPdf = true,
  hideCity = false,
}: FindingDetailProps) {
  const isPt = locale === 'pt-br'
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
        <span
          className={`rounded-pill px-3 py-1 text-xs font-semibold ${riskBadgeClass(finding.riskScore)}`}
          title={isPt
            ? `Pontuação de risco ${finding.riskScore}/100 — calculada pelos critérios legais do Fiscal.`
            : `Risk score ${finding.riskScore}/100 — calculated from the legal criteria applied by the Fiscal Agent.`}
        >
          {riskLabel}
        </span>
        <span
          className="rounded-pill bg-brand-gray/10 px-3 py-1 text-xs font-semibold text-brand-gray"
          title={isPt
            ? `Confiança ${Math.round(finding.confidence * 100)}% — quão certo o algoritmo está dos dados extraídos do diário.`
            : `Confidence ${Math.round(finding.confidence * 100)}% — how confident the algorithm is in the extracted data.`}
        >
          {finding.confidence >= 0.85
            ? (isPt ? 'Confiança alta' : 'High confidence')
            : (isPt ? 'Confiança média' : 'Medium confidence')}
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

      {/* COMO INTERPRETAMOS — transparência sobre a metodologia */}
      <details className="group rounded-xl border border-brand-gray/15 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl p-4 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-paper">
          <span>{isPt ? 'Como interpretamos esta pontuação' : 'How we interpret this score'}</span>
          <CaretDown
            size={16}
            weight="bold"
            className="text-brand-gray transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="space-y-4 border-t border-brand-gray/10 p-5 text-sm text-brand-ink">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-gray">
              {isPt ? 'Como calculamos' : 'How we calculate'}
            </p>
            <ul className="ml-4 list-disc space-y-1 text-brand-gray">
              <li>{isPt
                ? 'O Fiscal aplica critérios legais explícitos (citados em "Base legal" acima)'
                : 'The Fiscal applies explicit legal criteria (cited in "Legal basis" above)'}</li>
              <li>{isPt
                ? 'A pontuação 0–100 reflete quão claros são os indicadores no diário'
                : 'The 0–100 score reflects how clear the indicators are in the gazette'}</li>
              <li>{isPt
                ? <><strong className="text-brand-ink">80–100:</strong> Alerta crítico (indicadores fortes)</>
                : <><strong className="text-brand-ink">80–100:</strong> Critical alert (strong indicators)</>}</li>
              <li>{isPt
                ? <><strong className="text-brand-ink">60–79:</strong> Alerta (indicadores presentes, requer análise)</>
                : <><strong className="text-brand-ink">60–79:</strong> Alert (indicators present, requires analysis)</>}</li>
              <li>{isPt
                ? <><strong className="text-brand-ink">&lt; 60:</strong> não publicamos</>
                : <><strong className="text-brand-ink">&lt; 60:</strong> we don't publish</>}</li>
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-gray">
              {isPt ? 'Por que esse alerta apareceu' : 'Why this alert was triggered'}
            </p>
            <p className="text-brand-gray">
              <span className="font-semibold text-brand-ink">{findingTypeLabel(finding.type, locale)}</span>
              {' — '}
              {triggerCriterion(finding.type, isPt)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-gray">
              {isPt ? 'Limitações desta análise' : 'Limitations of this analysis'}
            </p>
            <ul className="ml-4 list-disc space-y-1 text-brand-gray">
              <li>{isPt
                ? 'Análise automatizada de texto público — não substitui auditoria técnica'
                : 'Automated analysis of public text — does not replace technical audit'}</li>
              <li>{isPt
                ? 'Toda decisão de fato é dos Tribunais de Contas e órgãos competentes'
                : 'Any factual decision is for the Audit Courts and competent bodies'}</li>
              <li>{isPt ? (
                <>
                  Encontrou erro?{' '}
                  <a href="https://github.com/fiscal-digital/fiscal-digital/issues/new?labels=falso-positivo" target="_blank" rel="noopener noreferrer" className="text-brand-teal underline-offset-2 hover:underline">
                    Reporte aqui
                  </a>
                  {' '}— corrigimos publicamente no mesmo canal.
                </>
              ) : (
                <>
                  Found an error?{' '}
                  <a href="https://github.com/fiscal-digital/fiscal-digital/issues/new?labels=falso-positivo" target="_blank" rel="noopener noreferrer" className="text-brand-teal underline-offset-2 hover:underline">
                    Report it here
                  </a>
                  {' '}— we publicly correct on the same channel.
                </>
              )}</li>
            </ul>
          </div>
        </div>
      </details>

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
