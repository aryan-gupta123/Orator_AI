# Orator backend

See the [root README](../readme.md) for setup, configuration, architecture and tests.

Entrypoint: `uvicorn main:app --host 0.0.0.0 --port 8100` from this directory. `app` includes the Socket.IO server and the FastAPI health routes. The key is loaded from `.env` in this directory, independently of the shell's working directory. Existing environment variables take precedence.

`GEMINI_API_KEY` is required in the default hosted mode; local mode (`ORATOR_PROVIDER=local`) uses an OpenAI-compatible model server and faster-whisper instead. For hosted mode, `GEMINI_MODEL` defaults to `gemini-2.5-flash-lite`. Deepgram and ElevenLabs are optional. The backend accepts complete bounded recordings, not partial streaming containers.
