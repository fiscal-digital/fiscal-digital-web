import { ImageResponse } from 'next/og'
import { CITIES, getCityBySlug } from '@/lib/cities'
import { API_URL } from '@/lib/api'
import { routing } from '@/i18n/routing'

export const dynamic = 'force-static'
export const runtime = 'nodejs'

export const alt = 'Fiscal Digital — Fiscalização Municipal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

// ── Static generation: apenas cidades com findings reais — escalável para 5000 ─

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/cities`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const cities = (await res.json()) as Array<{ slug: string; findingsCount: number }>
      const withData = cities.filter((c) => c.findingsCount > 0).map((c) => c.slug)
      if (withData.length > 0) {
        return routing.locales.flatMap((locale) => withData.map((slug) => ({ locale, slug })))
      }
    }
  } catch { /* fallback */ }
  return routing.locales.flatMap((locale) =>
    ['caxias-do-sul', 'porto-alegre'].map((slug) => ({ locale, slug })),
  )
}

// ── findingsCount via API (timeout 2 s, fallback null) ───────────────────────

async function fetchFindingsCount(cityId: string): Promise<number | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`${API_URL}/cities`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ cityId: string; findingsCount?: number }>
    const entry = Array.isArray(data) ? data.find((c) => c.cityId === cityId) : null
    return entry?.findingsCount ?? null
  } catch {
    return null
  }
}

// ── OG Image render ───────────────────────────────────────────────────────────

export default async function Image({ params }: Props) {
  const { locale, slug } = await params
  const city = getCityBySlug(slug)

  // fallback: cidade desconhecida
  const cityName = city?.name ?? slug
  const cityUf = city?.uf ?? ''
  const cityId = city?.cityId ?? ''

  const findingsCount = cityId ? await fetchFindingsCount(cityId) : null

  const isPt = locale === 'pt-br'

  const eyebrow = isPt
    ? 'Fiscal Digital · Fiscalização Municipal'
    : 'Fiscal Digital · Municipal Oversight'

  const findingsLabel =
    findingsCount !== null
      ? isPt
        ? `${findingsCount.toLocaleString('pt-BR')} alertas detectados`
        : `${findingsCount.toLocaleString('en-US')} alerts detected`
      : isPt
        ? 'Monitorada pelo Fiscal Digital'
        : 'Monitored by Fiscal Digital'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#0D4F4A',
          color: '#F8F5EE',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#F5B700',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              background: '#F5B700',
              borderRadius: 999,
              flexShrink: 0,
            }}
          />
          {eyebrow}
        </div>

        {/* City block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* City name + UF badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 20,
              flexWrap: 'nowrap',
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                color: '#F8F5EE',
                maxWidth: 800,
              }}
            >
              {cityName}
            </div>
            {cityUf && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#F5B700',
                  background: 'rgba(245, 183, 0, 0.15)',
                  border: '2px solid #F5B700',
                  borderRadius: 999,
                  padding: '6px 20px',
                  marginBottom: 10,
                  flexShrink: 0,
                  letterSpacing: 1,
                }}
              >
                {cityUf}
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'rgba(245, 183, 0, 0.30)',
            }}
          />

          {/* Findings count or fallback */}
          <div
            style={{
              fontSize: 24,
              color: 'rgba(248, 245, 238, 0.70)',
              fontWeight: 400,
            }}
          >
            {findingsLabel}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 18,
              color: 'rgba(248, 245, 238, 0.50)',
            }}
          >
            <div
              style={{
                width: 4,
                height: 28,
                background: '#F5B700',
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            fiscaldigital.org
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
