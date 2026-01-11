# Orator.ai

A real-time voice conversation practice platform powered by AI. Practice conversations, improve your communication skills, and receive instant feedback through natural voice interactions.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## Overview

Orator.ai is a full-stack application that enables users to practice conversations with AI personas, train for specific scenarios like salary negotiations or job interviews, and watch AI debates. The platform uses real-time WebSocket communication to provide seamless voice interactions with instant transcription, AI-generated responses, and text-to-speech playback.

### Key Capabilities

- **Real-time voice conversations** with AI personas
- **Speech-to-text** transcription using Deepgram
- **AI-generated responses** using Google Gemini
- **Text-to-speech** audio playback using ElevenLabs
- **Multiple conversation modes** for different use cases
- **Real-time coaching feedback** for skill improvement
- **Session management** for conversation history

## Features

### 🎯 Sandbox Mode
Free-form conversations with AI personas:
- **Supportive Friend**: Warm, empathetic listener
- **Wise Mentor**: Thoughtful guidance and advice
- **Patient Teacher**: Clear explanations and learning support
- **Motivational Coach**: Energetic encouragement
- **Calm Therapist**: Professional emotional support
- **Devil's Advocate**: Challenges your thinking

### 🥋 Dojo Mode
Practice scenarios with real-time coaching:
- **Salary Negotiation**: Practice with tough or supportive managers
- **Technical Interview**: Prepare for challenging tech questions
- **Behavioral Interview**: Master the STAR method
- **Difficult Conversations**: Navigate sensitive topics
- Receive instant feedback on confidence, tone, and technique

### 🏛️ Arena Mode
Watch AI vs AI debates on various topics:
- **Pineapple Pizza Debate**: The eternal food controversy
- **AI Future Debate**: Is AI dangerous or beneficial?
- **Climate Action Debate**: Environmental policy discussions
- Interrupt and join the conversation at any time

## How It Works

### Application Flow

#### 1. **Connection & Initialization**
```
User opens frontend → WebSocket connection established → Backend creates session
```
- Frontend connects to backend via Socket.IO WebSocket
- Backend creates a new Session with unique ID
- Connection status shown as "Live" or "Offline" in UI
- Status indicator updates based on WebSocket connection state

#### 2. **Mode Selection**
```
User selects mode (Sandbox/Dojo/Arena) → Frontend sends mode message → Backend updates session
```
- User selects desired mode from ModeSelector component
- Frontend sends `{type: "mode", data: mode}` message
- Backend updates session mode and initializes appropriate prompts
- UI switches to corresponding view component (SandboxView/DojoView/ArenaView)

#### 3. **Voice Recording Flow (Sandbox & Dojo)**

**Frontend Side:**
```
User taps Voice Orb → Microphone permission requested → Recording starts
```
- `useAudioRecorder` hook requests microphone access
- MediaRecorder API captures audio chunks (every 250ms)
- Audio is encoded as base64 and sent to backend via WebSocket
- Visual feedback: VoiceOrb shows recording state with animations

**Backend Side:**
```
Audio chunks received → Accumulated in buffer → 1.5s silence detected → Processing begins
```
- Audio chunks arrive as base64, decoded to bytes
- Chunks accumulated in `audio_buffers[session_id]`
- Timer starts/cancels based on incoming chunks
- After 1.5 seconds of silence, processing begins

#### 4. **Speech-to-Text Processing**
```
Audio buffer → Deepgram API → Transcript returned
```
- Accumulated audio sent to Deepgram REST API
- Uses `nova-2` model with smart formatting
- Transcript extracted from response
- Status updated to "listening" → "thinking"

#### 5. **AI Response Generation**

**Sandbox Mode:**
```
Transcript → Gemini API (with persona prompt) → Response text
```
- System prompt from selected persona (friend/mentor/teacher/etc.)
- Conversation history included for context
- Gemini generates conversational response
- Temperature: 0.8 for natural variation

**Dojo Mode:**
```
Transcript → Gemini API (scenario prompt) → AI response
Transcript → Gemini API (coach prompt) → Feedback JSON
```
- Two API calls: one for scenario response, one for coaching analysis
- Scenario: AI plays role (tough boss, interviewer, etc.)
- Coach: Analyzes user's performance (sentiment, advice, score 0-100)
- Coach feedback displayed in CoachPanel component

**Arena Mode (User Barge-in):**
```
User interrupts debate → Transcript processed → Brief acknowledgment response
```
- User can interrupt running debate
- Brief response acknowledging user's point
- Debate continues after user interaction

#### 6. **Text-to-Speech & Playback**
```
Response text → ElevenLabs API → Base64 audio → Frontend playback
```
- Text sent to ElevenLabs text-to-speech API
- Voice selected based on mode/persona
- Audio returned as base64 MP3
- Sent to frontend via WebSocket message
- `useAudioPlayer` hook decodes and plays audio using Web Audio API
- Audio queue manages multiple chunks sequentially

#### 7. **Status Updates**
```
Backend sends status updates → Frontend updates UI indicators
```
Status flow:
- `idle`: Ready for input
- `listening`: Processing audio (after recording stops)
- `thinking`: Generating AI response
- `speaking`: Playing audio response

#### 8. **Arena Mode Special Flow**
```
User starts debate → Backend generates opening → AI A speaks → AI B responds → Loop continues
```
- Backend runs `run_arena_debate` async task
- Two AI debaters with different system prompts
- Alternating turns, up to 10 exchanges
- Each response transcribed and played
- User can interrupt (barge_in) or stop debate
- Frontend tracks active speaker (ai_a/ai_b) for visual indicators

### Connection Status Logic

The "Live"/"Offline" status is determined by:
- **Live**: WebSocket connection established (`socket.on("connect")` event)
- **Offline**: Connection failed, disconnected, or error occurred

Factors affecting connection:
- Backend server running and accessible
- Correct `NEXT_PUBLIC_BACKEND_URL` environment variable
- Network connectivity (WiFi, firewall, proxy settings)
- CORS configuration (backend allows all origins)
- Port availability (default: 8000)

## Architecture

### System Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js/React)│
│                 │
│  - UI Components│
│  - WebSocket    │◄──┐
│  - Audio Capture│   │
│  - Audio Playback   │   │
└────────┬────────┘   │
         │            │
         │ WebSocket  │
         │ (Socket.IO)│
         │            │
         ▼            │
┌─────────────────┐   │
│   Backend       │   │
│  (FastAPI)      │   │
│                 │   │
│  - Session Mgmt │   │
│  - Audio Buffer │   │
│  - WebSocket Hub│───┘
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ Deepgram│   │ Gemini  │   │ElevenLabs│   │ Session │
    │   API   │   │   API   │   │   API   │   │ Manager │
    │ (STT)   │   │  (LLM)  │   │  (TTS)  │   │         │
    └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

### Data Flow

1. **Audio Input**: Browser MediaRecorder → Base64 chunks → WebSocket → Backend buffer
2. **Transcription**: Audio buffer → Deepgram API → Text transcript
3. **AI Processing**: Transcript + History + Prompt → Gemini API → Response text
4. **Speech Synthesis**: Response text → ElevenLabs API → Audio base64
5. **Audio Output**: Audio base64 → WebSocket → Frontend → Web Audio API → Speakers

### State Management

**Frontend:**
- React Context API (`WebSocketContext`) for WebSocket state
- Local state for UI components
- Custom hooks for audio recording/playback

**Backend:**
- In-memory session storage (`SessionManager`)
- Per-session audio buffers
- Async tasks for audio processing and arena debates

## Project Structure

```
sbhacksXII_team_bananitungtung/
│
├── orator-backend/                 # Python FastAPI backend
│   ├── main.py                     # Main server file, WebSocket handlers, routing
│   ├── requirements.txt            # Python dependencies
│   ├── Procfile                    # Render deployment config
│   ├── render.yaml                 # Render service configuration
│   ├── README.md                   # Backend-specific documentation
│   │
│   ├── models/                     # Data models
│   │   ├── __init__.py
│   │   └── session.py              # Session and SessionManager classes
│   │
│   ├── services/                   # External API integrations
│   │   ├── __init__.py
│   │   ├── deepgram_service.py     # Deepgram STT API client
│   │   ├── gemini_service.py       # Google Gemini LLM API client
│   │   └── elevenlabs_service.py   # ElevenLabs TTS API client
│   │
│   ├── prompts/                    # AI system prompts
│   │   ├── __init__.py
│   │   └── system_prompts.py       # Persona and scenario prompts
│   │
│   └── venv/                       # Python virtual environment (gitignored)
│
├── orator-frontend-v2-updated/     # Next.js React frontend
│   ├── package.json                # Node dependencies and scripts
│   ├── next.config.ts              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── postcss.config.mjs          # PostCSS/Tailwind config
│   │
│   ├── src/
│   │   ├── app/                    # Next.js app directory
│   │   │   ├── layout.tsx          # Root layout component
│   │   │   ├── page.tsx            # Main page component (mode routing)
│   │   │   ├── globals.css         # Global styles
│   │   │   └── favicon.ico         # Site favicon
│   │   │
│   │   ├── components/             # React components
│   │   │   ├── AnimatedBackground.tsx  # Animated gradient background
│   │   │   ├── ArenaView.tsx       # Arena mode UI
│   │   │   ├── ChatDisplay.tsx     # Message display component
│   │   │   ├── CoachPanel.tsx      # Coaching feedback display
│   │   │   ├── DojoView.tsx        # Dojo mode UI
│   │   │   ├── GlassCard.tsx       # Glassmorphism card component
│   │   │   ├── ModeSelector.tsx    # Mode selection buttons
│   │   │   ├── PersonaSelector.tsx # Sandbox persona selector
│   │   │   ├── SandboxView.tsx     # Sandbox mode UI
│   │   │   ├── ScenarioSelector.tsx # Dojo/Arena scenario selector
│   │   │   └── VoiceOrb.tsx        # Voice recording button/indicator
│   │   │
│   │   ├── context/                # React Context providers
│   │   │   └── WebSocketContext.tsx # WebSocket connection management
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAudioPlayer.ts   # Audio playback management
│   │   │   └── useAudioRecorder.ts # Microphone recording management
│   │   │
│   │   ├── lib/                    # Utility functions
│   │   │   └── utils.ts            # Helper functions (cn, generateId, etc.)
│   │   │
│   │   └── types/                  # TypeScript type definitions
│   │       └── index.ts            # All type definitions (modes, messages, scenarios, personas)
│   │
│   └── node_modules/               # Node dependencies (gitignored)
│
└── README.md                        # This file
```

### Key Files Explained

**Backend:**
- `main.py`: Entry point, WebSocket event handlers, audio processing logic, mode routing
- `models/session.py`: Session state management, conversation history, mode/scenario tracking
- `services/*.py`: API clients for external services (Deepgram, Gemini, ElevenLabs)
- `prompts/system_prompts.py`: All AI system prompts for personas and scenarios

**Frontend:**
- `src/app/page.tsx`: Main application component, mode routing, state coordination
- `src/context/WebSocketContext.tsx`: WebSocket connection, message handling, state management
- `src/hooks/useAudioRecorder.ts`: Browser MediaRecorder API wrapper, base64 encoding
- `src/hooks/useAudioPlayer.ts`: Web Audio API wrapper, audio queue management
- `src/components/VoiceOrb.tsx`: Visual voice interface with status animations
- `src/types/index.ts`: TypeScript definitions for all data structures

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **python-socketio**: WebSocket server implementation
- **Uvicorn**: ASGI server
- **Deepgram SDK**: Speech-to-text API
- **google-generativeai**: Google Gemini LLM API
- **ElevenLabs**: Text-to-speech API
- **python-dotenv**: Environment variable management
- **httpx**: Async HTTP client

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Socket.IO Client**: WebSocket client library
- **Framer Motion**: Animation library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Web Audio API**: Audio playback
- **MediaRecorder API**: Audio recording

## Setup Instructions

### Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **npm** or **yarn** (package manager)
- API keys for:
  - Deepgram (speech-to-text)
  - Google Gemini (AI conversations)
  - ElevenLabs (text-to-speech)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd orator-backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create `.env` file:**
   ```env
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   FRONTEND_URL=http://localhost:3000
   PORT=8000
   ```

6. **Run the server:**
   ```bash
   python main.py
   ```
   
   Or with uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The backend should be running at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd orator-frontend-v2-updated
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file (optional):**
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```
   
   If not set, defaults to `http://localhost:8000`

4. **Run development server:**
   ```bash
   npm run dev
   ```

   The frontend should be running at `http://localhost:3000`

### Verifying Setup

1. **Check backend health:**
   - Open `http://localhost:8000/health` in browser
   - Should return JSON with status and API key configuration

2. **Check frontend:**
   - Open `http://localhost:3000` in browser
   - Should see Orator.ai interface
   - Connection status should show "Live" (green dot) if backend is running

3. **Test connection:**
   - Click on Voice Orb
   - Grant microphone permissions
   - Status should update during recording/processing

## Configuration

### Environment Variables

#### Backend (`.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DEEPGRAM_API_KEY` | Deepgram API key for speech-to-text | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key for AI responses | Yes | - |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for text-to-speech | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | No | `http://localhost:3000` |
| `PORT` | Backend server port | No | `8000` |

#### Frontend (`.env.local`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend WebSocket URL | No | `http://localhost:8000` |

### API Key Setup

1. **Deepgram:**
   - Sign up at https://deepgram.com
   - Get API key from dashboard
   - Add to backend `.env`

2. **Google Gemini:**
   - Go to https://makersuite.google.com/app/apikey
   - Create API key
   - Add to backend `.env`

3. **ElevenLabs:**
   - Sign up at https://elevenlabs.io
   - Get API key from profile settings
   - Add to backend `.env`

## API Documentation

### REST Endpoints

#### `GET /`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "Orator API",
  "version": "1.0.0"
}
```

#### `GET /health`
Detailed health check with API key status.

**Response:**
```json
{
  "status": "healthy",
  "deepgram": "configured",
  "gemini": "configured",
  "elevenlabs": "configured"
}
```

### WebSocket Events

The application uses Socket.IO for real-time communication. All events use the `message` event name with a type discriminator.

#### Client → Server Events

**Audio Data:**
```typescript
{
  type: "audio",
  data: string  // base64-encoded audio chunk
}
```

**Mode Change:**
```typescript
{
  type: "mode",
  data: "sandbox" | "dojo" | "arena"
}
```

**Scenario Change:**
```typescript
{
  type: "scenario",
  data: ScenarioType  // e.g., "salary_hard", "interview_tech"
}
```

**Sandbox Configuration:**
```typescript
{
  type: "sandbox_config",
  data: {
    persona: string,  // Persona ID
    context: string   // Optional context
  }
}
```

**Start Debate (Arena):**
```typescript
{
  type: "start_debate",
  data: true
}
```

**Stop Debate (Arena):**
```typescript
{
  type: "stop_debate",
  data: true
}
```

**Barge In (Arena):**
```typescript
{
  type: "barge_in",
  data: true
}
```

#### Server → Client Events

**Status Update:**
```typescript
{
  type: "status",
  data: "idle" | "listening" | "thinking" | "speaking"
}
```

**Transcript:**
```typescript
{
  type: "transcript",
  data: {
    speaker: "user" | "ai" | "ai_a" | "ai_b",
    text: string
  }
}
```

**Audio Response:**
```typescript
{
  type: "audio",
  data: string  // base64-encoded MP3 audio
}
```

**Coach Feedback (Dojo Mode):**
```typescript
{
  type: "coach",
  data: {
    sentiment: string,  // e.g., "confident", "uncertain"
    advice: string,     // Actionable feedback
    score: number       // 0-100 performance score
  }
}
```

**Video (Future Feature):**
```typescript
{
  type: "video",
  data: {
    videoId: string,
    timestamp: number
  }
}
```

## Deployment

### Backend Deployment (Render)

1. **Push code to GitHub repository**

2. **Create Render Web Service:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select `orator-backend` directory

3. **Configure Build Settings:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables:**
   - `DEEPGRAM_API_KEY`
   - `GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `FRONTEND_URL` (your deployed frontend URL)
   - `PORT` (Render sets this automatically)

5. **Deploy!**

### Frontend Deployment (Vercel)

1. **Push code to GitHub repository**

2. **Create Vercel Project:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Set root directory to `orator-frontend-v2-updated`

3. **Set Environment Variables:**
   - `NEXT_PUBLIC_BACKEND_URL` (your deployed backend URL)

4. **Deploy!**

### Alternative: Docker Deployment

You can containerize both services using Docker. Example Dockerfile for backend:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Connection Issues

**Problem: Frontend shows "Offline" status**

**Solutions:**
1. Verify backend is running: `http://localhost:8000/health`
2. Check `NEXT_PUBLIC_BACKEND_URL` matches backend URL
3. Check browser console for WebSocket errors
4. Verify CORS is configured correctly (backend allows all origins)
5. Check firewall/proxy settings if deploying
6. Ensure backend port is not blocked

**Problem: WebSocket connection fails**

**Solutions:**
1. Check backend logs for errors
2. Verify Socket.IO server started successfully
3. Check network connectivity (WiFi, firewall)
4. Try different network (public WiFi often blocks WebSockets)
5. Verify backend URL is correct and reachable

### Audio Issues

**Problem: Microphone not working**

**Solutions:**
1. Check browser permissions (allow microphone access)
2. Verify microphone is connected and working
3. Check browser console for MediaRecorder errors
4. Try different browser (Chrome recommended)
5. Check `useAudioRecorder` hook errors

**Problem: Audio playback not working**

**Solutions:**
1. Check browser console for Web Audio API errors
2. Verify audio context is not suspended (user interaction required)
3. Check `useAudioPlayer` hook for errors
4. Verify base64 audio decoding
5. Check system volume and browser volume

**Problem: No audio transcription**

**Solutions:**
1. Verify Deepgram API key is correct
2. Check backend logs for Deepgram API errors
3. Verify audio format is supported (WebM/MP4)
4. Check audio buffer size (minimum 1000 bytes)
5. Verify microphone is actually capturing audio

### AI Response Issues

**Problem: No AI responses**

**Solutions:**
1. Verify Gemini API key is correct
2. Check backend logs for Gemini API errors
3. Verify API quotas/billing
4. Check system prompts are loading correctly
5. Verify conversation history is being maintained

**Problem: Slow responses**

**Solutions:**
1. Check API response times (Gemini, ElevenLabs)
2. Verify network latency
3. Check backend processing time in logs
4. Consider using faster models (Gemini Flash)

**Problem: Poor response quality**

**Solutions:**
1. Check system prompts in `prompts/system_prompts.py`
2. Adjust temperature in `gemini_service.py`
3. Verify conversation history is being passed correctly
4. Check model version (currently `gemini-2.5-flash-lite`)

### General Issues

**Problem: Session state not persisting**

**Solutions:**
1. Sessions are in-memory, reset on server restart
2. This is expected behavior (no database)
3. For persistence, implement database storage

**Problem: Multiple users interfere with each other**

**Solutions:**
1. Each WebSocket connection gets unique session ID
2. Sessions are isolated per connection
3. Verify session management is working correctly

**Problem: Arena debate doesn't start**

**Solutions:**
1. Verify arena mode is selected
2. Check backend logs for debate task errors
3. Verify scenario is set correctly
4. Check async task is starting in `run_arena_debate`

## Development

### Running in Development Mode

**Backend:**
```bash
cd orator-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd orator-frontend-v2-updated
npm run dev
```

The `--reload` flag enables hot-reloading for backend changes.

### Project Structure Best Practices

- **Backend**: Follow Python PEP 8 style guide
- **Frontend**: Follow React/TypeScript best practices
- **Components**: Keep components focused and reusable
- **Services**: Keep API clients separate and testable
- **Types**: Define all types in `src/types/index.ts`

### Adding New Features

**New Persona (Sandbox):**
1. Add persona prompt to `prompts/system_prompts.py`
2. Add persona to `SANDBOX_PERSONAS` in `src/types/index.ts`
3. Add voice mapping in `elevenlabs_service.py`

**New Scenario (Dojo/Arena):**
1. Add scenario prompts to `prompts/system_prompts.py`
2. Add scenario to `SCENARIOS` in `src/types/index.ts`
3. Update scenario handling in `main.py`

**New Mode:**
1. Add mode type to `AppMode` in types
2. Create view component in `components/`
3. Add mode handling in backend `main.py`
4. Update routing in `src/app/page.tsx`

### Testing

Currently no automated tests. Manual testing recommended:
- Test all three modes (Sandbox, Dojo, Arena)
- Test audio recording and playback
- Test WebSocket reconnection
- Test error handling (API failures, network issues)
- Test on different browsers and devices

## License

This project was created for SBHacks XII.

## Credits

- **Team**: Parth and Aryan
- **Project Name**: Orator.ai
- **Hackathon**: SBHacks XII

---

For detailed backend documentation, see [orator-backend/README.md](./orator-backend/README.md)
