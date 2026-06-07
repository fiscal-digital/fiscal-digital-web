#!/usr/bin/env node
/**
 * Copy linter: verifica se messages/*.json contêm
 * palavras da lista `avoid` do brand/glossary.json.
 *
 * Uso: npm run lint:copy
 * Sai com exit code 1 se encontrar palavras proibidas.
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Carrega glossary e extrai lista avoid
const glossary = JSON.parse(readFileSync(join(root, 'brand', 'glossary.json'), 'utf8'))

/** @type {Array<{pt?: string, en?: string, "pt-br"?: string, "en-us"?: string, reason: string, use_instead: string[]}>} */
const avoidList = glossary.avoid

function avoidTerms(entry) {
  return [entry.pt, entry.en, entry['pt-br'], entry['en-us']]
    .filter((term) => typeof term === 'string' && term.trim().length > 0)
}

// Extrai todas as palavras/frases proibidas (pt + en) em lowercase
const forbiddenTerms = avoidList.flatMap((entry) => {
  return avoidTerms(entry)
    .flatMap((term) => term.split('/').map((t) => t.trim()))
    .map((t) => t.toLowerCase())
})

/**
 * Percorre recursivamente um objeto JSON e retorna todas as strings de valor
 * com seu caminho de chave.
 * @param {unknown} obj
 * @param {string} prefix
 * @returns {Array<{key: string, value: string}>}
 */
function extractStrings(obj, prefix = '') {
  const results = []
  if (typeof obj === 'string') {
    results.push({ key: prefix, value: obj })
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      results.push(...extractStrings(obj[i], `${prefix}[${i}]`))
    }
  } else if (obj !== null && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      results.push(...extractStrings(v, prefix ? `${prefix}.${k}` : k))
    }
  }
  return results
}

const messagePaths = [
  join(root, 'messages', 'pt-br.json'),
  join(root, 'messages', 'en-us.json'),
  join(root, 'messages', 'pt.json'),
  join(root, 'messages', 'en.json'),
].filter((path) => existsSync(path))

let violations = 0

for (const msgPath of messagePaths) {
  const fileName = msgPath.replace(root, '.').replace(/\\/g, '/')
  const messages = JSON.parse(readFileSync(msgPath, 'utf8'))
  const strings = extractStrings(messages)

  for (const { key, value } of strings) {
    const valueLower = value.toLowerCase()
    for (const term of forbiddenTerms) {
      // Busca o termo como palavra inteira (word boundary) para evitar falsos positivos
      // Ex: "fraude" não deve dar match em "infraestrutura"
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}\\b`, 'i')
      if (regex.test(valueLower)) {
        console.error(`[lint:copy] PROIBIDO: "${term}"`)
        console.error(`  Arquivo: ${fileName}`)
        console.error(`  Chave:   ${key}`)
        console.error(`  Valor:   ${value.slice(0, 120)}`)
        // Encontra a entrada avoid original para mostrar alternativa
        const entry = avoidList.find(
          (a) => avoidTerms(a)
            .flatMap((t) => t.toLowerCase().split('/').map((part) => part.trim()))
            .includes(term),
        )
        if (entry) {
          console.error(`  Motivo: ${entry.reason}`)
          if (entry.use_instead?.length) {
            console.error(`  Use:    ${entry.use_instead.join(', ')}`)
          }
        }
        console.error()
        violations++
        break // um único termo proibido por string é suficiente para reportar
      }
    }
  }
}

if (violations > 0) {
  console.error(`[lint:copy] ${violations} violação(ões) encontrada(s). Corrija antes de publicar.`)
  process.exit(1)
} else {
  console.log('[lint:copy] OK — nenhuma palavra proibida encontrada.')
}
