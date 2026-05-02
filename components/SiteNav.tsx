'use client'

import { List, X } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Props = {
  locale: string
}

type NavItem = { href: string; key: 'manifesto' | 'sobre' | 'alertas' | 'fiscais' | 'transparencia' | 'apoie' }

const NAV_ITEMS: NavItem[] = [
  { href: '/manifesto', key: 'manifesto' },
  { href: '/sobre', key: 'sobre' },
  { href: '/alertas', key: 'alertas' },
  { href: '/fiscais', key: 'fiscais' },
  { href: '/transparencia', key: 'transparencia' },
  { href: '/apoie', key: 'apoie' },
]

/**
 * Navegação principal do site.
 *
 * Decisões de design:
 *  - 'use client' justificado: precisa de useState (hamburger), usePathname
 *    (active state, lang toggle preserve route), focus trap no menu mobile.
 *  - Logo via next/image previne CLS — width/height fixos.
 *  - Lang toggle preserva a rota: substitui apenas o segmento de locale.
 *  - Mobile (<768px): hamburger com slide-down menu, focus trap, ESC fecha.
 *  - Active state: borda inferior brand-amber 2px + aria-current="page".
 */
export default function SiteNav({ locale }: Props) {
  const t = useTranslations('nav')
  const tA11y = useTranslations('a11y')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Substitui o segmento de locale, preservando o resto da rota
  // /pt/alertas?x=1 → /en/alertas?x=1
  const otherLocale = locale === 'pt' ? 'en' : 'pt'
  const swappedPathname = pathname.replace(/^\/(pt|en)(?=\/|$)/, `/${otherLocale}`)
  const langTogglePath = swappedPathname === pathname ? `/${otherLocale}` : swappedPathname

  // Fecha menu ao mudar de rota
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // ESC fecha menu mobile + focus trap básico
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    // Foca no botão de fechar ao abrir (a11y)
    closeBtnRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Determina active: rota atual começa com o href localizado
  const isActive = (href: string) => {
    const localized = `/${locale}${href}`
    if (href === '/') return pathname === `/${locale}`
    return pathname === localized || pathname.startsWith(`${localized}/`)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-brand-gray/10 bg-brand-paper/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3"
        aria-label={tA11y('primaryNav')}
      >
        <Link
          href={`/${locale}`}
          className="flex items-center"
          aria-label="Fiscal Digital — home"
        >
          <Image
            src="/brand/logo/wordmark-horizontal.svg"
            alt="Fiscal Digital"
            width={208}
            height={56}
            priority
            className="h-10 w-auto md:h-12"
          />
        </Link>

        {/* Desktop nav (>= md) */}
        <ul className="hidden items-center gap-6 text-sm text-brand-ink md:flex">
          {NAV_ITEMS.map((item) => {
            const localized = `/${locale}${item.href}`
            const active = isActive(item.href)
            const isCta = item.key === 'apoie'
            if (isCta) {
              return (
                <li key={item.key}>
                  <Link
                    href={localized}
                    aria-current={active ? 'page' : undefined}
                    className="rounded-md bg-brand-amber px-3 py-1.5 text-xs font-semibold text-brand-ink transition-opacity hover:opacity-90"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              )
            }
            return (
              <li key={item.key}>
                <Link
                  href={localized}
                  aria-current={active ? 'page' : undefined}
                  className={`border-b-2 pb-1 transition-colors hover:text-brand-teal ${
                    active
                      ? 'border-brand-amber text-brand-teal'
                      : 'border-transparent'
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            )
          })}
          <li>
            <Link
              href={langTogglePath}
              hrefLang={otherLocale}
              aria-label={tA11y('switchLanguage', { lang: otherLocale.toUpperCase() })}
              className="text-xs font-semibold text-brand-gray transition-colors hover:text-brand-teal"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </li>
        </ul>

        {/* Mobile hamburger (< md) */}
        <button
          type="button"
          aria-label={open ? tA11y('closeMenu') : tA11y('openMenu')}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-brand-ink hover:bg-brand-gray/10"
        >
          {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
        </button>
      </nav>

      {/* Mobile menu (slide down) */}
      {open && (
        <div
          ref={menuRef}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label={tA11y('primaryNav')}
          className="md:hidden border-t border-brand-gray/10 bg-brand-paper"
        >
          <ul className="flex flex-col px-6 py-4 text-base text-brand-ink">
            {NAV_ITEMS.map((item) => {
              const localized = `/${locale}${item.href}`
              const active = isActive(item.href)
              return (
                <li key={item.key}>
                  <Link
                    href={localized}
                    aria-current={active ? 'page' : undefined}
                    className={`block border-l-2 py-3 pl-3 transition-colors hover:text-brand-teal ${
                      active
                        ? 'border-brand-amber font-semibold text-brand-teal'
                        : 'border-transparent'
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              )
            })}
            <li className="mt-2 border-t border-brand-gray/10 pt-3">
              <Link
                href={langTogglePath}
                hrefLang={otherLocale}
                aria-label={tA11y('switchLanguage', { lang: otherLocale.toUpperCase() })}
                className="inline-block py-2 text-sm font-semibold text-brand-gray hover:text-brand-teal"
              >
                {otherLocale === 'en' ? 'English' : 'Português'} ({otherLocale.toUpperCase()})
              </Link>
            </li>
            <li>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label={tA11y('closeMenu')}
                className="sr-only"
              >
                {tA11y('closeMenu')}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
