# Negotiation AI - Backend (Person B: Brains)

## 🎯 Your Responsibilities
- All AI logic and content
- Prompts, Gemini orchestration, TwelveLabs
- WebSocket audio pipeline
- Demo prep and fallbacks

## 📁 File Structure

```
backend/
├── main.py                      # FastAPI + WebSocket server
├── requirements.txt             # Python dependencies
├── .env                         # API keys (DO NOT COMMIT)
├── setup_and_run.sh            # Quick setup script
├── index_videos.py             # Pre-hackathon video indexing
│
├── services/
│   ├── deepgram_service.py     # Speech-to-text streaming
│   ├── gemini_service.py       # AI logic & prompts
│   ├── elevenlabs_service.py   # Text-to-speech streaming
│   └── twelvelabs_service.py   # Video search
│
├── models/
│   └── session.py              # Conversation state
│
└── prompts/
    └── system_prompts.py       # All AI personas
```

## 🚀 Quick Start

### 1. Get API Keys (Do This NOW)

- **Deepgram**: https://console.deepgram.com/ (STT)
- **Google AI Studio**: https://aistudio.google.com/app/apikey (Gemini)
- **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys (TTS)
- **TwelveLabs**: https://playground.twelvelabs.io/ (Video search)

### 2. Setup Environment

```bash
chmod +x setup_and_run.sh
./setup_and_run.sh
```

Edit `.env` and add your API keys:
```bash
DEEPGRAM_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
TWELVELABS_API_KEY=your_key_here
TWELVELABS_INDEX_ID=your_index_id_here
```

### 3. Pre-Hackathon: Index Videos

**THIS MUST BE DONE BEFORE HACKATHON STARTS!**

1. Go to https://playground.twelvelabs.io/
2. Create a new index with model:
   - **Marengo 3.0** (recommended) or **Pegasus 1.2**
   - Both include Visual + Audio automatically
3. Copy the Index ID to `.env`
4. Find 5-10 YouTube videos for evidence:
   - Negotiation tactics (Chris Voss)
   - AI regulation debates
   - Remote work debates
   - Fun debate clips (pineapple pizza, etc.)
5. Update `index_videos.py` with your video URLs
6. Run: `python index_videos.py`

**⏰ Indexing takes 5-10 minutes per video - DO THIS EARLY!**

### 4. Test the Server

```bash
python main.py
```

Should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test endpoint:
```bash
curl http://localhost:8000
# Should return: {"status": "Negotiation AI Backend Running"}
```

## 📡 WebSocket Message Contract

### Frontend → Backend

```javascript
// Audio chunks from microphone
{ type: 'audio', data: '<base64AudioChunk>' }

// Mode selection
{ type: 'mode', data: 'dojo' | 'arena' }

// Scenario selection
{ type: 'scenario', data: 'salary_negotiation' | 'pizza_debate' | ... }

// Difficulty (dojo mode only)
{ type: 'difficulty', data: 'supportive' | 'hard' }

// Interrupt AI speech
{ type: 'barge_in', data: true }
```

### Backend → Frontend

```javascript
// User transcript
{ type: 'transcript', data: { speaker: 'user', text: 'I think 180k is fair' } }

// AI transcript
{ type: 'transcript', data: { speaker: 'ai_a', text: 'That seems high for this role' } }

// AI speech audio (MP3 chunks)
{ type: 'audio', data: '<base64Mp3Chunk>' }

// Video evidence clip
{ type: 'video', data: { videoId: 'abc123', timestamp: 45.2 } }

// Coach feedback (dojo mode)
{ type: 'coach', data: { sentiment: 'strong', advice: 'Great anchor!', score: 85 } }

// Status updates
{ type: 'status', data: 'listening' | 'thinking' | 'speaking' | 'connected' }
```

## 🎮 Scenarios & Prompts

### Dojo Mode (Training)
- **Supportive**: AI gives small wins, helps build confidence
- **Hard Mode**: Tough negotiator, makes you work for it

### Arena Mode (Fight Club)
- Two AI debaters argue opposite sides
- User can "barge in" to interrupt
- AIs can trigger video evidence with `[SEARCH: query]`

### Available Scenarios
1. `salary_negotiation` - Negotiate salary with hiring manager
2. `vendor_negotiation` - Enterprise software licensing
3. `pizza_debate` - Pineapple on pizza (pro vs anti)
4. `ai_debate` - Should AI be regulated?
5. `wfh_debate` - Return to office mandates

**To add more**: Edit `prompts/system_prompts.py`

## ⚡ Hour-by-Hour Checklist

### Hour 0-3: Skeleton
- [x] Get all API keys
- [x] Set up FastAPI WebSocket
- [x] Deepgram streaming → transcript to console
- [x] Test with Person A: speak → see text

### Hour 3-7: The Loop
- [x] Build Session class
- [x] Deepgram → Gemini pipeline
- [x] Gemini → ElevenLabs pipeline
- [x] Audio chunks back through WebSocket
- [x] Initial system prompts
- [x] Test: have voice conversation (laggy OK)

### Hour 7-11: Modes & Logic
- [x] All system prompts (negotiator, debaters, coach)
- [x] Fight Club orchestrator (A → B → loop)
- [x] Coach logic (parallel Gemini call)
- [x] "Barge in" interruption handling
- [x] Test: both modes working

### Hour 11-13: TwelveLabs
- [x] Pre-indexed videos ready
- [x] `search_video_evidence()` function
- [x] Parse response, send video_id + timestamp
- [x] Update debater prompts for `[SEARCH: query]`
- [x] Test: AI triggers video

### Hour 13-16: Polish
- [x] Coach sidebar streaming JSON
- [ ] Tune all prompts for quality
- [ ] Latency masking
- [ ] Edge case handling
- [ ] Demo script

### Hour 16-18: Golden Run
- [ ] Hardcode demo scenarios
- [ ] Rehearse 3-4 times
- [ ] Record backup video
- [ ] Prepare Q&A answers

## 🐛 Common Issues

### "Deepgram connection failed"
- Check API key in `.env`
- Make sure using Nova-2 streaming model
- Verify audio format: linear16, 16000 sample rate

### "ElevenLabs too slow"
- Use `eleven_turbo_v2_5` model (already set)
- Consider caching responses for demo

### "WebSocket drops"
- Person A should implement auto-reconnect
- Test on same network as demo

### "Gemini rate limited"
- Cache responses for hardcoded demo scenarios
- Use `gemini-2.0-flash-exp` (already set)

### "TwelveLabs no results"
- Check index has videos indexed
- Try broader search queries
- Verify index_id in `.env`

## 🎯 Demo Tips

1. **Have Fallbacks**:
   - Cache AI responses for demo scenarios
   - Pre-load video clips
   - Record backup video of it working

2. **Test Edge Cases**:
   - What if user says nothing?
   - What if user rambles forever?
   - What if internet dies?

3. **Prepare for Questions**:
   - "What was hardest?" → WebSocket audio streaming
   - "What would you add?" → Multi-language, better coach AI
   - "Why this idea?" → Practicing difficult conversations is hard, making it fun helps

## 🔒 Security Notes

- **Never commit `.env`** - add to `.gitignore`
- API keys are in environment variables only
- No authentication needed for hackathon demo
- For production: add rate limiting, auth, input validation

## 📞 Coordination with Person A (Pipes)

### Sync Points

**Hour 3**: WebSocket contract working?
- Can send audio → receive transcripts?
- Agree on exact message format

**Hour 7**: Audio conversation working?
- If not, debug together
- This is the foundation - MUST work

**Hour 11**: Mode switching?
- How does frontend tell backend which mode?
- Test both dojo and arena

**Hour 13**: TwelveLabs videos?
- Share list of indexed videos
- Person A needs video IDs for testing

**Hour 16**: Demo script?
- Both review exact flow
- Rehearse together

## 🏆 What Makes This Win

**Technical Complexity**:
- Real-time bidirectional audio streaming
- Multi-model orchestration (4 APIs!)
- Video RAG with synchronized playback

**Completion**:
- It works. Live. No slides. No mockups.

**Originality**:
- Voice-to-voice AI with live coach sidebar
- AI debates with video evidence
- We haven't seen this combo before

**Startup Potential**:
- B2B: Sales training, interview prep
- B2C: Therapy exposure practice, debate education
- Platform play: API for conversation practice

---

## 🚨 Before You Start Coding

- [ ] All API keys obtained
- [ ] Videos indexed in TwelveLabs
- [ ] Tested MediaRecorder in browser (Person A)
- [ ] Agreed on repo structure (monorepo vs separate)
- [ ] Picked 3 debate topics + 2 training scenarios
- [ ] Both have `.env` file with same keys

**Let's build this! 🔥**