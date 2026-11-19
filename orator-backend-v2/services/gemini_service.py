"""Gemini REST client shared by conversation, coaching, and optional audio input."""
import base64
import json
import math
import os

import httpx


class ProviderError(RuntimeError):
    """An actionable provider failure safe to show to the user."""


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

    async def _generate(self, contents, system_prompt="", *, json_output=False):
        if not self.api_key:
            raise ProviderError("Set GEMINI_API_KEY on the backend to enable conversations.")
        config = {"temperature": 0.3 if json_output else 0.7, "maxOutputTokens": 600}
        if json_output:
            config["responseMimeType"] = "application/json"
        payload = {"contents": contents, "generationConfig": config}
        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent",
                    headers={"x-goog-api-key": self.api_key}, json=payload,
                )
        except httpx.TimeoutException:
            raise ProviderError("Gemini timed out. Please try again.") from None
        except httpx.HTTPError:
            raise ProviderError("Cannot reach Gemini. Check the backend network connection.") from None
        if response.status_code != 200:
            explanations = {
                400: "Gemini rejected this request. Check the model and recording format.",
                401: "Gemini authentication failed. Check GEMINI_API_KEY.",
                403: "Gemini access was denied. Check the API key and project permissions.",
                404: "Gemini model not found. Check GEMINI_MODEL.",
                429: "Gemini quota or rate limit reached. Wait before trying again, or check your project's quota.",
            }
            raise ProviderError(explanations.get(response.status_code, "Gemini is unavailable. Please try again later."))
        try:
            parts = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [])
            text = "".join(p.get("text", "") for p in parts if not p.get("thought")).strip()
        except (ValueError, IndexError, AttributeError, TypeError):
            text = ""
        if not text:
            raise ProviderError("Gemini returned no usable response. Try rephrasing your message.")
        return text

    async def generate_response(self, user_message, system_prompt, history=None):
        contents = []
        for item in history or []:
            contents.append({"role": item["role"], "parts": [
                {"text": p} if isinstance(p, str) else p for p in item["parts"]
            ]})
        contents.append({"role": "user", "parts": [{"text": user_message}]})
        return await self._generate(contents, system_prompt)

    async def generate_coach_feedback(self, user_message, coach_prompt, context=""):
        text = await self._generate([{"role": "user", "parts": [{"text":
            f"Context: {context}\nUser statement: {user_message}\n"
            'Return JSON with sentiment (string), advice (string), score (number 0–100).'
        }]}], coach_prompt, json_output=True)
        try:
            data = json.loads(text)
            score = data["score"]
            if isinstance(score, bool) or not isinstance(score, (int, float)) or not math.isfinite(score) or not 0 <= score <= 100:
                raise ValueError
            if not all(isinstance(data[k], str) and data[k].strip() for k in ("sentiment", "advice")):
                raise ValueError
            return {"sentiment": data["sentiment"], "advice": data["advice"], "score": round(score)}
        except (ValueError, KeyError, TypeError):
            raise ProviderError("Coaching feedback was invalid. No score was assigned; please try another turn.") from None

    async def transcribe_audio(self, audio_data, mime_type):
        return await self._generate([{"role": "user", "parts": [
            {"text": "Transcribe only the intelligible spoken words in this recording. Do not answer the speaker. If there is no speech, return exactly [NO_SPEECH]."},
            {"inlineData": {"mimeType": mime_type, "data": base64.b64encode(audio_data).decode()}},
        ]}])


gemini_service = GeminiService()
