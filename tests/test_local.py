import json
import sys
from pathlib import Path

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'orator-backend-v2'))
from services.local_service import LocalService
from services.gemini_service import ProviderError

pytestmark = pytest.mark.asyncio


async def test_local_protocol_converts_history_and_requests_real_json_feedback(monkeypatch):
    requests = []
    def respond(request):
        requests.append(json.loads(request.content))
        return httpx.Response(200, json={'choices': [{'message': {'content': '{"sentiment":"calm","advice":"Give an example.","score":80}'}}]})
    original = httpx.AsyncClient
    monkeypatch.setattr(httpx, 'AsyncClient', lambda **kwargs: original(transport=httpx.MockTransport(respond), **kwargs))
    service = LocalService()
    result = await service.generate_coach_feedback('My statement', 'Coach me')
    assert result['score'] == 80
    assert requests[0]['response_format'] == {'type': 'json_object'}
    await service.generate_response('Next turn', 'Be helpful', [{'role': 'model', 'parts': ['Previous reply']}])
    assert [item['role'] for item in requests[1]['messages']] == ['system', 'assistant', 'user']
    assert requests[1]['messages'][-1]['content'] == 'Next turn'


@pytest.mark.parametrize('status,body', [(503, {}), (200, {'choices': []})])
async def test_local_failure_does_not_become_canned_reply(monkeypatch, status, body):
    original = httpx.AsyncClient
    transport = httpx.MockTransport(lambda request: httpx.Response(status, json=body))
    monkeypatch.setattr(httpx, 'AsyncClient', lambda **kwargs: original(transport=transport, **kwargs))
    with pytest.raises(ProviderError):
        await LocalService().generate_response('Hi', 'Coach me')


async def test_local_audio_decoder_compatibility():
    pytest.importorskip('faster_whisper')
    import io
    import wave
    from faster_whisper.audio import decode_audio
    data = io.BytesIO()
    with wave.open(data, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        wav.writeframes(b'\x00\x00' * 1600)
    data.seek(0)
    assert len(decode_audio(data)) == 1600
