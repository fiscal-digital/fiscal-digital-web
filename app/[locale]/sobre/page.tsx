import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('sobre_title') }
}

const REPO_KEYS = [
  'engine',
  'web',
  'collectors',
  'analytics',
] as const

export default async function SobrePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'sobre' })

  return (
    <main className="min-h-dvh bg-brand-paper">
      {/* Header */}
      <section className="bg-brand-teal px-6 py-16 text-brand-paper">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            Fiscal Digital
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl text-base opacity-80 sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Quem somos */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl space-y-5">
          <h2 className="text-2xl font-bold tracking-tight text-brand-teal">
            {t('who_title')}
          </h2>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('who_body_1')}
          </p>
          <p className="text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('who_body_2')}
          </p>
        </div>
      </section>

      {/* Posicionamento */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('position_title')}
          </h2>
          <p className="mb-6 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('position_body')}
          </p>

          <pre className="overflow-x-auto rounded-lg bg-brand-ink p-5 font-mono text-xs leading-relaxed text-brand-paper sm:text-sm">
{`Serenata de Amor  → Federal   (CEAP)
Querido Diário    → Municipal (open data infrastructure)
Fiscal Digital    → Municipal (intelligence + alerts on QD data)`}
          </pre>
        </div>
      </section>

      {/* Governança */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('governance_title')}
          </h2>
          <p className="mb-8 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('governance_body')}
          </p>

          <div className="rounded-lg border-l-4 border-brand-teal bg-brand-paper p-6 shadow-sm">
            <p className="font-mono text-sm font-semibold text-brand-ink">
              {t('governance_flow')}
            </p>
          </div>
        </div>
      </section>

      {/* Repositórios */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-brand-teal">
            {t('repos_title')}
          </h2>

          <div className="overflow-hidden rounded-lg border border-brand-gray/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-teal text-brand-paper">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('repos_th_repo')}</th>
                  <th className="px-4 py-3 font-semibold">{t('repos_th_role')}</th>
                  <th className="px-4 py-3 font-semibold">{t('repos_th_license')}</th>
                </tr>
              </thead>
              <tbody>
                {REPO_KEYS.map((key, i) => (
                  <tr
                    key={key}
                    className={i % 2 === 0 ? 'bg-brand-paper' : 'bg-brand-gray/5'}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-brand-ink">
                      {t(`repos_${key}_name`)}
                    </td>
                    <td className="px-4 py-3 text-brand-ink">
                      {t(`repos_${key}_role`)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-gray">
                      {t(`repos_${key}_license`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Licenças */}
      <section className="border-t border-brand-gray/10 bg-brand-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-brand-teal">
            {t('licenses_title')}
          </h2>
          <p className="mb-6 text-base leading-relaxed text-brand-ink sm:text-lg">
            {t('licenses_body')}
          </p>
          <ul className="space-y-3 text-base text-brand-ink">
            <li className="flex gap-3">
              <span className="font-mono text-sm font-semibold text-brand-teal">MIT</span>
              <span className="text-brand-gray">— {t('licenses_mit')}</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-sm font-semibold text-brand-teal">CC-BY 4.0</span>
              <span className="text-brand-gray">— {t('licenses_ccby')}</span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
