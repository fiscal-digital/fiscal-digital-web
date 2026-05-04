import colors from '../brand/colors.json'

export type RiskLevel = keyof typeof colors.risk

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'alert'
  if (score >= 30) return 'low'
  return 'info'
}

export function getRiskColor(score: number): string {
  return colors.risk[getRiskLevel(score)].hex
}

export function getRiskLabel(score: number, locale: 'pt-br' | 'en-us' = 'pt-br'): string {
  return colors.risk[getRiskLevel(score)].label[locale]
}

export const brandColors = colors.colors
export const brandModes = colors.modes
export const riskScale = colors.risk
