'use client'

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

export function useAlertsQueryParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  const params: AlertsParams = {
    search: searchParams.get('search') ?? '',
    state: searchParams.get('state') ?? '',
    city: searchParams.get('city') ?? '',
    type: searchParams.get('type') ?? '',
    yearMin: parseInt(searchParams.get('yearMin') ?? '2021', 10),
    yearMax: parseInt(searchParams.get('yearMax') ?? String(currentYear), 10),
    sort: (searchParams.get('sort') ?? 'dateDesc') as SortOption,
    page: parseInt(searchParams.get('page') ?? '1', 10),
    limit: parseInt(searchParams.get('limit') ?? '20', 10),
    view: (searchParams.get('view') ?? 'grid') as ViewOption,
  }

  const setParams = (updates: Partial<AlertsParams>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) {
        newParams.delete(k)
      } else {
        newParams.set(k, String(v))
      }
    })
    router.push(`${pathname}?${newParams.toString()}`)
  }

  return { params, setParams }
}
