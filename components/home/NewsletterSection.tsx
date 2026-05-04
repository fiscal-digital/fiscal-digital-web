import { getTranslations } from 'next-intl/server'
import { Bell, Newspaper, Buildings } from '@phosphor-icons/react/dist/ssr'
import NewsletterForm from '@/components/NewsletterForm'

interface Props {
  locale: string
}

export default async function NewsletterSection({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.newsletter' })

  const bullets = [
    { Icon: Bell, key: 'bullet_alerts' as const },
    { Icon: Newspaper, key: 'bullet_stories' as const },
    { Icon: Buildings, key: 'bullet_updates' as const },
  ] as const

  return (
    <section
      id="newsletter"
      className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_title')}
          </h2>
          <p className="text-brand-gray">{t('desc')}</p>
        </div>

        {/* O que você vai receber */}
        <ul className="mb-8 space-y-3" aria-label={t('what_you_get_label')}>
          {bullets.map(({ Icon, key }) => (
            <li key={key} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
                <Icon size={16} weight="regular" aria-hidden="true" />
              </span>
              <span className="text-sm leading-relaxed text-brand-gray">
                {t(key)}
              </span>
            </li>
          ))}
        </ul>

        <NewsletterForm source="home" locale={locale as 'pt-br' | 'en-us'} />
      </div>
    </section>
  )
}
