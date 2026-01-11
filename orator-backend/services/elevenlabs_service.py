"""
ElevenLabs service for text-to-speech.
"""
import os
import httpx
import base64
from typing import Optional

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Voice IDs from ElevenLabs
VOICES = {
    # Default voices
    "default": "21m00Tcm4TlvDq8ikWAM",  # Rachel - calm, friendly
    "friendly": "21m00Tcm4TlvDq8ikWAM",  # Rachel
    "professional": "29vD33N1CtxCmqQRPOHJ",  # Drew - confident male
    "warm": "EXAVITQu4vr4xnSDxMaL",  # Bella - warm female
    "energetic": "ErXwobaYiN019PkySvjV",  # Antoni - energetic male
    
    # Arena debate voices
    "advocate": "29vD33N1CtxCmqQRPOHJ",  # Drew - confident
    "critic": "VR6AewLTigWG4xSOukaG",  # Arnold - deeper voice
    
    # Persona voices
    "friend": "EXAVITQu4vr4xnSDxMaL",  # Bella - warm
    "mentor": "29vD33N1CtxCmqQRPOHJ",  # Drew - wise
    "teacher": "21m00Tcm4TlvDq8ikWAM",  # Rachel - clear
    "coach": "ErXwobaYiN019PkySvjV",  # Antoni - energetic
    "therapist": "EXAVITQu4vr4xnSDxMaL",  # Bella - calm
    "devil": "VR6AewLTigWG4xSOukaG",  # Arnold - challenging
}

class ElevenLabsService:
    """Handles text-to-speech using ElevenLabs."""
    
    def __init__(self):
        self.api_key = ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
    
    async def text_to_speech(
        self,
        text: str,
        voice_id: str = "default",
        model_id: str = "eleven_turbo_v2_5"
    ) -> Optional[bytes]:
        """
        Convert text to speech.
        
        Args:
            text: Text to convert
            voice_id: Voice identifier (name or actual ID)
            model_id: ElevenLabs model to use (turbo for low latency)
            
        Returns:
            Audio bytes (MP3 format) or None on error
        """
        # Resolve voice name to ID
        actual_voice_id = VOICES.get(voice_id, voice_id)
        
        url = f"{self.base_url}/text-to-speech/{actual_voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key,
        }
        
        payload = {
            "text": text,
            "model_id": model_id,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.5,
                "use_speaker_boost": True
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.content
                else:
                    print(f"ElevenLabs API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            print(f"ElevenLabs request error: {e}")
            return None
    
    async def text_to_speech_base64(
        self,
        text: str,
        voice_id: str = "default"
    ) -> Optional[str]:
        """
        Convert text to speech and return as base64.
        
        Args:
            text: Text to convert
            voice_id: Voice identifier
            
        Returns:
            Base64 encoded audio string or None
        """
        audio_bytes = await self.text_to_speech(text, voice_id)
        
        if audio_bytes:
            return base64.b64encode(audio_bytes).decode('utf-8')
        return None
    
    def get_voice_for_persona(self, persona_id: str) -> str:
        """Get the appropriate voice ID for a persona."""
        return VOICES.get(persona_id, VOICES["default"])
    
    def get_voice_for_debater(self, debater: str) -> str:
        """Get voice ID for arena debater (ai_a or ai_b)."""
        if debater == "ai_a":
            return VOICES["advocate"]
        elif debater == "ai_b":
            return VOICES["critic"]
        return VOICES["default"]


# Global instance  
elevenlabs_service = ElevenLabsService()
