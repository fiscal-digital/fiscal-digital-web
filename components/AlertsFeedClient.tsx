'use client'

import { Suspense } from 'react'
import AlertsFeed from './AlertsFeed'

interface AlertsFeedClientProps {
  locale: string
  cityId?: string
  hideKpis?: boolean
}

/**
 * Suspense fallback — DEVE espelhar o estado `loading=true` do AlertsFeed
 * (mesmo grid de skeletons). Se for texto "Carregando..." enquanto o JS
 * ainda não hidratou, e depois skeletons após hydration, e depois cards
 * reais, o usuário vê 3 transições e percebe como "página piscando".
 */
function FeedSkeleton({ hideKpis }: { hideKpis?: boolean }) {
  return (
    <div>
      {!hideKpis && (
        <dl className={`mb-6 grid gap-3 ${'sm:grid-cols-3'}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-brand-gray/15 bg-white p-4">
              <div className="mb-3 h-3 w-24 rounded bg-brand-gray/15" />
              <div className="h-9 w-32 rounded bg-brand-gray/15" />
            </div>
          ))}
        </dl>
      )}
      <div className="mb-6 hidden sm:block">
        <div className="flex items-end gap-3">
          <div className="h-10 flex-1 animate-pulse rounded-md bg-brand-gray/10" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-brand-amber/20" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-brand-gray/15 bg-white p-5">
            <div className="mb-3 flex gap-2">
              <div className="h-5 w-28 rounded-pill bg-brand-gray/15" />
              <div className="h-5 w-16 rounded-pill bg-brand-gray/10" />
            </div>
            <div className="mb-2 h-4 w-3/4 rounded bg-brand-gray/15" />
            <div className="mb-1 h-3 w-full rounded bg-brand-gray/10" />
            <div className="h-3 w-5/6 rounded bg-brand-gray/10" />
            <div className="mt-4 flex justify-between">
              <div className="h-3 w-20 rounded bg-brand-gray/10" />
              <div className="h-3 w-24 rounded bg-brand-gray/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AlertsFeedClient({ locale, cityId, hideKpis }: AlertsFeedClientProps) {
  return (
    <Suspense fallback={<FeedSkeleton hideKpis={hideKpis} />}>
      <AlertsFeed locale={locale} cityId={cityId} hideKpis={hideKpis} />
    </Suspense>
  )
}
