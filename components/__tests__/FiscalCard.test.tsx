import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import FiscalCard, { type FiscalCardProps } from '../FiscalCard'

/**
 * Smoke do FiscalCard — TST-020..024. Server Component puro, sem estado nem
 * fetch: props → markup. Garante que nome, base legal e thresholds aparecem e
 * que o contador de achados só mostra quando informado.
 */

function makeProps(overrides: Partial<FiscalCardProps> = {}): FiscalCardProps {
  return {
    id: 'licitacoes',
    name: 'Fiscal de Licitações',
    role: 'Detecta dispensas e fracionamento',
    criteriaLabel: 'Critérios',
    exclusionsLabel: 'Exclusões',
    legalLabel: 'Base legal',
    thresholdsLabel: 'Limiares',
    thMetric: 'Métrica',
    thValue: 'Valor',
    criteria: ['Dispensa acima do teto', 'Fracionamento por CNPJ'],
    exclusions: ['Emergência sanitária'],
    legal: 'Lei 14.133/2021, Art. 75',
    thresholds: [{ metric: 'Teto dispensa', value: 'R$ 50.000' }],
    ...overrides,
  }
}

describe('FiscalCard', () => {
  it('renderiza nome, função e base legal', () => {
    render(<FiscalCard {...makeProps()} />)
    expect(screen.getByRole('heading', { name: 'Fiscal de Licitações' })).toBeInTheDocument()
    expect(screen.getByText(/Detecta dispensas e fracionamento/)).toBeInTheDocument()
    expect(screen.getByText(/Lei 14\.133\/2021, Art\. 75/)).toBeInTheDocument()
  })

  it('lista critérios e limiares', () => {
    render(<FiscalCard {...makeProps()} />)
    expect(screen.getByText('Fracionamento por CNPJ')).toBeInTheDocument()
    expect(screen.getByText('Teto dispensa')).toBeInTheDocument()
    expect(screen.getByText('R$ 50.000')).toBeInTheDocument()
  })

  it('mostra contador de achados só quando informado (e > 0)', () => {
    const { rerender } = render(<FiscalCard {...makeProps({ findingsCount: undefined })} />)
    expect(screen.queryByText(/achados/)).not.toBeInTheDocument()

    // count 0 não deve renderizar o badge (condição findingsCount > 0)
    rerender(<FiscalCard {...makeProps({ findingsCount: 0, findingsLabel: 'achados' })} />)
    expect(screen.queryByText(/achados/)).not.toBeInTheDocument()

    rerender(<FiscalCard {...makeProps({ findingsCount: 12, findingsLabel: 'achados' })} />)
    expect(screen.getByText(/12\s+achados/)).toBeInTheDocument()
  })
})
