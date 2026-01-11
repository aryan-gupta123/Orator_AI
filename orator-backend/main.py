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

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import socketio

from models.session import Session, SessionManager
from services.deepgram_service import deepgram_service
from services.gemini_service import gemini_service
from services.elevenlabs_service import elevenlabs_service
from prompts.system_prompts import (
    get_sandbox_prompt,
    get_dojo_prompts,
    get_arena_prompts,
    SANDBOX_PERSONAS
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
    await sio.emit("message", {"type": "audio", "data": audio_base64}, room=sid)

async def send_coach(sid: str, feedback: dict):
    """Send coach feedback to client."""
    await sio.emit("message", {"type": "coach", "data": feedback}, room=sid)

async def process_user_audio(sid: str, audio_base64: str, session: Session):
    """Process incoming audio: transcribe -> respond -> speak."""
    try:
        # Decode audio
        audio_bytes = base64.b64decode(audio_base64)
        
        # Update status
        await send_status(sid, "listening")
        
        # Transcribe with Deepgram
        transcript = await deepgram_service.transcribe(audio_bytes)
        
        if not transcript:
            return
        
        # Send user transcript to frontend
        await send_transcript(sid, "user", transcript)
        session.add_message("user", transcript)
        
        # Update status
        await send_status(sid, "thinking")
        
        # Generate response based on mode
        if session.mode == "sandbox":
            response = await handle_sandbox_response(session, transcript)
            speaker = "ai"
            voice = elevenlabs_service.get_voice_for_persona(session.persona_id)
            
        elif session.mode == "dojo":
            response, coach_feedback = await handle_dojo_response(session, transcript)
            speaker = "ai"
            voice = "professional"
            
            # Send coach feedback
            if coach_feedback:
                await send_coach(sid, coach_feedback)
                
        else:  # arena - user barged in
            response = await handle_arena_barge_in(session, transcript)
            speaker = "ai"
            voice = "default"
        
        if not response:
            await send_status(sid, "idle")
            return
        
        # Send AI transcript
        await send_transcript(sid, speaker, response)
        session.add_message("assistant", response)
        
        # Generate and send audio
        await send_status(sid, "speaking")
        audio_base64 = await elevenlabs_service.text_to_speech_base64(response, voice)
        
        if audio_base64:
            await send_audio(sid, audio_base64)
        
        await send_status(sid, "idle")
        
    except Exception as e:
        print(f"Error processing audio: {e}")
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
    
    # Generate coach feedback (in parallel would be better, but keeping simple)
    coach_feedback = await gemini_service.generate_coach_feedback(
        user_message=user_message,
        coach_prompt=coach_prompt,
        context=f"Scenario: {session.scenario_id}"
    )
    
    return response, coach_feedback

async def handle_arena_barge_in(session: Session, user_message: str) -> str:
    """Handle user intervention in arena debate."""
    # Simple acknowledgment - in a full implementation, this would
    # integrate into the debate flow
    response = await gemini_service.generate_response(
        user_message=user_message,
        system_prompt="""The user has intervened in an AI debate to share their opinion.
Acknowledge their point briefly and either agree, disagree, or ask for clarification.
Be respectful and engaging. Keep it to 2 sentences.""",
        history=[]
    )
    return response

async def run_arena_debate(sid: str, session: Session):
    """Run the arena debate loop."""
    arena_config = get_arena_prompts(session.scenario_id)
    topic = arena_config["topic"]
    ai_a_config = arena_config["ai_a"]
    ai_b_config = arena_config["ai_b"]
    
    # Opening statement from AI A
    session.arena_current_speaker = "ai_a"
    
    opening = await gemini_service.generate_debate_response(
        opponent_message="[Opening statement - state your position clearly]",
        system_prompt=ai_a_config["system"],
        topic=topic
    )
    
    await send_transcript(sid, "ai_a", opening)
    session.add_message("assistant", f"[{ai_a_config['name']}]: {opening}")
    
    # Speak it
    await send_status(sid, "speaking")
    audio = await elevenlabs_service.text_to_speech_base64(
        opening, 
        elevenlabs_service.get_voice_for_debater("ai_a")
    )
    if audio:
        await send_audio(sid, audio)
    
    await asyncio.sleep(1)  # Brief pause between speakers
    
    last_statement = opening
    turn = 0
    max_turns = 10  # Limit debate length
    
    while session.arena_is_running and turn < max_turns:
        turn += 1
        
        # AI B responds
        session.arena_current_speaker = "ai_b"
        await send_status(sid, "thinking")
        
        response_b = await gemini_service.generate_debate_response(
            opponent_message=last_statement,
            system_prompt=ai_b_config["system"],
            topic=topic
        )
        
        await send_transcript(sid, "ai_b", response_b)
        session.add_message("assistant", f"[{ai_b_config['name']}]: {response_b}")
        
        await send_status(sid, "speaking")
        audio = await elevenlabs_service.text_to_speech_base64(
            response_b,
            elevenlabs_service.get_voice_for_debater("ai_b")
        )
        if audio:
            await send_audio(sid, audio)
        
        await asyncio.sleep(1)
        
        if not session.arena_is_running:
            break
        
        # AI A responds
        session.arena_current_speaker = "ai_a"
        await send_status(sid, "thinking")
        
        response_a = await gemini_service.generate_debate_response(
            opponent_message=response_b,
            system_prompt=ai_a_config["system"],
            topic=topic
        )
        
        await send_transcript(sid, "ai_a", response_a)
        session.add_message("assistant", f"[{ai_a_config['name']}]: {response_a}")
        
        await send_status(sid, "speaking")
        audio = await elevenlabs_service.text_to_speech_base64(
            response_a,
            elevenlabs_service.get_voice_for_debater("ai_a")
        )
        if audio:
            await send_audio(sid, audio)
        
        last_statement = response_a
        await asyncio.sleep(1)
    
    session.arena_is_running = False
    await send_status(sid, "idle")

# ============================================================
# SOCKET.IO EVENT HANDLERS
# ============================================================

@sio.event
async def connect(sid, environ):
    """Handle new client connection."""
    print(f"Client connected: {sid}")
    session = session_manager.get_or_create(sid)
    await send_status(sid, "idle")

@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    print(f"Client disconnected: {sid}")
    session = session_manager.get(sid)
    if session:
        session.arena_is_running = False  # Stop any running debate
    session_manager.remove(sid)

@sio.event
async def message(sid, data):
    """Handle incoming messages from client."""
    session = session_manager.get_or_create(sid)
    msg_type = data.get("type")
    msg_data = data.get("data")
    
    print(f"Message from {sid}: type={msg_type}")
    
    if msg_type == "audio":
        # Process audio in background to not block
        asyncio.create_task(process_user_audio(sid, msg_data, session))
    
    elif msg_type == "mode":
        session.set_mode(msg_data)
        print(f"Session {sid} mode changed to: {msg_data}")
        
        # Set default scenario/persona for the mode
        if msg_data == "sandbox":
            session.persona_id = "friend"
        elif msg_data == "dojo":
            session.scenario_id = "salary_hard"
        elif msg_data == "arena":
            session.scenario_id = "pizza_debate"
    
    elif msg_type == "scenario":
        session.scenario_id = msg_data
        session.clear_history()
        print(f"Session {sid} scenario changed to: {msg_data}")
    
    elif msg_type == "sandbox_config":
        persona = msg_data.get("persona", "friend")
        session.persona_id = persona
        session.clear_history()
        print(f"Session {sid} persona changed to: {persona}")
    
    elif msg_type == "barge_in":
        # Stop the debate loop
        session.arena_is_running = False
        print(f"Session {sid} barged into debate")
    
    elif msg_type == "start_debate":
        if session.mode == "arena" and not session.arena_is_running:
            session.arena_is_running = True
            asyncio.create_task(run_arena_debate(sid, session))
    
    elif msg_type == "stop_debate":
        session.arena_is_running = False

# ============================================================
# REST ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Orator API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Detailed health check."""
    return {
        "status": "healthy",
        "deepgram": "configured" if os.getenv("DEEPGRAM_API_KEY") else "missing",
        "gemini": "configured" if os.getenv("GEMINI_API_KEY") else "missing",
        "elevenlabs": "configured" if os.getenv("ELEVENLABS_API_KEY") else "missing",
    }

# ============================================================
# RUN SERVER
# ============================================================

# Use the Socket.IO ASGI app as the main app
app = socket_app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
