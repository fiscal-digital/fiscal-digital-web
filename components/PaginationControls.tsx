'use client'

import { CaretLeft, CaretRight } from '@phosphor-icons/react'

interface PaginationControlsProps {
  page: number
  totalPages: number
  totalCount: number
  limit: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ page, totalPages, totalCount, limit, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, totalCount)

  // Gera números de página (máximo 5 vizinhos)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const range = 2

    for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
      pages.push(i)
    }

    if (pages[0] !== 1) {
      pages.unshift('...')
      pages.unshift(1)
    }
    if (pages[pages.length - 1] !== totalPages) {
      pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row" aria-label="Paginação">
      <p className="text-sm text-brand-gray">
        Mostrando {start}-{end} de {totalCount}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-md border border-brand-gray/25 bg-white p-2 text-brand-ink disabled:cursor-not-allowed disabled:opacity-50 hover:bg-brand-gray/10 transition-colors"
          aria-label="Página anterior"
        >
          <CaretLeft size={16} weight="bold" />
        </button>

        {pageNumbers.map((num, idx) => (
          <div key={idx}>
            {num === '...' ? (
              <span className="px-2 py-2 text-brand-gray">…</span>
            ) : (
              <button
                onClick={() => onPageChange(num as number)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  page === num
                    ? 'bg-brand-teal text-brand-paper'
                    : 'border border-brand-gray/25 bg-white text-brand-ink hover:bg-brand-gray/10'
                }`}
                aria-current={page === num ? 'page' : undefined}
              >
                {num}
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-md border border-brand-gray/25 bg-white p-2 text-brand-ink disabled:cursor-not-allowed disabled:opacity-50 hover:bg-brand-gray/10 transition-colors"
          aria-label="Próxima página"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </nav>
  )
}
