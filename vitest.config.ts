import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': root,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['lib/**/*.test.ts', 'components/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
