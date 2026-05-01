import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Next.js 16: middleware.ts foi depreciado — este é o proxy.ts equivalente.
// Ativo em desenvolvimento (next dev) para locale detection e redirect.
// Em produção (static export S3+CloudFront), este arquivo é ignorado pelo runtime.
// A detecção de locale em prod é responsabilidade da CloudFront Function no edge.
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
