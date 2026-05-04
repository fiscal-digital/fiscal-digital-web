import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

type Props = {
  locale: string
}

/**
 * Footer global — server component (sem interatividade).
 *
 * Layout: 4 colunas em desktop (>= md), 1 coluna empilhada em mobile.
 * Bottom strip com copy + crédito ao ecossistema (Serenata + QD/OKFN).
 *
 * WCAG: links externos com rel="noopener noreferrer", contrastes verificados
 * (brand-gray #5C6670 sobre brand-paper #F8F5EE → 5.04:1 ≥ 4.5:1 AA).
 */
export default async function Footer({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'footer' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  const sections: Array<{
    heading: string
    links: Array<{ label: string; href?: string; external?: boolean; comingSoon?: boolean }>
  }> = [
    {
      heading: t('col_about'),
      links: [
        { label: tNav('manifesto'), href: `/${locale}/manifesto` },
        { label: tNav('sobre'), href: `/${locale}/sobre` },
        { label: tNav('transparencia'), href: `/${locale}/transparencia` },
      ],
    },
    {
      heading: t('col_resources'),
      links: [
        { label: tNav('alertas'), href: `/${locale}/alertas` },
        { label: 'RSS', href: `/${locale}/alertas/feed.xml` },
        // api.fiscaldigital.org ainda não tem cert/DNS dedicado — Lambda
        // Function URL atende o site mas não é endpoint público polido.
        { label: t('api_link'), comingSoon: true },
      ],
    },
    {
      heading: t('col_community'),
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/fiscal-digital',
          external: true,
        },
        {
          label: t('contact_link'),
          href: `/${locale}/sobre`,
        },
      ],
    },
    {
      heading: t('col_legal'),
      links: [
        {
          label: t('license_code'),
          href: 'https://github.com/fiscal-digital/fiscal-digital/blob/main/LICENSE',
          external: true,
        },
        {
          label: t('license_data'),
          href: 'https://creativecommons.org/licenses/by/4.0/',
          external: true,
        },
        { label: t('retraction_policy'), href: `/${locale}/transparencia#retratacao` },
      ],
    },
  ]

  return (
    <footer
      role="contentinfo"
      className="mt-24 border-t border-brand-gray/15 bg-brand-paper"
    >
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-teal">
                {section.heading}
              </h2>
              <ul className="space-y-2 text-sm text-brand-gray">
                {section.links.map((link) => (
                  <li key={`${section.heading}:${link.label}`}>
                    {link.comingSoon ? (
                      <span className="inline-flex items-center gap-1.5 text-brand-gray/60">
                        <span>{link.label}</span>
                        <span className="rounded-pill border border-brand-gray/25 bg-brand-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gray/80">
                          {t('coming_soon')}
                        </span>
                      </span>
                    ) : link.external && link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-brand-teal"
                      >
                        {link.label}
                      </a>
                    ) : link.href ? (
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-brand-teal"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span>{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-brand-gray/15 pt-6 text-xs text-brand-gray">
          <p>
            Fiscal Digital{' '}
            {t.rich('ombros', {
              serenata: (chunks) => (
                <a
                  href="https://serenata.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-teal"
                >
                  {chunks}
                </a>
              ),
              qd: (chunks) => (
                <a
                  href="https://queridodiario.ok.org.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-teal"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
          <p className="mt-2 text-brand-gray/80">{t('tagline')}</p>
        </div>
      </div>
    </footer>
  )
}
