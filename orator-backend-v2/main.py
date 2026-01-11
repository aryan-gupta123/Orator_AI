"""
Orator Backend - Main Server
Real-time voice conversation practice with AI.
"""
import os
import asyncio
import base64
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from models.session import Session, SessionManager
from services.deepgram_service import deepgram_service
from services.gemini_service import gemini_service
from services.elevenlabs_service import elevenlabs_service
from prompts.system_prompts import (
    get_sandbox_prompt,
    get_dojo_prompts,
)

# ============================================================
# APP SETUP
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("🎭 Orator Backend starting...")
    yield
    print("🎭 Orator Backend shutting down...")

app = FastAPI(
    title="Orator API",
    description="Real-time voice conversation practice with AI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS for frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO setup
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    ping_timeout=60,
    ping_interval=25,
)
socket_app = socketio.ASGIApp(sio, app)

# Session management
session_manager = SessionManager()

# Audio buffer for accumulating chunks
audio_buffers: dict[str, bytearray] = {}
audio_tasks: dict[str, asyncio.Task] = {}

# ============================================================
# HELPER FUNCTIONS
# ============================================================

async def send_status(sid: str, status: str):
    """Send status update to client."""
    await sio.emit("message", {"type": "status", "data": status}, room=sid)

async def send_transcript(sid: str, speaker: str, text: str):
    """Send transcript to client."""
    await sio.emit("message", {
        "type": "transcript",
        "data": {"speaker": speaker, "text": text}
    }, room=sid)

async def send_audio(sid: str, audio_base64: str):
    """Send audio to client."""
    print(f"Sending audio to client: {len(audio_base64)} bytes")
    await sio.emit("message", {"type": "audio", "data": audio_base64}, room=sid)

async def send_coach(sid: str, feedback: dict):
    """Send coach feedback to client."""
    await sio.emit("message", {"type": "coach", "data": feedback}, room=sid)


async def process_audio_buffer(sid: str):
    """Process accumulated audio buffer after silence."""
    await asyncio.sleep(1.5)  # Wait for 1.5 seconds of silence
    
    if sid not in audio_buffers or len(audio_buffers[sid]) < 1000:
        return
    
    session = session_manager.get(sid)
    if not session:
        return
    
    # Get and clear the buffer
    audio_data = bytes(audio_buffers[sid])
    audio_buffers[sid] = bytearray()
    
    print(f"Processing {len(audio_data)} bytes of audio for {sid}")
        # Stop any running debate audio when user speaks
    if session.mode == "arena" and session.user_debate_side:
        session.arena_is_running = False
    try:
        # Update status
        await send_status(sid, "listening")
        
        # Transcribe with Deepgram
        transcript = await deepgram_service.transcribe(audio_data)
        
        if not transcript:
            print("No transcript returned")
            await send_status(sid, "idle")
            return
        
        print(f"Transcript: {transcript}")
        
        # Send user transcript to frontend
        await send_transcript(sid, "user", transcript)
        session.add_message("user", transcript)
        
        # Update status
        await send_status(sid, "thinking")
        
        # Generate response based on mode
        if session.mode == "sandbox":
            response = await handle_sandbox_response(session, transcript)
            voice = elevenlabs_service.get_voice_for_persona(session.persona_id)
            speaker = "ai"
            
        elif session.mode == "dojo":
            response, coach_feedback = await handle_dojo_response(session, transcript)
            voice = "professional"
            speaker = "ai"
            
            # Send coach feedback
            if coach_feedback:
                await send_coach(sid, coach_feedback)
                
        elif session.mode == "arena" and session.user_debate_side:
            # User has joined the debate
            response = await handle_arena_user_argument(session, transcript)
            # Response comes from the opposing AI
            if session.user_debate_side == "pro":
                speaker = "ai_b"
                voice = elevenlabs_service.get_voice_for_debater("ai_b")
            else:
                speaker = "ai_a"
                voice = elevenlabs_service.get_voice_for_debater("ai_a")
        else:
            await send_status(sid, "idle")
            return
        
        if not response:
            await send_status(sid, "idle")
            return
        
        print(f"AI Response: {response}")
        
        # Send AI transcript
        await send_transcript(sid, speaker, response)
        session.add_message("assistant", response)
        
        # Generate and send audio
        await send_status(sid, "speaking")
        audio_base64 = await elevenlabs_service.text_to_speech_base64(response, voice)
        
        if audio_base64:
            await send_audio(sid, audio_base64)
        
        await send_status(sid, "idle")
        
        # If in arena and user is participating, continue the debate after user's turn
        if session.mode == "arena" and session.user_debate_side and session.arena_is_running:
            # Resume AI debate after a short pause
            await asyncio.sleep(5)
            if session.arena_is_running and not session.user_debate_side:
                asyncio.create_task(continue_arena_debate(sid, session, response))
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        import traceback
        traceback.print_exc()
        await send_status(sid, "idle")


async def handle_sandbox_response(session: Session, user_message: str) -> str:
    """Generate response for sandbox mode."""
    system_prompt = get_sandbox_prompt(session.persona_id)
    
    response = await gemini_service.generate_response(
        user_message=user_message,
        system_prompt=system_prompt,
        history=session.get_history_for_llm()
    )
    
    return response


async def handle_dojo_response(session: Session, user_message: str) -> tuple[str, dict]:
    """Generate response and coach feedback for dojo mode."""
    system_prompt, coach_prompt = get_dojo_prompts(session.scenario_id)
    
    # Generate AI response (the scenario character)
    response = await gemini_service.generate_response(
        user_message=user_message,
        system_prompt=system_prompt,
        history=session.get_history_for_llm()
    )
    
    # Generate coach feedback
    coach_feedback = await gemini_service.generate_coach_feedback(
        user_message=user_message,
        coach_prompt=coach_prompt,
        context=f"Scenario: {session.scenario_id}"
    )
    
    return response, coach_feedback


async def handle_arena_user_argument(session: Session, user_message: str) -> str:
    """Handle user's argument in the debate - opposing AI responds."""
    topic = session.arena_topic
    user_side = session.user_debate_side
    
    # The opposing AI responds to the user
    if user_side == "pro":
        # User is FOR, so AI B (AGAINST) responds
        system_prompt = f"""You are debating AGAINST the topic: "{topic}"
You are responding to a human who is arguing FOR this topic.
Give a strong counter-argument to their point. Be passionate but respectful.
Keep it to 2-3 sentences. Make it punchy and persuasive."""
    else:
        # User is AGAINST, so AI A (FOR) responds
        system_prompt = f"""You are debating FOR the topic: "{topic}"
You are responding to a human who is arguing AGAINST this topic.
Give a strong counter-argument to their point. Be passionate but respectful.
Keep it to 2-3 sentences. Make it punchy and persuasive."""
    
    response = await gemini_service.generate_response(
        user_message=user_message,
        system_prompt=system_prompt,
        history=[]
    )
    
    return response


async def run_arena_debate(sid: str, session: Session):
    """Run the arena debate loop with custom topic."""
    topic = session.arena_topic
    
    if not topic:
        print("No topic set for arena debate")
        return
    
    print(f"Starting arena debate on topic: {topic}")
    
    # Generate system prompts for the two AIs based on the topic
    ai_a_prompt = f"""You are passionately arguing FOR the following topic: "{topic}"

Your role is to defend this position with strong arguments.
Be enthusiastic, use vivid examples, and make compelling points.
Keep responses to 2-3 sentences. Be passionate but respectful.
End with conviction."""

    ai_b_prompt = f"""You are passionately arguing AGAINST the following topic: "{topic}"

Your role is to oppose this position with strong arguments.
Be thoughtful, point out flaws, and make compelling counter-points.
Keep responses to 2-3 sentences. Be passionate but respectful.
Challenge the other side with logic."""

    # Opening statement from AI A (FOR)
    session.arena_current_speaker = "ai_a"
    await send_status(sid, "thinking")
    
    opening = await gemini_service.generate_response(
        user_message=f"Give your opening statement arguing FOR: {topic}",
        system_prompt=ai_a_prompt,
        history=[]
    )
    
    await send_transcript(sid, "ai_a", opening)
    session.add_message("assistant", f"[FOR]: {opening}")
    
    # Speak it
    await send_status(sid, "speaking")
    audio = await elevenlabs_service.text_to_speech_base64(
        opening, 
        elevenlabs_service.get_voice_for_debater("ai_a")
    )
    if audio:
        await send_audio(sid, audio)
    
    await asyncio.sleep(5)  # Wait for audio to finish
    
    last_statement = opening
    turn = 0
    max_turns = 20  # Increased for longer debates
    
    while session.arena_is_running and turn < max_turns:
        # Check if user has joined - if so, pause AI debate
        if session.user_debate_side:
            await asyncio.sleep(5)
            continue
            
        turn += 1
        
        # AI B responds (AGAINST)
        session.arena_current_speaker = "ai_b"
        await send_status(sid, "thinking")
        
        response_b = await gemini_service.generate_response(
            user_message=f"Respond to this argument: {last_statement}",
            system_prompt=ai_b_prompt,
            history=[]
        )
        
        await send_transcript(sid, "ai_b", response_b)
        session.add_message("assistant", f"[AGAINST]: {response_b}")
        
        await send_status(sid, "speaking")
        audio = await elevenlabs_service.text_to_speech_base64(
            response_b,
            elevenlabs_service.get_voice_for_debater("ai_b")
        )
        if audio:
            await send_audio(sid, audio)
        
        await asyncio.sleep(5)
        
        if not session.arena_is_running or session.user_debate_side:
            continue
        
        # AI A responds (FOR)
        session.arena_current_speaker = "ai_a"
        await send_status(sid, "thinking")
        
        response_a = await gemini_service.generate_response(
            user_message=f"Respond to this argument: {response_b}",
            system_prompt=ai_a_prompt,
            history=[]
        )
        
        await send_transcript(sid, "ai_a", response_a)
        session.add_message("assistant", f"[FOR]: {response_a}")
        
        await send_status(sid, "speaking")
        audio = await elevenlabs_service.text_to_speech_base64(
            response_a,
            elevenlabs_service.get_voice_for_debater("ai_a")
        )
        if audio:
            await send_audio(sid, audio)
        
        last_statement = response_a
        await asyncio.sleep(5)
    x
    session.arena_is_running = False
    await send_status(sid, "idle")


async def continue_arena_debate(sid: str, session: Session, last_response: str):
    """Continue the arena debate after user leaves."""
    # This function resumes the AI vs AI debate
    # For now, just let the main debate loop handle it
    pass


# ============================================================
# SOCKET.IO EVENT HANDLERS
# ============================================================

@sio.event
async def connect(sid, environ):
    """Handle new client connection."""
    print(f"Client connected: {sid}")
    session_manager.get_or_create(sid)
    audio_buffers[sid] = bytearray()
    await send_status(sid, "idle")

@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    print(f"Client disconnected: {sid}")
    session = session_manager.get(sid)
    if session:
        session.arena_is_running = False
    session_manager.remove(sid)
    audio_buffers.pop(sid, None)
    if sid in audio_tasks:
        audio_tasks[sid].cancel()
        audio_tasks.pop(sid, None)

@sio.event
async def message(sid, data):
    """Handle incoming messages from client."""
    session = session_manager.get_or_create(sid)
    msg_type = data.get("type")
    msg_data = data.get("data")
    
    print(f"Message from {sid}: type={msg_type}")
    
    if msg_type == "audio":
        # Decode and accumulate audio
        try:
            audio_bytes = base64.b64decode(msg_data)
            
            if sid not in audio_buffers:
                audio_buffers[sid] = bytearray()
            
            audio_buffers[sid].extend(audio_bytes)
            
            # Cancel existing timer and start new one
            if sid in audio_tasks:
                audio_tasks[sid].cancel()
            
            # Start new timer to process after silence
            audio_tasks[sid] = asyncio.create_task(process_audio_buffer(sid))
            
        except Exception as e:
            print(f"Error handling audio: {e}")
    
    elif msg_type == "mode":
        session.set_mode(msg_data)
        audio_buffers[sid] = bytearray()
        print(f"Session {sid} mode changed to: {msg_data}")
        
        if msg_data == "sandbox":
            session.persona_id = "friend"
        elif msg_data == "dojo":
            session.scenario_id = "salary_hard"
    
    elif msg_type == "scenario":
        session.scenario_id = msg_data
        session.clear_history()
        print(f"Session {sid} scenario changed to: {msg_data}")
    
    elif msg_type == "sandbox_config":
        persona = msg_data.get("persona", "friend")
        session.persona_id = persona
        session.clear_history()
        print(f"Session {sid} persona changed to: {persona}")
    
    elif msg_type == "start_debate":
        topic = msg_data.get("topic", "") if isinstance(msg_data, dict) else ""
        if topic and session.mode == "arena" and not session.arena_is_running:
            session.arena_topic = topic
            session.arena_is_running = True
            session.user_debate_side = None
            print(f"Starting debate on topic: {topic}")
            asyncio.create_task(run_arena_debate(sid, session))
    
    elif msg_type == "stop_debate":
        session.arena_is_running = False
        session.user_debate_side = None
        print(f"Session {sid} stopped debate")
    
    elif msg_type == "join_debate":
        side = msg_data.get("side", "") if isinstance(msg_data, dict) else ""
        if side in ["pro", "con"]:
            session.user_debate_side = side
            print(f"Session {sid} joined debate on {side} side")
    
    elif msg_type == "leave_debate":
        session.user_debate_side = None
        print(f"Session {sid} left debate")


# ============================================================
# REST ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "Orator API", "version": "1.0.0"}

@app.get("/health")
async def health():
    """Detailed health check."""
    return {
        "status": "healthy",
        "deepgram": "configured" if os.getenv("DEEPGRAM_API_KEY") else "missing",
        "gemini": "configured" if os.getenv("GEMINI_API_KEY") else "missing",
        "elevenlabs": "configured" if os.getenv("ELEVENLABS_API_KEY") else "missing",
    }


# Use the Socket.IO ASGI app as the main app
app = socket_app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
