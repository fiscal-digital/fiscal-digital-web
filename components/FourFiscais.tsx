import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import {
  Scales,
  FileText,
  Buildings,
  Users,
  Warning,
  Megaphone,
  House,
  Airplane,
  Handshake,
  TreeStructure,
} from '@phosphor-icons/react/dist/ssr'

const FISCAIS = [
  { key: 'licitacoes', Icon: Scales },
  { key: 'contratos',  Icon: FileText },
  { key: 'fornecedores', Icon: Buildings },
  { key: 'pessoal',    Icon: Users },
  { key: 'nepotismo',  Icon: Warning },
  { key: 'publicidade', Icon: Megaphone },
  { key: 'locacao',    Icon: House },
  { key: 'diarias',   Icon: Airplane },
  { key: 'convenios', Icon: Handshake },
] as const

type FiscalKey = (typeof FISCAIS)[number]['key']

interface Props {
  locale: string
}

export default async function FourFiscais({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'home.fiscais' })
  const tFiscais = await getTranslations({ locale, namespace: 'fiscais' })

  return (
    <div>
      {/* Fiscal Geral — orquestrador, destacado */}
      <div className="mb-5">
        <article className="flex items-start gap-4 rounded-xl border border-brand-teal/30 bg-white p-5 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal text-brand-paper">
            <TreeStructure size={20} weight="regular" aria-hidden="true" />
          </span>
          <div>
            <p className="mb-0.5 font-mono text-xs uppercase tracking-wider text-brand-amber">
              {tFiscais('label_orchestrator')}
            </p>
            <h3 className="text-base font-semibold text-brand-ink">
              {tFiscais('geral.name')}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-brand-gray">
              {tFiscais('geral.role')}
            </p>
          </div>
        </article>
      </div>

      {/* Grid dos 9 Fiscais especializados */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FISCAIS.map(({ key, Icon }) => {
          const nameKey = `${key}.name` as Parameters<typeof tFiscais>[0]
          const roleKey = `${key}.role` as Parameters<typeof tFiscais>[0]

          // fallback to home.fiscais for the 4 originals
          const isInHome = ['licitacoes', 'contratos', 'fornecedores', 'pessoal'].includes(key)
          const title = isInHome
            ? t(`${key as 'licitacoes' | 'contratos' | 'fornecedores' | 'pessoal'}.title`)
            : tFiscais(nameKey)
          const desc = isInHome
            ? t(`${key as 'licitacoes' | 'contratos' | 'fornecedores' | 'pessoal'}.detects`)
            : tFiscais(roleKey)

          return (
            <article
              key={key}
              className="flex h-full flex-col rounded-xl border border-brand-gray/15 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
                  <Icon size={18} weight="regular" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>
              </div>
              <p className="flex-1 text-xs leading-relaxed text-brand-gray">{desc}</p>
            </article>
          )
        })}
      </div>

      {/* Link para /fiscais */}
      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/fiscais`}
          className="inline-flex items-center gap-2 rounded-md border border-brand-teal/30 px-4 py-2 text-sm font-semibold text-brand-teal transition-colors hover:bg-brand-teal/5"
        >
          {tFiscais('label_all_agents')}
        </Link>
      </div>
    </div>
  )
}
