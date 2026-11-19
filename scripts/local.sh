#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ $# -lt 2 ]]; then
  printf 'Usage: %s /path/to/llama-server /path/to/model.gguf [whisper-model-or-directory]\n' "$0" >&2
  printf 'First install .venv/bin/pip install -r orator-backend-v2/requirements-local.txt\n' >&2
  exit 1
fi
LLAMA_BINARY="$1"
LLAMA_WEIGHTS="$2"
MODEL_PORT="${ORATOR_MODEL_PORT:-8091}"
export ORATOR_PROVIDER=local
export LOCAL_MODEL_URL="http://127.0.0.1:$MODEL_PORT/v1"
export LOCAL_MODEL_NAME="${LOCAL_MODEL_NAME:-qwen2.5-1.5b-instruct}"
export LOCAL_WHISPER_MODEL="${3:-${LOCAL_WHISPER_MODEL:-tiny.en}}"
MODEL_PID=""
APP_PID=""
cleanup() {
  [[ -z "$APP_PID" ]] || kill "$APP_PID" 2>/dev/null || true
  [[ -z "$MODEL_PID" ]] || kill "$MODEL_PID" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT TERM
"$LLAMA_BINARY" -m "$LLAMA_WEIGHTS" --host 127.0.0.1 --port "$MODEL_PORT" --ctx-size 4096 --threads 4 --alias "$LOCAL_MODEL_NAME" &
MODEL_PID=$!
.venv/bin/python - <<'PY'
import os, time, urllib.request
url = os.environ['LOCAL_MODEL_URL'].removesuffix('/v1') + '/health'
for _ in range(60):
    try:
        with urllib.request.urlopen(url, timeout=1) as response:
            if response.status == 200:
                break
    except Exception:
        time.sleep(0.5)
else:
    raise SystemExit('Local model did not become ready. Check the model path and llama-server logs.')
PY
./scripts/dev.sh &
APP_PID=$!
wait -n "$MODEL_PID" "$APP_PID"
