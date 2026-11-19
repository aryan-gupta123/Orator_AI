# Orator

Practice conversations with AI personas, rehearse difficult scenarios with coaching, and watch short debates. Use a microphone or type a message. Replies appear as transcripts and can be read aloud.

## Quick start

Requires Python 3.11+ and Node.js 20.9+ (Node 22/24 recommended).

```bash
./scripts/setup.sh
cp orator-backend-v2/.env.example orator-backend-v2/.env
# Set GEMINI_API_KEY in orator-backend-v2/.env, or supply it in your environment.
./scripts/dev.sh
```

Open **http://localhost:3000**. The backend listens on port 8100. The frontend proxies Socket.IO to that backend, so the browser uses one origin. `ORATOR_PORT` and `ORATOR_FRONTEND_PORT` override the development ports.

For the default hosted mode, only **GEMINI_API_KEY** is required. The default model is `gemini-2.5-flash-lite`; override with `GEMINI_MODEL` if your project has access to a different compatible model. API availability and free-tier quotas depend on your Google project. A configured key is not a guarantee of available quota. Keys stay on the backend.

## Free local mode (no API key)

Gemini can run out of free quota. For an explicit alternative, run an OpenAI-compatible llama.cpp server and local Whisper transcription. The UI labels the selected provider; there is no silent model switch.

```bash
.venv/bin/pip install -r orator-backend-v2/requirements-local.txt
./scripts/local.sh /path/to/llama-server /path/to/qwen2.5-1.5b-instruct.gguf
```

The third optional argument is a faster-whisper model directory; otherwise `tiny.en` downloads on first transcription. Model weights and a compatible llama.cpp binary must be obtained separately; they are not committed. Qwen2.5-1.5B-Instruct Q4_K_M was tested here. Smaller local models have weaker responses/coaching than larger hosted models; generated scores are practice feedback.

To use an already running model server, set `ORATOR_PROVIDER=local`, `LOCAL_MODEL_URL` (default `http://127.0.0.1:8091/v1`), `LOCAL_MODEL_NAME`, and optionally `LOCAL_WHISPER_MODEL` on the backend. Install the local requirements first. Browser speech still handles output. With optional Deepgram/ElevenLabs keys unset and models already cached, this mode needs no external AI requests. The local model server is bound to loopback by the startup script.

## Use it

- **Sandbox:** choose a persona and talk or type. Tap the microphone once to record, then again to send. Each recording is limited to 60 seconds.
- **Dojo:** choose a scenario and send a turn. The character responds and a coach gives model-generated advice and a score. These are practice suggestions, not a validated assessment of communication ability.
- **Arena:** enter a topic and start a six-turn debate. Pause cancels pending work. Joining a side pauses the automatic debate so you can contribute; leaving returns to spectator mode. Start again to run another round.
- **Mute** controls response audio; it does not discard microphone input.
- **Reset** clears server conversation history and cancels outstanding work. Mode/persona/scenario changes cancel previous turns. Reconnecting starts a fresh session while retaining the selected mode configuration.

## Audio path

The browser records one complete WebM/MP4/Ogg container per turn. After you stop, the backend transcribes it with Gemini, then generates a reply. Browser speech synthesis reads the reply. This is turn-based voice interaction, not incremental end-to-end streaming or automatic silence detection.

Optional `DEEPGRAM_API_KEY` selects Deepgram transcription. Optional `ELEVENLABS_API_KEY` selects ElevenLabs speech; if synthesis fails, the app explicitly falls back to the browser voice. No extra provider keys are necessary for the default path.

Microphone capture needs HTTPS or localhost, browser permission and a supported MediaRecorder format. Browser speech availability varies by browser/OS and may use an online voice service. The transcript and text input remain available if recording or playback fails. Provider/quota failures appear as errors; the app does not substitute canned replies or invented coaching scores.

## Production build and separate hosting

```bash
cd orator-frontend-v3
npm ci
npm run typecheck
npm run build
npm start
```

Run the backend separately with:

```bash
.venv/bin/uvicorn main:app --app-dir orator-backend-v2 --host 0.0.0.0 --port 8100
```

For the default same-origin frontend proxy, set `ORATOR_BACKEND_URL` to the backend's reachable URL **before building**. If the browser connects directly to a separately hosted backend instead, set `NEXT_PUBLIC_BACKEND_URL` before building and set backend `FRONTEND_URL` to the exact frontend origin(s), comma-separated. Keep API keys out of all `NEXT_PUBLIC_` variables. `GET /health` on the backend reports configuration, not provider quota health.

This app currently has no user authentication or persistent storage. The validated setup is for personal use; unrestricted public API access would spend the backend owner's provider quota.

## Verification

```bash
.venv/bin/pytest
cd orator-frontend-v3
npm run typecheck
npm run build
```

Backend tests mock providers to verify message history, isolation, cancellation, input validation, debate limits and truthful error handling. See `validation/README.md` for the separate live Gemini/browser checks and their limits.

Tracked `node_modules` and `.next` output were removed: use `npm ci` so dependencies match your operating system. Local `.env` files and build artifacts are ignored.
