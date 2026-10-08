#!/usr/bin/env bash
# Run every check a generated project's CI runs, against a rendered project.
#
# Usage: scripts/check-generated.sh <project-dir> [--docker]
#
# The project must have been rendered with tasks (dependencies installed, API
# client generated). Fails on the first failing check.
set -euo pipefail

project=${1:?usage: check-generated.sh <project-dir> [--docker]}
docker=${2:-}
cd "$project"

step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

step "Generated files are deterministic"
# Re-running the generators must not change what the tasks produced.
git add -A >/dev/null
git -c user.name=ci -c user.email=ci@example.com commit -qm "rendered" --allow-empty
make api-client >/dev/null
npm run routes:generate --workspace=frontend >/dev/null
git add -N . && git diff --exit-code

step "Backend"
(
  cd backend
  uv lock --check
  uv run ruff format --check .
  uv run ruff check .
  uv run pyright
  uv run lint-imports
  uv run pytest -q
)

step "Frontend"
(
  cd frontend
  npm run format:check
  npm run lint
  npm run type-check
  npm run knip
  npm run deps:check
  npm run test
  npm run build:ci
)

step "Duplication"
(cd backend && npx jscpd --no-tips)
(cd frontend && npm run duplication-check)

if [[ "$docker" == "--docker" ]]; then
  step "Docker image"
  docker build -t template-check:latest .
fi

step "All checks passed"
