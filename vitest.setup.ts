// BUG-WEB-001: fixa o fuso dos testes em America/Sao_Paulo (UTC-3, negativo)
// para que asserções de data exercitem o cenário que expôs o deslocamento de
// dia — do contrário, num runner em UTC (CI) o bug passaria despercebido.
// Deve vir antes de qualquer uso de Date.
process.env.TZ = 'America/Sao_Paulo'

import '@testing-library/jest-dom/vitest'
