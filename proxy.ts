import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Next.js 16: middleware.ts foi depreciado — este é o proxy.ts equivalente.
// Ativo em dev local (next dev) e em prod (Lambda ISR — INF-WEB-001).
//
// Matcher exclui:
// - `_next/*`     assets internos do Next
// - `api/*`       route handlers (não devem receber prefixo de locale — ISR-WEB-002)
// - `.*\..*`      arquivos com extensão (favicon, robots.txt, sitemap.xml, brand/...)
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
