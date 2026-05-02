'use client'

import { useState } from 'react'
import {
  Check,
  Copy,
  TelegramLogo,
  WhatsappLogo,
  XLogo,
} from '@phosphor-icons/react'

/**
 * ShareButton — botões explícitos por canal + fallback clipboard.
 * navigator.share é mobile-only e não tem WhatsApp em todos os devices,
 * então preferimos URLs canônicas de cada canal:
 *  - https://wa.me/?text=... (WhatsApp)
 *  - https://t.me/share/url?url=...&text=... (Telegram)
 *  - https://twitter.com/intent/tweet?text=...&url=... (X)
 *  - clipboard fallback universal
 */

interface ShareButtonProps {
  title: string
  text: string
  label: string
  locale: 'pt-br' | 'en'
}

const t = {
  'pt-br': { copy: 'Copiar link', copied: 'Copiado!', whatsapp: 'Compartilhar no WhatsApp', telegram: 'Compartilhar no Telegram', x: 'Compartilhar no X' },
  en: { copy: 'Copy link', copied: 'Copied!', whatsapp: 'Share on WhatsApp', telegram: 'Share on Telegram', x: 'Share on X' },
}

function getUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : ''
}

export default function ShareButton({ title, text, label, locale }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const i18n = t[locale]

  // Texto compartilhado: title + URL. Limita a 240 chars total para acomodar X.
  const shareText = `${title}${text ? ` — ${text.slice(0, 120)}` : ''}`.slice(0, 240)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // noop — alguns browsers exigem HTTPS + gesture
    }
  }

  // Cada canal abre em nova aba. URLs construídas client-side para usar
  // window.location.href atualizado (suporta hash, query, locale switch).
  const onChannel = (kind: 'whatsapp' | 'telegram' | 'x') => () => {
    const url = getUrl()
    const encoded = encodeURIComponent(url)
    const encodedText = encodeURIComponent(shareText)
    const target = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}&text=${encodedText}`,
      x:        `https://twitter.com/intent/tweet?text=${encodedText}&url=${encoded}`,
    }[kind]
    if (typeof window !== 'undefined') {
      window.open(target, '_blank', 'noopener,noreferrer,width=600,height=600')
    }
  }

  const baseBtn =
    'inline-flex items-center gap-1.5 rounded-md border border-brand-gray/20 bg-white px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-teal hover:text-brand-teal'

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={label}>
      <button type="button" onClick={onChannel('whatsapp')} aria-label={i18n.whatsapp} className={baseBtn}>
        <WhatsappLogo size={14} weight="fill" />
        WhatsApp
      </button>
      <button type="button" onClick={onChannel('telegram')} aria-label={i18n.telegram} className={baseBtn}>
        <TelegramLogo size={14} weight="fill" />
        Telegram
      </button>
      <button type="button" onClick={onChannel('x')} aria-label={i18n.x} className={baseBtn}>
        <XLogo size={14} weight="bold" />
        X
      </button>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={i18n.copy}
        className={`${baseBtn} bg-brand-teal text-brand-paper`}
      >
        {copied ? (
          <>
            <Check size={14} weight="bold" />
            {i18n.copied}
          </>
        ) : (
          <>
            <Copy size={14} weight="bold" />
            {i18n.copy}
          </>
        )}
      </button>
    </div>
  )
}
