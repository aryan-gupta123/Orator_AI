"""Optional Deepgram transcription for complete audio recordings."""
import os
import httpx
from services.gemini_service import ProviderError


class SimpleDeepgramService:
    def __init__(self):
        self.api_key = os.getenv("DEEPGRAM_API_KEY", "")

    async def transcribe(self, audio_data: bytes, mime_type="audio/webm") -> str:
        if not self.api_key:
            raise ProviderError("Deepgram is not configured.")
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.deepgram.com/v1/listen",
                    headers={"Authorization": f"Token {self.api_key}", "Content-Type": mime_type},
                    params={"model": "nova-2", "smart_format": "true", "language": "en-US"},
                    content=audio_data,
                )
            if response.status_code != 200:
                raise ProviderError("Deepgram transcription failed. Check its key and quota, or use text input.")
            result = response.json()
            return result["results"]["channels"][0]["alternatives"][0]["transcript"].strip()
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
            raise ProviderError("Could not transcribe this recording. Try again or use text input.") from None


deepgram_service = SimpleDeepgramService()
