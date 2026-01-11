"""
Gemini service for AI conversation logic.
"""
import os
import json
import google.generativeai as genai
from typing import Optional, AsyncGenerator

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

class GeminiService:
    """Handles AI conversations using Google Gemini."""
    
    def __init__(self):
        # Use Gemini 1.5 Flash for speed
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.8,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 500,
            }
        )
        
        # Separate model for coach analysis (more deterministic)
        self.coach_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.3,
                "top_p": 0.9,
                "max_output_tokens": 200,
            }
        )
    
    async def generate_response(
        self,
        user_message: str,
        system_prompt: str,
        history: list[dict] = None
    ) -> str:
        """
        Generate a conversational response.
        
        Args:
            user_message: The user's message
            system_prompt: System instructions for the AI
            history: Previous conversation history
            
        Returns:
            AI response text
        """
        try:
            # Build the conversation
            chat = self.model.start_chat(history=history or [])
            
            # Combine system prompt with user message for context
            full_prompt = f"""[SYSTEM INSTRUCTIONS]
{system_prompt}

[USER MESSAGE]
{user_message}

Respond naturally and conversationally. Keep your response concise (2-4 sentences unless more detail is needed)."""

            # Generate response
            response = await chat.send_message_async(full_prompt)
            
            return response.text.strip()
            
        except Exception as e:
            print(f"Gemini generation error: {e}")
            return "I'm having trouble responding right now. Could you try again?"
    
    async def generate_coach_feedback(
        self,
        user_message: str,
        coach_prompt: str,
        context: str = ""
    ) -> dict:
        """
        Generate coach feedback on user's communication.
        
        Args:
            user_message: What the user said
            coach_prompt: Instructions for the coach
            context: Additional context about the conversation
            
        Returns:
            Dict with sentiment, advice, and score
        """
        try:
            prompt = f"""{coach_prompt}

Context: {context}

User just said: "{user_message}"

Analyze this and respond with ONLY valid JSON (no markdown, no explanation):
{{"sentiment": "string", "advice": "string", "score": number}}"""

            response = await self.coach_model.generate_content_async(prompt)
            text = response.text.strip()
            
            # Clean up response - remove markdown code blocks if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()
            
            # Parse JSON
            try:
                feedback = json.loads(text)
                return {
                    "sentiment": feedback.get("sentiment", "neutral"),
                    "advice": feedback.get("advice", "Keep going!"),
                    "score": min(100, max(0, int(feedback.get("score", 70))))
                }
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "sentiment": "neutral",
                    "advice": "Keep the conversation going!",
                    "score": 70
                }
                
        except Exception as e:
            print(f"Coach feedback error: {e}")
            return {
                "sentiment": "neutral", 
                "advice": "Keep practicing!",
                "score": 70
            }
    
    async def generate_debate_response(
        self,
        opponent_message: str,
        system_prompt: str,
        topic: str,
        history: list[dict] = None
    ) -> str:
        """
        Generate a debate response for Arena mode.
        
        Args:
            opponent_message: What the opponent just said
            system_prompt: This debater's persona and stance
            topic: The debate topic
            history: Previous debate exchanges
            
        Returns:
            Debate response text
        """
        try:
            prompt = f"""{system_prompt}

DEBATE TOPIC: {topic}

Your opponent just said: "{opponent_message}"

Respond with a strong counter-argument or rebuttal. Be passionate but respectful.
Keep it to 2-3 sentences. Make it punchy and quotable."""

            response = await self.model.generate_content_async(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"Debate generation error: {e}")
            return "That's an interesting point, but I respectfully disagree."


# Global instance
gemini_service = GeminiService()
