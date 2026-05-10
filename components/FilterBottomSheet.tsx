'use client'

import { X } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import { FilterBar, type FilterUpdate } from './FilterBar'

interface FilterBottomSheetProps {
  isOpen: boolean
  filters: { state: string; city: string; type: string; yearMin: number; yearMax: number }
  onFilterChange: (filters: FilterUpdate) => void
  onClose: () => void
  locale?: 'pt-br' | 'en-us'
}

export function FilterBottomSheet({ isOpen, filters, onFilterChange, onClose, locale = 'pt-br' }: FilterBottomSheetProps) {
  const t = useTranslations('alertas.toolbar')

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl border-t border-brand-gray/15 bg-white p-4 sm:hidden max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brand-ink">{t('mobile.title')}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-brand-gray/10 transition-colors"
            aria-label={t('mobile.close')}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="mb-4 overflow-visible">
          <FilterBar
            state={filters.state}
            city={filters.city}
            type={filters.type}
            yearMin={filters.yearMin}
            yearMax={filters.yearMax}
            onFilterChange={onFilterChange}
            allLabel={t('common.all')}
            locale={locale}
          />
        </div>

        <div className="flex gap-2 border-t border-brand-gray/15 pt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-brand-paper transition-opacity hover:opacity-90"
          >
            {t('mobile.apply')}
          </button>
          <button
            onClick={() => {
              const currentYear = new Date().getFullYear()
              onFilterChange({ state: '', city: '', type: '', yearMin: 2021, yearMax: currentYear })
              onClose()
            }}
            className="flex-1 rounded-md border border-brand-gray/25 bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-gray/10"
          >
            {t('mobile.clear')}
          </button>
        </div>
      </div>
    </>
  )
}
