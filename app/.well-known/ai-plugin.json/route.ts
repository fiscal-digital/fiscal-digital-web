/**
 * /.well-known/ai-plugin.json — OpenAI plugin manifest.
 *
 * Padrão da OpenAI / ChatGPT plugin store. Mesmo que o plugin store esteja
 * em hiato, manter o manifest declarado tem custo zero e habilita descoberta
 * por Perplexity, Cursor, Claude com tool use, etc.
 *
 * Aponta para o OpenAPI spec da API pública (gerado em
 * https://api.fiscaldigital.org/openapi.json — PR irmão na Onda 2).
 *
 * Blueprint AI SEO Onda 2 §3 Item 8.
 */

const MANIFEST = {
  schema_version: 'v1',
  name_for_human: 'Fiscal Digital',
  name_for_model: 'fiscal_digital',
  description_for_human:
    'Consulte alertas de fiscalização autônoma de gastos públicos municipais brasileiros, com fonte citada e licença CC-BY-4.0.',
  description_for_model:
    'Plugin para acesso aos alertas do Fiscal Digital — corpus de irregularidades detectadas por agentes autônomos em diários oficiais de 50 cidades brasileiras. Use para consultar alertas por cidade, estado, tipo (dispensa, fracionamento, aditivo, etc.), CNPJ, contrato ou secretaria. Cada alerta cita a fonte primária no Querido Diário/OKFN e a base legal aplicável. Dados sob licença CC-BY-4.0; atribuição obrigatória.',
  auth: {
    type: 'none',
  },
  api: {
    type: 'openapi',
    url: 'https://api.fiscaldigital.org/openapi.json',
  },
  logo_url: 'https://fiscaldigital.org/brand/logo/favicon-256.png',
  contact_email: 'lineu@fiscaldigital.org',
  legal_info_url: 'https://fiscaldigital.org/pt-br/sobre',
}

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify(MANIFEST, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
