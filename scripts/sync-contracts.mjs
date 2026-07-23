#!/usr/bin/env node
/**
 * sync-contracts.mjs — traz os schemas zod do contrato público da API.
 *
 * TST-010..014. A fonte da verdade é `packages/contracts/src/index.ts` no repo
 * `fiscal-digital` (engine). Aqui o arquivo é apenas ESPELHADO em
 * `lib/contracts.generated.ts` (gitignored) para que o web derive seus tipos
 * via `z.infer` em vez de redeclará-los à mão.
 *
 * Mesmo padrão do `sync-brand.mjs` na direção inversa (engine ← web/brand):
 *   1. Em dev local com o repo irmão clonado, copia do path relativo.
 *   2. Caso contrário, baixa de raw.githubusercontent.com — ambos os repos são
 *      PÚBLICOS, então não precisa de token nem de registry/.npmrc.
 *
 * Por que espelhar em vez de instalar como pacote npm: o repo web não tem
 * `.npmrc` nem auth de GitHub Packages no CI; publicar o contrato exigiria
 * infraestrutura nova só para isso.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SOURCE_PATH = 'packages/contracts/src/index.ts'
const SIBLING = resolve(ROOT, '..', 'fiscal-digital', SOURCE_PATH)
const RAW_URL = `https://raw.githubusercontent.com/fiscal-digital/fiscal-digital/main/${SOURCE_PATH}`
const OUT = join(ROOT, 'lib', 'contracts.generated.ts')

const BANNER = `/* eslint-disable */
// ─────────────────────────────────────────────────────────────────────────────
// ARQUIVO GERADO — NÃO EDITAR À MÃO.
// Espelho de ${SOURCE_PATH} do repo fiscal-digital (engine).
// Regenerado por scripts/sync-contracts.mjs em prebuild/predev/pretest.
// Para mudar o contrato, abra PR no repo engine.
// ─────────────────────────────────────────────────────────────────────────────
`

async function fetchRemote() {
  const res = await fetch(RAW_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${RAW_URL}`)
  return res.text()
}

function readSibling() {
  return readFileSync(SIBLING, 'utf8')
}

async function main() {
  let source
  let origin

  if (existsSync(SIBLING)) {
    source = readSibling()
    origin = `repo irmão (${SIBLING})`
  } else {
    try {
      source = await fetchRemote()
      origin = RAW_URL
    } catch (err) {
      // Sem fonte e sem espelho anterior = build inválido: melhor falhar alto
      // do que compilar contra um contrato desatualizado silenciosamente.
      if (existsSync(OUT)) {
        console.warn(`[sync-contracts] falha ao buscar contrato (${err.message}); mantendo espelho existente`)
        return
      }
      console.error(`[sync-contracts] ERRO: não foi possível obter ${SOURCE_PATH}.`)
      console.error(`  - repo irmão não encontrado em ${SIBLING}`)
      console.error(`  - download falhou: ${err.message}`)
      process.exit(1)
    }
  }

  // O contrato não pode importar nada além de zod — se importar, o espelho
  // quebra (imports relativos não existem aqui).
  const badImport = source
    .split('\n')
    .find(l => /^\s*import\s/.test(l) && !/from\s+['"]zod['"]/.test(l))
  if (badImport) {
    console.error(`[sync-contracts] ERRO: contrato importa algo além de zod: ${badImport.trim()}`)
    process.exit(1)
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, BANNER + source, 'utf8')
  console.log(`[sync-contracts] contrato sincronizado de ${origin} → lib/contracts.generated.ts`)
}

main()
