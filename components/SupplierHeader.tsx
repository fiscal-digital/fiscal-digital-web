import Link from 'next/link'
import { CaretLeft, Hash, ArrowSquareOut } from '@phosphor-icons/react/dist/ssr'

interface Props {
  cnpj: string
  locale: 'pt-br' | 'en-us'
}

function formatCnpj(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length !== 14) return raw
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

const t = {
  'pt-br': {
    back: 'Voltar para alertas',
    label: 'Perfil do Fornecedor',
    rfbLink: 'Consultar na Receita Federal',
  },
  'en-us': {
    back: 'Back to alerts',
    label: 'Supplier Profile',
    rfbLink: 'Check at Federal Revenue',
  },
} as const

export default function SupplierHeader({ cnpj, locale }: Props) {
  const tx = t[locale]
  const formatted = formatCnpj(cnpj)
  const rfbUrl = `https://www.receita.fazenda.gov.br/pessoajuridica/cnpj/cnpjreva/cnpjreva_solicitacao.asp?cnpj=${cnpj}`

  return (
    <section className="bg-brand-teal px-6 py-12 text-brand-paper">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${locale}/alertas`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-amber hover:underline"
        >
          <CaretLeft size={14} weight="bold" className="pointer-events-none" />
          {tx.back}
        </Link>

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-amber">
          {tx.label}
        </p>

        <h1 className="mt-2 flex items-center gap-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          <Hash size={24} weight="bold" className="pointer-events-none text-brand-amber" />
          <span className="font-mono">{formatted}</span>
        </h1>

        <a
          href={rfbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-brand-paper/70 hover:text-brand-paper"
        >
          <ArrowSquareOut size={12} weight="bold" className="pointer-events-none" />
          {tx.rfbLink}
        </a>
      </div>
    </section>
  )
}
