"""Explicit, optional local mode: OpenAI-compatible inference plus faster-whisper."""
import asyncio
import logging
import os
import tempfile
from pathlib import Path

import httpx
from services.gemini_service import GeminiService, ProviderError


class LocalService(GeminiService):
    def __init__(self):
        self.model = os.getenv("LOCAL_MODEL_NAME", "qwen2.5-1.5b-instruct")
        self.base_url = os.getenv("LOCAL_MODEL_URL", "http://127.0.0.1:8091/v1").rstrip("/")
        self.whisper_path = os.getenv("LOCAL_WHISPER_MODEL", "tiny.en")
        self.whisper = None
        self.transcription_lock = asyncio.Lock()

    async def _generate(self, contents, system_prompt="", *, json_output=False):
        messages = [{"role": "system", "content": system_prompt}] if system_prompt else []
        for item in contents:
            messages.append({"role": "assistant" if item.get("role") == "model" else "user",
                             "content": "\n".join(p.get("text", "") for p in item["parts"])})
        payload = {"model": self.model, "messages": messages, "max_tokens": 350, "temperature": 0.3 if json_output else 0.7}
        if json_output:
            payload["response_format"] = {"type": "json_object"}
        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(f"{self.base_url}/chat/completions", json=payload)
            if response.status_code != 200:
                raise ProviderError("Local model rejected this request. Check the model server logs.")
            text = response.json()["choices"][0]["message"]["content"].strip()
        except httpx.HTTPError:
            raise ProviderError("Cannot reach the local model. Start its OpenAI-compatible server or select Gemini.") from None
        except (ValueError, KeyError, IndexError, AttributeError, TypeError):
            raise ProviderError("The local model returned an invalid response.") from None
        if not text:
            raise ProviderError("The local model returned an empty response. Please try again.")
        return text

    async def transcribe_audio(self, audio_data, mime_type):
        # Loading/decoding/generation is CPU work: keep it off the event loop.
        async with self.transcription_lock:
            return await asyncio.to_thread(self._transcribe, audio_data)

    def _transcribe(self, audio_data):
        try:
            from faster_whisper import WhisperModel
            if self.whisper is None:
                self.whisper = WhisperModel(self.whisper_path, device="cpu", compute_type="int8", cpu_threads=4)
            with tempfile.TemporaryDirectory(prefix="orator-audio-") as folder:
                path = Path(folder) / "recording"
                path.write_bytes(audio_data)
                segments, _ = self.whisper.transcribe(str(path), language="en", beam_size=1)
                return " ".join(segment.text.strip() for segment in segments).strip() or "[NO_SPEECH]"
        except ImportError:
            raise ProviderError("Install requirements-local.txt to use local speech recognition.") from None
        except Exception:
            logging.getLogger(__name__).exception("Local transcription failed")
            raise ProviderError("Local transcription failed. Check LOCAL_WHISPER_MODEL or use text input.") from None
