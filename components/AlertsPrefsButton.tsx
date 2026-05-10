'use client'

import { useEffect, useRef, useState } from 'react'
import { Gear, GridFour, List } from '@phosphor-icons/react'
import type { ViewOption } from '@/lib/hooks/useAlertsQueryParams'

interface AlertsPrefsButtonProps {
  limit: number
  view: ViewOption
  onLimitChange: (limit: number) => void
  onViewChange: (view: ViewOption) => void
  limitOptions: number[]
  labels: {
    button: string
    perPage: string
    view: string
    grid: string
    list: string
  }
}

export function AlertsPrefsButton({
  limit,
  view,
  onLimitChange,
  onViewChange,
  limitOptions,
  labels,
}: AlertsPrefsButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-gray/10 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={labels.button}
      >
        <Gear size={14} weight="bold" />
        {labels.button}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={labels.button}
          className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-brand-gray/15 bg-white p-4 shadow-lg"
        >
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-gray">
              {labels.perPage}
            </p>
            <div className="inline-flex w-full" role="group" aria-label={labels.perPage}>
              {limitOptions.map((opt, i) => {
                const active = limit === opt
                const isFirst = i === 0
                const isLast = i === limitOptions.length - 1
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onLimitChange(opt)}
                    aria-pressed={active}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isFirst ? 'rounded-l-md' : ''
                    } ${isLast ? 'rounded-r-md' : ''} ${
                      active
                        ? 'bg-brand-teal text-brand-paper'
                        : 'border border-brand-gray/25 bg-white text-brand-ink hover:bg-brand-gray/10'
                    } ${!isFirst ? '-ml-px' : ''}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-gray">
              {labels.view}
            </p>
            <div className="inline-flex w-full" role="group" aria-label={labels.view}>
              <button
                type="button"
                onClick={() => onViewChange('grid')}
                aria-pressed={view === 'grid'}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-l-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === 'grid'
                    ? 'bg-brand-teal text-brand-paper'
                    : 'border border-brand-gray/25 bg-white text-brand-ink hover:bg-brand-gray/10'
                }`}
              >
                <GridFour size={14} weight="bold" />
                {labels.grid}
              </button>
              <button
                type="button"
                onClick={() => onViewChange('list')}
                aria-pressed={view === 'list'}
                className={`-ml-px flex-1 inline-flex items-center justify-center gap-1.5 rounded-r-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === 'list'
                    ? 'bg-brand-teal text-brand-paper'
                    : 'border border-brand-gray/25 bg-white text-brand-ink hover:bg-brand-gray/10'
                }`}
              >
                <List size={14} weight="bold" />
                {labels.list}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
