import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

type Props = {
  locale: string
}

export default async function SiteNav({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    <header className="sticky top-0 z-10 border-b border-brand-gray/10 bg-brand-paper/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="font-semibold tracking-tight text-brand-teal"
        >
          Fiscal Digital
        </Link>
        <ul className="flex items-center gap-6 text-sm text-brand-gray">
          <li>
            <Link
              href={`/${locale}/alertas`}
              className="transition-colors hover:text-brand-teal"
            >
              {t('alertas')}
            </Link>
          </li>
          <li>
            <a
              href={`/${locale}#apoie`}
              className="rounded-md bg-brand-amber px-3 py-1.5 text-xs font-semibold text-brand-ink transition-opacity hover:opacity-90"
            >
              {t('apoie')}
            </a>
          </li>
          <li className="text-xs text-brand-gray/50">
            {locale === 'pt' ? (
              <Link href="/en" className="transition-colors hover:text-brand-teal">EN</Link>
            ) : (
              <Link href="/pt" className="transition-colors hover:text-brand-teal">PT</Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  )
}
