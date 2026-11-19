#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv
.venv/bin/pip install -r orator-backend-v2/requirements-dev.txt
(cd orator-frontend-v3 && npm ci --no-audit --no-fund)
printf '\nSetup complete. Set GEMINI_API_KEY or copy orator-backend-v2/.env.example to .env in that directory.\nRun ./scripts/dev.sh\n'
