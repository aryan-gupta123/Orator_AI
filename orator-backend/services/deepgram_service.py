"""
Deepgram service for real-time speech-to-text.
"""
import os
import httpx

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

class SimpleDeepgramService:
    """
    Deepgram service using REST API for transcription.
    """
    
    def __init__(self):
        self.api_key = DEEPGRAM_API_KEY
        self.base_url = "https://api.deepgram.com/v1/listen"
    
    async def transcribe(self, audio_data: bytes) -> str:
        """
        Transcribe audio data using REST API.
        """
        headers = {
            "Authorization": f"Token {self.api_key}",
        }
        
        # Simplified params - let Deepgram auto-detect the format
        params = {
            "model": "nova-2",
            "smart_format": "true",
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    params=params,
                    content=audio_data,
                    timeout=30.0
                )
                
                print(f"Deepgram response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    transcript = (
                        result.get("results", {})
                        .get("channels", [{}])[0]
                        .get("alternatives", [{}])[0]
                        .get("transcript", "")
                    )
                    print(f"Transcript: '{transcript}'")
                    return transcript.strip()
                else:
                    print(f"Deepgram API error: {response.status_code} - {response.text}")
                    return ""
        except Exception as e:
            print(f"Deepgram request error: {e}")
            return ""


# Global instance
deepgram_service = SimpleDeepgramService()