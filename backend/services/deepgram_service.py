import os
import asyncio
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
from typing import AsyncIterator

class DeepgramService:
    def __init__(self):
        self.api_key = os.getenv("DEEPGRAM_API_KEY")
        self.client = DeepgramClient(self.api_key)
        self.connection = None
        self.transcript_queue = None
        
    async def stream_transcription(self, transcript_queue: asyncio.Queue):
        """Start streaming transcription session"""
        self.transcript_queue = transcript_queue
        
        try:
            # Create connection with optimal settings
            options = LiveOptions(
                model="nova-2",
                language="en-US",
                smart_format=True,
                interim_results=True,
                utterance_end_ms=1000,  # Detect pause after 1 second
                vad_events=True,  # Voice activity detection
                encoding="linear16",
                sample_rate=16000,
            )
            
            self.connection = self.client.listen.websocket.v("1")
            
            # Set up event handlers
            self.connection.on(LiveTranscriptionEvents.Transcript, self._on_transcript)
            self.connection.on(LiveTranscriptionEvents.Error, self._on_error)
            
            # Start connection
            if await self.connection.start(options):
                print("Deepgram connection started")
                
                # Keep connection alive
                while True:
                    await asyncio.sleep(0.1)
            else:
                print("Failed to start Deepgram connection")
                
        except Exception as e:
            print(f"Deepgram error: {e}")
            
    async def send_audio(self, audio_data: bytes):
        """Send audio data to Deepgram"""
        if self.connection:
            self.connection.send(audio_data)
            
    def _on_transcript(self, *args, **kwargs):
        """Handle transcript events"""
        result = kwargs.get("result")
        
        if result:
            channel = result.channel
            alternative = channel.alternatives[0]
            transcript = alternative.transcript
            
            if transcript:
                # Put in queue for processing
                asyncio.create_task(self.transcript_queue.put({
                    "text": transcript,
                    "is_final": result.is_final,
                    "speech_final": result.speech_final
                }))
                
    def _on_error(self, *args, **kwargs):
        """Handle errors"""
        error = kwargs.get("error")
        print(f"Deepgram error: {error}")
        
    async def close(self):
        """Close connection"""
        if self.connection:
            await self.connection.finish()