#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT_DIR="$PWD"
BACKEND_PORT="${ORATOR_PORT:-8100}"
FRONTEND_PORT="${ORATOR_FRONTEND_PORT:-3000}"
if [[ ! -x .venv/bin/uvicorn || ! -d orator-frontend-v3/node_modules ]]; then
  printf 'Run ./scripts/setup.sh first.\n' >&2
  exit 1
fi
BACKEND_PID=""
FRONTEND_PID=""
cleanup() {
  [[ -z "$BACKEND_PID" ]] || kill "$BACKEND_PID" 2>/dev/null || true
  [[ -z "$FRONTEND_PID" ]] || kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT TERM
FRONTEND_URL="${FRONTEND_URL:-http://localhost:$FRONTEND_PORT,http://127.0.0.1:$FRONTEND_PORT}" \
  .venv/bin/uvicorn main:app --app-dir "$ROOT_DIR/orator-backend-v2" --host 0.0.0.0 --port "$BACKEND_PORT" &
BACKEND_PID=$!
cd orator-frontend-v3
ORATOR_BACKEND_URL="http://127.0.0.1:$BACKEND_PORT" \
  node node_modules/next/dist/bin/next dev --hostname 0.0.0.0 --port "$FRONTEND_PORT" &
FRONTEND_PID=$!
wait -n "$BACKEND_PID" "$FRONTEND_PID"
