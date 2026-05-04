'use client'

import { X } from '@phosphor-icons/react'
import { FilterBar } from './FilterBar'

interface FilterBottomSheetProps {
  isOpen: boolean
  filters: { state: string; city: string; type: string; yearMin: number; yearMax: number }
  onFilterChange: (filters: any) => void
  onClose: () => void
}

export function FilterBottomSheet({ isOpen, filters, onFilterChange, onClose }: FilterBottomSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl border-t border-brand-gray/15 bg-white p-4 sm:hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brand-ink">Filtros</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-brand-gray/10 transition-colors"
            aria-label="Fechar filtros"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 overflow-visible">
          <FilterBar
            state={filters.state}
            city={filters.city}
            type={filters.type}
            yearMin={filters.yearMin}
            yearMax={filters.yearMax}
            onFilterChange={onFilterChange}
            allLabel="Todas"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-brand-gray/15 pt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-brand-paper transition-opacity hover:opacity-90"
          >
            Aplicar
          </button>
          <button
            onClick={() => {
              const currentYear = new Date().getFullYear()
              onFilterChange({ state: '', city: '', type: '', yearMin: 2021, yearMax: currentYear })
              onClose()
            }}
            className="flex-1 rounded-md border border-brand-gray/25 bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-gray/10"
          >
            Limpar
          </button>
        </div>
      </div>
    </>
  )
}
