import os
import elevenlabs
from typing import AsyncIterator

class ElevenLabsService:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        elevenlabs.set_api_key(self.api_key)
        
        # Voice IDs (you can customize these)
        self.voices = {
            "negotiator": "21m00Tcm4TlvDq8ikWAM",  # Rachel - professional female
            "debater_a": "pNInz6obpgDQGcFmaJgB",   # Adam - confident male
            "debater_b": "EXAVITQu4vr4xnSDxMaL",   # Bella - assertive female
        }
        
    async def text_to_speech_stream(
        self, 
        text: str, 
        voice_type: str = "negotiator"
    ) -> AsyncIterator[bytes]:
        """
        Stream TTS audio chunks
        Using Turbo v2.5 for lowest latency
        """
        
        voice_id = self.voices.get(voice_type, self.voices["negotiator"])
        
        try:
            # Generate audio with streaming
            audio_stream = elevenlabs.generate(
                text=text,
                voice=voice_id,
                model="eleven_turbo_v2_5",  # Fastest model
                stream=True
            )
            
            # Yield audio chunks
            for chunk in audio_stream:
                if chunk:
                    yield chunk
                    
        except Exception as e:
            print(f"ElevenLabs error: {e}")
            # Return empty generator on error
            return
            
    def get_voice_for_mode(self, mode: str, debater: str = "a") -> str:
        """Get appropriate voice type based on mode"""
        if mode == "dojo":
            return "negotiator"
        else:  # arena
            return f"debater_{debater}"