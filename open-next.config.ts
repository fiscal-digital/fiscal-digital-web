import type { OpenNextConfig } from '@opennextjs/aws/types/open-next.js'

const config: OpenNextConfig = {
  default: {},
  // open-next re-executa o build do Next internamente.
  // Setar para "next build" evita recursão quando package.json "build" chama
  // "open-next build" (que por default chamaria "npm run build" novamente).
  buildCommand: 'next build',
}

export default config
