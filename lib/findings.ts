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

export interface ApiFindingEvidence {
  source: string
  excerpt: string
  date: string
}

export interface ApiFinding {
  id: string
  type: string
  cityId: string
  city: string
  state: string
  riskScore: number
  confidence: number
  value?: number
  secretaria?: string
  legalBasis?: string
  narrative?: string
  /** URL canônica da gazette — first evidence source. */
  source: string
  createdAt: string
  /** Frente F: expor evidence completo. Stub-tolerante. */
  evidence?: ApiFindingEvidence[]
  /** Frente F: cnpj denormalizado para perfis de fornecedor. */
  cnpj?: string
  contractNumber?: string
  fiscalId?: string
  /**
   * URL do PDF no cache CDN (gazettes.fiscaldigital.org). Derivado pelo
   * backend a partir do source QD. Pode ser null se não houver cache.
   * Site usa para renderizar iframe inline com headers controlados.
   */
  cachedPdfUrl?: string | null
}

export interface ApiAlertsResponse {
  total: number
  filters: Record<string, string | undefined>
  items: ApiFinding[]
}

/**
 * Labels canônicos PT-BR de cada FindingType.
 * Espelha `engine/types/FindingType` + fallback EN curto.
 */
export const FINDING_TYPE_LABELS: Record<string, { pt: string; en: string }> = {
  dispensa_irregular:               { pt: 'Dispensa irregular',           en: 'Irregular waiver' },
  fracionamento:                    { pt: 'Fracionamento',                en: 'Contract splitting' },
  aditivo_abusivo:                  { pt: 'Aditivo abusivo',              en: 'Abusive amendment' },
  prorrogacao_excessiva:            { pt: 'Prorrogação excessiva',        en: 'Excessive extension' },
  cnpj_jovem:                       { pt: 'CNPJ jovem',                   en: 'New company' },
  concentracao_fornecedor:          { pt: 'Concentração de fornecedor',   en: 'Supplier concentration' },
  pico_nomeacoes:                   { pt: 'Pico de nomeações',            en: 'Appointment spike' },
  rotatividade_anormal:             { pt: 'Rotatividade anormal',         en: 'Abnormal turnover' },
  inexigibilidade_sem_justificativa:{ pt: 'Inexigibilidade sem justif.',  en: 'Unjustified non-bid' },
  padrao_recorrente:                { pt: 'Padrão recorrente',            en: 'Recurring pattern' },
  convenio_sem_chamamento:          { pt: 'Convênio sem chamamento',      en: 'Agreement without call' },
  repasse_recorrente_osc:           { pt: 'Repasse recorrente a OSC',     en: 'Recurring NGO transfer' },
  diaria_irregular:                 { pt: 'Diária irregular',             en: 'Irregular per diem' },
  publicidade_eleitoral:            { pt: 'Publicidade em janela vedada', en: 'Electoral publicity' },
  locacao_sem_justificativa:        { pt: 'Locação sem justificativa',    en: 'Lease without justification' },
  nepotismo_indicio:                { pt: 'Indício de nepotismo',         en: 'Nepotism indicator' },
  cnpj_situacao_irregular:          { pt: 'CNPJ situação irregular',      en: 'Irregular CNPJ status' },
  fornecedor_sancionado:            { pt: 'Fornecedor sancionado (CGU)',  en: 'Sanctioned supplier (CGU)' },
}

function humanizeSnake(s: string): string {
  return s
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

export function findingTypeLabel(type: string, locale: 'pt' | 'en' = 'pt'): string {
  return FINDING_TYPE_LABELS[type]?.[locale] ?? humanizeSnake(type)
}

export function formatCurrency(value: number, locale: 'pt' | 'en' = 'pt'): string {
  return value.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatDate(iso: string, locale: 'pt' | 'en' = 'pt'): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
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
 * Estratégia: Base64url encoding do ID completo para garantir reversibilidade
 * total e compatibilidade com qualquer sistema de arquivos (Windows incluso).
 */
export function findingIdToSlug(id: string): string {
  // btoa não está disponível em Node server-side de forma confiável em todas versões;
  // usar Buffer (Node built-in) para base64url encoding
  return Buffer.from(id, 'utf8').toString('base64url')
}

export function slugToFindingId(slug: string): string {
  try {
    return Buffer.from(slug, 'base64url').toString('utf8')
  } catch {
    // fallback para slugs no formato antigo (retrocompatibilidade)
    return slug.replace(/--/g, '#')
  }
}
