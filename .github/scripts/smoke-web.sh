#!/usr/bin/env bash
# Smoke pós-deploy do site. Duas perguntas:
#  1. A versão no ar é a deste build? O payload RSC de cada página carrega
#     "b":"<BUILD_ID>". Espera até a invalidação do CloudFront propagar.
#  2. As rotas principais respondem como devem?
# Uso: smoke-web.sh <BUILD_ID esperado>   (BASE_URL opcional)
set -euo pipefail
ESPERADO="$1"
BASE="${BASE_URL:-https://fiscaldigital.org}"
FAIL=0
fail() { echo "::error::$1"; FAIL=1; }

build_no_ar() {
  curl -s --max-time 20 "$BASE/pt-br/" | grep -oE '\\?"b\\?":\\?"[A-Za-z0-9_-]{10,}' | head -1 | grep -oE '[A-Za-z0-9_-]{10,}$' || true
}

echo "Build esperado: $ESPERADO"
for i in $(seq 1 "${SMOKE_TENTATIVAS:-30}"); do
  atual=$(build_no_ar)
  [ "$atual" = "$ESPERADO" ] && break
  echo "  tentativa $i: no ar '${atual:-?}', aguardando invalidação"
  sleep 10
done
[ "$atual" = "$ESPERADO" ] || fail "Versão no ar é '$atual', esperado '$ESPERADO' após aguardar a invalidação"

# caminho  status-final  sufixo-esperado-da-URL-final
while read -r path code dest; do
  out=$(curl -s -o /dev/null -L --max-time 30 -w "%{http_code} %{url_effective}" "$BASE$path")
  got=${out%% *}; url=${out#* }
  [ "$got" = "$code" ] || fail "$path: HTTP $got (esperado $code)"
  case "$url" in *"$dest") ;; *) fail "$path terminou em $url (esperado *$dest)";; esac
  echo "$path -> $got $url"
done <<'ROTAS'
/ 200 /pt-br/
/pt-br/ 200 /pt-br/
/en-us/ 200 /en-us/
/pt-br/alertas/ 200 /pt-br/alertas/
/en 200 /en-us/
/brand/logo/symbol.svg 200 /brand/logo/symbol.svg
/sitemap.xml 200 /sitemap.xml
ROTAS

[ $FAIL -eq 0 ] && echo "Smoke PASS" || exit 1
