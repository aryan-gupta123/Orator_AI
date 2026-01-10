from typing import List, Dict, Literal
from datetime import datetime

class Session:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.mode: Literal["dojo", "arena"] = "dojo"
        self.scenario: str = "salary_negotiation"
        self.difficulty: Literal["supportive", "hard"] = "supportive"
        self.history: List[Dict[str, str]] = []
        self.current_debater: Literal["a", "b"] = "a"
        self.created_at = datetime.now()
        self.coach_feedback: List[Dict] = []
        
    def add_message(self, role: str, content: str):
        """Add message to conversation history"""
        self.history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
    def reset_history(self):
        """Clear conversation history"""
        self.history = []
        self.coach_feedback = []
        
    def toggle_debater(self):
        """Switch between debater A and B in arena mode"""
        self.current_debater = "b" if self.current_debater == "a" else "a"
        
    def get_conversation_context(self) -> str:
        """Get formatted conversation for prompts"""
        context = []
        for msg in self.history[-10:]:  # Last 10 messages for context
            role = msg["role"]
            content = msg["content"]
            context.append(f"{role}: {content}")
        return "\n".join(context)