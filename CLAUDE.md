# Fiscal Digital — Web

## Hierarquia de contexto (lê PRIMEIRO)

Antes de qualquer trabalho aqui, **abrir e ler [`../fiscal-digital/CLAUDE.md`](../fiscal-digital/CLAUDE.md)**.

Esse é o documento mestre do projeto Fiscal Digital. Contém:

- Identidade de marca, missão, ecossistema (Serenata, Querido Diário)
- Princípios inegociáveis
- Regras de ouro (TypeScript Strict, Node 24.x, Serverless, OIDC, etc.)
- Mapa dos 4 repositórios e suas responsabilidades
- Domínio, DNS, secrets de produção
- Convenção de nomenclatura AWS
- Arquitetura dos Fiscais como agentes
- LLM (Haiku 4.5) e estratégia de prompt caching
- Ciclo autônomo de produção
- Governança open source e licenças
- Contrato de brand pack para consumidores externos (engine, etc.)
- Learning system

**Tudo que não estiver neste arquivo está lá.** Se houver divergência
entre os dois, o mestre vence — abrir PR para reconciliar.

Este arquivo descreve **apenas o escopo local** do `fiscal-digital-web`.
Não duplicar conteúdo do mestre.

---

## Escopo local

Este repo é o **owner do brand pack** e da camada web do Fiscal Digital.

```
fiscal-digital-web/
├── brand/      Brand pack canônica (cor, voz, glossário, logos, social)
├── app/        Aplicação web — stack TBD (ver "Stack" abaixo)
└── scripts/    Utilitários (PNG export do brand, etc.)
```

## Brand Pack — owner

Mudanças no brand passam por PR neste repo. [`brand/README.md`](brand/README.md)
tem o guia completo. Estrutura:

| Arquivo | Conteúdo |
|---|---|
| [`brand/colors.json`](brand/colors.json) | Tokens de cor (modes light/dark), escala de risco visual, tipografia, radius |
| [`brand/glossary.json`](brand/glossary.json) | 46 termos PT↔EN + lista `avoid` (palavras proibidas em conteúdo público) |
| [`brand/voice-tone.md`](brand/voice-tone.md) | Princípios + DO/DON'T bilíngue + templates de alerta + retratação |
| [`brand/logo/`](brand/logo/), [`brand/social/`](brand/social/) | SVGs (source of truth) + PNGs (derivados via `@resvg/resvg-js`) |

Após editar SVG, **regerar PNGs** via Opção C do [`brand/README.md`](brand/README.md)
(`@resvg/resvg-js`, pasta scratch FORA do repo — ver
`../fiscal-digital/.learnings/LEARNINGS.md` LRN-20260501-001).

### Contrato com outros repos

A engine (`fiscal-digital`) consome `glossary.json`, `voice-tone.md` e
`colors.json` via `gh api` em build-time. **Quebrar contrato = quebrar prod.**
Mudanças que afetem consumo (renomear chaves, remover termos, alterar
estrutura de `risk`) coordenar via PR cross-repo.

## Bilíngue (path-based)

- `/` → PT-BR (default)
- `/en` → EN

Conteúdo institucional traduzido integralmente. Alertas ficam em PT-BR
(citam lei brasileira, secretarias locais) com summary EN curto. "Fiscal
Digital" é proper noun — não traduzido.

## Stack

| Camada | Escolha | Versão instalada |
|---|---|---|
| Framework | **Next.js 16** App Router, `output: 'export'` (SSG) | `^16.0.0` |
| Linguagem | **TypeScript Strict** | `^6.0.0` |
| Runtime | **Node.js 24.x** (mínimo Next.js 16: 20.9+) | `>=24.0.0` |
| Estilo | **Tailwind v4** CSS-first via `@theme` em `app/globals.css` | `^4.2.0` |
| i18n | **next-intl 4** `/pt/` (default) e `/en/` — `localePrefix: 'always'` | `^4.0.0` |
| Ícones | **Phosphor React** | `^2.1.0` |
| Fontes | **next/font** — Inter (UI) + JetBrains Mono (dados, CNPJs, valores) | built-in |
| Brand tokens | `lib/brand.ts` importa `brand/colors.json` com `resolveJsonModule` | — |

### Guardrails de performance (mobile-first, 3G) — obrigatórios

- **`use client` SOMENTE** onde há interatividade real (livro-caixa, filtros de alertas,
  gráficos). Server Components é o padrão — PR sem `use client` justificado é bloqueado.
- **`next/image`** para toda imagem — previne CLS (layout shift) em mobile.
- **`next/font`** configurado em `lib/fonts.ts` — previne FOUT/FOIT (flash de fonte).
- Lighthouse 90+ em mobile 3G como gate de PR para páginas de conteúdo.

### Next.js 16 — mudanças que afetam este repo

| Mudança | Impacto aqui |
|---|---|
| `middleware.ts` depreciado → `proxy.ts` | Renomeado. Export default de `createMiddleware`. |
| `next lint` removido | Sem script `lint` no `package.json`. Usar ESLint CLI ou Biome diretamente. |
| `params` é `Promise` | Todos os layouts/pages já usam `await params`. |
| Turbopack é bundler padrão | `next dev` usa Turbopack. Manter padrão. |
| Node mínimo 20.9+ | Usamos 24, OK. |

### Static export + i18n em produção

- `proxy.ts` ativo em `next dev` para locale detection local.
- Em produção (S3+CloudFront, static export), `proxy.ts` é ignorado.
- **CloudFront Function** (a implementar no deploy) faz redirect `/ → /pt|/en`
  via `Accept-Language` header.
- ISR indisponível em static export. Feed de alertas atualizado via rebuild
  agendado em GH Actions (quando engine estiver ativa).

### next-intl 4 — mudanças relevantes

| Mudança | Status neste repo |
|---|---|
| `getRequestConfig` deve retornar `locale` | ✅ já retorna |
| `NextIntlClientProvider` herda mensagens auto | Passamos `messages` explicitamente (compatível) |
| ESM-only (exceto `next-intl/plugin`) | ✅ usando `import`, não `require` |
| TypeScript 5+ obrigatório | ✅ usando TS 6 |

## Deploy

Conforme mestre: **S3 + CloudFront** via GH Actions com OIDC. Workflow
herda padrão do repo `fiscal-digital`.

⚠️ **Ainda não acionar deploy público.** Memória do projeto registra:
"Sequenciamento — site só publicado após engine rodar". Dev e preview
estão liberados; produção (`fiscaldigital.org`) está bloqueada até o
pipeline da engine estar gerando alertas reais para Caxias.

## Citação jurídica em copy do site (enforcement via hook)

Copy bilíngue do site, mesmo curta, é artefato público. Vale a mesma
regra do repo mestre: **nunca citar lei, decreto, súmula, artigo ou
jurisprudência** em `messages/*.json`, `docs/**/*.md`, `README.md`, ou
em corpo de Issue/PR `gh` sem ter LIDO a fonte na sessão atual.

**Enforcement local:** [`.claude/hooks/check-legal-citation.js`](.claude/hooks/check-legal-citation.js) +
[`.claude/settings.json`](.claude/settings.json). Hook bloqueia `gh issue|pr create|edit|comment` e
`Edit|Write` em paths sensíveis quando detecta padrão regulatório sem bypass.

**Fonte canônica:** o hook localiza automaticamente o `legal-corpus`
do repo irmão `../fiscal-digital/packages/engine/src/legal-corpus/` e
libera citações que mapeiam para textos sincronizados de fontes oficiais.

**Bypass quando já validou:** `[legal-verified: <fonte>]` em body de
`gh` ou `<!-- legal-verified -->` em markdown.

Para detalhes da arquitetura, ver [CLAUDE.md do repo mestre](../fiscal-digital/CLAUDE.md)
> seção "Citação jurídica em artefatos públicos".
