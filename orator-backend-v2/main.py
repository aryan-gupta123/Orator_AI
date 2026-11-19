"""Orator: bounded voice turns, truthful provider errors, cancellable sessions."""
import asyncio
import base64
import binascii
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).with_name(".env"))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from models.session import SessionManager
from prompts.system_prompts import SANDBOX_PERSONAS, DOJO_SCENARIOS, get_sandbox_prompt, get_dojo_prompts
from services.gemini_service import gemini_service, ProviderError
PROVIDER = os.getenv("ORATOR_PROVIDER", "gemini")
if PROVIDER == "local":
    from services.local_service import LocalService
    gemini_service = LocalService()
elif PROVIDER != "gemini":
    raise RuntimeError("ORATOR_PROVIDER must be gemini or local")
from services.deepgram_service import deepgram_service
from services.elevenlabs_service import elevenlabs_service

logger = logging.getLogger(__name__)
origins = [u.strip() for u in os.getenv("FRONTEND_URL", "http://localhost:3000,http://127.0.0.1:3000").split(",") if u.strip()]
api = FastAPI(title="Orator API", version="1.1.0")
api.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["*"])
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins, max_http_buffer_size=12_000_000)
app = socketio.ASGIApp(sio, api)
session_manager = SessionManager()
tasks: dict[str, asyncio.Task] = {}
message_locks: dict[str, asyncio.Lock] = {}
playback: dict[str, tuple[str, asyncio.Event]] = {}
MAX_AUDIO_BYTES = 8_000_000
AUDIO_TYPES = {"audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"}


async def emit(sid, kind, data):
    await sio.emit("message", {"type": kind, "data": data}, room=sid)


async def cancel_work(sid):
    task = tasks.pop(sid, None)
    if task and not task.done():
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
    playback.pop(sid, None)


async def speak(sid, text, voice="default", *, wait=False):
    """Browser speech is the default; optional ElevenLabs errors fall back explicitly."""
    token = os.urandom(8).hex()
    finished = asyncio.Event()
    playback[sid] = (token, finished)
    await emit(sid, "status", "speaking")
    audio = None
    if elevenlabs_service.api_key:
        audio = await elevenlabs_service.text_to_speech_base64(text, voice)
        if not audio:
            await emit(sid, "notice", "ElevenLabs audio is unavailable; using your browser's voice.")
    await emit(sid, "speech", {"id": token, "text": text, "audio": audio})
    if wait:
        # A bounded wait also lets muted clients and failed playback advance the debate.
        try:
            await asyncio.wait_for(finished.wait(), timeout=45)
        except asyncio.TimeoutError:
            pass
    if playback.get(sid, (None,))[0] == token:
        playback.pop(sid, None)


async def conversation(sid, text):
    session = session_manager.get(sid)
    if not session:
        return
    await emit(sid, "transcript", {"speaker": "user", "text": text})
    await emit(sid, "status", "thinking")
    history = session.get_history_for_llm()
    feedback = None
    if session.mode == "sandbox":
        response = await gemini_service.generate_response(text, get_sandbox_prompt(session.persona_id), history)
        speaker = "ai"
    elif session.mode == "dojo":
        prompt, coach = get_dojo_prompts(session.scenario_id)
        response = await gemini_service.generate_response(text, prompt, history)
        try:
            feedback = await gemini_service.generate_coach_feedback(text, coach, f"Scenario: {session.scenario_id}")
        except ProviderError as exc:
            await emit(sid, "notice", str(exc))
        speaker = "ai"
    elif session.user_debate_side:
        stance = "AGAINST" if session.user_debate_side == "pro" else "FOR"
        response = await gemini_service.generate_response(text,
            f"Argue {stance} this topic: {session.arena_topic}. Respond respectfully in 2–3 sentences.", history)
        speaker = "ai_b" if stance == "AGAINST" else "ai_a"
    else:
        raise ProviderError("Join a side before speaking in the Arena.")
    # Only completed turns enter model history; the current user input is sent once.
    session.add_message("user", text)
    session.add_message("assistant", response)
    await emit(sid, "transcript", {"speaker": speaker, "text": response})
    if feedback:
        await emit(sid, "coach", feedback)
    await speak(sid, response, elevenlabs_service.get_voice_for_persona(session.persona_id), wait=True)


async def audio_turn(sid, data):
    if not isinstance(data, dict):
        raise ProviderError("Send a complete recording with its audio format.")
    mime = str(data.get("mimeType", "")).split(";")[0]
    encoded = data.get("audio", "")
    if mime not in AUDIO_TYPES or not isinstance(encoded, str) or len(encoded) > 11_000_000:
        raise ProviderError("Unsupported or oversized recording. Record at most 60 seconds.")
    try:
        audio = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error):
        raise ProviderError("Invalid recording. Please record again.") from None
    if not audio or len(audio) > MAX_AUDIO_BYTES:
        raise ProviderError("Recording is empty or too large. Please record a shorter message.")
    await emit(sid, "status", "listening")
    if deepgram_service.api_key:
        text = await deepgram_service.transcribe(audio, mime)
    else:
        text = await gemini_service.transcribe_audio(audio, mime)
    if not text or text == "[NO_SPEECH]":
        raise ProviderError("No speech detected. Try again or type your message.")
    await conversation(sid, text)


async def debate(sid):
    session = session_manager.get(sid)
    last = "Give a brief opening argument."
    # Six alternating turns per start; no unbounded API loop.
    for turn in range(6):
        if not session or not session.arena_is_running or session.user_debate_side:
            break
        speaker = "ai_a" if turn % 2 == 0 else "ai_b"
        stance = "FOR" if speaker == "ai_a" else "AGAINST"
        await emit(sid, "status", "thinking")
        response = await gemini_service.generate_response(last,
            f"Debate {stance} the topic: {session.arena_topic}. Give a strong, respectful 2–3 sentence argument.")
        session.add_message("assistant", f"[{stance}] {response}")
        await emit(sid, "transcript", {"speaker": speaker, "text": response})
        await speak(sid, response, elevenlabs_service.get_voice_for_debater(speaker), wait=True)
        last = response
    if session:
        session.arena_is_running = False
    await emit(sid, "debate_state", False)


async def guarded(sid, work):
    try:
        await work
    except ProviderError as exc:
        await emit(sid, "error", str(exc))
    except Exception:
        logger.exception("Orator turn failed")
        await emit(sid, "error", "This turn failed. Please try again.")
    finally:
        if tasks.get(sid) is asyncio.current_task():
            tasks.pop(sid, None)
        session = session_manager.get(sid)
        if session:
            if session.arena_is_running and session.mode == "arena":
                session.arena_is_running = False
                await emit(sid, "debate_state", False)
            await emit(sid, "status", "idle")


def start_work(sid, work):
    tasks[sid] = asyncio.create_task(guarded(sid, work))


@sio.event
async def connect(sid, environ, auth=None):
    session_manager.get_or_create(sid)
    message_locks[sid] = asyncio.Lock()
    await emit(sid, "configuration", {"provider": PROVIDER, "model": gemini_service.model})
    await emit(sid, "status", "idle")


@sio.event
async def disconnect(sid, reason=None):
    session_manager.remove(sid)
    await cancel_work(sid)
    message_locks.pop(sid, None)


@sio.event
async def message(sid, data):
    lock = message_locks.get(sid)
    if lock:
        async with lock:
            await handle_message(sid, data)


async def handle_message(sid, data):
    if not isinstance(data, dict):
        await emit(sid, "error", "Invalid message.")
        return
    session = session_manager.get(sid)
    if not session:
        return
    kind, value = data.get("type"), data.get("data")
    if kind == "playback_finished":
        current = playback.get(sid)
        if current and current[0] == value:
            current[1].set()
        return
    if kind in ("mode", "scenario", "sandbox_config", "reset", "stop_debate", "join_debate", "leave_debate"):
        if kind == "mode" and value not in ("sandbox", "dojo", "arena"):
            await emit(sid, "error", "Unknown mode.")
            return
        if kind == "scenario" and (not isinstance(value, str) or value not in DOJO_SCENARIOS):
            await emit(sid, "error", "Unknown scenario.")
            return
        if kind == "sandbox_config" and (not isinstance(value, dict) or not isinstance(value.get("persona"), str) or value.get("persona") not in SANDBOX_PERSONAS):
            await emit(sid, "error", "Unknown persona.")
            return
        if kind == "join_debate" and (not isinstance(value, dict) or value.get("side") not in ("pro", "con")):
            await emit(sid, "error", "Choose a debate side.")
            return
        await cancel_work(sid)
        session.arena_is_running = False
        await emit(sid, "debate_state", False)
        if kind == "mode":
            session.set_mode(value)
            session.persona_id, session.scenario_id = "friend", "salary_hard"
        elif kind == "scenario":
            session.scenario_id = value
            session.clear_history()
        elif kind == "sandbox_config":
            session.persona_id = value["persona"]
            session.clear_history()
        elif kind == "reset":
            session.clear_history()
            session.user_debate_side = None
            session.arena_topic = ""
        elif kind == "join_debate":
            session.user_debate_side = value["side"]
        else:
            session.user_debate_side = None
        await emit(sid, "status", "idle")
        return
    if tasks.get(sid) and not tasks[sid].done():
        await emit(sid, "error", "Please wait for this turn to finish.")
        return
    if kind == "text":
        if not isinstance(value, str) or not value.strip() or len(value) > 4000:
            await emit(sid, "error", "Enter a message between 1 and 4,000 characters.")
            return
        start_work(sid, conversation(sid, value.strip()))
    elif kind == "audio":
        start_work(sid, audio_turn(sid, value))
    elif kind == "start_debate":
        topic = value.get("topic") if isinstance(value, dict) else None
        if session.mode != "arena" or not isinstance(topic, str) or not topic.strip() or len(topic) > 500:
            await emit(sid, "error", "Enter a debate topic of at most 500 characters in Arena mode.")
            return
        session.arena_topic = topic.strip()
        session.arena_is_running = True
        session.user_debate_side = None
        await emit(sid, "debate_state", True)
        start_work(sid, debate(sid))
    else:
        await emit(sid, "error", "Unsupported action.")


@api.get("/")
@api.get("/health")
async def health():
    return {"status": "ok", "service": "Orator API", "provider": PROVIDER, "gemini": bool(os.getenv("GEMINI_API_KEY")),
            "model": gemini_service.model, "transcription": "deepgram" if deepgram_service.api_key else ("whisper" if PROVIDER == "local" else "gemini"),
            "speech": "elevenlabs" if elevenlabs_service.api_key else "browser"}
