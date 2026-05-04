'use client'

import { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  ShareNetwork,
  TelegramLogo,
  WhatsappLogo,
  XLogo,
} from '@phosphor-icons/react'

/**
 * ShareButton — UH-WEB-005.
 *
 * Estratégia mobile-first:
 *  - Mobile (Web Share API disponível): 1 botão "Compartilhar" abre menu nativo
 *    do sistema (cobre WhatsApp, Telegram, AirDrop, e-mail, etc.) + botão Copy.
 *  - Desktop / sem `navigator.share`: 4 botões explícitos por canal —
 *    https://wa.me/?text=… · https://t.me/share/url?… · https://twitter.com/intent/tweet?…
 *    + botão Copy (clipboard).
 *
 * Detecção é client-side post-mount para não quebrar SSR/SSG. Default render
 * é o fallback de 4 canais — isso evita "flash" na primeira pintura mobile e
 * mantém a UI funcional caso JS não execute.
 */

interface ShareButtonProps {
  title: string
  text: string
  label: string
  locale: 'pt-br' | 'en-us'
}

const t = {
  'pt-br': {
    copy: 'Copiar link',
    copied: 'Copiado!',
    whatsapp: 'Compartilhar no WhatsApp',
    telegram: 'Compartilhar no Telegram',
    x: 'Compartilhar no X',
    native: 'Compartilhar',
    nativeAria: 'Abrir menu de compartilhamento do sistema',
  },
  'en-us': {
    copy: 'Copy link',
    copied: 'Copied!',
    whatsapp: 'Share on WhatsApp',
    telegram: 'Share on Telegram',
    x: 'Share on X',
    native: 'Share',
    nativeAria: 'Open system share menu',
  },
}

function getUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : ''
}

export default function ShareButton({ title, text, label, locale }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [hasNativeShare, setHasNativeShare] = useState(false)
  const i18n = t[locale]

  // Detect Web Share API post-mount (evita SSR mismatch)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setHasNativeShare(true)
    }
  }, [])

  const shareText = `${title}${text ? ` — ${text.slice(0, 120)}` : ''}`.slice(0, 240)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // alguns browsers exigem HTTPS + gesture
    }
  }

  const handleNativeShare = async () => {
    const url = getUrl()
    try {
      await navigator.share({ title, text: shareText, url })
    } catch (err) {
      // AbortError = usuário cancelou — silencioso.
      // Outros erros: fallback para clipboard.
      if ((err as { name?: string })?.name !== 'AbortError') {
        handleCopy()
      }
    }
  }

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

  const filledBtn =
    'inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90'

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={label}>
      {hasNativeShare ? (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label={i18n.nativeAria}
          className={filledBtn}
        >
          <ShareNetwork size={14} weight="bold" />
          {i18n.native}
        </button>
      ) : (
        <>
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
        </>
      )}

      <button
        type="button"
        onClick={handleCopy}
        aria-label={i18n.copy}
        className={hasNativeShare ? baseBtn : filledBtn}
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
