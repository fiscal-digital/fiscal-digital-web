import { describe, expect, it } from 'vitest'
import { buildLlmsTxt, buildLlmsFullTxt } from '../llms-txt'

/**
 * Garante que o índice canônico llms.txt / llms-full.txt anuncia as
 * superfícies da Onda 2 (JSON Feed, OpenAPI, página Dataset /dados e a
 * convenção de markdown view /alertas/<id>/m). Sem esses links as entregas
 * da Onda 2 ficam sub-descobríveis pelos crawlers de LLM.
 */
describe('llms.txt — superfícies da Onda 2 na seção Dados', () => {
  const onda2Links = [
    '/pt-br/alertas/feed.json', // JSON Feed
    '/openapi.json', // OpenAPI 3.1
    '/pt-br/dados', // página Dataset
    '/pt-br/alertas/<id>/m', // convenção markdown por alerta
  ]

  it('buildLlmsTxt() anuncia os 4 links da Onda 2', () => {
    const txt = buildLlmsTxt()
    for (const link of onda2Links) {
      expect(txt).toContain(link)
    }
  })

  it('buildLlmsFullTxt() herda a seção Dados e anuncia os mesmos links', () => {
    const txt = buildLlmsFullTxt([])
    for (const link of onda2Links) {
      expect(txt).toContain(link)
    }
  })

  it('mantém os links pré-existentes da seção Dados (RSS, API REST)', () => {
    const txt = buildLlmsTxt()
    expect(txt).toContain('/rss')
    expect(txt).toContain('/alerts')
  })
})
