# Voice-flow repair

## Before
- Backend imported a Deepgram SDK entrypoint incompatible with its pinned SDK, despite using the REST fallback.
- MediaRecorder emitted chunks every 250 ms; the server treated absence of chunks as silence. Silent microphone samples still produce chunks, and subsequent container fragments lack an independent header.
- Gemini failures became canned conversational replies; coach failures became a fabricated score of 70.
- Current input could appear in history and again in the new prompt.
- Persona selection sent prompt text where the server expected a persona ID.
- Reset cleared client messages without clearing server history. Inflight tasks could survive mode changes/disconnection, and Arena used fixed playback sleeps and contained a stray failing expression.
- Frontend dependencies/build output were committed from macOS; clean Linux startup failed.

## After
- One completed, format-tagged recording per turn, capped at 60 seconds / 8 MB decoded; explicit start/send control.
- Gemini transcription/conversation with one configured key, plus an explicitly labeled free local Qwen/Whisper option. Optional Deepgram/ElevenLabs remain optional; browser speech is the default output.
- Actionable provider errors and no invented coaching result. Successful character replies can survive a separate coaching failure, with a visible notice.
- Model history excludes the pending user turn. Session state is isolated; control events are serialized per socket. Reset/mode/configuration/disconnect cancel work.
- Six-turn Arena limit; playback acknowledgements, bounded waits, pause cancellation, editable topics.
- Same-origin Socket.IO proxy, complete TypeScript protocol, typed input and reproducible setup/start scripts.
- Generated dependencies/builds ignored and untracked; install with `npm ci` on the target OS.

See README.md for the verification record and its limits. The generated-file cleanup is a separate commit so source changes can be reviewed independently.
