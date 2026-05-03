import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Code, Database, Megaphone, Heart, ArrowRight } from '@phosphor-icons/react/dist/ssr'

interface Props {
  locale: string
}

export default async function ContributeSection({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.contribute' })

  const cards = [
    {
      key: 'code',
      Icon: Code,
      href: 'https://github.com/fiscal-digital/fiscal-digital/issues',
      external: true,
    },
    {
      key: 'data',
      Icon: Database,
      href: 'https://github.com/fiscal-digital/fiscal-digital/issues/new?labels=cidade%2Cdados',
      external: true,
    },
    {
      key: 'spread',
      Icon: Megaphone,
      href: 'https://github.com/fiscal-digital/fiscal-digital/discussions',
      external: true,
    },
    {
      key: 'financial',
      Icon: Heart,
      href: `/${locale}/apoie`,
      external: false,
    },
  ] as const

  return (
    <section
      id="contribua"
      className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_title')}
          </h2>
          <p className="mx-auto max-w-2xl text-brand-gray">
            {t('section_desc')}
          </p>
        </div>

        {/* 4 formas de contribuir */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ key, Icon, href, external }) => {
            const inner = (
              <div className="group flex h-full flex-col rounded-xl border border-brand-gray/20 bg-white p-5 transition-shadow hover:shadow-md">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-brand-paper">
                  <Icon size={20} weight="regular" aria-hidden="true" />
                </span>
                <h3 className="mb-2 text-sm font-bold text-brand-ink">
                  {t(`${key}_title` as Parameters<typeof t>[0])}
                </h3>
                <p className="flex-1 text-xs leading-relaxed text-brand-gray">
                  {t(`${key}_desc` as Parameters<typeof t>[0])}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-teal">
                  {t(`${key}_cta` as Parameters<typeof t>[0])}
                  <ArrowRight size={13} weight="bold" aria-hidden="true" />
                </span>
              </div>
            )

            return external ? (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <Link key={key} href={href} prefetch>
                {inner}
              </Link>
            )
          })}
        </div>

        {/* Contato de texto — sem mailto */}
        <p className="text-center text-xs text-brand-gray">
          {t('contact_note')}
        </p>
      </div>
    </section>
  )
}
