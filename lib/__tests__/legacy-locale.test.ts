import { describe, expect, it } from 'vitest'
import { legacyLocaleRedirect } from '../legacy-locale'

// Regressão: em 02/10/2026 https://fiscaldigital.org/en redirecionava para
// /pt-br/en/ e respondia 404.
describe('legacyLocaleRedirect', () => {
  it('leva /en e /pt para os prefixos atuais', () => {
    expect(legacyLocaleRedirect('/en')).toBe('/en-us/')
    expect(legacyLocaleRedirect('/en/')).toBe('/en-us/')
    expect(legacyLocaleRedirect('/pt')).toBe('/pt-br/')
    expect(legacyLocaleRedirect('/EN')).toBe('/en-us/')
  })

  it('preserva o restante do caminho', () => {
    expect(legacyLocaleRedirect('/en/alertas/')).toBe('/en-us/alertas/')
    expect(legacyLocaleRedirect('/pt/cidades/caxias-do-sul')).toBe('/pt-br/cidades/caxias-do-sul')
  })

  it('não mexe em prefixos atuais nem em segmentos parecidos', () => {
    expect(legacyLocaleRedirect('/en-us/')).toBeNull()
    expect(legacyLocaleRedirect('/pt-br/alertas/')).toBeNull()
    expect(legacyLocaleRedirect('/entrar')).toBeNull()
    expect(legacyLocaleRedirect('/alertas/')).toBeNull()
    expect(legacyLocaleRedirect('/')).toBeNull()
  })
})
