"""
Demo Cache - Pre-generated responses for reliable demo
Use this if APIs are slow or rate-limited during presentation
"""

# Salary Negotiation Demo Script
SALARY_DEMO = {
    "user_1": "Hi, I'm excited to discuss the offer. I was hoping we could talk about the compensation package.",
    "ai_1": "Of course! I'm glad you're interested. We're offering $150,000 base salary. I think that's very competitive for this role. What are your thoughts?",
    
    "user_2": "I appreciate the offer, but based on my research and experience, I was hoping for something closer to $180,000.",
    "ai_2": "That's quite ambitious for this position. Our budget for this role is pretty firm at $150k. However, we do have excellent benefits and equity options. Can I ask what's driving that number?",
    
    "user_3": "I have 7 years of experience in this exact tech stack, and I've led teams of 5+ engineers at my current role. Market data shows senior engineers in this area averaging $175k.",
    "ai_3": "You make fair points about your experience. Let me see what I can do. I might be able to stretch to $160,000, but that's really pushing our budget. We could also add an extra week of PTO and a $10k signing bonus. How does that sound?",
    
    "user_4": "I appreciate you working with me. The signing bonus helps, but I'd really like to get closer to $170k on base salary. Could we meet in the middle at $165k with the signing bonus?",
    "ai_4": "You drive a hard bargain! Alright, I can do $165,000 base plus the $10k signing bonus and the extra PTO. That's my final offer, but I think it's a strong package. Do we have a deal?",
    
    "coach_1": {
        "sentiment": "neutral",
        "advice": "Good opening. Build rapport first.",
        "score": 60
    },
    "coach_2": {
        "sentiment": "strong",
        "advice": "Excellent anchor! Named specific number.",
        "score": 85
    },
    "coach_3": {
        "sentiment": "strong",
        "advice": "Perfect! Used data and experience.",
        "score": 90
    },
    "coach_4": {
        "sentiment": "strong",
        "advice": "Great counter. Shows flexibility.",
        "score": 88
    }
}

# AI Debate Demo Script
AI_DEBATE_DEMO = {
    "debater_a_1": "AI regulation is absolutely necessary. We're developing technology that could reshape society, and we need guardrails. Look at what experts are saying about the risks.",
    
    "debater_b_1": "Regulation will only slow innovation and create regulatory capture. The big tech companies will write the rules to benefit themselves. History shows this pattern repeatedly.",
    
    "debater_a_2": "But without regulation, we risk catastrophic outcomes. We need independent oversight, not industry self-regulation. The stakes are too high to just hope companies do the right thing.",
    
    "debater_b_2": "Innovation moves faster than regulation. By the time rules are written, the technology has evolved. We need adaptive frameworks, not rigid laws that become obsolete immediately."
}

class DemoCache:
    """Fallback cache for demo presentations"""
    
    def __init__(self):
        self.salary_responses = SALARY_DEMO
        self.debate_responses = AI_DEBATE_DEMO
        self.current_turn = 0
        
    def get_cached_response(self, mode: str, turn: int) -> dict:
        """Get pre-cached response for demo"""
        
        if mode == "dojo":
            response_key = f"ai_{turn}"
            coach_key = f"coach_{turn}"
            
            return {
                "response": self.salary_responses.get(response_key, ""),
                "coach": self.salary_responses.get(coach_key, {})
            }
        
        elif mode == "arena":
            debater = "a" if turn % 2 == 1 else "b"
            response_key = f"debater_{debater}_{(turn + 1) // 2}"
            
            response = self.debate_responses.get(response_key, "")
            
            return {
                "response": response
            }
        
        return {"response": "", "coach": None}
    
    def should_use_cache(self) -> bool:
        """
        Determine if we should use cache
        Set this to True during actual demo presentation
        """
        import os
        return os.getenv("DEMO_MODE", "false").lower() == "true"

# Usage in main.py:
"""
from demo_cache import DemoCache

cache = DemoCache()

if cache.should_use_cache():
    # Use cached response
    cached = cache.get_cached_response(session.mode, session.turn_count)
    response = cached["response"]
    coach_feedback = cached.get("coach")
else:
    # Use real APIs
    response = await gemini.generate_response(...)
"""

# To enable demo mode, add to .env:
# DEMO_MODE=true