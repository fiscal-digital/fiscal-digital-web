import { getTranslations } from 'next-intl/server'

const FISCAIS = [
  { key: 'licitacoes', icon: '⚖️' },
  { key: 'contratos',  icon: '📑' },
  { key: 'fornecedores', icon: '🏢' },
  { key: 'pessoal',    icon: '👥' },
] as const

type FiscalKey = (typeof FISCAIS)[number]['key']

interface Props {
  locale: string
}

export default async function FourFiscais({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.fiscais' })

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {FISCAIS.map((f) => (
        <FiscalCard key={f.key} fiscalKey={f.key} icon={f.icon} t={t} />
      ))}
    </div>
  )
}

interface CardProps {
  fiscalKey: FiscalKey
  icon: string
  t: Awaited<ReturnType<typeof getTranslations<'home.fiscais'>>>
}

function FiscalCard({ fiscalKey, icon, t }: CardProps) {
  const titleKey = `${fiscalKey}.title` as Parameters<typeof t>[0]
  const detectsKey = `${fiscalKey}.detects` as Parameters<typeof t>[0]
  const lawKey = `${fiscalKey}.law` as Parameters<typeof t>[0]

  return (
    <article className="flex h-full flex-col rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 text-3xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-brand-ink">
        {t(titleKey)}
      </h3>
      <p className="mb-3 flex-1 text-sm leading-relaxed text-brand-gray">
        {t(detectsKey)}
      </p>
      <p className="border-t border-brand-gray/10 pt-3 text-xs text-brand-teal">
        {t(lawKey)}
      </p>
    </article>
  )
}
