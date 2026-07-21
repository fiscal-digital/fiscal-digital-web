import { describe, expect, it } from 'vitest'
import { freshnessTone } from '../freshness'

describe('freshnessTone', () => {
  it('atualizada → ok', () => {
    expect(freshnessTone('atualizada')).toBe('ok')
  })

  it('estagnada → warn (indexação do QD parada para a cidade)', () => {
    expect(freshnessTone('estagnada')).toBe('warn')
  })

  it('sem-dados → muted (cidade sem cobertura)', () => {
    expect(freshnessTone('sem-dados')).toBe('muted')
  })
})
