'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/findings'

interface Props {
  locale: 'pt-br' | 'en-us'
  bySecretaria: Record<string, number>
}

const t = {
  'pt-br': {
    title: 'Concentracao por Secretaria',
    noData: 'Sem dados de secretaria disponíveis.',
    other: 'Outras',
  },
  'en-us': {
    title: 'Concentration by Department',
    noData: 'No department data available.',
    other: 'Others',
  },
} as const

// Paleta ciclica de cores do brand (teal, amber, muted, success, danger + variacoes)
const PALETTE = [
  '#0D4F4A', // teal
  '#F5B700', // amber
  '#5C6670', // gray
  '#1F7A50', // success
  '#C8372D', // danger
  '#3FBFB3', // teal-light
  '#F5A623', // amber-warm
  '#7B8794', // gray-light
]

interface Slice {
  label: string
  value: number
  pct: number
  color: string
  startAngle: number
  endAngle: number
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function slicePath(cx: number, cy: number, r: number, inner: number, start: number, end: number): string {
  // Evita arco de 360 graus (SVG nao renderiza paths completos)
  const adjustedEnd = end - start >= 360 ? end - 0.01 : end
  const outer1 = polarToXY(cx, cy, r, start)
  const outer2 = polarToXY(cx, cy, r, adjustedEnd)
  const inner1 = polarToXY(cx, cy, inner, start)
  const inner2 = polarToXY(cx, cy, inner, adjustedEnd)
  const largeArc = adjustedEnd - start > 180 ? 1 : 0

  return [
    `M ${outer1.x} ${outer1.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${outer2.x} ${outer2.y}`,
    `L ${inner2.x} ${inner2.y}`,
    `A ${inner} ${inner} 0 ${largeArc} 0 ${inner1.x} ${inner1.y}`,
    'Z',
  ].join(' ')
}

export default function SupplierSecretariaDonut({ locale, bySecretaria }: Props) {
  const tx = t[locale]
  const [hovered, setHovered] = useState<string | null>(null)

  const entries = Object.entries(bySecretaria)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-brand-gray/15 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-gray">{tx.title}</h2>
        <p className="text-sm text-brand-gray">{tx.noData}</p>
      </div>
    )
  }

  const total = entries.reduce((s, [, v]) => s + v, 0)

  // Agrupa os ultimos itens em "Outros" se houver mais de 7
  const MAX_SLICES = 7
  let displayEntries = entries
  if (entries.length > MAX_SLICES) {
    const top = entries.slice(0, MAX_SLICES)
    const othersValue = entries.slice(MAX_SLICES).reduce((s, [, v]) => s + v, 0)
    displayEntries = [...top, [tx.other, othersValue]]
  }

  // Constroi slices com angulos
  const slices: Slice[] = []
  let currentAngle = 0
  for (let i = 0; i < displayEntries.length; i++) {
    const [label, value] = displayEntries[i]
    const pct = total > 0 ? (value / total) * 100 : 0
    const sweep = (pct / 100) * 360
    slices.push({
      label,
      value,
      pct,
      color: PALETTE[i % PALETTE.length],
      startAngle: currentAngle,
      endAngle: currentAngle + sweep,
    })
    currentAngle += sweep
  }

  const CX = 80
  const CY = 80
  const R = 72
  const INNER = 42

  const hoveredSlice = hovered ? slices.find((s) => s.label === hovered) : null

  return (
    <div className="rounded-xl border border-brand-gray/15 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-gray">{tx.title}</h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* SVG Donut */}
        <div className="relative shrink-0">
          <svg
            width={160}
            height={160}
            viewBox="0 0 160 160"
            aria-hidden="true"
            role="img"
          >
            {slices.map((s) => (
              <path
                key={s.label}
                d={slicePath(CX, CY, R, INNER, s.startAngle, s.endAngle)}
                fill={s.color}
                opacity={hovered && hovered !== s.label ? 0.4 : 1}
                onMouseEnter={() => setHovered(s.label)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer transition-opacity"
              />
            ))}
            {/* Centro */}
            <circle cx={CX} cy={CY} r={INNER} fill="white" />
            {hoveredSlice ? (
              <>
                <text
                  x={CX}
                  y={CY - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#0F1419"
                  fontWeight="700"
                >
                  {hoveredSlice.pct.toFixed(0)}%
                </text>
                <text
                  x={CX}
                  y={CY + 10}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#5C6670"
                >
                  {hoveredSlice.label.length > 14
                    ? hoveredSlice.label.slice(0, 13) + '…'
                    : hoveredSlice.label}
                </text>
              </>
            ) : (
              <text
                x={CX}
                y={CY + 5}
                textAnchor="middle"
                fontSize="8"
                fill="#5C6670"
              >
                {entries.length} {locale === 'pt-br' ? 'secretarias' : 'depts'}
              </text>
            )}
          </svg>
        </div>

        {/* Legenda */}
        <ul className="flex-1 space-y-2 text-xs">
          {slices.map((s) => (
            <li
              key={s.label}
              className="flex items-center gap-2"
              onMouseEnter={() => setHovered(s.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="flex-1 truncate text-brand-ink" title={s.label}>
                {s.label}
              </span>
              <span className="shrink-0 font-mono text-brand-gray">
                {s.pct.toFixed(1)}%
              </span>
              <span className="shrink-0 font-mono text-brand-gray">
                {formatCurrency(s.value, locale)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
