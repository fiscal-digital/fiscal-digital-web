#!/usr/bin/env node
/**
 * Lê brand/colors.json e gera app/brand.generated.css com CSS variables
 * para o @theme do Tailwind v4.
 *
 * Uso: npm run brand:theme
 * Output: app/brand.generated.css (gitignored — regerar após atualizar colors.json)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const colors = JSON.parse(readFileSync(join(root, 'brand', 'colors.json'), 'utf8'))

function toKebab(camel) {
  return camel.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`)
}

const lines = [
  '/* AUTO-GENERATED — npm run brand:theme — não editar manualmente */',
  '/* Source of truth: brand/colors.json */',
  '',
  '@theme {',
  '  /* Named brand colors */',
]

for (const [name, { hex, role, use }] of Object.entries(colors.colors)) {
  lines.push(`  --color-brand-${toKebab(name)}: ${hex}; /* ${role} — ${use} */`)
}

lines.push('', '  /* Light mode semantic tokens */')
for (const [name, value] of Object.entries(colors.modes.light)) {
  lines.push(`  --color-light-${toKebab(name)}: ${value};`)
}

lines.push('', '  /* Dark mode semantic tokens */')
for (const [name, value] of Object.entries(colors.modes.dark)) {
  lines.push(`  --color-dark-${toKebab(name)}: ${value};`)
}

lines.push('', '  /* Risk scale */')
for (const [level, { hex, label }] of Object.entries(colors.risk)) {
  lines.push(`  --color-risk-${level}: ${hex}; /* ${label.pt} / ${label.en} */`)
}

lines.push('}', '')

const out = join(root, 'app', 'brand.generated.css')
writeFileSync(out, lines.join('\n'))
console.log('✔ Generated:', out.replace(root, '.'))
