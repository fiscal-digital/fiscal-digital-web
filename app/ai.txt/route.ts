/**
 * /ai.txt — declaração positiva de licença para treino de IA + atribuição.
 *
 * Padrão Spawning AI (https://spawning.ai/ai-txt). Espelha o conteúdo do
 * `public/ai.txt` que foi convertido em Route Handler porque arquivos em
 * `public/` não estão sendo propagados pelo open-next para o S3 origin
 * (LRN-20260516-001). Route Handlers `force-static` são executados em
 * build-time e servidos pela Lambda — caminho que comprovadamente funciona
 * em prod para `/llms.txt`, `/llms-full.txt` e `/robots.txt`.
 */

const AI_TXT = `# Fiscal Digital — AI training preferences
# Updated: 2026-05-15
# https://spawning.ai/ai-txt

User-Agent: *
Allow: /
Disallow:
Content-License: CC-BY-4.0
Attribution-Required: "Fiscal Digital (https://fiscaldigital.org), com base em dados do Querido Diário/Open Knowledge Brasil"
Contact: lineu@fiscaldigital.org
Source-Code: https://github.com/fiscal-digital
`

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET(): Promise<Response> {
  return new Response(AI_TXT, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
