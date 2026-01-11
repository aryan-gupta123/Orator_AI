"""
Session management for conversation state.
"""
from dataclasses import dataclass, field
from typing import Literal, Optional
from datetime import datetime
import uuid

MessageRole = Literal["user", "assistant", "system"]
AppMode = Literal["sandbox", "dojo", "arena"]
AppStatus = Literal["idle", "listening", "thinking", "speaking"]

@dataclass
class Message:
    role: MessageRole
    content: str
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass 
class Session:
    """Manages conversation state for a single user session."""
    
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    mode: AppMode = "sandbox"
    status: AppStatus = "idle"
    
    # Conversation history
    messages: list[Message] = field(default_factory=list)
    
    # Current configuration
    system_prompt: str = ""
    coach_prompt: str = ""
    persona_id: str = "friend"
    scenario_id: str = ""
    
    # Arena mode specific
    arena_topic: str = ""
    arena_ai_a_prompt: str = ""
    arena_ai_b_prompt: str = ""
    arena_current_speaker: Literal["ai_a", "ai_b", None] = None
    arena_is_running: bool = False
    
    # Timestamps
    created_at: datetime = field(default_factory=datetime.now)
    last_activity: datetime = field(default_factory=datetime.now)
    
    def add_message(self, role: MessageRole, content: str):
        """Add a message to the conversation history."""
        self.messages.append(Message(role=role, content=content))
        self.last_activity = datetime.now()
    
    def get_history_for_llm(self, max_messages: int = 20) -> list[dict]:
        """Get conversation history formatted for Gemini API."""
        recent = self.messages[-max_messages:] if len(self.messages) > max_messages else self.messages
        
        history = []
        for msg in recent:
            if msg.role == "user":
                history.append({"role": "user", "parts": [msg.content]})
            elif msg.role == "assistant":
                history.append({"role": "model", "parts": [msg.content]})
        
        return history
    
    def clear_history(self):
        """Clear conversation history."""
        self.messages = []
        self.last_activity = datetime.now()
    
    def set_mode(self, mode: AppMode):
        """Change mode and reset relevant state."""
        self.mode = mode
        self.clear_history()
        self.arena_is_running = False
        self.arena_current_speaker = None


class SessionManager:
    """Manages multiple user sessions."""
    
    def __init__(self):
        self.sessions: dict[str, Session] = {}
    
    def get_or_create(self, session_id: str) -> Session:
        """Get existing session or create new one."""
        if session_id not in self.sessions:
            self.sessions[session_id] = Session(id=session_id)
        return self.sessions[session_id]
    
    def get(self, session_id: str) -> Optional[Session]:
        """Get session by ID."""
        return self.sessions.get(session_id)
    
    def remove(self, session_id: str):
        """Remove a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def cleanup_old_sessions(self, max_age_hours: int = 2):
        """Remove sessions older than max_age_hours."""
        now = datetime.now()
        to_remove = []
        
        for sid, session in self.sessions.items():
            age = (now - session.last_activity).total_seconds() / 3600
            if age > max_age_hours:
                to_remove.append(sid)
        
        for sid in to_remove:
            del self.sessions[sid]
