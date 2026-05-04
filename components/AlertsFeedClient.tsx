'use client'

import { Suspense } from 'react'
import AlertsFeed from './AlertsFeed'

interface AlertsFeedClientProps {
  locale: string
  cityId?: string
  hideKpis?: boolean
}

export default function AlertsFeedClient({ locale, cityId, hideKpis }: AlertsFeedClientProps) {
  return (
    <Suspense fallback={<div className="text-brand-gray text-center py-12">Carregando...</div>}>
      <AlertsFeed locale={locale} cityId={cityId} hideKpis={hideKpis} />
    </Suspense>
  )
}
