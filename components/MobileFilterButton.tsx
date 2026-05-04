'use client'

import { FunnelSimple } from '@phosphor-icons/react'

interface MobileFilterButtonProps {
  onClick: () => void
}

export function MobileFilterButton({ onClick }: MobileFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-gray/10"
      aria-label="Abrir filtros"
    >
      <FunnelSimple size={14} weight="bold" />
      Filtros
    </button>
  )
}
