import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * globalSetup do Playwright — garante que o contrato zod (lib/contracts.generated.ts)
 * exista antes dos specs de contrato (e2e/contracts.spec.ts).
 *
 * O arquivo é gitignored e gerado por scripts/sync-contracts.mjs (prebuild/
 * pretest). O workflow de E2E roda `npx playwright test` direto, sem passar por
 * esses hooks — então geramos aqui. Idempotente: roda o sync sempre (barato),
 * cobrindo tambem o caso local de rodar só o e2e num checkout limpo.
 */
export default function globalSetup(): void {
  const script = join(__dirname, '..', 'scripts', 'sync-contracts.mjs')
  if (!existsSync(script)) return
  execFileSync(process.execPath, [script], { stdio: 'inherit' })
}
