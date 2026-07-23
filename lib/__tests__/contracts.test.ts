import { describe, expect, it } from 'vitest'
import {
  alertItemSchema,
  alertsResponseSchema,
  citySchema,
  FINDING_TYPES,
  FINDING_TYPE_LABELS,
  costMtdResponseSchema,
} from '../contracts.generated'

/**
 * TST-010..014 — o web deriva seus tipos do contrato do engine em vez de
 * redeclará-los. Estes testes cobrem a FIAÇÃO (o espelho existe, exporta o que
 * o web usa e codifica as divergências que já nos morderam).
 *
 * A verificação contra a API REAL de produção vive no E2E (e2e/contracts.spec.ts),
 * que é onde drift de prod aparece.
 */

const baseAlert = {
  id: 'FINDING#fiscal-licitacoes#4305108#dispensa_irregular#abc',
  fiscalId: 'fiscal-licitacoes',
  type: 'dispensa_irregular',
  cityId: '4305108',
  city: 'Caxias do Sul',
  state: 'RS',
  riskScore: 75,
  confidence: 0.85,
  narrative: 'Identificamos dispensa publicada em 15/04/2026.',
  legalBasis: 'Lei 14.133/2021, Art. 75, II',
  cachedPdfUrl: null,
  pdfProxyUrl: null,
  evidence: [],
  createdAt: '2026-04-15T00:00:00.000Z',
}

describe('contrato: espelho sincronizado', () => {
  it('exporta os 18 tipos de achado (fonte única, antes triplicada)', () => {
    expect(FINDING_TYPES).toHaveLength(18)
    expect(FINDING_TYPES).toContain('dispensa_irregular')
    expect(FINDING_TYPES).toContain('publicidade_eleitoral')
  })

  it('todo tipo tem label PT e EN', () => {
    for (const t of FINDING_TYPES) {
      expect(FINDING_TYPE_LABELS[t]?.['pt-br'], `label pt-br de ${t}`).toBeTruthy()
      expect(FINDING_TYPE_LABELS[t]?.['en-us'], `label en-us de ${t}`).toBeTruthy()
    }
  })
})

describe('contrato: divergências que o web tinha', () => {
  it('`source` é OPCIONAL — a API só emite quando há evidence[0].source', () => {
    // O web tipava como obrigatório e recebia undefined em runtime (D1).
    expect(alertItemSchema.safeParse(baseAlert).success).toBe(true)
    expect(alertItemSchema.safeParse({ ...baseAlert, source: 'https://qd/g/1' }).success).toBe(true)
  })

  it('`confidence` é OBRIGATÓRIO — faltava por completo na tipagem do web', () => {
    const { confidence, ...semConfidence } = baseAlert
    void confidence
    expect(alertItemSchema.safeParse(semConfidence).success).toBe(false)
  })

  it('`evidence[].date` é opcional — ordenação precisa tratar ausência', () => {
    const comEvidenceSemData = {
      ...baseAlert,
      evidence: [{ source: 'https://qd/g/1', excerpt: 'trecho' }],
    }
    expect(alertItemSchema.safeParse(comEvidenceSemData).success).toBe(true)
  })

  it('`pageInfo` é OBRIGATÓRIO na resposta de /alerts (o web tipava opcional)', () => {
    const semPageInfo = { total: 1, filters: {}, items: [baseAlert] }
    expect(alertsResponseSchema.safeParse(semPageInfo).success).toBe(false)
  })
})

describe('contrato: freshness por cidade', () => {
  it('city inclui os campos de freshness e aceita cobertura estagnada', () => {
    const caxias = {
      cityId: '4305108', name: 'Caxias do Sul', slug: 'caxias-do-sul', uf: 'RS',
      active: true, findingsCount: 31, lastFindingAt: null,
      lastGazetteDate: '2025-12-15', staleDays: 219, dataStatus: 'estagnada',
    }
    expect(citySchema.safeParse(caxias).success).toBe(true)
  })

  it('rejeita dataStatus fora do enum', () => {
    const invalido = {
      cityId: '1', name: 'X', slug: 'x', uf: 'RS', active: true, findingsCount: 0,
      lastFindingAt: null, lastGazetteDate: null, staleDays: null, dataStatus: 'desatualizada',
    }
    expect(citySchema.safeParse(invalido).success).toBe(false)
  })
})

describe('contrato: custos', () => {
  it('costMtd aceita deltaPct e updatedAt nulos', () => {
    const mtd = {
      currency: 'BRL', month: '2026-07', mtdBrl: 17.5, projectedBrl: 33.2,
      lifetimeBrl: 120, deltaPct: null, updatedAt: null, source: 'aws-cost-explorer',
    }
    expect(costMtdResponseSchema.safeParse(mtd).success).toBe(true)
  })
})
