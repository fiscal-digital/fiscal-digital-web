'use client'

import { useState } from 'react'
import { ArrowSquareOut, FilePdf, Eye, X as XIcon } from '@phosphor-icons/react'

/**
 * PdfPreview — Componente híbrido de visualização do diário oficial.
 *
 * Estratégia (validada via curl 2026-05-02):
 *   - URLs em `data.queridodiario.ok.org.br` NÃO definem X-Frame-Options nem
 *     CSP frame-ancestors → iframe é tecnicamente permitido.
 *   - Mas `Content-Type: binary/octet-stream` (não `application/pdf`) faz
 *     muitos browsers forçarem download em vez de inline. PDFs médios pesam
 *     ~7MB — hostil para mobile 3G.
 *   - Decisão: excerpt destacado é primário, iframe é progressive enhancement
 *     opt-in (carrega só quando usuário clica em "Visualizar inline").
 *
 * Garante sempre:
 *   1. Excerpt em destaque tipográfico (citação canônica).
 *   2. Link primário "Abrir no Querido Diário" (nova aba).
 *   3. Iframe sob demanda — `loading="lazy"`, fechável, com fallback explícito.
 */

interface PdfPreviewProps {
  source: string
  /**
   * URL do PDF no nosso cache CDN (gazettes.fiscaldigital.org).
   * Se presente, o iframe usa essa URL — temos controle de headers
   * (Content-Disposition: inline, X-Frame-Options: SAMEORIGIN) para
   * que o browser realmente exiba inline em vez de baixar.
   * Quando ausente, fallback para o source URL do QD direto.
   */
  cachedPdfUrl?: string | null
  excerpt?: string
  date?: string
  /** Locale para labels — defaults to 'pt-br'. */
  locale?: 'pt-br' | 'en'
}

const labels = {
  'pt-br': {
    excerpt: 'Trecho citado',
    sourceLabel: 'Fonte: Querido Diário',
    open: 'Abrir no Querido Diário',
    viewInline: 'Visualizar PDF inline',
    closeInline: 'Fechar visualização',
    inlineWarning: 'Visualizando PDF do Querido Diário. Documento original: ',
    fallback: 'Seu navegador não exibe PDFs inline. Use o link acima para abrir.',
    date: 'Data do diário',
  },
  en: {
    excerpt: 'Cited excerpt',
    sourceLabel: 'Source: Querido Diário',
    open: 'Open in Querido Diário',
    viewInline: 'View PDF inline',
    closeInline: 'Close inline viewer',
    inlineWarning: 'Viewing PDF from Querido Diário. Original document: ',
    fallback: 'Your browser does not display PDFs inline. Use the link above.',
    date: 'Gazette date',
  },
} as const

function formatDate(iso: string, locale: 'pt-br' | 'en'): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(locale === 'pt-br' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function PdfPreview({ source, cachedPdfUrl, excerpt, date, locale = 'pt-br' }: PdfPreviewProps) {
  const [showInline, setShowInline] = useState(false)
  const t = labels[locale]
  // Preferir cache CDN quando disponível — temos controle de headers,
  // navegador exibe inline ao invés de baixar.
  const iframeSrc = cachedPdfUrl ?? source

  return (
    <section className="rounded-xl border border-brand-gray/15 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <FilePdf size={20} weight="fill" className="text-brand-amber" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-ink">
          {t.sourceLabel}
        </h3>
      </div>

      {/* Excerpt destacado — citação canônica */}
      {excerpt && (
        <blockquote className="mb-4 border-l-4 border-brand-amber bg-brand-paper px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-gray">
            {t.excerpt}
            {date && (
              <span className="ml-2 font-mono normal-case tracking-normal">
                · {formatDate(date, locale)}
              </span>
            )}
          </p>
          <p className="font-mono text-sm leading-relaxed text-brand-ink">
            &ldquo;{excerpt}&rdquo;
          </p>
        </blockquote>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-brand-paper transition-opacity hover:opacity-90"
        >
          {t.open}
          <ArrowSquareOut size={12} weight="bold" />
        </a>
        <button
          type="button"
          onClick={() => setShowInline((v) => !v)}
          aria-expanded={showInline}
          aria-controls="pdf-inline-frame"
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-gray/25 bg-white px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-paper"
        >
          {showInline ? (
            <>
              <XIcon size={12} weight="bold" />
              {t.closeInline}
            </>
          ) : (
            <>
              <Eye size={12} weight="bold" />
              {t.viewInline}
            </>
          )}
        </button>
      </div>

      {/* Iframe inline — opt-in, lazy */}
      {showInline && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-brand-gray">
            {t.inlineWarning}
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-teal underline"
            >
              {source.split('/').slice(-1)[0]}
            </a>
          </p>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-brand-gray/20 bg-brand-paper">
            <iframe
              id="pdf-inline-frame"
              src={iframeSrc}
              title={t.sourceLabel}
              loading="lazy"
              className="h-full w-full"
            >
              <p className="p-4 text-sm text-brand-gray">{t.fallback}</p>
            </iframe>
          </div>
        </div>
      )}
    </section>
  )
}
