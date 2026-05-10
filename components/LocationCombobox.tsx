'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CaretDown, MapPin, X } from '@phosphor-icons/react'
import { CITIES } from '@/lib/cities'

const BR_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

interface LocationComboboxProps {
  state: string
  city: string
  onChange: (next: { state: string; city: string }) => void
  allLabel: string
  placeholder: string
  searchPlaceholder: string
  stateBadge: string
}

interface ListItem {
  kind: 'state' | 'city'
  state: string
  cityId: string
  label: string
}

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()
}

export function LocationCombobox({
  state,
  city,
  onChange,
  allLabel,
  placeholder,
  searchPlaceholder,
  stateBadge,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useRef(`loc-listbox-${Math.random().toString(36).slice(2, 8)}`)

  const cityById = useMemo(() => {
    const map = new Map<string, { name: string; uf: string }>()
    Object.values(CITIES).forEach((c) => {
      if (c.active) map.set(c.cityId, { name: c.name, uf: c.uf })
    })
    return map
  }, [])

  const items = useMemo<ListItem[]>(() => {
    const q = normalize(query)
    const list: ListItem[] = []
    BR_STATES.forEach((uf) => {
      if (!q || normalize(uf).includes(q)) {
        list.push({ kind: 'state', state: uf, cityId: '', label: uf })
      }
    })
    Object.values(CITIES)
      .filter((c) => c.active)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .forEach((c) => {
        if (!q || normalize(c.name).includes(q) || normalize(c.uf).includes(q)) {
          list.push({ kind: 'city', state: c.uf, cityId: c.cityId, label: c.name })
        }
      })
    return list.slice(0, 50)
  }, [query])

  const buttonLabel = useMemo(() => {
    if (city) {
      const info = cityById.get(city)
      return info ? `${info.name} (${info.uf})` : allLabel
    }
    if (state) return `${state}`
    return allLabel
  }, [state, city, cityById, allLabel])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  useEffect(() => {
    if (open) {
      setActiveIdx(0)
      setQuery('')
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  function selectItem(item: ListItem) {
    if (item.kind === 'state') {
      onChange({ state: item.state, city: '' })
    } else {
      onChange({ state: item.state, city: item.cityId })
    }
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(items.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const it = items[activeIdx]
      if (it) selectItem(it)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const isFiltered = !!state || !!city

  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      <label className="text-xs font-semibold uppercase tracking-wider text-brand-gray inline-flex items-center gap-1.5">
        <MapPin size={12} weight="bold" />
        {placeholder}
      </label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-w-[220px] items-center justify-between gap-2 rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-sm text-brand-ink hover:border-brand-teal/50 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId.current}
      >
        <span className="truncate text-left">{buttonLabel}</span>
        <span className="flex items-center gap-1">
          {isFiltered && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Limpar local"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ state: '', city: '' })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange({ state: '', city: '' })
                }
              }}
              className="rounded p-0.5 text-brand-gray hover:bg-brand-gray/15 hover:text-brand-ink"
            >
              <X size={12} weight="bold" />
            </span>
          )}
          <CaretDown size={12} weight="bold" className="text-brand-gray" />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-[240px] rounded-md border border-brand-gray/15 bg-white shadow-lg">
          <div className="border-b border-brand-gray/10 p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIdx(0)
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="w-full rounded border border-brand-gray/25 bg-white px-2 py-1.5 text-sm focus:border-brand-teal focus:outline-none"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listboxId.current}
              aria-activedescendant={items[activeIdx] ? `loc-item-${activeIdx}` : undefined}
            />
          </div>
          <ul
            id={listboxId.current}
            ref={listRef}
            role="listbox"
            className="max-h-72 overflow-y-auto py-1 text-sm"
          >
            {items.length === 0 ? (
              <li className="px-3 py-2 text-xs text-brand-gray">Sem resultados</li>
            ) : (
              items.map((it, idx) => (
                <li
                  key={`${it.kind}-${it.state}-${it.cityId}`}
                  id={`loc-item-${idx}`}
                  role="option"
                  aria-selected={idx === activeIdx}
                >
                  <button
                    type="button"
                    onClick={() => selectItem(it)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left ${
                      idx === activeIdx ? 'bg-brand-paper' : 'bg-white hover:bg-brand-paper'
                    }`}
                  >
                    {it.kind === 'state' ? (
                      <>
                        <span className="rounded bg-brand-teal/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-teal">
                          {stateBadge}
                        </span>
                        <span>{it.label}</span>
                      </>
                    ) : (
                      <>
                        <span>{it.label}</span>
                        <span className="ml-auto text-xs text-brand-gray">· {it.state}</span>
                      </>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
