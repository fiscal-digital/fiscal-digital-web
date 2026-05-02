'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RssSimple, Copy, Check } from '@phosphor-icons/react'
import { API_URL } from '@/lib/api'

const BR_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

export default function RssSubscribe() {
  const t = useTranslations('alertas.rss')
  const [stateFilter, setStateFilter] = useState('')
  const [copied, setCopied] = useState(false)

  const rssUrl = stateFilter
    ? `${API_URL}/rss?state=${stateFilter}`
    : `${API_URL}/rss`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rssUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text in the input
      const input = document.getElementById('rss-url-input') as HTMLInputElement | null
      input?.select()
    }
  }

  return (
    <aside className="rounded-xl border border-brand-gray/15 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <RssSimple size={20} weight="fill" className="text-brand-amber" />
        <h3 className="font-semibold text-brand-ink">{t('title')}</h3>
      </div>
      <p className="mb-4 text-sm text-brand-gray">{t('description')}</p>

      {/* State filter */}
      <div className="mb-3">
        <label htmlFor="rss-state-filter" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-gray">
          {t('byState')}
        </label>
        <select
          id="rss-state-filter"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="w-full rounded-md border border-brand-gray/25 bg-brand-paper px-3 py-2 text-sm text-brand-ink focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="">{t('all')}</option>
          {BR_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* URL display + copy */}
      <div className="mb-3 flex gap-2">
        <input
          id="rss-url-input"
          type="text"
          readOnly
          value={rssUrl}
          className="min-w-0 flex-1 rounded-md border border-brand-gray/25 bg-brand-paper px-3 py-2 font-mono text-xs text-brand-gray focus:outline-none"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={handleCopy}
          aria-label={copied ? t('copied') : t('copy')}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
        >
          {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
          <span>{copied ? t('copied') : t('copy')}</span>
        </button>
      </div>

      {/* Subscribe link */}
      <a
        href={rssUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-3 block rounded-md border border-brand-amber/40 px-3 py-2 text-center text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-amber/10"
      >
        {t('all')} →
      </a>

      <p className="text-xs text-brand-gray">{t('compatible')}</p>
    </aside>
  )
}
