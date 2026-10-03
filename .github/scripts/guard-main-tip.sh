#!/usr/bin/env bash
# Guarda contra rollback silencioso (fiscal-digital#214; cópia do script da engine).
#
# "Re-run" de um run antigo do deploy reimplanta o commit DAQUELE run, não o
# topo da main, e termina verde. Em 13/09/2026 isso desfez o #146 em prod por
# 6 minutos sem nenhum sinal. Este script falha se o commit a implantar não
# for o topo atual da main, a menos que o rollback seja declarado.
#
# Usa a API de compare do GitHub: independe da profundidade do clone.
# Env: GH_TOKEN, GITHUB_REPOSITORY, ALLOW_ROLLBACK (true|false) e o commit em
# DEPLOY_SHA, com fallback para GITHUB_SHA. Em workflow_run o GITHUB_SHA é o
# topo da main, não o commit testado, e variáveis GITHUB_* não podem ser
# sobrescritas: quem dispara por workflow_run TEM que passar DEPLOY_SHA.
set -euo pipefail
SHA="${DEPLOY_SHA:-$GITHUB_SHA}"

main_sha=$(gh api "repos/${GITHUB_REPOSITORY}/commits/main" --jq .sha)
status=$(gh api "repos/${GITHUB_REPOSITORY}/compare/main...${SHA}" --jq .status)

echo "commit a implantar: ${SHA}"
echo "topo atual da main: ${main_sha}"
echo "relação com a main: ${status}"

if [ "$status" = "identical" ]; then
  echo "OK: o commit é o topo da main."
  exit 0
fi

if [ "${ALLOW_ROLLBACK:-false}" = "true" ]; then
  echo "::warning title=Rollback declarado::Implantando ${SHA} (status ${status}); topo da main é ${main_sha}."
  exit 0
fi

echo "::error title=Deploy fora do topo da main (#214)::Este run implantaria ${SHA}, mas o topo da main é ${main_sha} (status: ${status}). Re-run de deploy antigo é rollback silencioso. No site o deploy segue o E2E da main: para implantar a main, re-execute o E2E do commit mais recente. Para rollback, faça revert na main."
exit 1
