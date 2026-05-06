'use client'

import { useCallback, useMemo, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export type SortOption = 'dateDesc' | 'dateAsc' | 'riskDesc' | 'riskAsc' | 'valueDesc' | 'valueAsc'
export type ViewOption = 'grid' | 'list'

export interface AlertsParams {
  search: string
  state: string
  city: string
  type: string
  yearMin: number
  yearMax: number
  sort: SortOption
  page: number
  limit: number
  view: ViewOption
}

/**
 * useAlertsQueryParams — sync entre URL e estado dos filtros.
 *
 * Garantias de estabilidade (críticas para evitar loops em consumidores):
 *
 *  - `params` é memoizado com useMemo dependendo apenas dos VALORES PRIMITIVOS
 *    extraídos de searchParams. Mesmo que `useSearchParams()` retorne nova
 *    instância em algum re-render, `params` mantém referência estável quando
 *    a URL não muda — consumidores podem usar `params` em deps de useEffect
 *    sem disparar loop.
 *
 *  - `setParams` é memoizado com useCallback. Para evitar invalidar o callback
 *    sempre que `searchParams` muda (o que aconteceria em qualquer push),
 *    usamos useRef como source-of-truth. Resultado: `setParams` é
 *    REFERENCIALMENTE ESTÁVEL durante toda a vida do componente —
 *    consumidores podem passá-lo como prop ou usá-lo em deps sem medo.
 */
export function useAlertsQueryParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // currentYear é estável (snapshot do mount; mudança de ano é caso ultra-raro)
  const currentYearRef = useRef(new Date().getFullYear())

  // Extrai cada primitivo separadamente para o useMemo poder fazer comparação
  // por valor, em vez de comparar instância de searchParams.
  const search = searchParams.get('search') ?? ''
  const state = searchParams.get('state') ?? ''
  const city = searchParams.get('city') ?? ''
  const type = searchParams.get('type') ?? ''
  const yearMinStr = searchParams.get('yearMin') ?? '2021'
  const yearMaxStr = searchParams.get('yearMax') ?? ''
  const sortStr = searchParams.get('sort') ?? 'dateDesc'
  const pageStr = searchParams.get('page') ?? '1'
  const limitStr = searchParams.get('limit') ?? '20'
  const viewStr = searchParams.get('view') ?? 'grid'

  const params = useMemo<AlertsParams>(() => ({
    search,
    state,
    city,
    type,
    yearMin: parseInt(yearMinStr, 10),
    yearMax: parseInt(yearMaxStr || String(currentYearRef.current), 10),
    sort: (sortStr as SortOption),
    page: parseInt(pageStr, 10),
    limit: parseInt(limitStr, 10),
    view: (viewStr as ViewOption),
  }), [search, state, city, type, yearMinStr, yearMaxStr, sortStr, pageStr, limitStr, viewStr])

  // searchParamsRef garante que setParams seja referencialmente estável.
  // Sem isso, useCallback teria `searchParams` como dep e mudaria toda vez
  // que router.push fosse chamado — invalidando memos/effects de consumidores.
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  const setParams = useCallback((updates: Partial<AlertsParams>) => {
    const current = searchParamsRef.current
    const next = new URLSearchParams(current.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) {
        next.delete(k)
      } else {
        next.set(k, String(v))
      }
    })
    // scroll: false evita scroll-to-top a cada filtro alterado
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }, [router, pathname])

  return { params, setParams }
}
