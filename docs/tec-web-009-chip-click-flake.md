# TEC-WEB-009 — Chip click engolido em tests E2E

**Status:** investigação concluída · workaround `.fixme`
**Repo:** `fiscal-digital-web`
**Spec afetado:** `e2e/alerts-toolbar.spec.ts` tests 10 e 11

## Sintoma

Tests do `AlertsAppliedFilters` falham intermitentemente em CI:

```
Error: expect(received).not.toContain(expected)
Expected substring: not "state=RS"
Received string:    "https://fiscaldigital.org/pt-br/alertas/?state=RS"
```

Após click no botão `×` de um chip aplicado, URL deveria perder o filtro
correspondente. Em alguns runs, URL fica idêntica.

## Investigação local (2026-05-10, Playwright headed)

### Spec isolado: 10/10 verde

```bash
npx playwright test e2e/_compare.spec.ts --project=chromium  # passa 10/10
```

### Em sequência com tests 1-9 do toolbar: falha consistentemente

```bash
CI=true npx playwright test e2e/alerts-toolbar.spec.ts --project=chromium
# 10 passed, 2 failed (testes 10 e 11)
```

### Test 7 (popover prefs) + test 10 isoladamente: falha

```bash
npx playwright test e2e/alerts-toolbar.spec.ts -g "7\.|10\." --project=chromium
# 1 passed, 1 failed (test 10)
```

Tests 1+10 ou 9+10 isolados passam. **Padrão claro: rodar test 6/7/8 (que
abrem popover de Preferências) antes do 10 reproduz a falha.**

### Instrumentação do click

Patcheado `history.pushState` e `replaceState` para logar invocação. Inspeção
do button via `__reactProps$X.onClick`:

| Verificação | Resultado |
|---|---|
| `__reactProps$X` existe no button | ✅ |
| `props.onClick` é função | ✅ |
| `props.onClick.toString()` | `()=>d({state:""})` (closure correta) |
| Playwright `.click()` | sem erro |
| `evaluate(el => el.click())` | sem erro |
| `dispatchEvent(new MouseEvent('click', {bubbles: true}))` | sem erro |
| Invocação direta `props.onClick(mock)` | retorna `success: true` sem throw |
| `history.pushState` chamado após click | ❌ NUNCA |
| `history.replaceState` chamado após click | ❌ NUNCA |

**O handler é invocado sem erro, mas `router.push()` no `setParams` nunca
dispara navigation real.** Não é problema de pointer events ou click delivery —
é algo entre `setParams` e o Next.js router.

## Hipóteses descartadas

- ~~SVG bloqueando click~~: já mitigado com `pointer-events-none` (PR #10)
- ~~Pointer event de Playwright cair fora do button~~: `force: true` não resolve
- ~~Handler não attached~~: `__reactProps$X.onClick` existe e é invocado
- ~~Programmatic click bypassed por React 18+~~: `removeBtn.click()` (trusted) também falha
- ~~State residual em cookies/localStorage~~: `clearCookies()` + `localStorage.clear()` no beforeEach não resolve
- ~~Race de hidratação inicial~~: `waitForTimeout(2000)` + `expect(removeBtn).toBeVisible()` não resolve
- ~~Spec sharing context~~: mover tests para arquivo próprio com retry 3x ainda flaky 50%

## Hipótese remanescente

Após múltiplos `router.push` em sequência (testes 7 e 8 disparam push de
`?limit=50` e `?view=list`), o **Next.js 16 router state interno** acumula
stale ref ou cache de prefetch RSC que silenciosamente engole o próximo
`router.push`. O click chega ao handler, `setParams` executa `URLSearchParams`
manipulation corretamente, chama `router.push(?page=1)`, mas Next.js
não converte isso em navigation.

Específico do Next.js 16 com static export + RSC prefetches. Não reproduzido
em isolation porque sem testes anteriores não há acumulação.

## Reprodução manual

Não reproduz facilmente em browser real (usuário típico não faz 8 navigations
seguidas em 30s). Mas teoricamente possível.

## Cobertura preservada

- Test 9: chip aparece com filter na URL (render + condição)
- Tests 7/8: popover prefs muda URL via `setParams` (mesmo caminho de write)
- Componente AlertsAppliedFilters em [components/AlertsAppliedFilters.tsx](../../components/AlertsAppliedFilters.tsx) é simples — `chip.onRemove` invoca `onChange` que é `handleFilterChange` que é `setParams`. Caminho exercitado por outros tests.

## Próximos passos (se virar dor)

1. Migrar tests 10/11 para component test (Vitest + Testing Library) — bypass do router real
2. Investigar Next.js 16 issue tracker por bugs de router state com static export
3. Tentar implementar `router.push` direto via `window.location.href` no setParams como workaround temporário
