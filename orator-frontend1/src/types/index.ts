// WebSocket message types - MUST MATCH BACKEND CONTRACT

// Frontend -> Backend
export type OutgoingMessageType = 'audio' | 'mode' | 'scenario' | 'barge_in';

export interface AudioMessage {
  type: 'audio';
  data: string; // base64 audio chunk
}

export interface ModeMessage {
  type: 'mode';
  data: 'dojo' | 'arena';
}

export interface ScenarioMessage {
  type: 'scenario';
  data: ScenarioType;
}

export interface BargeInMessage {
  type: 'barge_in';
  data: boolean;
}

export type OutgoingMessage = AudioMessage | ModeMessage | ScenarioMessage | BargeInMessage;

// Backend -> Frontend
export type IncomingMessageType = 'transcript' | 'audio' | 'video' | 'coach' | 'status';

export interface TranscriptMessage {
  type: 'transcript';
  data: {
    speaker: 'user' | 'ai_a' | 'ai_b';
    text: string;
  };
}

export interface IncomingAudioMessage {
  type: 'audio';
  data: string; // base64 mp3 chunk
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
  data: 'listening' | 'thinking' | 'speaking';
}

export type IncomingMessage = 
  | TranscriptMessage 
  | IncomingAudioMessage 
  | VideoMessage 
  | CoachMessage 
  | StatusMessage;

// App types
export type AppMode = 'dojo' | 'arena';
export type AppStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export type ScenarioType = 
  | 'salary_hard' 
  | 'salary_easy' 
  | 'pizza_debate' 
  | 'ai_danger_debate'
  | 'interview_practice';

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  mode: AppMode;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'salary_hard',
    name: 'Salary Negotiation (Hard)',
    description: 'Your boss is tough and skeptical. Convince them you deserve a raise.',
    mode: 'dojo',
  },
  {
    id: 'salary_easy',
    name: 'Salary Negotiation (Supportive)',
    description: 'Your boss is open-minded. Practice making your case.',
    mode: 'dojo',
  },
  {
    id: 'interview_practice',
    name: 'Job Interview',
    description: 'Practice answering tough interview questions.',
    mode: 'dojo',
  },
  {
    id: 'pizza_debate',
    name: 'Pineapple on Pizza',
    description: 'Watch two AIs battle over the most controversial food topic.',
    mode: 'arena',
  },
  {
    id: 'ai_danger_debate',
    name: 'Is AI Dangerous?',
    description: 'A heated debate on the future of artificial intelligence.',
    mode: 'arena',
  },
];

export interface ChatMessage {
  id: string;
  speaker: 'user' | 'ai_a' | 'ai_b' | 'system';
  text: string;
  timestamp: Date;
}

export interface CoachFeedback {
  sentiment: string;
  advice: string;
  score: number;
  timestamp: Date;
}
