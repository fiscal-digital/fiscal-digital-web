import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? routing.defaultLocale
  if (!routing.locales.includes(locale as 'pt-br' | 'en')) {
    // Fallback silencioso para locale padrão
    return {
      locale: routing.defaultLocale,
      messages: (await import(`../messages/${routing.defaultLocale}.json`)).default,
    }
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
