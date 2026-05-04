'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import type { Finding } from './AlertsFeed'
import { FindingCard } from './FindingCard'

interface AlertsGridProps {
  findings: Finding[]
  typeLabel: (type: string) => string
}

export function AlertsGrid({ findings, typeLabel }: AlertsGridProps) {
  const t = useTranslations('alertas')
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'pt-br'

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {findings.map((f) => (
        <FindingCard
          key={f.id}
          finding={f}
          typeLabel={typeLabel}
          t={t}
          locale={locale as 'pt-br' | 'en-us'}
        />
      ))}
    </div>
  )
}
