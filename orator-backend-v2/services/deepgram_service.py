"""
Deepgram service for real-time speech-to-text.
"""
import os
import asyncio
import base64
from typing import Callable, Optional
from deepgram import Deepgram

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

class DeepgramService:
    """Handles real-time speech-to-text using Deepgram."""
    
    def __init__(self):
        self.client = Deepgram(DEEPGRAM_API_KEY)
        self.connections: dict[str, any] = {}
    
    async def start_stream(
        self, 
        session_id: str,
        on_transcript: Callable[[str, bool], None],
        on_error: Optional[Callable[[Exception], None]] = None
    ):
        """
        Start a real-time transcription stream.
        
        Args:
            session_id: Unique session identifier
            on_transcript: Callback(text, is_final) when transcript received
            on_error: Optional callback for errors
        """
        try:
            # Create live transcription connection
            connection = await self.client.transcription.live({
                "model": "nova-2",
                "language": "en-US",
                "smart_format": True,
                "interim_results": True,
                "utterance_end_ms": 1000,
                "vad_events": True,
                "endpointing": 300,
            })
            
            # Set up event handlers
            async def on_message(result):
                try:
                    transcript = result.get("channel", {}).get("alternatives", [{}])[0].get("transcript", "")
                    is_final = result.get("is_final", False)
                    
                    if transcript.strip():
                        await on_transcript(transcript, is_final)
                except Exception as e:
                    print(f"Error processing transcript: {e}")
            
            async def on_error_handler(error):
                print(f"Deepgram error: {error}")
                if on_error:
                    await on_error(error)
            
            connection.registerHandler(connection.event.TRANSCRIPT_RECEIVED, on_message)
            connection.registerHandler(connection.event.ERROR, on_error_handler)
            
            self.connections[session_id] = connection
            
            return connection
            
        except Exception as e:
            print(f"Failed to start Deepgram stream: {e}")
            raise
    
    async def send_audio(self, session_id: str, audio_data: bytes):
        """Send audio data to the transcription stream."""
        connection = self.connections.get(session_id)
        if connection:
            try:
                connection.send(audio_data)
            except Exception as e:
                print(f"Error sending audio to Deepgram: {e}")
    
    async def stop_stream(self, session_id: str):
        """Stop and clean up a transcription stream."""
        connection = self.connections.pop(session_id, None)
        if connection:
            try:
                await connection.finish()
            except Exception as e:
                print(f"Error closing Deepgram connection: {e}")


class SimpleDeepgramService:
    """
    Simplified Deepgram service using REST API for non-streaming transcription.
    Use this as fallback if WebSocket streaming has issues.
    """
    
    def __init__(self):
        self.api_key = DEEPGRAM_API_KEY
        self.base_url = "https://api.deepgram.com/v1/listen"
    
    async def transcribe(self, audio_data: bytes) -> str:
        """
        Transcribe audio data using REST API.
        
        Args:
            audio_data: Raw audio bytes
            
        Returns:
            Transcribed text
        """
        import httpx
        
        headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "audio/webm",
        }
        
        params = {
            "model": "nova-2",
            "smart_format": "true",
            "language": "en-US",
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.base_url,
                headers=headers,
                params=params,
                content=audio_data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                transcript = (
                    result.get("results", {})
                    .get("channels", [{}])[0]
                    .get("alternatives", [{}])[0]
                    .get("transcript", "")
                )
                return transcript.strip()
            else:
                print(f"Deepgram API error: {response.status_code} - {response.text}")
                return ""


# Global instance
deepgram_service = SimpleDeepgramService()
