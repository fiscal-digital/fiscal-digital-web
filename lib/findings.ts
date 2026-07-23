/**
 * Modelo do finding como serializado pela API pública (`/alerts`).
 *
 * Snapshot da resposta atual (Sprint 5). Frente F está expandindo a API com
 * `evidence[]`, `cnpj`, `contractNumber`, etc. — campos opcionais aqui já
 * antecipam essa expansão sem quebrar consumo.
 *
 * Fonte canônica do schema interno: `packages/engine/src/types/index.ts`
 * (interface `Finding`). Aqui só replicamos o shape publicado pela API,
 * não o do DynamoDB.
 */

// TST-010..014: os tipos abaixo NÃO são mais declarados à mão — derivam dos
// schemas zod do contrato (lib/contracts.generated.ts, espelho de
// packages/contracts no repo engine). Mudou a API? O contrato muda no engine,
// o sync traz para cá e o `tsc` aponta cada ponto de uso que precisa ajuste.
//
// Divergências que essa derivação corrigiu (mapeamento 2026-07-23):
//   - `source` era declarado obrigatório aqui, mas a API só o emite quando há
//     evidence[0].source — chegava `undefined` em runtime.
//   - `evidence[].date` era obrigatório aqui e não é required no contrato;
//     `applySorting` caía em 0 silenciosamente.
//   - `pageInfo` era opcional aqui e a API sempre retorna.
export type {
  Evidence as ApiFindingEvidence,
  AlertItem as ApiFinding,
  AlertsResponse as ApiAlertsResponse,
} from './contracts.generated'

export interface SortableFinding {
  riskScore: number
  value?: number
  evidence?: Array<{ date: string }>
}

export function applySorting<T extends SortableFinding>(findings: T[], sortBy: string): T[] {
  const sorted = [...findings]
  const getGazetteDate = (f: T): number => {
    const gazetteDate = f.evidence?.[0]?.date
    return gazetteDate ? new Date(gazetteDate).getTime() : 0
  }

  switch (sortBy) {
    case 'riskDesc':
      return sorted.sort((a, b) => b.riskScore - a.riskScore)
    case 'riskAsc':
      return sorted.sort((a, b) => a.riskScore - b.riskScore)
    case 'dateDesc':
      return sorted.sort((a, b) => getGazetteDate(b) - getGazetteDate(a))
    case 'dateAsc':
      return sorted.sort((a, b) => getGazetteDate(a) - getGazetteDate(b))
    case 'valueDesc':
      return sorted.sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    case 'valueAsc':
      return sorted.sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
    default:
      return sorted
  }
}

/**
 * Labels canônicos PT-BR de cada FindingType.
 * Espelha `engine/types/FindingType` + fallback EN curto.
 */
export const FINDING_TYPE_LABELS: Record<string, { 'pt-br': string; 'en-us': string }> = {
  dispensa_irregular:               { 'pt-br': 'Dispensa irregular',           'en-us': 'Irregular waiver' },
  fracionamento:                    { 'pt-br': 'Fracionamento',                'en-us': 'Contract splitting' },
  aditivo_abusivo:                  { 'pt-br': 'Aditivo abusivo',              'en-us': 'Abusive amendment' },
  prorrogacao_excessiva:            { 'pt-br': 'Prorrogação excessiva',        'en-us': 'Excessive extension' },
  cnpj_jovem:                       { 'pt-br': 'CNPJ jovem',                   'en-us': 'New company' },
  concentracao_fornecedor:          { 'pt-br': 'Concentração de fornecedor',   'en-us': 'Supplier concentration' },
  pico_nomeacoes:                   { 'pt-br': 'Pico de nomeações',            'en-us': 'Appointment spike' },
  rotatividade_anormal:             { 'pt-br': 'Rotatividade anormal',         'en-us': 'Abnormal turnover' },
  inexigibilidade_sem_justificativa:{ 'pt-br': 'Inexigibilidade sem justif.',  'en-us': 'Unjustified non-bid' },
  padrao_recorrente:                { 'pt-br': 'Padrão recorrente',            'en-us': 'Recurring pattern' },
  convenio_sem_chamamento:          { 'pt-br': 'Convênio sem chamamento',      'en-us': 'Agreement without call' },
  repasse_recorrente_osc:           { 'pt-br': 'Repasse recorrente a OSC',     'en-us': 'Recurring NGO transfer' },
  diaria_irregular:                 { 'pt-br': 'Diária irregular',             'en-us': 'Irregular per diem' },
  publicidade_eleitoral:            { 'pt-br': 'Publicidade em janela vedada', 'en-us': 'Electoral publicity' },
  locacao_sem_justificativa:        { 'pt-br': 'Locação sem justificativa',    'en-us': 'Lease without justification' },
  nepotismo_indicio:                { 'pt-br': 'Indício de nepotismo',         'en-us': 'Nepotism indicator' },
  cnpj_situacao_irregular:          { 'pt-br': 'CNPJ situação irregular',      'en-us': 'Irregular CNPJ status' },
  fornecedor_sancionado:            { 'pt-br': 'Fornecedor sancionado (CGU)',  'en-us': 'Sanctioned supplier (CGU)' },
}

/**
 * Famílias de FindingType — usadas para agrupar tipos no select da toolbar
 * (`<optgroup>`). Ordem aqui define a ordem visual.
 */
export const FINDING_TYPE_FAMILIES: Array<{
  key: string
  labels: { 'pt-br': string; 'en-us': string }
  types: string[]
}> = [
  {
    key: 'licitacoes_contratos',
    labels: { 'pt-br': 'Licitações & Contratos', 'en-us': 'Procurement & Contracts' },
    types: [
      'dispensa_irregular',
      'fracionamento',
      'aditivo_abusivo',
      'prorrogacao_excessiva',
      'inexigibilidade_sem_justificativa',
      'locacao_sem_justificativa',
    ],
  },
  {
    key: 'fornecedores',
    labels: { 'pt-br': 'Fornecedores', 'en-us': 'Suppliers' },
    types: [
      'cnpj_jovem',
      'concentracao_fornecedor',
      'padrao_recorrente',
      'cnpj_situacao_irregular',
      'fornecedor_sancionado',
    ],
  },
  {
    key: 'pessoal',
    labels: { 'pt-br': 'Pessoal', 'en-us': 'Personnel' },
    types: ['pico_nomeacoes', 'rotatividade_anormal', 'nepotismo_indicio'],
  },
  {
    key: 'convenios',
    labels: { 'pt-br': 'Convênios', 'en-us': 'Agreements' },
    types: ['convenio_sem_chamamento', 'repasse_recorrente_osc'],
  },
  {
    key: 'eleitoral',
    labels: { 'pt-br': 'Eleitoral', 'en-us': 'Electoral' },
    types: ['publicidade_eleitoral'],
  },
  {
    key: 'diarias',
    labels: { 'pt-br': 'Diárias', 'en-us': 'Per diem' },
    types: ['diaria_irregular'],
  },
]

function humanizeSnake(s: string): string {
  return s
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

export function findingTypeLabel(type: string, locale: 'pt-br' | 'en-us' = 'pt-br'): string {
  return FINDING_TYPE_LABELS[type]?.[locale] ?? humanizeSnake(type)
}

export function formatCurrency(value: number, locale: 'pt-br' | 'en-us' = 'pt-br'): string {
  return value.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Formata data de gazette/achado como DD/MM/AAAA.
 *
 * BUG-WEB-001: `timeZone: 'UTC'` é obrigatório. As datas vêm como `YYYY-MM-DD`
 * (data de diário) ou timestamp UTC de meia-noite — sem fixar o fuso, o
 * `new Date(...)` interpreta em UTC e o `toLocaleDateString` renderiza no fuso
 * local, deslocando um dia para trás no Brasil (UTC-3). Um diário do dia 15
 * aparecia como 14 para o leitor brasileiro, quebrando a verificabilidade
 * contra o Querido Diário.
 */
export function formatDate(iso: string, locale: 'pt-br' | 'en-us' = 'pt-br'): string {
  const d = new Date(iso)
  // Data inválida não LANÇA — toLocaleDateString devolve 'Invalid Date'. O
  // try/catch anterior nunca capturava isso; guardamos com isNaN para de fato
  // degradar para a string original, como o código sempre pretendeu.
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** ID da finding contém timestamp e cityId — extrai data limpo para metadata. */
export function findingShortDate(id: string): string {
  const m = id.match(/(\d{4}-\d{2}-\d{2})T/)
  return m ? m[1] : ''
}

/**
 * Slug URL-safe a partir do ID interno do finding.
 * IDs têm formato `FINDING#fiscal-X#cityId#type#timestamp` onde o
 * timestamp é ISO8601 (contém `:` e `.`).
 *
 * Implementação cross-platform: Buffer.toString('base64url') funciona em
 * Node mas o polyfill webpack do Buffer no browser não suporta esse
 * encoding (TypeError: Unknown encoding: base64url). Usamos TextEncoder +
 * btoa/atob, que existe nativamente em ambos.
 */

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  const b64 = typeof btoa !== 'undefined'
    ? btoa(bin)
    : Buffer.from(bin, 'binary').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(slug: string): Uint8Array {
  const padding = '=='.slice((slug.length + 2) % 4)
  const b64 = slug.replace(/-/g, '+').replace(/_/g, '/') + padding
  const bin = typeof atob !== 'undefined'
    ? atob(b64)
    : Buffer.from(b64, 'base64').toString('binary')
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function findingIdToSlug(id: string): string {
  return bytesToBase64Url(new TextEncoder().encode(id))
}

export function slugToFindingId(slug: string): string {
  try {
    return new TextDecoder().decode(base64UrlToBytes(slug))
  } catch {
    // fallback para slugs no formato antigo (retrocompatibilidade)
    return slug.replace(/--/g, '#')
  }
}
