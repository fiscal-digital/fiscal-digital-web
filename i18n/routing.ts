import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  // 'always' para static export: todas as rotas têm prefixo (/pt/... e /en/...)
  // Evita necessidade de middleware para detecção de locale em S3+CloudFront
  localePrefix: 'always',
})
