# Verification record

Run date: November 19, 2026. Tests use synthetic messages and generated speech, not a user's private recording.

- Backend regression suite: 30 passing checks for history, session isolation, reset/disconnect cancellation, malformed recordings, provider failures, coaching-score validation, persona selection and six-turn debate limits.
- Frontend: TypeScript check and Next.js production build pass on Linux after `npm ci`.
- Live Gemini REST: configured `gemini-2.5-flash-lite` returned a real response.
- Live Socket.IO audio: generated WAV speech was correctly transcribed and received a generated conversational response. See `live-audio-events.json`.
- Browser: typed Sandbox interaction returned a generated reply with no JavaScript errors. See `sandbox-live.png`.
- Browser microphone: Chromium's fake microphone reads a synthetic spoken WAV; the app's real MediaRecorder captures it and sends the complete WebM recording. The resulting transcript and generated response are visible in `voice-live.png`.
- The final full browser check uses explicit local Qwen/Whisper mode because Gemini returned HTTP 429 during testing. The result is recorded in `browser-live-report.json`.

## Reproduce the live browser check

Start the app, install the optional Playwright package (`pip install -r orator-frontend-v3/requirements-browser.txt`), and provide an installed Chromium (`CHROMIUM_PATH` defaults to `/usr/bin/chromium`).

```bash
python tests/browser_live.py --live --audio /path/to/synthetic-speech.wav
```

Without `--audio`, the Sandbox check uses text. `--live` is mandatory because the check makes real provider requests and uses your quota. The browser check mutes output to avoid requiring a sound device on CI. Audio generation/playback events and cancellation are checked separately from a human's audible playback.

## Provider and dependency findings

Gemini produced genuine Sandbox and Dojo replies, audio transcription, and coaching before returning a quota/rate-limit error. No further Gemini requests were made after that error. The app shows the error rather than substituting success.

Local mode uses the existing Qwen2.5-1.5B-Instruct Q4_K_M weights, llama.cpp b12242, and faster-whisper tiny.en on CPU. PyAV 19 was incompatible with faster-whisper 1.2.1 (`metadata_errors` was removed); pinning PyAV 16.1.0 fixed transcription. The decoder regression is included in the suite and CI installs the optional dependencies to exercise it.

The browser smoke harness was corrected to wait for mode transitions and ignore Next.js's empty accessibility announcer when checking for visible error messages.

## Limits

No human microphone, speaker, or physical device was available in this cloud session. Browser speech depends on the user's browser/OS voices. Deepgram and ElevenLabs were not live-tested because those keys are not configured; their absence is supported. One earlier synthetic microphone attempt did not produce a reply within the test's wait window; a captured retry succeeded. No stable cause was established from that first uncaptured attempt. External-provider availability and quotas can still vary; failures are shown explicitly.

This record establishes a working personal-use setup, not a public deployment, concurrency benchmark, or measured end-to-end latency claim.

## Final result

The complete local-mode browser check passed: real MediaRecorder capture from a synthetic microphone, local transcription, conversational reply, Dojo reply and coaching, Arena start/pause cancellation, and zero browser JavaScript errors. The synthetic microphone loops the source WAV, so repeated words in its transcript reflect the test input. Browser output was muted in this automated run; audible playback on the user's physical speakers remains unverified.
