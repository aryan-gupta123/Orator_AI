from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import base64
from typing import Dict
from services.deepgram_service import DeepgramService
from services.gemini_service import GeminiService
from services.elevenlabs_service import ElevenLabsService
from services.twelvelabs_service import TwelveLabsService
from models.session import Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: Dict[str, Session] = {}

@app.get("/")
async def root():
    return {"status": "Negotiation AI Backend Running"}

@app.websocket("/ws/audio")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = id(websocket)
    
    deepgram = DeepgramService()
    gemini = GeminiService()
    elevenlabs = ElevenLabsService()
    twelvelabs = TwelveLabsService()
    
    session = Session(session_id=str(session_id))
    sessions[str(session_id)] = session
    
    transcript_queue = asyncio.Queue()
    deepgram_task = None
    transcript_task = None
    is_processing = False
    
    try:
        await websocket.send_json({"type": "status", "data": "connected"})
        
        async def handle_transcripts():
            """Process transcripts and generate AI responses"""
            nonlocal is_processing
            
            while True:
                transcript_data = await transcript_queue.get()
                
                if transcript_data.get("is_final") and not is_processing:
                    text = transcript_data.get("text", "").strip()
                    
                    if not text:
                        continue
                    
                    is_processing = True
                    
                    # Add to session history
                    session.add_message("user", text)
                    
                    # Send transcript to frontend
                    await websocket.send_json({
                        "type": "transcript",
                        "data": {"speaker": "user", "text": text}
                    })
                    
                    # Generate coach feedback (parallel in dojo mode)
                    if session.mode == "dojo":
                        feedback_task = asyncio.create_task(
                            gemini.generate_coach_feedback(text, session.history, session.scenario)
                        )
                    
                    # Generate AI response
                    await websocket.send_json({"type": "status", "data": "thinking"})
                    
                    if session.mode == "dojo":
                        response = await gemini.generate_response(
                            session.history, session.scenario, session.difficulty
                        )
                        speaker = "ai_a"
                    else:  # arena
                        response = await gemini.generate_debate_response(
                            session.history, session.scenario, session.current_debater
                        )
                        speaker = f"ai_{session.current_debater}"
                    
                    # Check for video search request
                    has_search, search_query = await gemini.check_for_video_search(response)
                    
                    if has_search:
                        # Remove search tag from response
                        response = response.replace(f"[SEARCH: {search_query}]", "").strip()
                        
                        # Search for video
                        video_result = await twelvelabs.search_video_evidence(search_query)
                        
                        if video_result:
                            await websocket.send_json({
                                "type": "video",
                                "data": {
                                    "videoId": video_result["video_id"],
                                    "timestamp": video_result["timestamp"]
                                }
                            })
                    
                    # Add AI response to history
                    session.add_message("ai", response)
                    
                    # Send transcript
                    await websocket.send_json({
                        "type": "transcript",
                        "data": {"speaker": speaker, "text": response}
                    })
                    
                    # Generate speech
                    await websocket.send_json({"type": "status", "data": "speaking"})
                    
                    voice_type = elevenlabs.get_voice_for_mode(
                        session.mode, 
                        session.current_debater
                    )
                    
                    async for audio_chunk in elevenlabs.text_to_speech_stream(
                        response, voice_type
                    ):
                        await websocket.send_json({
                            "type": "audio",
                            "data": base64.b64encode(audio_chunk).decode()
                        })
                    
                    # Send coach feedback (if ready)
                    if session.mode == "dojo":
                        try:
                            feedback = await feedback_task
                            await websocket.send_json({
                                "type": "coach",
                                "data": feedback
                            })
                        except:
                            pass
                    
                    await websocket.send_json({"type": "status", "data": "listening"})
                    
                    # If arena mode, switch debater
                    if session.mode == "arena":
                        session.toggle_debater()
                    
                    is_processing = False
        
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            msg_type = data.get("type")
            
            if msg_type == "audio":
                # Start Deepgram if not started
                if not deepgram_task:
                    deepgram_task = asyncio.create_task(
                        deepgram.stream_transcription(transcript_queue)
                    )
                    transcript_task = asyncio.create_task(handle_transcripts())
                
                # Send audio to Deepgram
                audio_data = base64.b64decode(data.get("data"))
                await deepgram.send_audio(audio_data)
                
            elif msg_type == "mode":
                session.mode = data.get("data")
                session.reset_history()
                await websocket.send_json({
                    "type": "status",
                    "data": f"switched_to_{session.mode}"
                })
                
            elif msg_type == "scenario":
                session.scenario = data.get("data")
                session.reset_history()
                
            elif msg_type == "difficulty":
                session.difficulty = data.get("data")
                
            elif msg_type == "barge_in":
                # Interrupt current processing
                is_processing = False
                await websocket.send_json({"type": "status", "data": "listening"})
                
    except WebSocketDisconnect:
        print(f"Client disconnected: {session_id}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup
        if deepgram_task:
            deepgram_task.cancel()
        if transcript_task:
            transcript_task.cancel()
        if deepgram.connection:
            await deepgram.close()
        if str(session_id) in sessions:
            del sessions[str(session_id)]
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)