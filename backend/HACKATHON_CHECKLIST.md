# 🚀 Hackathon Day Checklist - Person B (Brains)

## ⏰ BEFORE HACKATHON STARTS (Do This NOW!)

### API Keys (30 minutes)
- [ ] Deepgram account + API key
- [ ] Google AI Studio + Gemini API key  
- [ ] ElevenLabs account + API key
- [ ] All keys added to `.env` file
- [ ] Shared `.env` with Person A (via secure channel)

### Environment Setup (15 minutes)
- [ ] Python 3.9+ installed
- [ ] Ran `./setup_and_run.sh`
- [ ] All dependencies installed
- [ ] Ran `python test_apis.py` - all tests pass
- [ ] Test server starts: `python main.py`
- [ ] Curl test works: `curl http://localhost:8000`

### Coordination (30 minutes)
- [ ] Shared `.env` file with Person A
- [ ] Agreed on WebSocket message format
- [ ] Decided: monorepo or separate repos?
- [ ] Picked 3 debate topics
- [ ] Picked 2 training scenarios
- [ ] Tested Person A can connect to WebSocket

---

## 🕐 HOUR 0-3: SKELETON

### Tasks
- [ ] FastAPI server running on port 8000
- [ ] WebSocket endpoint `/ws/audio` accepting connections
- [ ] Deepgram service receiving audio chunks
- [ ] Transcripts printing to console

### Sync with Person A
- [ ] Person A can send audio → you receive blobs
- [ ] You can send transcript → Person A sees text
- [ ] WebSocket stays connected (no drops)

### Debug Checklist
- [ ] Check Deepgram API key in `.env`
- [ ] Verify audio format: linear16, 16kHz
- [ ] Check CORS allows `localhost:3000`
- [ ] WebSocket URL: `ws://localhost:8000/ws/audio`

---

## 🕐 HOUR 3-7: THE LOOP

### Tasks
- [ ] Session class tracking conversation state
- [ ] Deepgram → Gemini pipeline working
- [ ] Gemini → ElevenLabs pipeline working
- [ ] Audio chunks streaming back via WebSocket
- [ ] Basic system prompts for negotiator

### Sync with Person A
- [ ] Full loop works: speak → AI responds with voice
- [ ] Audio playback works on frontend
- [ ] Conversation history displaying correctly

### Test
```bash
# You should be able to:
# 1. Speak into browser
# 2. See transcript appear
# 3. Hear AI response
# 4. Continue conversation
```

### Debug Checklist
- [ ] Check Gemini API key
- [ ] Check ElevenLabs API key
- [ ] Verify using `eleven_turbo_v2_5` model
- [ ] Audio chunks are base64 encoded
- [ ] WebSocket sending correct message types

---

## 🕐 HOUR 7-11: MODES & LOGIC

### Tasks
- [ ] All 5 system prompts written and tested:
  - [ ] Negotiator (hard mode)
  - [ ] Negotiator (supportive mode)
  - [ ] Debater A
  - [ ] Debater B
  - [ ] Coach
- [ ] Arena mode: two AIs debating
- [ ] Debater switching logic (A → B → A)
- [ ] Coach feedback generating in parallel
- [ ] Barge-in interrupt handling

### Sync with Person A
- [ ] Mode switcher UI connected
- [ ] Both dojo and arena work
- [ ] Coach feedback displays in sidebar
- [ ] Barge-in button stops AI speech

### Test Scenarios
```bash
# Dojo Mode:
# - User negotiates salary
# - Coach feedback appears
# - AI pushes back appropriately

# Arena Mode:
# - Two AIs debate pineapple pizza
# - They alternate speaking
# - User can interrupt with barge-in
```

---

## 🕐 HOUR 11-13: POLISH & TESTING

### Tasks
- [ ] All prompts tuned for quality
- [ ] Edge cases handled
- [ ] Performance optimized
- [ ] Demo scenarios prepared

### Sync with Person A
- [ ] All modes tested together
- [ ] UI/UX polished
- [ ] Ready for final demo prep

---

## 🕐 HOUR 13-16: POLISH

### Tasks
- [ ] Tune all prompts for natural speech
- [ ] Coach JSON streaming (if possible)
- [ ] Add latency masking (status messages)
- [ ] Handle edge cases:
  - [ ] User says nothing for 5+ seconds
  - [ ] User rambles for 2+ minutes
  - [ ] Network hiccup/reconnection
  - [ ] API rate limiting
- [ ] Write demo script with exact dialogue

### Quality Checks
- [ ] AI responses feel natural (not robotic)
- [ ] AI doesn't repeat itself
- [ ] Latency under 2 seconds total
- [ ] No awkward pauses or cuts

---

## 🕐 HOUR 16-18: GOLDEN RUN

### Demo Preparation
- [ ] Added `DEMO_MODE=true` option to `.env`
- [ ] Cached responses in `demo_cache.py`
- [ ] Rehearsed demo 3-4 times with Person A
- [ ] Recorded backup video of working demo
- [ ] Tested on different network/device
- [ ] Prepared answers to judge questions

### Demo Flow (2-3 minutes)
1. **Intro** (15 seconds)
   - "We built real-time AI conversation practice"
   - "Two modes: training and debate"

2. **Dojo Demo** (60 seconds)
   - Switch to dojo mode
   - Start salary negotiation
   - Show coach feedback in real-time
   - Make 2-3 exchanges
   - Point out live coaching tips

3. **Arena Demo** (60 seconds)
   - Switch to arena mode
   - Start AI debate (pineapple pizza or AI regulation)
   - Show two AIs debating
   - Use barge-in button

4. **Wrap** (15 seconds)
   - "3 APIs, real-time streaming, live coaching"
   - "Built in 18 hours"

### Judge Q&A Prep
**"What was the hardest part?"**
> "Real-time bidirectional audio streaming. Coordinating Deepgram, Gemini, and ElevenLabs in under 2 seconds while maintaining WebSocket stability."

**"What would you add with more time?"**
> "Multi-language support, more AI personas, replay/recording features, mobile app, analytics dashboard for tracking improvement."

**"Why is this useful?"**
> "Practicing difficult conversations is hard. Job negotiations, debates, conflict resolution - people avoid these. We make it safe, fun, and you get better through practice."

**"How's this different from ChatGPT Voice?"**
> "ChatGPT is conversational but not adversarial. Our AI pushes back, argues, negotiates. Plus real-time coaching feedback during conversations."

**"What's the business model?"**
> "B2B for sales training and interview prep. B2C subscription for personal development. API for others to build on."

---

## 🚨 Emergency Protocols

### If APIs Go Down
- [ ] Switch to `DEMO_MODE=true` in `.env`
- [ ] Use cached responses from `demo_cache.py`
- [ ] Fall back to recorded video demo

### If WebSocket Drops
- [ ] Person A's auto-reconnect should handle it
- [ ] If not: restart server quickly
- [ ] Use backup video if demo is happening

### If Demo Internet Fails
- [ ] Use phone hotspot
- [ ] Play backup video recording
- [ ] Walk through code instead

---

## 📋 Final Checklist (Before Demo)

### Technical
- [ ] Server running on stable network
- [ ] All API keys working
- [ ] No console errors
- [ ] Audio latency acceptable
- [ ] Fallbacks ready (cached responses, video)

### Presentation  
- [ ] Demo script memorized
- [ ] Backup video ready
- [ ] Judge Q&A answers prepared
- [ ] Laptop charged + charger handy
- [ ] Audio working (microphone, speakers)

### Coordination
- [ ] Person A's frontend deployed/working
- [ ] Both laptops on same network
- [ ] Agreed who speaks during demo
- [ ] Timed run-through under 3 minutes

---

## 💡 Remember

- **Keep it simple**: Working > fancy
- **Demo ready > feature complete**: Ship what works
- **Rehearse**: 4 run-throughs minimum
- **Have fun**: You built something cool!

**You got this! 🔥**