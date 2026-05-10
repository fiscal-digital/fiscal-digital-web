'use client'

import { FunnelSimple } from '@phosphor-icons/react'

interface MobileFilterButtonProps {
  onClick: () => void
  activeCount?: number
  label?: string
  ariaLabel?: string
}

export function MobileFilterButton({
  onClick,
  activeCount = 0,
  label = 'Filtros',
  ariaLabel = 'Abrir filtros',
}: MobileFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center gap-1.5 rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-gray/10"
      aria-label={ariaLabel}
    >
      <FunnelSimple size={14} weight="bold" />
      {label}
      {activeCount > 0 && (
        <span
          className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-teal px-1 text-[10px] font-bold text-brand-paper"
          aria-label={`${activeCount} filtros ativos`}
        >
          {activeCount}
        </span>
      )}
    </button>
  )
}
