import { ShieldCheck, ShieldWarning, ArrowSquareOut } from '@phosphor-icons/react/dist/ssr'

interface Props {
  locale: 'pt-br' | 'en-us'
  sancionado?: boolean
  /** URL do CGU se sancionado */
  cguUrl?: string
  /** Descricao da sancao */
  descricao?: string
}

const t = {
  'pt-br': {
    title: 'Sancoes CGU',
    clean: 'Sem sancoes nos cadastros CGU',
    cleanDesc: 'Empresa nao consta nos registros CEIS/CNEP (Controladoria-Geral da Uniao) como sancionada.',
    sanctionedTitle: 'Fornecedor sancionado pela CGU',
    sanctionedDesc: 'Empresa consta em ao menos um dos cadastros: CEIS (empresas inidoneas e suspensas) ou CNEP (empresas punidas).',
    viewCgu: 'Ver no portal CGU',
    pending: 'Status CGU pendente — integracao em desenvolvimento',
  },
  'en-us': {
    title: 'CGU Sanctions',
    clean: 'No sanctions in CGU registries',
    cleanDesc: 'Company is not listed in CEIS/CNEP (CGU — Federal Comptroller General) as sanctioned.',
    sanctionedTitle: 'Supplier sanctioned by CGU',
    sanctionedDesc: 'Company appears in at least one registry: CEIS (debarred and suspended companies) or CNEP (punished companies).',
    viewCgu: 'View at CGU portal',
    pending: 'CGU status pending — integration in development',
  },
} as const

const CGU_PORTAL_URL = 'https://portaldatransparencia.gov.br/sancoes'

export default function SupplierCguCard({ locale, sancionado, cguUrl, descricao }: Props) {
  const tx = t[locale]

  if (sancionado === undefined) {
    return (
      <div className="rounded-xl border border-brand-gray/15 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gray">
          <ShieldCheck size={14} weight="bold" className="pointer-events-none" />
          {tx.title}
        </h2>
        <p className="text-sm italic text-brand-gray/70">{tx.pending}</p>
      </div>
    )
  }

  if (!sancionado) {
    return (
      <div className="rounded-xl border border-brand-success/30 bg-brand-success/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={20}
            weight="fill"
            className="pointer-events-none mt-0.5 shrink-0 text-brand-success"
          />
          <div>
            <p className="font-semibold text-brand-success">{tx.clean}</p>
            <p className="mt-1 text-sm text-brand-gray">{tx.cleanDesc}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/5 p-5">
      <div className="flex items-start gap-3">
        <ShieldWarning
          size={20}
          weight="fill"
          className="pointer-events-none mt-0.5 shrink-0 text-brand-danger"
        />
        <div className="flex-1">
          <p className="font-semibold text-brand-danger">{tx.sanctionedTitle}</p>
          <p className="mt-1 text-sm text-brand-gray">
            {descricao ?? tx.sanctionedDesc}
          </p>
          <a
            href={cguUrl ?? CGU_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-danger hover:underline"
          >
            <ArrowSquareOut size={12} weight="bold" className="pointer-events-none" />
            {tx.viewCgu}
          </a>
        </div>
      </div>
    </div>
  )
}
