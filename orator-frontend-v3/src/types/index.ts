// WebSocket message types

export type AppMode = 'sandbox' | 'dojo' | 'arena';
export type AppStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

// Frontend -> Backend
export interface AudioMessage {
  type: 'audio';
  data: string;
}

export interface ModeMessage {
  type: 'mode';
  data: AppMode;
}

export interface ScenarioMessage {
  type: 'scenario';
  data: ScenarioType;
}

export interface BargeInMessage {
  type: 'barge_in';
  data: boolean;
}

export interface SandboxConfigMessage {
  type: 'sandbox_config';
  data: {
    persona: string;
    context: string;
  };
}

export type OutgoingMessage = 
  | AudioMessage 
  | ModeMessage 
  | ScenarioMessage 
  | BargeInMessage
  | SandboxConfigMessage;

// Backend -> Frontend
export interface TranscriptMessage {
  type: 'transcript';
  data: {
    speaker: 'user' | 'ai' | 'ai_a' | 'ai_b';
    text: string;
  };
}

export interface IncomingAudioMessage {
  type: 'audio';
  data: string;
}

export interface VideoMessage {
  type: 'video';
  data: {
    videoId: string;
    timestamp: number;
  };
}

export interface CoachMessage {
  type: 'coach';
  data: {
    sentiment: string;
    advice: string;
    score: number;
  };
}

export interface StatusMessage {
  type: 'status';
  data: AppStatus;
}

export type IncomingMessage = 
  | TranscriptMessage 
  | IncomingAudioMessage 
  | VideoMessage 
  | CoachMessage 
  | StatusMessage;

// Scenario types
export type ScenarioType = 
  | 'salary_hard' 
  | 'salary_easy' 
  | 'interview_tech'
  | 'interview_behavioral'
  | 'difficult_conversation'
  | 'pizza_debate' 
  | 'ai_debate'
  | 'climate_debate'
  | 'custom';

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  icon: string;
  mode: 'dojo' | 'arena';
  gradient: string;
}

export const SCENARIOS: Scenario[] = [
  // Dojo scenarios
  {
    id: 'salary_hard',
    name: 'Salary Negotiation',
    description: 'Face a tough, skeptical boss',
    icon: '💰',
    mode: 'dojo',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'salary_easy',
    name: 'Raise Request',
    description: 'Practice with a supportive manager',
    icon: '📈',
    mode: 'dojo',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'interview_tech',
    name: 'Technical Interview',
    description: 'Prepare for tough tech questions',
    icon: '💻',
    mode: 'dojo',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'interview_behavioral',
    name: 'Behavioral Interview',
    description: 'Master the STAR method',
    icon: '🎯',
    mode: 'dojo',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'difficult_conversation',
    name: 'Difficult Conversation',
    description: 'Navigate sensitive topics',
    icon: '💬',
    mode: 'dojo',
    gradient: 'from-rose-500 to-red-600',
  },
  // Arena scenarios
  {
    id: 'pizza_debate',
    name: 'Pineapple Pizza',
    description: 'The eternal food debate',
    icon: '🍕',
    mode: 'arena',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'ai_debate',
    name: 'AI Future',
    description: 'Is AI dangerous or beneficial?',
    icon: '🤖',
    mode: 'arena',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'climate_debate',
    name: 'Climate Action',
    description: 'Debate environmental policies',
    icon: '🌍',
    mode: 'arena',
    gradient: 'from-green-500 to-emerald-600',
  },
];

// Sandbox personas
export interface SandboxPersona {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  gradient: string;
}

export const SANDBOX_PERSONAS: SandboxPersona[] = [
  {
    id: 'friend',
    name: 'Supportive Friend',
    description: 'A warm, empathetic listener',
    icon: '🤗',
    systemPrompt: 'You are a warm, supportive friend. Be empathetic, caring, and genuinely interested.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'mentor',
    name: 'Wise Mentor',
    description: 'Thoughtful guidance and advice',
    icon: '🧙',
    systemPrompt: 'You are a wise mentor. Give thoughtful advice and help them see different perspectives.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'teacher',
    name: 'Patient Teacher',
    description: 'Learn anything, ask anything',
    icon: '📚',
    systemPrompt: 'You are a patient, encouraging teacher. Explain things clearly and celebrate progress.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'coach',
    name: 'Motivational Coach',
    description: 'Get pumped and stay focused',
    icon: '🔥',
    systemPrompt: 'You are an energetic motivational coach. Be encouraging, push them to their best.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'therapist',
    name: 'Calm Therapist',
    description: 'Process thoughts and feelings',
    icon: '🧘',
    systemPrompt: 'You are a calm, professional therapist. Help them explore their thoughts without judgment.',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    id: 'devil',
    name: "Devil's Advocate",
    description: 'Challenge your thinking',
    icon: '😈',
    systemPrompt: 'You play devil\'s advocate. Respectfully challenge their views to strengthen their arguments.',
    gradient: 'from-red-600 to-rose-700',
  },
];

export interface ChatMessage {
  id: string;
  speaker: 'user' | 'ai' | 'ai_a' | 'ai_b' | 'system';
  text: string;
  timestamp: Date;
}

export interface CoachFeedback {
  sentiment: string;
  advice: string;
  score: number;
  timestamp: Date;
}
