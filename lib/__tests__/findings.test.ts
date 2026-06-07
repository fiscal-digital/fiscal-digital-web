import { describe, expect, it } from 'vitest'
import {
  applySorting,
  findingIdToSlug,
  findingTypeLabel,
  formatCurrency,
  slugToFindingId,
  type SortableFinding,
} from '@/lib/findings'

const findings: Array<SortableFinding & { id: string }> = [
  {
    id: 'low-old',
    riskScore: 30,
    value: 5000,
    evidence: [{ date: '2026-01-10' }],
  },
  {
    id: 'high-new',
    riskScore: 90,
    value: 120000,
    evidence: [{ date: '2026-04-20' }],
  },
  {
    id: 'medium-missing-value',
    riskScore: 60,
    evidence: [{ date: '2026-03-01' }],
  },
]

describe('applySorting', () => {
  it('sorts by risk, date, and value without mutating the input', () => {
    expect(applySorting(findings, 'riskDesc').map((f) => f.id)).toEqual([
      'high-new',
      'medium-missing-value',
      'low-old',
    ])
    expect(applySorting(findings, 'dateAsc').map((f) => f.id)).toEqual([
      'low-old',
      'medium-missing-value',
      'high-new',
    ])
    expect(applySorting(findings, 'valueDesc').map((f) => f.id)).toEqual([
      'high-new',
      'low-old',
      'medium-missing-value',
    ])
    expect(findings.map((f) => f.id)).toEqual([
      'low-old',
      'high-new',
      'medium-missing-value',
    ])
  })

  it('returns a copied list for unknown sort options', () => {
    const result = applySorting(findings, 'unknown')

    expect(result).toEqual(findings)
    expect(result).not.toBe(findings)
  })
})

describe('finding helpers', () => {
  it('formats known and unknown finding type labels', () => {
    expect(findingTypeLabel('dispensa_irregular', 'en-us')).toBe('Irregular waiver')
    expect(findingTypeLabel('new_custom_type', 'pt-br')).toBe('New Custom Type')
  })

  it('formats BRL currency for supported locales', () => {
    expect(formatCurrency(1234.5, 'pt-br')).toMatch(/^R\$\s1\.234,50$/u)
    expect(formatCurrency(1234.5, 'en-us')).toBe('R$1,234.50')
  })

  it('round-trips finding ids through URL-safe slugs', () => {
    const id = 'FINDING#fiscal-licitacoes#4305108#dispensa_irregular#2026-04-15T00:00:00.000Z'

    expect(slugToFindingId(findingIdToSlug(id))).toBe(id)
  })
})
