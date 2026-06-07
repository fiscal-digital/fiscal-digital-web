import { Buildings, Calendar, IdentificationCard, CurrencyDollar } from '@phosphor-icons/react/dist/ssr'

interface Props {
  locale: 'pt-br' | 'en-us'
  /** Dados RFB opcionais — pendentes quando a integracao ainda nao expoe via API */
  razaoSocial?: string
  dataAbertura?: string
  cnae?: string
  capitalSocial?: number
  socios?: string[]
  situacao?: 'ATIVA' | 'SUSPENSA' | 'INAPTA' | 'BAIXADA' | string
}

const t = {
  'pt-br': {
    title: 'Dados da Receita Federal',
    razao: 'Razao social',
    situacao: 'Situacao cadastral',
    abertura: 'Data de abertura',
    cnae: 'CNAE principal',
    capital: 'Capital social',
    socios: 'Socios',
    pending: 'Pendente — integracao RFB em desenvolvimento',
    ativa: 'ATIVA',
    suspensa: 'SUSPENSA',
    inapta: 'INAPTA',
    baixada: 'BAIXADA',
  },
  'en-us': {
    title: 'Federal Revenue Data',
    razao: 'Company name',
    situacao: 'Registration status',
    abertura: 'Founding date',
    cnae: 'Primary CNAE',
    capital: 'Share capital',
    socios: 'Partners',
    pending: 'Pending — RFB integration in development',
    ativa: 'ACTIVE',
    suspensa: 'SUSPENDED',
    inapta: 'UNFIT',
    baixada: 'CANCELLED',
  },
} as const

function situacaoBadge(status: string | undefined, locale: 'pt-br' | 'en-us') {
  if (!status) return null
  const upper = status.toUpperCase()
  const tx = t[locale]
  const map: Record<string, { label: string; cls: string }> = {
    ATIVA:    { label: tx.ativa,    cls: 'bg-brand-success/15 text-brand-success' },
    SUSPENSA: { label: tx.suspensa, cls: 'bg-brand-amber/20 text-brand-ink' },
    INAPTA:   { label: tx.inapta,   cls: 'bg-brand-danger/15 text-brand-danger' },
    BAIXADA:  { label: tx.baixada,  cls: 'bg-brand-gray/15 text-brand-gray' },
  }
  const entry = map[upper]
  if (!entry) return (
    <span className="rounded-full bg-brand-gray/10 px-2 py-0.5 text-xs font-semibold text-brand-gray">
      {status}
    </span>
  )
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${entry.cls}`}>
      {entry.label}
    </span>
  )
}

function formatCapital(value: number, locale: 'pt-br' | 'en-us'): string {
  return value.toLocaleString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  })
}

function Row({
  icon,
  label,
  value,
  pending,
}: {
  icon: React.ReactNode
  label: string
  value?: React.ReactNode
  pending: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-gray">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-brand-ink">
        {value ?? <span className="italic text-brand-gray/70">{pending}</span>}
      </dd>
    </div>
  )
}

export default function SupplierRfbCard({
  locale,
  razaoSocial,
  dataAbertura,
  cnae,
  capitalSocial,
  socios,
  situacao,
}: Props) {
  const tx = t[locale]

  return (
    <div className="rounded-xl border border-brand-gray/15 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-gray">
        <Buildings size={14} weight="bold" className="pointer-events-none" />
        {tx.title}
      </h2>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-gray">
            <IdentificationCard size={14} weight="bold" className="pointer-events-none" />
            {tx.razao}
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-brand-ink">
            {razaoSocial ?? <span className="italic font-normal text-brand-gray/70">{tx.pending}</span>}
          </dd>
        </div>

        <Row
          icon={<Buildings size={14} weight="bold" className="pointer-events-none" />}
          label={tx.situacao}
          value={situacaoBadge(situacao, locale)}
          pending={tx.pending}
        />

        <Row
          icon={<Calendar size={14} weight="bold" className="pointer-events-none" />}
          label={tx.abertura}
          value={dataAbertura}
          pending={tx.pending}
        />

        <Row
          icon={<Buildings size={14} weight="bold" className="pointer-events-none" />}
          label={tx.cnae}
          value={cnae}
          pending={tx.pending}
        />

        <Row
          icon={<CurrencyDollar size={14} weight="bold" className="pointer-events-none" />}
          label={tx.capital}
          value={capitalSocial != null ? formatCapital(capitalSocial, locale) : undefined}
          pending={tx.pending}
        />

        {socios && socios.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-gray">
              <Buildings size={14} weight="bold" className="pointer-events-none" />
              {tx.socios}
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {socios.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="rounded bg-brand-gray/8 px-2 py-0.5 text-xs text-brand-ink"
                >
                  {s}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
