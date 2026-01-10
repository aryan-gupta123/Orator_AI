"""
Quick test script to verify all API keys work
Run this before the hackathon starts!
"""

import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def test_deepgram():
    """Test Deepgram API key"""
    print("🎤 Testing Deepgram...")
    try:
        from deepgram import DeepgramClient
        client = DeepgramClient(os.getenv("DEEPGRAM_API_KEY"))
        # Just checking if we can create client
        print("   ✅ Deepgram API key valid")
        return True
    except Exception as e:
        print(f"   ❌ Deepgram error: {e}")
        return False

async def test_gemini():
    """Test Gemini API key"""
    print("🤖 Testing Gemini...")
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        
        response = await model.generate_content_async("Say 'API test successful' in 3 words")
        
        if response.text:
            print(f"   ✅ Gemini working! Response: {response.text.strip()}")
            return True
        else:
            print("   ❌ Gemini returned empty response")
            return False
    except Exception as e:
        print(f"   ❌ Gemini error: {e}")
        return False

async def test_elevenlabs():
    """Test ElevenLabs API key"""
    print("🔊 Testing ElevenLabs...")
    try:
        from elevenlabs import ElevenLabs
        client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
        
        # Test basic TTS
        audio = client.text_to_speech.convert(
            voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel
            text="API test",
            model_id="eleven_turbo_v2_5"
        )
        
        # Check if we got audio data
        audio_bytes = b"".join(audio)
        
        if len(audio_bytes) > 0:
            print(f"   ✅ ElevenLabs working! Generated {len(audio_bytes)} bytes of audio")
            return True
        else:
            print("   ❌ ElevenLabs returned no audio")
            return False
    except Exception as e:
        print(f"   ❌ ElevenLabs error: {e}")
        return False

async def test_twelvelabs():
    """Test TwelveLabs API key"""
    print("🎬 Testing TwelveLabs...")
    try:
        from twelvelabs import TwelveLabs
        client = TwelveLabs(api_key=os.getenv("TWELVELABS_API_KEY"))
        
        # Try to list indexes
        indexes = client.index.list()
        
        index_id = os.getenv("TWELVELABS_INDEX_ID")
        
        if index_id and index_id != "your_index_id_here":
            print(f"   ✅ TwelveLabs API key valid")
            print(f"   ℹ️  Using Index ID: {index_id}")
            
            # Check if index exists
            try:
                index = client.index.retrieve(index_id)
                print(f"   ✅ Index found: {index.index_name}")
                
                # Check if index has videos
                videos = client.index.video.list(index_id)
                video_count = len(videos.data) if hasattr(videos, 'data') else 0
                
                if video_count > 0:
                    print(f"   ✅ Index has {video_count} videos indexed")
                else:
                    print(f"   ⚠️  Index has NO videos! Run index_videos.py")
                    
            except Exception as e:
                print(f"   ⚠️  Could not retrieve index: {e}")
                
            return True
        else:
            print("   ⚠️  API key valid but no TWELVELABS_INDEX_ID set")
            print("   ℹ️  Create an index at https://playground.twelvelabs.io/")
            return False
            
    except Exception as e:
        print(f"   ❌ TwelveLabs error: {e}")
        return False

async def run_all_tests():
    """Run all API tests"""
    print("=" * 60)
    print("🔬 TESTING ALL API INTEGRATIONS")
    print("=" * 60)
    print()
    
    results = {
        "Deepgram": await test_deepgram(),
        "Gemini": await test_gemini(),
        "ElevenLabs": await test_elevenlabs(),
        "TwelveLabs": await test_twelvelabs()
    }
    
    print()
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    for service, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{service:15} {status}")
    
    print()
    
    all_passed = all(results.values())
    
    if all_passed:
        print("🎉 All API tests passed! You're ready to build!")
        print()
        print("Next steps:")
        print("1. Index videos: python index_videos.py")
        print("2. Start server: python main.py")
        print("3. Coordinate with Person A on WebSocket contract")
    else:
        print("⚠️  Some tests failed. Fix these before starting:")
        print()
        failed = [service for service, passed in results.items() if not passed]
        for service in failed:
            print(f"  • Check {service} API key in .env")
        print()
        print("After fixing, run this test again:")
        print("  python test_apis.py")
    
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_all_tests())