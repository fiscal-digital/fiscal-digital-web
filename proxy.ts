import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { legacyLocaleRedirect } from './lib/legacy-locale'

// Next.js 16: middleware.ts foi depreciado — este é o proxy.ts equivalente.
// Ativo em dev local (next dev) e em prod (Lambda ISR — INF-WEB-001).
//
// Matcher exclui:
// - `_next/*`     assets internos do Next
// - `api/*`       route handlers (não devem receber prefixo de locale — ISR-WEB-002)
// - `.*\..*`      arquivos com extensão (favicon, robots.txt, sitemap.xml, brand/...)
const intl = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  // `/en` e `/pt` antigos: 308 para `/en-us` e `/pt-br` antes do next-intl,
  // que de outro modo os trata como página e devolve 404.
  const destino = legacyLocaleRedirect(request.nextUrl.pathname)
  if (destino) {
    const url = request.nextUrl.clone()
    url.pathname = destino
    return NextResponse.redirect(url, 308)
  }
  return intl(request)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
