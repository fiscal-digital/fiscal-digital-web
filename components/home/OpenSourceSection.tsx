import { getTranslations } from 'next-intl/server'
import { Code, Globe, TreeStructure, ChartBar, Flask, GithubLogo } from '@phosphor-icons/react/dist/ssr'

interface Props {
  locale: string
}

const REPOS = [
  {
    key: 'engine',
    Icon: TreeStructure,
    href: 'https://github.com/fiscal-digital/fiscal-digital',
    stack: 'TypeScript · Lambda · DynamoDB',
  },
  {
    key: 'web',
    Icon: Globe,
    href: 'https://github.com/fiscal-digital/fiscal-digital-web',
    stack: 'Next.js · Tailwind · next-intl',
  },
  {
    key: 'collectors',
    Icon: Code,
    href: 'https://github.com/fiscal-digital/fiscal-digital-collectors',
    stack: 'TypeScript · Lambda · Querido Diário',
  },
  {
    key: 'analytics',
    Icon: ChartBar,
    href: 'https://github.com/fiscal-digital/fiscal-digital-analytics',
    stack: 'Jupyter · Python · CC-BY 4.0',
  },
  {
    key: 'evaluations',
    Icon: Flask,
    href: 'https://github.com/fiscal-digital/fiscal-digital-evaluations',
    stack: 'Golden set · ADRs · baselines',
  },
] as const

export default async function OpenSourceSection({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.open_source' })

  return (
    <section
      id="open-source"
      className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
            {t('section_title')}
          </h2>
          <p className="mx-auto max-w-2xl text-brand-gray">
            {t('desc')}
          </p>
        </div>

        {/* 5 repo cards — todos os repos públicos da org (UH-WEB-019) */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {REPOS.map(({ key, Icon, href, stack }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border border-brand-gray/20 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-brand-paper transition-colors">
                <Icon size={18} weight="regular" aria-hidden="true" />
              </span>
              <span className="mb-1 text-sm font-semibold text-brand-ink">
                {t(`repo_${key}_name` as Parameters<typeof t>[0])}
              </span>
              <span className="mb-3 flex-1 text-xs leading-relaxed text-brand-gray">
                {t(`repo_${key}_role` as Parameters<typeof t>[0])}
              </span>
              <span className="font-mono text-xs text-brand-gray/60">
                {stack}
              </span>
            </a>
          ))}
        </div>

        {/* Stats + CTA */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gray/20 px-3 py-1 text-xs text-brand-gray">
              <span className="font-mono font-bold text-brand-teal">4</span>
              {t('badge_repos')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gray/20 px-3 py-1 text-xs text-brand-gray">
              <span className="font-mono font-bold text-brand-teal">MIT</span>
              {t('badge_code_license')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gray/20 px-3 py-1 text-xs text-brand-gray">
              <span className="font-mono font-bold text-brand-teal">CC-BY 4.0</span>
              {t('badge_data_license')}
            </span>
          </div>
          <a
            href="https://github.com/fiscal-digital"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-ink px-5 py-2.5 text-sm font-semibold text-brand-paper transition-opacity hover:opacity-90"
          >
            <GithubLogo size={18} weight="fill" aria-hidden="true" />
            {t('cta_github')}
          </a>
        </div>
      </div>
    </section>
  )
}
