'use client'

import { MagnifyingGlass } from '@phosphor-icons/react'
import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, 300)
  // Skip initial onChange no mount (LRN-20260509-006/008): sem isso, monta com
  // value='' → debounce → onChange('') → setParams({search:'',page:1}) →
  // router.push(?page=1) parasita que cria race com qualquer nav. subsequente
  // (links, click em filtros). Só dispara onChange a partir da 2ª execução
  // do effect (i.e., quando o usuário muda o input).
  const isFirstRun = useRef(true)

  // Callback prop tipicamente é arrow inline do parent (nova ref por render).
  // Inclui-la nas deps causa loop infinito de re-renders → "página piscando"
  // / reload aparente. O efeito precisa rodar apenas quando o valor debounced
  // muda; chamamos onChange como side-effect.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    onChange(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  return (
    <div className="flex-1">
      <div className="relative">
        <MagnifyingGlass
          size={16}
          weight="bold"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray"
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-brand-gray/25 bg-white py-2 pl-9 pr-3 text-sm text-brand-ink placeholder-brand-gray/50 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          aria-label="Buscar alertas"
        />
      </div>
    </div>
  )
}
