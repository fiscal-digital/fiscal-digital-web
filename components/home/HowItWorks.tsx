import { getTranslations } from 'next-intl/server'
import { Newspaper, Cpu, Scales, Bell } from '@phosphor-icons/react/dist/ssr'

interface Props {
  locale: string
}

const STEPS = [
  {
    key: 'collect' as const,
    Icon: Newspaper,
  },
  {
    key: 'extract' as const,
    Icon: Cpu,
  },
  {
    key: 'analyze' as const,
    Icon: Scales,
  },
  {
    key: 'alert' as const,
    Icon: Bell,
  },
] as const

type StepKey = (typeof STEPS)[number]['key']

export default async function HowItWorks({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.how' })

  return (
    <section
      id="como-funciona"
      className="border-t border-brand-gray/10 bg-brand-paper px-6 py-14"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-brand-teal">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-brand-gray">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative">
          {/* Connector line — visible on md+ */}
          <div
            className="absolute left-0 right-0 top-10 hidden h-px bg-brand-gray/20 md:block"
            aria-hidden="true"
          />

          <ol className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {STEPS.map(({ key, Icon }, index) => (
              <li
                key={key}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number badge + icon */}
                <div className="relative z-10 mb-5 flex flex-col items-center gap-2">
                  {/* Number */}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal font-mono text-sm font-bold text-brand-paper shadow-sm">
                    {index + 1}
                  </span>
                  {/* Icon bubble */}
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-teal/20 bg-white shadow-sm text-brand-teal">
                    <Icon size={22} weight="duotone" aria-hidden="true" />
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-base font-semibold text-brand-ink">
                  {t(`step_${key}_title` as `step_${StepKey}_title`)}
                </h3>

                {/* What happens */}
                <p className="mb-2 text-sm leading-relaxed text-brand-ink">
                  {t(`step_${key}_what` as `step_${StepKey}_what`)}
                </p>

                {/* Citizen context — smaller */}
                <p className="text-xs leading-relaxed text-brand-gray">
                  {t(`step_${key}_why` as `step_${StepKey}_why`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
