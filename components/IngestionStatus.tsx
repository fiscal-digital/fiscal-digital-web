'use client'

import { useEffect, useState } from 'react'
import { Info } from '@phosphor-icons/react/dist/ssr'
import { API_URL } from '@/lib/api'

interface StatsResponse {
  lastFindingAt: string | null
}

const GAP_THRESHOLD_DAYS = 7

interface Props {
  locale: string
}

/**
 * Badge transparente que sinaliza gap de ingestão. Aparece apenas quando
 * o último finding publicado tem mais de 7 dias — alinhado ao princípio
 * "transparência do algoritmo": comunica abertamente quando o engine
 * está aguardando dados novos do Querido Diário, sem esconder a
 * dependência externa do leitor.
 *
 * Some sozinho quando o pipeline volta a publicar regularmente.
 */
export default function IngestionStatus({ locale }: Props) {
  const [lastIso, setLastIso] = useState<string | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/stats`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: StatsResponse | null) => {
        if (!d?.lastFindingAt) {
          setShow(false)
          return
        }
        const lastTs = new Date(d.lastFindingAt).getTime()
        const days = (Date.now() - lastTs) / 86400000
        if (days >= GAP_THRESHOLD_DAYS) {
          setLastIso(d.lastFindingAt)
          setShow(true)
        }
      })
      .catch(() => {})
  }, [])

  if (!show || !lastIso) return null

  const lang = locale === 'en-us' ? 'en-US' : 'pt-BR'
  const lastDate = new Intl.DateTimeFormat(lang, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(lastIso))

  const text =
    locale === 'en-us'
      ? `Engine waiting for new gazettes from Querido Diário (last published finding: ${lastDate}).`
      : `Engine aguardando novos diários do Querido Diário (último alerta publicado: ${lastDate}).`

  return (
    <div className="mt-4 flex items-start gap-2 rounded-md border border-brand-amber/30 bg-brand-amber/10 p-3 text-xs text-brand-paper/90">
      <Info size={16} weight="fill" className="mt-0.5 shrink-0 text-brand-amber" />
      <span>{text}</span>
    </div>
  )
}
