/**
 * Helpers de geração dos arquivos llms.txt / llms-full.txt e do JSON-LD Report
 * por alerta. Centraliza strings canônicas e estruturas para que /llms.txt,
 * /llms-full.txt e /alertas/[id] consumam o mesmo source of truth.
 *
 * Padrão: https://llmstxt.org. Bllueprint: AI SEO Onda 1.
 */

import type { ApiFinding } from './findings'
import { findingTypeLabel, formatCurrency, formatDate } from './findings'

const SITE = 'https://fiscaldigital.org'
const API = 'https://api.fiscaldigital.org'

const HEADER_PT = `# Fiscal Digital

> Agente autônomo de fiscalização de gastos públicos municipais no Brasil. Transforma diários oficiais (Querido Diário/OKFN) em alertas verificáveis com fonte citada.

Licença: CC-BY-4.0. Atribuição requerida: "Fiscal Digital (fiscaldigital.org), com base em dados do Querido Diário/OKFN".`

const SECTION_SOBRE = `## Sobre
- [Manifesto](${SITE}/pt-br/manifesto): princípios, missão, ecossistema (Serenata, Querido Diário)
- [Como funciona](${SITE}/pt-br/sobre): arquitetura dos 10 Fiscais, base legal, ciclo autônomo
- [Transparência](${SITE}/pt-br/transparencia): custos operacionais auditáveis
- [Roadmap](${SITE}/pt-br/roadmap): próximas entregas`

const SECTION_DADOS = `## Dados
- [Feed RSS de alertas](${API}/rss): atualizado a cada execução
- [API REST de alertas](${API}/alerts): paginado, filtros por cidade/estado/tipo
- [API REST de cidades](${API}/cities): 50 cidades cobertas
- [Estatísticas agregadas](${API}/stats)
- [Estatística por cidade](${API}/cities/{cityId}/stats)
- [Custos operacionais](${API}/transparencia/costs): transparência financeira
- [Health check](${API}/health): lista endpoints e versão`

const SECTION_FISCAIS = `## Fiscais ativos
- Licitações: Lei 14.133/2021 Art. 75 (dispensas e fracionamento)
- Contratos: Lei 14.133/2021 Art. 125 + 107 (aditivos abusivos, prorrogações)
- Fornecedores: RFB (CNPJ jovem, situação irregular) + CGU CEIS/CNEP (sancionados)
- Pessoal: Lei 9.504/97 (nomeações em período eleitoral)
- Convênios: Lei 13.019/2014 (chamamento público OSCs)
- Nepotismo: STF Súmula Vinculante 13
- Publicidade: Lei 9.504/97 Art. 73 VI "b" (janela vedada eleitoral)
- Locação: Lei 14.133/2021 Art. 74 III (locação inexigível)
- Diárias: Lei 8.112/90 Art. 58 (finais de semana, feriados, valor)
- Geral: orquestrador cross-gazette (padrão recorrente)`

const SECTION_OPTIONAL = `## Optional
- [GitHub](https://github.com/fiscal-digital): código fonte (MIT)
- [Querido Diário OKFN](https://queridodiario.ok.org.br): fonte primária dos dados
- [Catarse](https://www.catarse.me/fiscaldigitalbr): apoie o projeto`

/**
 * Versão curta do llms.txt — índice de URLs com descrição.
 * Sem dados embedados; LLM segue links para descobrir conteúdo.
 */
export function buildLlmsTxt(): string {
  return [
    HEADER_PT,
    '',
    SECTION_SOBRE,
    '',
    SECTION_DADOS,
    '',
    SECTION_FISCAIS,
    '',
    SECTION_OPTIONAL,
    '',
  ].join('\n')
}

/**
 * Versão extensa — cabeçalho + dump markdown dos N alertas mais recentes.
 * Cada finding vira ~1 KB; mantém payload < 100 KB com N=50.
 */
export function buildLlmsFullTxt(findings: ApiFinding[]): string {
  const alertSections = findings.map(findingToMarkdown).join('\n\n---\n\n')

  return [
    HEADER_PT,
    '',
    SECTION_SOBRE,
    '',
    SECTION_DADOS,
    '',
    SECTION_FISCAIS,
    '',
    SECTION_OPTIONAL,
    '',
    `## Alertas recentes (${findings.length})`,
    '',
    'Snapshot dos achados publicados mais recentes. Para feed atualizado em tempo real, ver Dados acima.',
    '',
    alertSections,
    '',
  ].join('\n')
}

function findingToMarkdown(f: ApiFinding): string {
  const title = `${findingTypeLabel(f.type, 'pt-br')} em ${f.city}`
  const url = `${SITE}/pt-br/alertas/${f.id}`
  const lines: string[] = [
    `### ${title}`,
    '',
    `- Cidade: ${f.city} (${f.state})`,
    `- Tipo: ${f.type}`,
    `- Data: ${formatDate(f.createdAt, 'pt-br')}`,
  ]
  if (f.value) lines.push(`- Valor: ${formatCurrency(f.value, 'pt-br')}`)
  if (f.cnpj) lines.push(`- CNPJ: ${f.cnpj}`)
  if (f.secretaria) lines.push(`- Secretaria: ${f.secretaria}`)
  if (f.contractNumber) lines.push(`- Contrato: ${f.contractNumber}`)
  if (f.legalBasis) lines.push(`- Base legal: ${f.legalBasis}`)
  lines.push(`- Alerta no site: ${url}`)
  if (f.source) lines.push(`- Fonte original (Querido Diário): ${f.source}`)
  if (f.narrative) {
    lines.push('')
    lines.push(f.narrative.trim())
  }
  return lines.join('\n')
}

/**
 * JSON-LD `Report` por alerta. Schema.org Report + GovernmentOrganization
 * + citation linkando o Querido Diário. Atribuição CC-BY-4.0 explícita.
 *
 * Inserido como <script type="application/ld+json"> em /alertas/[id].
 */
export function buildReportJsonLd(
  finding: ApiFinding,
  locale: 'pt-br' | 'en-us',
): Record<string, unknown> {
  const title = `${findingTypeLabel(finding.type, locale)} em ${finding.city}`
  const url = `${SITE}/${locale}/alertas/${finding.id}`

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    '@id': url,
    name: title,
    headline: title,
    datePublished: finding.createdAt,
    inLanguage: locale === 'pt-br' ? 'pt-BR' : 'en-US',
    url,
    author: { '@id': `${SITE}/#organization` },
    publisher: { '@id': `${SITE}/#organization` },
    about: {
      '@type': 'GovernmentOrganization',
      name: `Prefeitura de ${finding.city}`,
      address: {
        '@type': 'PostalAddress',
        addressRegion: finding.state,
        addressCountry: 'BR',
      },
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  }

  if (finding.source) {
    jsonLd.citation = {
      '@type': 'CreativeWork',
      name: 'Diário Oficial do Município',
      url: finding.source,
      publisher: {
        '@type': 'Organization',
        name: 'Open Knowledge Brasil — Querido Diário',
      },
    }
  }
  if (finding.value) {
    jsonLd.mainEntity = {
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: finding.value,
    }
  }
  if (finding.cnpj) {
    jsonLd.mentions = [
      {
        '@type': 'Organization',
        identifier: finding.cnpj,
        name: 'Fornecedor identificado no contrato',
      },
    ]
  }
  if (finding.legalBasis) jsonLd.isBasedOn = finding.legalBasis
  if (finding.narrative) jsonLd.abstract = finding.narrative

  return jsonLd
}
