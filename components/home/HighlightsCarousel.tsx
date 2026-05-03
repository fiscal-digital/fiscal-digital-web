'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CaretLeft, CaretRight, Spinner, Warning } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import { getRiskLevel, getRiskLabel } from '@/lib/brand'
import { API_URL } from '@/lib/api'
import { type ApiFinding, findingIdToSlug, findingTypeLabel } from '@/lib/findings'

interface Props {
  locale: 'pt-br' | 'en'
}

type FetchState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'ok'; items: ApiFinding[] }

const AUTOPLAY_DELAY = 6000

// Risk level → Tailwind class map (avoids dynamic string interpolation)
const RISK_BADGE_CLASSES: Record<string, string> = {
  critical: 'bg-brand-danger/10 text-brand-danger',
  alert:    'bg-brand-amber/15 text-brand-ink',
  low:      'bg-brand-success/10 text-brand-success',
  info:     'bg-brand-gray/10 text-brand-gray',
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

function cleanNarrative(raw: string): string {
  return raw
    .split('\n')
    .filter((line) => !/^\*{1,2}[^*\n]+\*{1,2}$/.test(line.trim()))
    .filter((line) => !/^#{1,6}\s/.test(line))
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function HighlightsCarousel({ locale }: Props) {
  const t = useTranslations('home.highlights')

  const [state, setState] = useState<FetchState>({ status: 'loading' })
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch
  useEffect(() => {
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const res = await fetch(`${API_URL}/alerts?size=8`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          if (!cancelled) setState({ status: 'error' })
          return
        }
        const data = (await res.json()) as { items?: ApiFinding[] } | ApiFinding[]
        const items: ApiFinding[] = Array.isArray(data) ? data : (data.items ?? [])
        if (cancelled) return
        if (items.length === 0) {
          setState({ status: 'empty' })
        } else {
          setState({ status: 'ok', items })
        }
      } catch {
        if (!cancelled) setState({ status: 'error' })
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const total = state.status === 'ok' ? state.items.length : 0

  // Scroll APENAS horizontal dentro do container — nunca usar scrollIntoView,
  // que faz a página inteira pular verticalmente para trazer o slide à
  // viewport (bug crítico no auto-play: a cada 6s a home pulava de scroll).
  const scrollToSlide = useCallback((index: number) => {
    const list = listRef.current
    if (!list) return
    const slide = list.children[index] as HTMLElement | undefined
    if (!slide) return
    list.scrollTo({ left: slide.offsetLeft - list.offsetLeft, behavior: 'smooth' })
  }, [])

  const goTo = useCallback(
    (index: number) => {
      const next = (index + total) % total
      setCurrent(next)
      scrollToSlide(next)
    },
    [total, scrollToSlide],
  )

  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])
  const goNext = useCallback(() => goTo(current + 1), [current, goTo])

  // Auto-play
  useEffect(() => {
    if (state.status !== 'ok' || paused || total <= 1) return
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % total
        scrollToSlide(next)
        return next
      })
    }, AUTOPLAY_DELAY)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [state.status, paused, total])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
    },
    [goPrev, goNext],
  )

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state.status === 'loading') {
    return (
      <div className="flex min-h-[200px] items-center justify-center gap-3 rounded-xl border border-brand-gray/15 bg-white text-brand-gray">
        <Spinner size={20} className="animate-spin" aria-hidden="true" />
        <span className="text-sm">…</span>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state.status === 'error') {
    return (
      <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-brand-gray/15 bg-white px-6 py-10 text-center">
        <Warning size={24} className="text-brand-amber" aria-hidden="true" />
        <p className="text-sm text-brand-gray">{t('error')}</p>
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (state.status === 'empty') {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-brand-gray/15 bg-white px-6 py-10 text-center">
        <p className="text-sm text-brand-gray">{t('empty')}</p>
      </div>
    )
  }

  const { items } = state

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t('title')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40 rounded-xl"
    >
      {/* Slide list */}
      <ul
        ref={listRef}
        className="flex snap-x snap-mandatory overflow-x-hidden scroll-smooth rounded-xl"
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((finding, idx) => {
          const slug = findingIdToSlug(finding.id)
          const href = `/${locale}/alertas/${slug}`
          const typeLabel = findingTypeLabel(finding.type, locale)
          const riskLevel = getRiskLevel(finding.riskScore)
          const riskLabelText = getRiskLabel(finding.riskScore, locale)
          const badgeClass = RISK_BADGE_CLASSES[riskLevel] ?? RISK_BADGE_CLASSES['info']
          const narrative = finding.narrative
            ? truncate(cleanNarrative(finding.narrative), 120)
            : ''
          const isActive = idx === current

          return (
            <li
              key={finding.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} / ${items.length}`}
              aria-hidden={!isActive}
              className="min-w-full snap-start"
            >
              <Link
                href={href}
                prefetch
                className="flex flex-col gap-3 rounded-xl border border-brand-gray/15 bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                tabIndex={isActive ? 0 : -1}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                    {typeLabel}
                  </span>
                  <span className="rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-semibold text-brand-teal">
                    {riskLabelText} · {finding.riskScore}
                  </span>
                </div>

                {/* City / state */}
                <p className="text-sm font-semibold text-brand-ink">
                  {finding.city}
                  {finding.state && (
                    <span className="ml-1.5 font-normal text-brand-gray">
                      · {finding.state}
                    </span>
                  )}
                </p>

                {/* Narrative snippet */}
                {narrative && (
                  <p className="text-sm leading-relaxed text-brand-gray">
                    {narrative}
                  </p>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Controls */}
      {total > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4 px-1">
          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label={t('prev_aria')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-gray/20 bg-white text-brand-ink transition-colors hover:border-brand-teal hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <CaretLeft size={14} weight="bold" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t('next_aria')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-gray/20 bg-white text-brand-ink transition-colors hover:border-brand-teal hover:text-brand-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <CaretRight size={14} weight="bold" aria-hidden="true" />
            </button>
          </div>

          {/* Position indicator */}
          <span className="text-xs text-brand-gray" aria-live="polite" aria-atomic="true">
            {t('position', { current: current + 1, total })}
          </span>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                aria-hidden="true"
                tabIndex={-1}
                className={`h-1.5 rounded-full transition-all ${
                  idx === current
                    ? 'w-4 bg-brand-teal'
                    : 'w-1.5 bg-brand-gray/30 hover:bg-brand-gray/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
