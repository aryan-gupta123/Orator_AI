# Orator Backend

Real-time voice conversation practice with AI.

## Features

- **Sandbox Mode**: Free conversation with AI personas (friend, mentor, teacher, coach, therapist, devil's advocate)
- **Dojo Mode**: Practice scenarios (salary negotiation, interviews, difficult conversations) with real-time coaching
- **Arena Mode**: Watch AI vs AI debates on various topics

## Tech Stack

- **FastAPI** + **Socket.IO** for real-time WebSocket communication
- **Deepgram** for speech-to-text
- **Google Gemini** for AI conversations
- **ElevenLabs** for text-to-speech

## Local Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file with your API keys:
```
DEEPGRAM_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000
PORT=8000
```

4. Run the server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Deploy to Render

1. Push this code to a GitHub repository
2. Create a new **Web Service** on Render
3. Connect your GitHub repo
4. Set environment variables in Render dashboard:
   - `DEEPGRAM_API_KEY`
   - `GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `FRONTEND_URL` (your deployed frontend URL)
5. Deploy!

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `WebSocket /socket.io/` - Real-time communication

## WebSocket Events

### Client -> Server

| Event | Payload | Description |
|-------|---------|-------------|
| `message` | `{type: "audio", data: base64}` | Send audio chunk |
| `message` | `{type: "mode", data: "sandbox"|"dojo"|"arena"}` | Change mode |
| `message` | `{type: "scenario", data: scenario_id}` | Change scenario |
| `message` | `{type: "sandbox_config", data: {persona: id}}` | Set persona |
| `message` | `{type: "start_debate"}` | Start arena debate |
| `message` | `{type: "stop_debate"}` | Stop arena debate |
| `message` | `{type: "barge_in"}` | Interrupt debate |

### Server -> Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message` | `{type: "status", data: status}` | Status update |
| `message` | `{type: "transcript", data: {speaker, text}}` | Transcript |
| `message` | `{type: "audio", data: base64}` | Audio response |
| `message` | `{type: "coach", data: {sentiment, advice, score}}` | Coach feedback |
