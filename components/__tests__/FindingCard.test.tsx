import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FindingCard } from '../FindingCard'
import type { Finding } from '../AlertsFeed'

/**
 * Smoke + snapshot do FindingCard (o "AlertCard" do feed) — TST-020..024.
 *
 * O componente é presentacional: recebe `t` (next-intl) e `typeLabel` por prop,
 * então dá para testá-lo sem provider, com mocks simples. Cobre o que um leitor
 * precisa ver e o comportamento condicional (valor, secretaria, narrativa).
 */

// `t` do next-intl: devolve a própria chave — suficiente para asserção estável.
const t = ((key: string) => key) as unknown as Parameters<typeof FindingCard>[0]['t']
const typeLabel = (type: string) => (type === 'dispensa_irregular' ? 'Dispensa irregular' : type)

function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: 'FINDING#fiscal-licitacoes#4305108#dispensa_irregular#4305108#2026-04-15#abc',
    type: 'dispensa_irregular',
    cityId: '4305108',
    city: 'Caxias do Sul',
    state: 'RS',
    riskScore: 82,
    confidence: 0.85,
    value: 80000,
    secretaria: 'SMS',
    legalBasis: 'Lei 14.133/2021, Art. 75, II',
    narrative: 'Identificamos dispensa publicada em 15/04/2026 em Caxias do Sul.',
    source: 'https://queridodiario.ok.org.br/gazettes/g-001',
    createdAt: '2026-04-15T00:00:00.000Z',
    evidence: [{ source: 'https://queridodiario.ok.org.br/gazettes/g-001', excerpt: 't', date: '2026-04-15' }],
    ...overrides,
  } as Finding
}

describe('FindingCard', () => {
  it('renderiza cidade, tipo, risco e link para o detalhe', () => {
    render(<FindingCard finding={makeFinding()} typeLabel={typeLabel} t={t} locale="pt-br" />)

    expect(screen.getByText('Caxias do Sul')).toBeInTheDocument()
    expect(screen.getByText('Dispensa irregular')).toBeInTheDocument()
    expect(screen.getByText('RS')).toBeInTheDocument()

    // O card inteiro é linkável para o detalhe da cidade/alerta.
    const link = screen.getByRole('link', { name: /Dispensa irregular — Caxias do Sul/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('/pt-br/alertas/'))
  })

  it('formata o valor em BRL quando presente', () => {
    render(<FindingCard finding={makeFinding({ value: 80000 })} typeLabel={typeLabel} t={t} locale="pt-br" />)
    // Aceita NBSP ou espaço comum entre "R$" e o número (Intl varia por runtime).
    expect(screen.getByText(/R\$\s*80\.000,00/)).toBeInTheDocument()
  })

  it('omite o valor quando ausente (não renderiza R$)', () => {
    render(<FindingCard finding={makeFinding({ value: undefined })} typeLabel={typeLabel} t={t} locale="pt-br" />)
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument()
  })

  it('mostra a narrativa sem markdown cru', () => {
    render(
      <FindingCard
        finding={makeFinding({ narrative: '**Identificamos** dispensa #relevante' })}
        typeLabel={typeLabel}
        t={t}
        locale="pt-br"
      />,
    )
    // O componente remove # e * antes de exibir.
    expect(screen.getByText(/Identificamos dispensa relevante/)).toBeInTheDocument()
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument()
  })

  it('linguagem factual — sem termos acusatórios no render', () => {
    render(<FindingCard finding={makeFinding()} typeLabel={typeLabel} t={t} locale="pt-br" />)
    expect(document.body.textContent).not.toMatch(/fraudou|desviou|corrup|criminoso/i)
  })

  it('snapshot estável (detecta mudança visual não intencional)', () => {
    const { container } = render(
      <FindingCard finding={makeFinding()} typeLabel={typeLabel} t={t} locale="pt-br" />,
    )
    // Mascara a data: o componente formata com toLocaleDateString sem timeZone,
    // entao a data UTC vira dia diferente conforme o fuso do runner (Windows
    // Brasil UTC-3 vs Linux do CI em UTC) — mascarada para estabilidade.
    const html = (container.firstChild as HTMLElement).outerHTML.replace(/\d{2}\/\d{2}\/\d{4}/g, 'DD/MM/AAAA')
    expect(html).toMatchSnapshot()
  })
})
