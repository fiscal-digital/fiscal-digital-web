import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config — testes E2E do site Fiscal Digital.
 *
 * Estratégia:
 *  - PR-gate roda só Chromium (rápido, ~30s)
 *  - Nightly roda matriz Chromium + Firefox + WebKit (~3min)
 *
 * Target padrão: https://fiscaldigital.org (prod). Testes são READ-ONLY
 * (não criam findings, não publicam, não mexem em DDB) — seguros pra prod.
 *
 * Para rodar contra dev local:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://fiscaldigital.org'

export default defineConfig({
  testDir: './e2e',
  // Sequencial por padrão — testes contra prod são read-only mas paralelismo
  // pode disparar throttle do CloudFront/Lambda em rajadas curtas. Em CI
  // mantemos 1 worker; localmente o dev pode subir para acelerar.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*\.mobile\.spec\.ts$/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testMatch: /.*\.mobile\.spec\.ts$/,
    },
    // Nightly matrix — só roda quando explícito
    ...(process.env.PLAYWRIGHT_FULL_MATRIX
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: /.*\.mobile\.spec\.ts$/ },
          { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: /.*\.mobile\.spec\.ts$/ },
        ]
      : []),
  ],

  // Sem webServer — rodamos contra prod por padrão. Para dev local,
  // setar PLAYWRIGHT_BASE_URL=http://localhost:3000 e rodar `npm run dev`
  // separadamente.
})
