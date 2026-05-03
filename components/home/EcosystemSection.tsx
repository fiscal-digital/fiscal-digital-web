import { getTranslations } from 'next-intl/server'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'

interface Props {
  locale: string
}

export default async function EcosystemSection({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.ecosystem' })

  return (
    <section
      id="ecossistema"
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

        {/* Timeline: 2016 → 2019 → 2026 */}
        <div className="mb-10 hidden items-center justify-center gap-0 sm:flex">
          <span className="font-mono text-xs font-semibold text-brand-amber">2016</span>
          <div className="mx-2 h-px w-16 bg-brand-gray/30" />
          <span className="font-mono text-xs font-semibold text-brand-amber">2019</span>
          <div className="mx-2 h-px w-16 bg-brand-gray/30" />
          <span className="font-mono text-xs font-semibold text-brand-amber">2026</span>
        </div>

        {/* Dois cards para os ombros de gigantes */}
        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          {/* Serenata de Amor */}
          <a
            href="https://serenata.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-brand-gray/20 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="mb-1 block font-mono text-xs font-semibold uppercase tracking-wider text-brand-amber">
                  {t('serenata_scope')}
                </span>
                <h3 className="text-lg font-bold text-brand-ink">
                  {t('serenata_name')}
                </h3>
              </div>
              <ArrowRight
                size={18}
                weight="bold"
                className="mt-1 shrink-0 text-brand-gray/40 transition-transform group-hover:translate-x-1 group-hover:text-brand-teal"
                aria-hidden="true"
              />
            </div>
            <p className="flex-1 text-sm leading-relaxed text-brand-gray">
              {t('serenata_desc')}
            </p>
            <span className="mt-4 text-xs font-semibold text-brand-teal">
              serenata.ai
            </span>
          </a>

          {/* Querido Diário */}
          <a
            href="https://queridodiario.ok.org.br"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-brand-gray/20 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="mb-1 block font-mono text-xs font-semibold uppercase tracking-wider text-brand-amber">
                  {t('qd_scope')}
                </span>
                <h3 className="text-lg font-bold text-brand-ink">
                  {t('qd_name')}
                </h3>
              </div>
              <ArrowRight
                size={18}
                weight="bold"
                className="mt-1 shrink-0 text-brand-gray/40 transition-transform group-hover:translate-x-1 group-hover:text-brand-teal"
                aria-hidden="true"
              />
            </div>
            <p className="flex-1 text-sm leading-relaxed text-brand-gray">
              {t('qd_desc')}
            </p>
            <span className="mt-4 text-xs font-semibold text-brand-teal">
              queridodiario.ok.org.br
            </span>
          </a>
        </div>

        {/* Fiscal Digital como resultado — posicionamento, não card próprio */}
        <div className="rounded-xl border border-brand-teal/25 bg-brand-teal/5 px-6 py-5 text-center">
          <p className="text-sm leading-relaxed text-brand-ink">
            <span className="font-semibold text-brand-teal">Fiscal Digital</span>
            {' '}
            {t('position_body')}
          </p>
        </div>
      </div>
    </section>
  )
}
