'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle, EnvelopeSimple, WarningCircle } from '@phosphor-icons/react'
import { API_URL } from '@/lib/api'

interface Props {
  /** Origem da inscrição (ex: 'home', 'apoie', 'sobre') — vai junto no payload. */
  source?: string
  locale: 'pt-br' | 'en-us'
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * NewsletterForm — captura de email para futura newsletter.
 *
 * Envia POST para /newsletter (Lambda API). Idempotente do lado do
 * servidor (mesmo email duas vezes não duplica). Estado de sucesso
 * persiste 8s antes de voltar a aceitar nova inscrição na mesma sessão.
 *
 * Anti-bot — honeypot: campo `website` invisível para humanos (CSS+aria),
 * indexado por bots de form-fill. Se preenchido, request é silenciosamente
 * rejeitada no backend (200 OK falso para não revelar a heurística).
 *
 * Acessibilidade:
 *  - aria-live="polite" na mensagem de status
 *  - input com label visível e descrição de erro vinculada via aria-describedby
 */
export default function NewsletterForm({ source = 'home', locale }: Props) {
  const t = useTranslations('home.newsletter')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot — humanos não veem
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      setStatus('error')
      setErrorMsg(t('invalid'))
      return
    }
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch(`${API_URL}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale, source, website }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('success')
      setEmail('')
      // Volta a aceitar nova inscrição depois de 8s
      setTimeout(() => setStatus('idle'), 8000)
    } catch {
      setStatus('error')
      setErrorMsg(t('error'))
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-2 rounded-lg bg-brand-teal/10 px-6 py-4 text-sm font-semibold text-brand-teal"
      >
        <CheckCircle size={20} weight="fill" />
        <span>{t('success')}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        {t('label')}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <EnvelopeSimple
            size={18}
            weight="bold"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray"
            aria-hidden="true"
          />
          <input
            id="newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder={t('placeholder')}
            aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
            aria-invalid={status === 'error'}
            disabled={status === 'submitting'}
            className="w-full rounded-md border border-brand-gray/25 bg-white py-3 pl-10 pr-3 text-sm text-brand-ink placeholder:text-brand-gray focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30 disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-teal px-5 py-3 text-sm font-semibold text-brand-paper transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === 'submitting' ? t('submitting') : t('cta')}
        </button>
      </div>

      {/* Honeypot — invisível para humanos, atrai bots de form-fill.
          Combinação de técnicas para ser ignorado por screen readers e tab
          mas continuar sendo um campo de texto que bots vão tentar preencher. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <label htmlFor="newsletter-website">Leave this field empty</label>
        <input
          id="newsletter-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status === 'error' && (
        <p
          id="newsletter-error"
          role="alert"
          aria-live="polite"
          className="mt-2 flex items-center gap-1.5 text-xs text-brand-danger"
        >
          <WarningCircle size={14} weight="fill" />
          {errorMsg}
        </p>
      )}
      <p className="mt-3 text-center text-xs text-brand-gray">{t('privacy')}</p>
    </form>
  )
}
