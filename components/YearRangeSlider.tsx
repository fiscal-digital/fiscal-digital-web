'use client'

import { CalendarBlank } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

interface YearRangeSliderProps {
  yearMin: number
  yearMax: number
  minYear?: number
  maxYear?: number
  onChange: (next: { yearMin: number; yearMax: number }) => void
  label: string
}

/**
 * Dual-thumb range slider acessível para seleção de intervalo de anos.
 *
 * - Drag com mouse e touch
 * - Teclado: ArrowLeft/Right movem ±1, ArrowUp/Down também, Home/End vão aos
 *   extremos. PageUp/PageDown movem ±5.
 * - aria-valuemin/max/now nos thumbs (role="slider"), atualizados a cada
 *   mudança para leitores de tela.
 * - Garantia min ≤ max embutida — não é possível cruzar os thumbs.
 */
export function YearRangeSlider({
  yearMin,
  yearMax,
  minYear = 2021,
  maxYear,
  onChange,
  label,
}: YearRangeSliderProps) {
  const currentYear = new Date().getFullYear()
  const max = maxYear ?? currentYear
  const trackRef = useRef<HTMLDivElement>(null)

  const years = useMemo(() => {
    const out: number[] = []
    for (let y = minYear; y <= max; y++) out.push(y)
    return out
  }, [minYear, max])

  const pctFor = useCallback(
    (year: number) => {
      if (max === minYear) return 0
      return ((year - minYear) / (max - minYear)) * 100
    },
    [minYear, max],
  )

  const yearFromClientX = useCallback(
    (clientX: number): number => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return minYear
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const idx = Math.round(pct * (years.length - 1))
      return years[idx]
    },
    [years, minYear],
  )

  function startDrag(isMin: boolean, startX: number) {
    const move = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0]?.clientX : e.clientX
      if (x == null) return
      const y = yearFromClientX(x)
      if (isMin) {
        onChange({ yearMin: Math.min(y, yearMax), yearMax })
      } else {
        onChange({ yearMin, yearMax: Math.max(y, yearMin) })
      }
    }
    const up = () => {
      window.removeEventListener('mousemove', move as never)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move as never)
      window.removeEventListener('touchend', up)
    }
    window.addEventListener('mousemove', move as never)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move as never)
    window.addEventListener('touchend', up)
    // Aplica primeiro evento (clique direto no thumb)
    const y = yearFromClientX(startX)
    if (isMin) {
      onChange({ yearMin: Math.min(y, yearMax), yearMax })
    } else {
      onChange({ yearMin, yearMax: Math.max(y, yearMin) })
    }
  }

  function onKeyDown(e: React.KeyboardEvent, isMin: boolean) {
    const cur = isMin ? yearMin : yearMax
    let next = cur
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = Math.max(minYear, cur - 1)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        next = Math.min(max, cur + 1)
        break
      case 'PageDown':
        next = Math.max(minYear, cur - 5)
        break
      case 'PageUp':
        next = Math.min(max, cur + 5)
        break
      case 'Home':
        next = minYear
        break
      case 'End':
        next = max
        break
      default:
        return
    }
    e.preventDefault()
    if (isMin) {
      onChange({ yearMin: Math.min(next, yearMax), yearMax })
    } else {
      onChange({ yearMin, yearMax: Math.max(next, yearMin) })
    }
  }

  // Trilha com clique direto seleciona thumb mais próximo e move pra lá.
  function onTrackClick(e: React.MouseEvent) {
    const y = yearFromClientX(e.clientX)
    const distMin = Math.abs(y - yearMin)
    const distMax = Math.abs(y - yearMax)
    if (distMin <= distMax) {
      onChange({ yearMin: Math.min(y, yearMax), yearMax })
    } else {
      onChange({ yearMin, yearMax: Math.max(y, yearMin) })
    }
  }

  useEffect(() => {
    // Sanity: se vier um yearMax >= max (próximo ano), clamp para max.
    if (yearMax > max) {
      onChange({ yearMin, yearMax: max })
    }
  }, [yearMax, max, yearMin, onChange])

  const display = yearMin === yearMax ? `${yearMin}` : `${yearMin}–${yearMax}`

  return (
    <div className="flex flex-col gap-1 min-w-[220px]">
      <label className="text-xs font-semibold uppercase tracking-wider text-brand-gray inline-flex items-center gap-1.5">
        <CalendarBlank size={12} weight="bold" />
        {label}
        <span className="ml-1 font-mono normal-case text-brand-ink">{display}</span>
      </label>
      <div className="px-2 py-3">
        <div
          ref={trackRef}
          className="relative h-1 rounded-full bg-brand-gray/20 cursor-pointer"
          onMouseDown={onTrackClick}
        >
          <div
            className="absolute h-1 rounded-full bg-brand-teal"
            style={{
              left: `${pctFor(yearMin)}%`,
              width: `${pctFor(yearMax) - pctFor(yearMin)}%`,
            }}
          />
          <ThumbHandle
            isMin
            year={yearMin}
            min={minYear}
            max={max}
            pct={pctFor(yearMin)}
            onMouseDown={(e) => {
              e.stopPropagation()
              startDrag(true, e.clientX)
            }}
            onTouchStart={(e) => {
              const x = e.touches[0]?.clientX
              if (x != null) startDrag(true, x)
            }}
            onKeyDown={(e) => onKeyDown(e, true)}
            ariaLabel="Ano de início"
          />
          <ThumbHandle
            isMin={false}
            year={yearMax}
            min={minYear}
            max={max}
            pct={pctFor(yearMax)}
            onMouseDown={(e) => {
              e.stopPropagation()
              startDrag(false, e.clientX)
            }}
            onTouchStart={(e) => {
              const x = e.touches[0]?.clientX
              if (x != null) startDrag(false, x)
            }}
            onKeyDown={(e) => onKeyDown(e, false)}
            ariaLabel="Ano de fim"
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-mono text-brand-gray">
          {years.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ThumbHandleProps {
  isMin: boolean
  year: number
  min: number
  max: number
  pct: number
  onMouseDown: (e: React.MouseEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  ariaLabel: string
}

function ThumbHandle({
  year,
  min,
  max,
  pct,
  onMouseDown,
  onTouchStart,
  onKeyDown,
  ariaLabel,
}: ThumbHandleProps) {
  return (
    <div
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={year}
      aria-valuetext={String(year)}
      tabIndex={0}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onKeyDown={onKeyDown}
      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-brand-teal bg-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber focus-visible:ring-offset-1 active:cursor-grabbing"
      style={{ left: `${pct}%` }}
    />
  )
}
