import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt-br', 'en-us'],
  defaultLocale: 'pt-br',
  // 'always': todas as rotas têm prefixo (/pt-br/... e /en-us/...).
  // BCP-47 explícito alinhado com `<html lang>` para SEO.
  localePrefix: 'always',
})
