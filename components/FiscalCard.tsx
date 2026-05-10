import {
  Scales,
  FileText,
  Buildings,
  Users,
  TreeStructure,
  Megaphone,
  House,
  Airplane,
  Handshake,
  Warning,
} from '@phosphor-icons/react/dist/ssr'

export type FiscalId =
  | 'geral'
  | 'licitacoes'
  | 'contratos'
  | 'fornecedores'
  | 'pessoal'
  | 'nepotismo'
  | 'publicidade'
  | 'locacao'
  | 'diarias'
  | 'convenios'

interface Threshold {
  metric: string
  value: string
}

export interface FiscalCardProps {
  id: FiscalId
  name: string
  role: string
  criteriaLabel: string
  exclusionsLabel: string
  legalLabel: string
  thresholdsLabel: string
  thMetric: string
  thValue: string
  criteria: string[]
  exclusions: string[]
  legal: string
  thresholds: Threshold[]
  elevatedConfidenceLabel?: string
  findingsCount?: number
  findingsLabel?: string
  expanded?: boolean
}

const ICONS: Record<FiscalId, React.ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'duotone'; className?: string; 'aria-hidden'?: 'true' }>> = {
  geral: TreeStructure,
  licitacoes: Scales,
  contratos: FileText,
  fornecedores: Buildings,
  pessoal: Users,
  nepotismo: Warning,
  publicidade: Megaphone,
  locacao: House,
  diarias: Airplane,
  convenios: Handshake,
}

export default function FiscalCard({
  id,
  name,
  role,
  criteriaLabel,
  exclusionsLabel,
  legalLabel,
  thresholdsLabel,
  thMetric,
  thValue,
  criteria,
  exclusions,
  legal,
  thresholds,
  elevatedConfidenceLabel,
  findingsCount,
  findingsLabel,
  expanded = false,
}: FiscalCardProps) {
  const Icon = ICONS[id]

  // Detect elevated confidence (0.95) from thresholds
  const confidenceThreshold = thresholds.find(
    (t) => t.metric.toLowerCase().includes('confiança') || t.metric.toLowerCase().includes('confidence')
  )
  const isElevated = confidenceThreshold?.value === '0,95' || confidenceThreshold?.value === '0.95'

  return (
    <article className="rounded-xl border border-brand-gray/15 bg-white shadow-sm">
      <details open={expanded}>
        <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden hover:bg-brand-gray/5 rounded-xl transition-colors">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
            <Icon size={20} weight="regular" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-brand-ink">{name}</h3>
              {isElevated && elevatedConfidenceLabel && (
                <span className="inline-flex items-center rounded-full border border-brand-amber/40 bg-brand-amber/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-ink">
                  confidence 0,95
                </span>
              )}
              {findingsCount != null && findingsCount > 0 && findingsLabel && (
                <span className="inline-flex items-center rounded-full bg-brand-teal/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-teal">
                  {findingsCount.toLocaleString('pt-BR')} {findingsLabel}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-brand-gray">{role}</p>
          </div>
          <span className="mt-1 shrink-0 text-brand-gray/50 text-xs select-none" aria-hidden="true">
            &#9660;
          </span>
        </summary>

        <div className="border-t border-brand-gray/10 px-5 pb-6 pt-5">
          {/* Critérios de detecção */}
          <section className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
              {criteriaLabel}
            </h3>
            <ol className="space-y-2">
              {criteria.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-brand-ink">
                  <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 font-mono text-xs font-bold text-brand-teal">
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Exclusão por regularidade */}
          <section className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
              {exclusionsLabel}
            </h3>
            <ul className="space-y-2">
              {exclusions.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-brand-gray">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gray/40" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Fundamentação legal */}
          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-amber">
              {legalLabel}
            </h3>
            <p className="text-sm leading-relaxed text-brand-ink">{legal}</p>
          </section>

          {/* Limiares */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-amber">
              {thresholdsLabel}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-gray/10">
                    <th className="pb-2 pr-4 text-left font-semibold text-brand-gray">{thMetric}</th>
                    <th className="pb-2 text-left font-semibold text-brand-gray">{thValue}</th>
                  </tr>
                </thead>
                <tbody>
                  {thresholds.map((row, i) => (
                    <tr key={i} className="border-b border-brand-gray/5 last:border-0">
                      <td className="py-1.5 pr-4 font-mono text-xs text-brand-gray">{row.metric}</td>
                      <td className="py-1.5 font-mono text-xs font-semibold text-brand-teal">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </details>
    </article>
  )
}
