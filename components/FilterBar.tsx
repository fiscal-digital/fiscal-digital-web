'use client'

import { useMemo, useState, useEffect } from 'react'
import { CITIES } from '@/lib/cities'
import { findingTypeLabel } from '@/lib/findings'

const BR_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

interface FilterBarProps {
  state: string
  city: string
  type: string
  riskMin: number
  riskMax: number
  onFilterChange: (filters: { state?: string; city?: string; type?: string; riskMin?: number; riskMax?: number }) => void
  allLabel: string
}

export function FilterBar({ state, city, type, riskMin, riskMax, onFilterChange, allLabel }: FilterBarProps) {
  const [tempRiskMin, setTempRiskMin] = useState(String(riskMin))
  const [tempRiskMax, setTempRiskMax] = useState(String(riskMax))

  const availableCities = useMemo(() => {
    if (!state) return []
    return Object.values(CITIES)
      .filter((c) => c.active && c.uf === state)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [state])

  // Reset city when state changes
  useEffect(() => {
    if (city && !availableCities.find((c) => c.cityId === city)) {
      onFilterChange({ city: '' })
    }
  }, [state, city, availableCities, onFilterChange])

  const handleRiskApply = () => {
    onFilterChange({
      riskMin: parseInt(tempRiskMin, 10),
      riskMax: parseInt(tempRiskMax, 10),
    })
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
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-state" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
          Estado
        </label>
        <select
          id="filter-state"
          value={state}
          onChange={(e) => onFilterChange({ state: e.target.value })}
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

      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="risk-min" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
            Risco mín
          </label>
          <input
            id="risk-min"
            type="number"
            min="0"
            max="100"
            value={tempRiskMin}
            onChange={(e) => setTempRiskMin(e.target.value)}
            className="w-16 rounded-md border border-brand-gray/25 bg-white px-2 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="risk-max" className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
            Máx
          </label>
          <input
            id="risk-max"
            type="number"
            min="0"
            max="100"
            value={tempRiskMax}
            onChange={(e) => setTempRiskMax(e.target.value)}
            className="w-16 rounded-md border border-brand-gray/25 bg-white px-2 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
        <button
          onClick={handleRiskApply}
          className="mt-5 rounded-md border border-brand-teal/40 bg-brand-teal/10 px-2 py-2 text-xs font-semibold text-brand-teal transition-colors hover:bg-brand-teal/20"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
