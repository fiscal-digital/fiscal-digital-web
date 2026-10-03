// Prefixos de idioma antigos. O site já usou `/en` e `/pt`; desde a migração
// para BCP-47 (`/en-us`, `/pt-br`) esses links caíam no next-intl como se
// fossem uma página, viravam `/pt-br/en/` e davam 404. Links antigos
// circulam em README, redes e buscadores — redirecionamos em vez de quebrar.
const LEGACY: Record<string, string> = {
  en: 'en-us',
  pt: 'pt-br',
}

/**
 * Se `pathname` começa com um prefixo de idioma legado, devolve o caminho
 * equivalente no prefixo atual; senão `null`. Só casa segmento inteiro:
 * `/entrar` ou `/ptx` não são afetados.
 */
export function legacyLocaleRedirect(pathname: string): string | null {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname)
  if (!match) return null
  const atual = LEGACY[match[1].toLowerCase()]
  if (!atual) return null
  const resto = match[2] ?? '/'
  return `/${atual}${resto}`
}
