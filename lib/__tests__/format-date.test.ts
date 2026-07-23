import { describe, expect, it } from 'vitest'
import { formatDate } from '../findings'

/**
 * BUG-WEB-001: data de gazette não pode deslocar por fuso.
 *
 * As datas vêm como YYYY-MM-DD (data de diário) ou timestamp UTC de meia-noite.
 * Sem timeZone:'UTC' no formatDate, o Brasil (UTC-3) renderizava um dia a menos
 * — um diário do dia 15 aparecia como 14, quebrando a conferência contra o QD.
 *
 * `process.env.TZ` é setado em vitest.setup.ts (America/Sao_Paulo) justamente
 * para que este teste exercite o fuso negativo que expôs o bug.
 */
describe('formatDate (BUG-WEB-001)', () => {
  it('data YYYY-MM-DD de gazette rende o mesmo dia (não desloca no Brasil)', () => {
    expect(formatDate('2026-04-15', 'pt-br')).toBe('15/04/2026')
  })

  it('timestamp UTC de meia-noite rende o dia UTC, não o local', () => {
    // 2026-04-15T00:00Z é 14/04 21:00 em São Paulo — deve mostrar 15, não 14.
    expect(formatDate('2026-04-15T00:00:00.000Z', 'pt-br')).toBe('15/04/2026')
  })

  it('en-us usa MM/DD/YYYY, também estável no fuso', () => {
    expect(formatDate('2026-04-15', 'en-us')).toBe('04/15/2026')
  })

  it('entrada inválida degrada para a própria string', () => {
    expect(formatDate('não-é-data', 'pt-br')).toBe('não-é-data')
  })
})
