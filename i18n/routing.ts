import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  // 'always': todas as rotas têm prefixo (/pt/... e /en/...).
  // CF Function fiscal-digital-redirect-pt-br-to-pt redireciona backlinks
  // antigos "/pt-br/*" → "/pt/*" (Reddit/X postados pré-cutover).
  localePrefix: 'always',
})
