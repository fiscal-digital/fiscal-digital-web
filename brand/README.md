# Fiscal Digital — Brand Pack

Identidade visual oficial. Vetorial, editável, MIT.

## Estrutura

```
brand/
├── colors.json                          tokens de cor + tipografia + radius
├── glossary.json                        termos PT↔EN canônicos + lista de palavras a evitar
├── voice-tone.md                        guia de voz bilíngue (DO/DON'T, templates)
├── logo/
│   ├── symbol.svg                       símbolo (quadrado, full-color)
│   ├── symbol-mono-dark.svg             monocromático para fundos claros
│   ├── symbol-mono-light.svg            monocromático para fundos escuros (apenas contorno)
│   ├── favicon.svg                      versão 32x32 simplificada
│   ├── wordmark-horizontal.svg          símbolo + texto lado a lado
│   └── wordmark-stacked.svg             símbolo em cima, texto embaixo
└── social/
    ├── avatar-400.svg                   400×400 — Twitter/X, GitHub, LinkedIn
    ├── twitter-header.svg               1500×500 — header X/Twitter
    ├── linkedin-banner.svg              1584×396 — banner LinkedIn
    └── github-social-preview.svg        1280×640 — Settings → Social preview
```

## Bilíngue desde a origem

Todo conteúdo institucional do Fiscal Digital é **PT-BR (default) + EN**.
Alertas ficam em PT-BR (citam lei brasileira e secretarias locais), com
*summary* curto em EN. Site usa roteamento path-based: `/` é PT-BR, `/en`
é EN. "Fiscal Digital" é proper noun — não traduzido em nenhum contexto.

- **Tagline canônica:**
  - 🇧🇷 Fiscalização autônoma de gastos públicos
  - 🇺🇸 Autonomous oversight of Brazilian municipal spending

Termos brasileiros sensíveis seguem [`glossary.json`](glossary.json).
Tom e exemplos paralelos PT/EN seguem [`voice-tone.md`](voice-tone.md).

## Conceito

O símbolo retrata 3 linhas de um diário oficial sobre fundo teal. A linha do
meio é mais curta — e o trecho que falta é preenchido por um marcador âmbar
no formato de marca-texto (16×10 no símbolo, 6×4 no favicon, sempre ~1.6:1
horizontal). Com isso, o âmbar **completa visualmente** a linha que estava
sendo lida — o achado é a parte do documento que recebeu atenção.

```
documento público (paper)  +  trecho marcado (âmbar)  =  fiscalização verificável
```

Lê de 16 px (favicon) a 1500 px (banner) sem perda. Em escalas pequenas, a
proporção horizontal do marcador é o que diferencia "marca-texto" de "bloco".

## Paleta

| Token        | Hex       | Uso                                                |
| ------------ | --------- | -------------------------------------------------- |
| Deep Teal    | `#0D4F4A` | primária — autoridade, fiscalização, fundo símbolo |
| Civic Amber  | `#F5B700` | acento — achado, alerta, CTA secundário            |
| Paper        | `#F8F5EE` | superfície clara — fundos, cards                   |
| Ink          | `#0F1419` | texto principal                                    |
| Mid Gray     | `#5C6670` | texto secundário, metadados, fonte citada          |
| Danger       | `#C8372D` | retratação, riskScore ≥ 80                         |
| Success      | `#1F7A50` | verificação, fonte confirmada                      |

## Escala de risco visual

Todo `riskScore` (0–100) tem um nível visual canônico. Mapeamento em
[`colors.json`](colors.json#L24) sob a chave `risk`:

| Faixa  | Nível          | Token        | Hex       | Publicável  | Label PT          | Label EN         |
| ------ | -------------- | ------------ | --------- | ----------- | ----------------- | ---------------- |
| 0–29   | Informativo    | `midGray`    | `#5C6670` | ❌ interno  | Informativo       | Informational    |
| 30–59  | Baixo risco    | `success`    | `#1F7A50` | ❌ interno  | Baixo risco       | Low risk         |
| 60–79  | Alerta         | `civicAmber` | `#F5B700` | ✅ publica  | Alerta            | Alert            |
| 80–100 | Alerta crítico | `danger`     | `#C8372D` | ✅ destaque | Alerta crítico    | Critical alert   |

Regras:

- Apenas faixas **alerta** e **crítico** geram publicação automática (combinado
  com `confidence >= 0.70`, conforme regra-de-ouro do projeto).
- **Crítico** recebe destaque visual: em posts no X, badge âmbar com borda
  vermelha; no site, card com borda esquerda em `danger`.
- Dashboards internos podem mostrar todas as 4 faixas. Publicação pública
  jamais cita as faixas internas (`info` / `low`) — não vazar análise crua.

## Modo escuro

Ambos os modos são primeira-classe no brand pack — nenhum é fallback do outro.
Tokens semânticos em [`colors.json`](colors.json#L33) sob a chave `modes`:

| Token      | Light       | Dark        | Uso                                              |
| ---------- | ----------- | ----------- | ------------------------------------------------ |
| `bg`       | `#F8F5EE`   | `#0F1419`   | fundo da página                                  |
| `surface`  | `#FFFFFF`   | `#1A2028`   | cards, modais, painéis elevados                  |
| `text`     | `#0F1419`   | `#F8F5EE`   | texto principal                                  |
| `muted`    | `#5C6670`   | `#9BA5AF`   | metadados, fonte citada (mantém AA contrast)     |
| `border`   | `#E6E0D5`   | `#2A323C`   | bordas, divisores                                |
| `brandFg`  | `#0D4F4A`   | `#3FBFB3`   | headlines, ícones, links em prosa                |

Cores que **não mudam** entre modos (mantêm identidade da marca):

- `civicAmber` (`#F5B700`) — pop em ambos os fundos, é o gesto da marca
- `danger` (`#C8372D`) e `success` (`#1F7A50`) — escalas de risco preservadas
- Símbolo: usar [`symbol.svg`](logo/symbol.svg) em ambos os modos (fundo teal
  fechado funciona universalmente). [`symbol-mono-light.svg`](logo/symbol-mono-light.svg)
  é alternativa só-contorno para fundos escuros estilizados.

O símbolo `brandFg` em dark (`#3FBFB3`) é o Deep Teal clareado para legibilidade
em prosa — nunca usar como fundo de painel (continuaria sendo Deep Teal).

## Tipografia

- **Inter** — UI, web, headlines (open source, Google Fonts)
- **JetBrains Mono** — números, CNPJ, valores monetários, IDs de contrato

## Voz

Resumo dos princípios — guia completo bilíngue (DO/DON'T, templates de
alerta, retratação, manchete) está em [`voice-tone.md`](voice-tone.md).

- **Factual, nunca acusatória.** Use "identificamos", "o documento aponta".
  Nunca: "fraude", "desvio", "esquema".
- **Sempre cita a fonte.** Toda peça pública linka para o Querido Diário.
- **Reconhece os ombros em que pisa.** Crédito explícito a Serenata e
  Querido Diário sempre que houver espaço.

Termos a evitar (acusatórios) e seus substitutos factuais estão em
[`glossary.json`](glossary.json) sob a chave `avoid`. O publisher deve
**rejeitar automaticamente** qualquer post que contenha termo da lista.

## Como exportar para PNG

Os SVGs são fonte de verdade. Para gerar PNGs nas dimensões finais das redes,
use uma das opções abaixo (escolha a que estiver instalada).

### Opção A — Inkscape (CLI)

```bash
inkscape brand/social/avatar-400.svg            -o avatar.png            -w 400  -h 400
inkscape brand/social/twitter-header.svg        -o twitter-header.png    -w 1500 -h 500
inkscape brand/social/linkedin-banner.svg       -o linkedin-banner.png   -w 1584 -h 396
inkscape brand/social/github-social-preview.svg -o github-preview.png    -w 1280 -h 640
```

### Opção B — rsvg-convert (libRSVG)

```bash
rsvg-convert -w 400  -h 400  brand/social/avatar-400.svg            > avatar.png
rsvg-convert -w 1500 -h 500  brand/social/twitter-header.svg        > twitter-header.png
rsvg-convert -w 1584 -h 396  brand/social/linkedin-banner.svg       > linkedin-banner.png
rsvg-convert -w 1280 -h 640  brand/social/github-social-preview.svg > github-preview.png
```

### Opção C — @resvg/resvg-js (Node, sem libvips/Chromium)

Recomendado para Windows quando Inkscape/ImageMagick/rsvg não estão no PATH.
Binário Rust nativo via npm — sem libvips (sharp) e sem Chromium (puppeteer).
Renderiza texto via fallback de fonte do sistema; em ausência de Inter,
usa Segoe UI no Windows / SF Pro no macOS sem perda visual relevante.

```bash
mkdir -p /tmp/brand-export && cd /tmp/brand-export
npm init -y >/dev/null
npm install --no-save @resvg/resvg-js
node -e '
  const { Resvg } = require("@resvg/resvg-js");
  const fs = require("fs");
  const REPO = process.env.REPO || "../..";
  const tasks = [
    ["brand/logo/favicon.svg",                 "brand/logo/favicon.png",                  32],
    ["brand/logo/symbol.svg",                  "brand/logo/symbol.png",                 1024],
    ["brand/logo/wordmark-horizontal.svg",     "brand/logo/wordmark-horizontal.png",    1040],
    ["brand/logo/wordmark-stacked.svg",        "brand/logo/wordmark-stacked.png",        640],
    ["brand/social/avatar-400.svg",            "brand/social/avatar-400.png",            400],
    ["brand/social/twitter-header.svg",        "brand/social/twitter-header.png",       1500],
    ["brand/social/linkedin-banner.svg",       "brand/social/linkedin-banner.png",      1584],
    ["brand/social/github-social-preview.svg", "brand/social/github-social-preview.png",1280],
  ];
  for (const [src, dst, w] of tasks) {
    const svg = fs.readFileSync(`${REPO}/${src}`);
    const r = new Resvg(svg, { fitTo: { mode: "width", value: w }, font: { defaultFontFamily: "Segoe UI" } });
    fs.writeFileSync(`${REPO}/${dst}`, r.render().asPng());
  }
'
```

### Opção D — sem instalar nada

Abra o SVG no Chrome/Firefox, dê print → "Salvar como PDF", ou abra no
[svgomg.net](https://svgomg.net) → Figma → exporte como PNG.

## Onde aplicar

| Plataforma         | Asset                                    | Dimensão final |
| ------------------ | ---------------------------------------- | -------------- |
| X / Twitter avatar | `social/avatar-400.svg`                  | 400×400        |
| X / Twitter header | `social/twitter-header.svg`              | 1500×500       |
| GitHub avatar      | `social/avatar-400.svg`                  | 400×400        |
| GitHub social card | `social/github-social-preview.svg`       | 1280×640       |
| LinkedIn avatar    | `social/avatar-400.svg`                  | 400×400        |
| LinkedIn banner    | `social/linkedin-banner.svg`             | 1584×396       |
| Favicon site       | `logo/favicon.svg`                       | 32×32 / ICO    |
| README badge       | `logo/symbol.svg`                        | 64×64          |

## Não fazer

- Esticar / distorcer o símbolo. Sempre escala proporcional.
- Trocar o âmbar por outra cor de "achado". Âmbar é a cor do alerta da marca.
- Compor com a bandeira do Brasil. Marca é cívica, mas apartidária e
  não-governamental.
- Colocar a marca sobre fotos de políticos identificáveis.
- Usar o símbolo sem citar a fonte do dado em peças públicas.

## Licença

Brand pack © 2026 Fiscal Digital — distribuído sob **CC-BY 4.0**.
Use livre, com crédito.
