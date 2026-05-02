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
  dispensa_irregular:               { pt: 'Dispensa Irregular',          en: 'Irregular Waiver' },
  fracionamento:                    { pt: 'Fracionamento',                en: 'Contract Splitting' },
  aditivo_abusivo:                  { pt: 'Aditivo Abusivo',              en: 'Abusive Amendment' },
  prorrogacao_excessiva:            { pt: 'Prorrogação Excessiva',        en: 'Excessive Extension' },
  cnpj_jovem:                       { pt: 'CNPJ Jovem',                   en: 'New Company' },
  concentracao_fornecedor:          { pt: 'Concentração Fornecedor',      en: 'Supplier Concentration' },
  pico_nomeacoes:                   { pt: 'Pico Nomeações',               en: 'Appointment Spike' },
  rotatividade_anormal:             { pt: 'Rotatividade Anormal',         en: 'Abnormal Turnover' },
  inexigibilidade_sem_justificativa:{ pt: 'Inexigibilidade Sem Justif.',  en: 'Unjustified Non-bid' },
  padrao_recorrente:                { pt: 'Padrão Recorrente',            en: 'Recurring Pattern' },
}

export function findingTypeLabel(type: string, locale: 'pt' | 'en' = 'pt'): string {
  return FINDING_TYPE_LABELS[type]?.[locale] ?? type.toUpperCase()
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
 * IDs começam com `FINDING#fiscal-X#cityId#type#timestamp` — base64url o
 * tornaria opaco. Manter o ID literal mas substituir `#` por `--` para
 * garantir compatibilidade com `[id]` route segment do Next (ele faz
 * percent-encoding por baixo, então `#` puro quebraria).
 */
export function findingIdToSlug(id: string): string {
  return id.replace(/#/g, '--')
}

export function slugToFindingId(slug: string): string {
  return slug.replace(/--/g, '#')
}
