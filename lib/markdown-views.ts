/**
 * Markdown views — converte `ApiFinding` para texto markdown auto-contido.
 *
 * LLMs e agentes de IA preferem markdown sobre HTML para extrair contexto
 * (menos tokens, sem ruído de CSS/Tailwind). Mesmo conteúdo do
 * `/alertas/[id]` em formato consumível por agente.
 *
 * Padrão URL: `/alertas/[id].md` (Blueprint AI SEO Onda 2 §5.2).
 *
 * Convenção: header com título, tabela de metadata, narrativa, evidências
 * com excerpt + link Querido Diário, base legal, atribuição CC-BY-4.0.
 */

import type { ApiFinding } from './findings'
import { findingTypeLabel, formatCurrency, formatDate, findingIdToSlug } from './findings'

const SITE = 'https://fiscaldigital.org'
const QD = 'https://queridodiario.ok.org.br'

/**
 * Converte um finding para markdown canônico, auto-contido e citável.
 * Usado por `/alertas/[id].md` e (no futuro) bulk dumps.
 */
export function findingToMarkdown(
  finding: ApiFinding,
  locale: 'pt-br' | 'en-us' = 'pt-br',
): string {
  const t = TEXTS[locale]
  const typeLabel = findingTypeLabel(finding.type, locale)
  const title = `${typeLabel} em ${finding.city}`
  const url = `${SITE}/${locale}/alertas/${findingIdToSlug(finding.id)}`

  const lines: string[] = []

  lines.push(`# ${title}`, '')
  lines.push(`> ${t.subtitleAutonomousFinding}`, '')

  // Metadata table — keys em letra capital para parse fácil por LLM.
  lines.push(`| ${t.metadata} | ${t.value} |`)
  lines.push('|---|---|')
  lines.push(`| ${t.city} | ${finding.city} |`)
  lines.push(`| ${t.state} | ${finding.state} |`)
  lines.push(`| ${t.type} | ${typeLabel} (\`${finding.type}\`) |`)
  if (finding.fiscalId) lines.push(`| ${t.detectedBy} | \`${finding.fiscalId}\` |`)
  if (finding.createdAt) lines.push(`| ${t.publishedAt} | ${formatDate(finding.createdAt, locale)} |`)
  if (finding.value) lines.push(`| ${t.amount} | ${formatCurrency(finding.value, locale)} |`)
  if (finding.cnpj) lines.push(`| ${t.cnpj} | \`${finding.cnpj}\` |`)
  if (finding.secretaria) lines.push(`| ${t.department} | ${finding.secretaria} |`)
  if (finding.contractNumber) lines.push(`| ${t.contractNumber} | \`${finding.contractNumber}\` |`)
  if (finding.riskScore) lines.push(`| ${t.riskScore} | ${finding.riskScore}/100 |`)
  if (finding.confidence) lines.push(`| ${t.confidence} | ${(finding.confidence * 100).toFixed(0)}% |`)
  lines.push('')

  if (finding.legalBasis) {
    lines.push(`## ${t.legalBasis}`, '')
    lines.push(finding.legalBasis, '')
  }

  if (finding.narrative) {
    lines.push(`## ${t.narrative}`, '')
    lines.push(finding.narrative.trim(), '')
  }

  if (finding.evidence && finding.evidence.length > 0) {
    lines.push(`## ${t.evidence}`, '')
    for (const [i, ev] of finding.evidence.entries()) {
      lines.push(`### ${t.excerpt} ${i + 1}`, '')
      if (ev.date) lines.push(`**${t.gazetteDate}:** ${formatDate(ev.date, locale)}`, '')
      lines.push('```')
      lines.push(ev.excerpt.trim())
      lines.push('```', '')
      if (ev.source) lines.push(`**${t.originalSource}:** ${ev.source}`, '')
    }
  } else if (finding.source) {
    lines.push(`## ${t.originalSource}`, '')
    lines.push(finding.source, '')
  }

  lines.push('---', '')
  lines.push(`**${t.alertOnSite}:** ${url}`)
  lines.push('')
  lines.push(`**${t.license}:** CC-BY-4.0 (https://creativecommons.org/licenses/by/4.0/)`)
  lines.push(`**${t.attribution}:** Fiscal Digital (fiscaldigital.org), ${t.basedOn} ${QD}`)
  lines.push('')

  return lines.join('\n')
}

const TEXTS = {
  'pt-br': {
    subtitleAutonomousFinding: 'Achado autônomo do Fiscal Digital baseado em diário oficial municipal.',
    metadata: 'Campo',
    value: 'Valor',
    city: 'Cidade',
    state: 'UF',
    type: 'Tipo',
    detectedBy: 'Fiscal',
    publishedAt: 'Publicado em',
    amount: 'Valor financeiro',
    cnpj: 'CNPJ',
    department: 'Secretaria',
    contractNumber: 'Contrato',
    riskScore: 'Risco',
    confidence: 'Confiança',
    legalBasis: 'Base legal',
    narrative: 'Análise',
    evidence: 'Evidências',
    excerpt: 'Trecho',
    gazetteDate: 'Data do diário',
    originalSource: 'Fonte original (Querido Diário)',
    alertOnSite: 'Alerta completo no site',
    license: 'Licença',
    attribution: 'Atribuição',
    basedOn: 'com base em dados do',
  },
  'en-us': {
    subtitleAutonomousFinding: 'Autonomous finding from Fiscal Digital based on the official municipal gazette.',
    metadata: 'Field',
    value: 'Value',
    city: 'City',
    state: 'State',
    type: 'Type',
    detectedBy: 'Fiscal agent',
    publishedAt: 'Published at',
    amount: 'Monetary value',
    cnpj: 'Tax ID (CNPJ)',
    department: 'Department',
    contractNumber: 'Contract',
    riskScore: 'Risk',
    confidence: 'Confidence',
    legalBasis: 'Legal basis',
    narrative: 'Analysis',
    evidence: 'Evidence',
    excerpt: 'Excerpt',
    gazetteDate: 'Gazette date',
    originalSource: 'Original source (Querido Diário)',
    alertOnSite: 'Full alert on the website',
    license: 'License',
    attribution: 'Attribution',
    basedOn: 'based on data from',
  },
}
