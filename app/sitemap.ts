import type { MetadataRoute } from 'next'

const SITE = 'https://fiscaldigital.org'

/**
 * Slugs das cidades ativas (Fase 1 + Top 50 BR).
 * Snapshot do source of truth em `fiscal-digital/packages/engine/src/cities/index.ts`.
 * Cidades inativas (sem cobertura QD confirmada) ficam fora do sitemap.
 *
 * Manter sincronizado com `activeCities()` da engine.
 */
const ACTIVE_CITY_SLUGS: readonly string[] = [
  'caxias-do-sul',
  'porto-alegre',
  'sao-paulo',
  'campinas',
  'florianopolis',
  'curitiba',
  'rio-de-janeiro',
  'brasilia',
  'fortaleza',
  'salvador',
  'belo-horizonte',
  'manaus',
  'recife',
  'goiania',
  'belem',
  'guarulhos',
  'sao-luis',
  'maceio',
  'campo-grande',
  'sao-goncalo',
  'teresina',
  'joao-pessoa',
  'sao-bernardo-do-campo',
  'duque-de-caxias',
  'nova-iguacu',
  'natal',
  'santo-andre',
  'osasco',
  'sorocaba',
  'uberlandia',
  'ribeirao-preto',
  'sao-jose-dos-campos',
  'cuiaba',
  'jaboatao-dos-guararapes',
  'contagem',
  'joinville',
  'feira-de-santana',
  'aracaju',
  'londrina',
  'juiz-de-fora',
  'aparecida-de-goiania',
  'serra',
  'campos-dos-goytacazes',
  'belford-roxo',
  'niteroi',
  'sao-jose-do-rio-preto',
  'ananindeua',
  'vila-velha',
  'porto-velho',
  'mogi-das-cruzes',
] as const

const STATIC_PAGES = [
  { path: '', priority: 1.0, changeFrequency: 'daily' as const },
  { path: 'alertas', priority: 0.9, changeFrequency: 'daily' as const },
  { path: 'manifesto', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: 'sobre', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: 'transparencia', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: 'apoie', priority: 0.7, changeFrequency: 'monthly' as const },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const entries: MetadataRoute.Sitemap = []

  // Raiz (redireciona para locale via CloudFront Function)
  entries.push({
    url: `${SITE}/`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 1.0,
  })

  // Páginas estáticas por locale
  for (const { path, priority, changeFrequency } of STATIC_PAGES) {
    for (const locale of ['pt', 'en'] as const) {
      const suffix = path ? `/${path}` : ''
      entries.push({
        url: `${SITE}/${locale}${suffix}`,
        lastModified,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            pt: `${SITE}/pt${suffix}`,
            en: `${SITE}/en${suffix}`,
          },
        },
      })
    }
  }

  // Páginas de cidade — uma entrada por locale × cidade
  for (const slug of ACTIVE_CITY_SLUGS) {
    for (const locale of ['pt', 'en'] as const) {
      entries.push({
        url: `${SITE}/${locale}/cidades/${slug}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: {
          languages: {
            pt: `${SITE}/pt/cidades/${slug}`,
            en: `${SITE}/en/cidades/${slug}`,
          },
        },
      })
    }
  }

  return entries
}
