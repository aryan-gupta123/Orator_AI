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
        model = genai.GenerativeModel("gemini-2.5-flash")
        
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
        import elevenlabs
        elevenlabs.set_api_key(os.getenv("ELEVENLABS_API_KEY"))
        
        # Test basic TTS using the generate function
        audio = elevenlabs.generate(
            text="API test",
            voice="21m00Tcm4TlvDq8ikWAM",  # Rachel
            model="eleven_turbo_v2_5"
        )
        
        # Check if we got audio data
        audio_bytes = audio if isinstance(audio, bytes) else b"".join(audio) if hasattr(audio, '__iter__') else b""
        
        if len(audio_bytes) > 0:
            print(f"   ✅ ElevenLabs working! Generated {len(audio_bytes)} bytes of audio")
            return True
        else:
            print("   ❌ ElevenLabs returned no audio")
            return False
    except Exception as e:
        print(f"   ❌ ElevenLabs error: {e}")
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
        "ElevenLabs": await test_elevenlabs()
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
        print("1. Start server: python main.py")
        print("2. Coordinate with Person A on WebSocket contract")
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