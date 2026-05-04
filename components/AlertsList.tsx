'use client'

import { usePathname } from 'next/navigation'
import type { Finding } from './AlertsFeed'
import { FindingRow } from './FindingRow'

interface AlertsListProps {
  findings: Finding[]
  typeLabel: (type: string) => string
}

export function AlertsList({ findings, typeLabel }: AlertsListProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'pt'

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-gray/15 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-gray/15 bg-brand-gray/5">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">Cidade</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">Risco</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">Valor</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-gray">Descrição</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brand-gray">Ação</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f) => (
            <FindingRow key={f.id} finding={f} typeLabel={typeLabel} locale={locale as 'pt' | 'en'} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
