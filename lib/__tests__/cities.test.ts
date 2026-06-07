import { describe, expect, it } from 'vitest'
import {
  activeCities,
  activeCount,
  citiesByRegion,
  getCity,
  regionOf,
  slugForCityId,
} from '@/lib/cities'

describe('city helpers', () => {
  it('maps states to IBGE regions case-insensitively', () => {
    expect(regionOf('rs')).toBe('S')
    expect(regionOf('SP')).toBe('SE')
    expect(regionOf('xx')).toBeUndefined()
  })

  it('keeps active city helpers consistent', () => {
    const cities = activeCities()

    expect(cities).toHaveLength(activeCount())
    expect(cities.every((city) => city.active)).toBe(true)
  })

  it('looks up city ids, slugs, and region buckets', () => {
    expect(getCity('4305108')?.slug).toBe('caxias-do-sul')
    expect(slugForCityId('unknown')).toBe('unknown')
    expect(citiesByRegion().S.some((city) => city.cityId === '4305108')).toBe(true)
  })
})
