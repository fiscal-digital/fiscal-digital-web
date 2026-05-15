<div align="center">
  <img src="brand/logo/symbol.svg" width="96" alt="Fiscal Digital" />

  # Fiscal Digital — Web

  **Fiscalização autônoma de gastos públicos municipais.**
  *Autonomous oversight of Brazilian municipal spending.*

  [fiscaldigital.org](https://fiscaldigital.org) · [@FiscalDigitalBR](https://x.com/FiscalDigitalBR)

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Brand: CC BY 4.0](https://img.shields.io/badge/Brand-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)
  [![Status: Produção](https://img.shields.io/badge/Status-Produção-success.svg)]()
</div>

---

## 🇧🇷 Português

Site institucional do **Fiscal Digital** — agentes autônomos que leem
diários oficiais municipais brasileiros e transformam dados públicos em
alertas verificáveis para a sociedade.

Cada alerta cita a fonte. Cada fonte é o diário oficial publicado no
[Querido Diário](https://queridodiario.ok.org.br) (OKFN Brasil).

### Status

✅ **Em produção** desde 02 de maio de 2026. Serve atualmente 179 alertas publicáveis em 26 cidades brasileiras, com mais de R$ 499 milhões em contratos analisados desde 2021. Pipeline diário ativo: collector às 04:00 BRT, analyzer contínuo via SQS, publisher gera narrativas para findings com `riskScore ≥ 60`.

Engine v1.7.0 em produção (Ciclo 4.1 concluído em 13 de maio de 2026). Janela de observação 30 dias até 10 de junho de 2026, validando ≥ 5 verdadeiros positivos e ≤ 1 falso positivo por Fiscal. Veja [TRAINING_CYCLES.md](https://github.com/fiscal-digital/fiscal-digital-evaluations/blob/main/TRAINING_CYCLES.md) no repo de evaluations.

### Stack

- [Next.js 16](https://nextjs.org) App Router (`output: 'export'`)
- [TypeScript 6](https://www.typescriptlang.org) strict
- [Tailwind v4](https://tailwindcss.com) (CSS-first via `@theme`)
- [next-intl 4](https://next-intl.dev) (PT-BR padrão · EN secundária)
- [Phosphor Icons](https://phosphoricons.com)
- Deploy: AWS S3 + CloudFront via GitHub Actions (OIDC)

### Brand Pack

Este repo é o **owner canônico** do brand pack do projeto: cores, voz,
glossário PT↔EN, logos e templates. Ver [`brand/`](brand/).

A engine de fiscalização (`fiscal-digital`) consome o brand pack via
`gh api` em build-time — ver contrato em [`CLAUDE.md`](CLAUDE.md).

### Rodando localmente

```bash
npm install
npm run dev          # http://localhost:3000 → /pt
npm run type-check
npm run build        # gera estático em out/
npm run brand:theme  # regera CSS theme a partir de brand/colors.json
```

Requer Node.js 24+.

### Ecossistema

O Fiscal Digital nasce sobre os ombros de:

- **[Serenata de Amor](https://serenata.ai)** (OKFN Brasil) — pioneira no
  uso de IA para fiscalização de gastos federais
- **[Querido Diário](https://queridodiario.ok.org.br)** (OKFN Brasil) —
  infraestrutura de digitalização de diários oficiais municipais

Não competimos. Estendemos.

### Contribuindo

Issues e PRs bem-vindos. Mudanças em copy ou voz devem seguir
[`brand/voice-tone.md`](brand/voice-tone.md).

### Licença

- **Código:** [MIT](LICENSE)
- **Brand pack** (`brand/`): CC-BY 4.0 — uso livre, com crédito

---

## 🇺🇸 English

Institutional website for **Fiscal Digital** — autonomous agents that read
Brazilian municipal official gazettes and turn public data into verifiable
alerts for society.

Every alert cites its source. Every source is the official gazette published
through [Querido Diário](https://queridodiario.ok.org.br) (Open Knowledge
Foundation Brazil).

### Status

✅ **In production** since May 2, 2026. Currently serves 179 publishable alerts across 26 Brazilian cities, with over R$ 499 million in analyzed contracts since 2021. Daily pipeline active: collector at 04:00 BRT, continuous analyzer via SQS, publisher generates narratives for findings with `riskScore ≥ 60`.

Engine v1.7.0 in production (Cycle 4.1 completed May 13, 2026). Thirty-day observation window through June 10, 2026, validating ≥ 5 true positives and ≤ 1 false positive per Fiscal. See [TRAINING_CYCLES.md](https://github.com/fiscal-digital/fiscal-digital-evaluations/blob/main/TRAINING_CYCLES.md) in the evaluations repo.

### Stack

Next.js 16 (App Router, static export) · TypeScript 6 strict ·
Tailwind v4 · next-intl 4 (PT-BR default, EN secondary) · Phosphor Icons.
Deploy: AWS S3 + CloudFront via GitHub Actions with OIDC.

### Brand Pack

This repo is the **canonical owner** of the project's brand pack: colors,
voice, PT↔EN glossary, logos, and templates. See [`brand/`](brand/).

The fiscal engine (`fiscal-digital`) consumes the brand pack via `gh api`
at build-time — see contract in [`CLAUDE.md`](CLAUDE.md).

### Running locally

```bash
npm install
npm run dev
npm run build
```

Requires Node.js 24+.

### Ecosystem

Fiscal Digital stands on the shoulders of:

- **[Serenata de Amor](https://serenata.ai)** (OKFN Brazil) — pioneered the
  use of AI to oversee Brazilian federal spending
- **[Querido Diário](https://queridodiario.ok.org.br)** (OKFN Brazil) —
  infrastructure for digitizing Brazilian municipal official gazettes

We don't compete. We extend.

### License

- **Code:** [MIT](LICENSE)
- **Brand pack** (`brand/`): CC-BY 4.0 — free use, with attribution
