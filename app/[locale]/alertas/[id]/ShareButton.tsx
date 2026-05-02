'use client'

import { useState } from 'react'
import { Share, Check, Copy } from '@phosphor-icons/react'

/**
 * ShareButton — Web Share API com fallback para clipboard.
 * Mantido como client component dedicado para isolar a interatividade
 * do resto da página do alerta (server component).
 */

interface ShareButtonProps {
  title: string
  text: string
  label: string
  locale: 'pt' | 'en'
}

export default function ShareButton({ title, text, label, locale }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const t = {
    pt: { copy: 'Copiar link', copied: 'Copiado!' },
    en: { copy: 'Copy link',   copied: 'Copied!' },
  }[locale]

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // Cancelado pelo usuário ou não-suportado — cai pro clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // noop
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
    >
      {copied ? (
        <>
          <Check size={14} weight="bold" />
          {t.copied}
        </>
      ) : (
        <>
          <Share size={14} weight="bold" />
          {t.copy}
        </>
      )}
    </button>
  )
}
