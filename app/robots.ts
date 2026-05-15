import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const SITE = 'https://fiscaldigital.org'

/**
 * AI crawlers nomeados explicitamente. Alguns bots respeitam apenas
 * diretivas direcionadas pelo nome (não pegam o fallback `*`), então
 * declaramos um Allow explícito para cada um. `crawlDelay` apenas onde
 * o bot é conhecido por ser agressivo.
 *
 * Lista canônica do Blueprint AI SEO Onda 1 (Seção 6.4).
 */
const AI_CRAWLERS: Array<{ userAgent: string; crawlDelay?: number }> = [
  { userAgent: 'GPTBot', crawlDelay: 2 },
  { userAgent: 'ChatGPT-User' },
  { userAgent: 'OAI-SearchBot' },
  { userAgent: 'ClaudeBot', crawlDelay: 2 },
  { userAgent: 'anthropic-ai' },
  { userAgent: 'Claude-Web' },
  { userAgent: 'Claude-SearchBot' },
  { userAgent: 'PerplexityBot', crawlDelay: 2 },
  { userAgent: 'Perplexity-User' },
  { userAgent: 'CCBot', crawlDelay: 5 },
  { userAgent: 'Google-Extended' },
  { userAgent: 'Applebot-Extended' },
  { userAgent: 'Bytespider' },
  { userAgent: 'cohere-ai' },
  { userAgent: 'Diffbot' },
  { userAgent: 'FacebookBot' },
  { userAgent: 'Meta-ExternalAgent' },
  { userAgent: 'YouBot' },
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_CRAWLERS.map(({ userAgent, crawlDelay }) => ({
        userAgent,
        allow: '/',
        ...(crawlDelay !== undefined && { crawlDelay }),
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
