'use client'

import { MagnifyingGlass } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, 300)

  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue, onChange])

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
