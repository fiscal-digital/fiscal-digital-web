'use client'

import { Suspense } from 'react'
import AlertsFeed from './AlertsFeed'

interface AlertsFeedClientProps {
  locale: string
  cityId?: string
}

export default function AlertsFeedClient({ locale, cityId }: AlertsFeedClientProps) {
  return (
    <Suspense fallback={<div className="text-brand-gray text-center py-12">Carregando...</div>}>
      <AlertsFeed locale={locale} cityId={cityId} />
    </Suspense>
  )
}
