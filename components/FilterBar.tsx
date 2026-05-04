'use client'

import { useMemo } from 'react'
import { CITIES } from '@/lib/cities'
import { findingTypeLabel } from '@/lib/findings'

const BR_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

export interface FilterUpdate {
  state?: string
  city?: string
  type?: string
  yearMin?: number
  yearMax?: number
}

interface FilterBarProps {
  state: string
  city: string
  type: string
  yearMin: number
  yearMax: number
  onFilterChange: (filters: FilterUpdate) => void
  allLabel: string
  hideLocation?: boolean
}

export function FilterBar({ state, city, type, yearMin, yearMax, onFilterChange, allLabel, hideLocation }: FilterBarProps) {
  const currentYear = new Date().getFullYear()
  const availableYears = [2021, 2022, 2023, 2024, 2025, 2026].filter(y => y <= currentYear)

  const availableCities = useMemo(() => {
    if (!state) return []
    return Object.values(CITIES)
      .filter((c) => c.active && c.uf === state)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [state])

  // Reset city quando estado muda — feito inline no onChange do select de Estado
  // (eliminado useEffect que tinha callback prop nas deps e causava loop infinito
  // de re-renders → skeleton flickering).
  const handleStateChange = (newState: string) => {
    if (newState !== state && city) {
      onFilterChange({ state: newState, city: '' })
    } else {
      onFilterChange({ state: newState })
    }
  }

  // All finding types
  const ALERT_TYPES = [
    'dispensa_irregular',
    'fracionamento',
    'aditivo_abusivo',
    'prorrogacao_excessiva',
    'cnpj_jovem',
    'concentracao_fornecedor',
    'pico_nomeacoes',
    'rotatividade_anormal',
    'inexigibilidade_sem_justificativa',
    'padrao_recorrente',
    'convenio_sem_chamamento',
    'repasse_recorrente_osc',
    'diaria_irregular',
    'publicidade_eleitoral',
    'locacao_sem_justificativa',
    'nepotismo_indicio',
    'cnpj_situacao_irregular',
    'fornecedor_sancionado',
  ]

  return (
    <div className="flex flex-col gap-4 sm:flex-wrap sm:flex-row sm:items-end sm:gap-3">
      {!hideLocation && (
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-state" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
            Estado
          </label>
          <select
            id="filter-state"
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          >
            <option value="">{allLabel}</option>
            {BR_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {!hideLocation && (
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-city" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
            Cidade
          </label>
          <select
            id="filter-city"
            value={city}
            onChange={(e) => onFilterChange({ city: e.target.value })}
            disabled={!state}
            className="rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal disabled:cursor-not-allowed disabled:bg-brand-gray/10 disabled:text-brand-gray/60"
          >
            <option value="">{state ? allLabel : 'Selecione um estado'}</option>
            {availableCities.map((c) => (
              <option key={c.cityId} value={c.cityId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-type" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
          Tipo
        </label>
        <select
          id="filter-type"
          value={type}
          onChange={(e) => onFilterChange({ type: e.target.value })}
          className="rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="">{allLabel}</option>
          {ALERT_TYPES.map((t) => (
            <option key={t} value={t}>
              {findingTypeLabel(t, 'pt')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="year-min" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
            Ano (De)
          </label>
          <select
            id="year-min"
            value={yearMin}
            onChange={(e) => onFilterChange({ yearMin: parseInt(e.target.value, 10) })}
            className="rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="year-max" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
            Até
          </label>
          <select
            id="year-max"
            value={yearMax}
            onChange={(e) => onFilterChange({ yearMax: parseInt(e.target.value, 10) })}
            className="rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
