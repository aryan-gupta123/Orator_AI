import os
import google.generativeai as genai
from typing import List, Dict
from prompts.system_prompts import (
    NEGOTIATOR_HARD,
    NEGOTIATOR_SUPPORTIVE,
    DEBATER_A,
    DEBATER_B,
    COACH,
    get_scenario_context
)

class GeminiService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")
        
    async def generate_response(
        self, 
        history: List[Dict], 
        scenario: str,
        difficulty: str = "supportive"
    ) -> str:
        """Generate negotiator response in dojo mode"""
        
        # Get system prompt based on difficulty
        system_prompt = NEGOTIATOR_HARD if difficulty == "hard" else NEGOTIATOR_SUPPORTIVE
        
        # Get scenario context
        scenario_context = get_scenario_context(scenario)
        
        # Format conversation history
        context = self._format_history(history)
        
        # Create prompt
        prompt = f"""{system_prompt}

SCENARIO:
{scenario_context}

CONVERSATION SO FAR:
{context}

Respond naturally as the negotiator. Keep it conversational (2-3 sentences max).
Remember: You're speaking, not writing. Use natural speech patterns."""
        
        # Generate response
        response = await self.model.generate_content_async(prompt)
        return response.text.strip()
        
    async def generate_debate_response(
        self,
        history: List[Dict],
        scenario: str,
        debater: str
    ) -> str:
        """Generate debater response in arena mode"""
        
        # Get debater prompt
        system_prompt = DEBATER_A if debater == "a" else DEBATER_B
        
        # Get scenario context
        scenario_context = get_scenario_context(scenario)
        
        # Format conversation
        context = self._format_history(history)
        
        prompt = f"""{system_prompt}

DEBATE TOPIC:
{scenario_context}

DEBATE SO FAR:
{context}

Make your argument. Keep it punchy (2-3 sentences). 
Speak naturally - you're in a live debate."""
        
        response = await self.model.generate_content_async(prompt)
        return response.text.strip()
        
    async def generate_coach_feedback(
        self,
        user_statement: str,
        history: List[Dict],
        scenario: str
    ) -> Dict:
        """Generate real-time coach feedback"""
        
        context = self._format_history(history[-5:])  # Last 5 messages
        
        prompt = f"""{COACH}

SCENARIO: {get_scenario_context(scenario)}

RECENT CONVERSATION:
{context}

USER JUST SAID:
"{user_statement}"

Provide feedback in this exact JSON format:
{{
    "sentiment": "strong|neutral|weak",
    "advice": "One specific tip (10 words max)",
    "score": 0-100
}}"""
        
        response = await self.model.generate_content_async(prompt)
        
        # Parse JSON response
        import json
        try:
            return json.loads(response.text.strip())
        except:
            return {
                "sentiment": "neutral",
                "advice": "Keep engaging naturally",
                "score": 50
            }
            
    def _format_history(self, history: List[Dict]) -> str:
        """Format conversation history for prompts"""
        if not history:
            return "No conversation yet."
            
        formatted = []
        for msg in history[-10:]:  # Last 10 messages
            role = "You" if msg["role"] == "ai" else "User"
            formatted.append(f"{role}: {msg['content']}")
            
        return "\n".join(formatted)