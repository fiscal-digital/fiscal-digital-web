/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

type Locale = (typeof routing.locales)[number]

export interface OgCopy {
  'pt': { eyebrow: string; title: string; sub: string }
  en: { eyebrow: string; title: string; sub: string }
}

export function ogGenerateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export function resolveLocale(locale: string): Locale {
  return (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale
}

/**
 * Renderiza OG image (1200x630) com identidade visual Fiscal Digital.
 * - Fundo deepTeal, accent civicAmber (brand/colors.json)
 * - Wordmark + tagline + slug da página
 */
export function renderOgImage(copy: OgCopy[Locale]) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: '#0D4F4A',
          color: '#F8F5EE',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#F5B700',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              background: '#F5B700',
              borderRadius: 999,
            }}
          />
          {copy.eyebrow}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            {copy.title}
          </div>
          <div
            style={{
              fontSize: 30,
              opacity: 0.75,
              maxWidth: 900,
            }}
          >
            {copy.sub}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 22,
            opacity: 0.7,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 4,
                height: 32,
                background: '#F5B700',
              }}
            />
            fiscaldigital.org
          </div>
          <div>MIT · CC-BY 4.0</div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  )
}
