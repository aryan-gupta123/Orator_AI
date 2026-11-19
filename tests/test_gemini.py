import sys
from pathlib import Path
from unittest.mock import AsyncMock

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'orator-backend-v2'))
from services.gemini_service import GeminiService, ProviderError

pytestmark = pytest.mark.asyncio


@pytest.mark.parametrize('status', [400, 403, 404, 429, 503])
async def test_provider_errors_are_actionable_and_do_not_leak_key(monkeypatch, status):
    service = GeminiService()
    service.api_key = 'test-key-do-not-leak'
    original = httpx.AsyncClient
    transport = httpx.MockTransport(lambda req: httpx.Response(status, json={'error': {'message': service.api_key}}))
    monkeypatch.setattr(httpx, 'AsyncClient', lambda **kwargs: original(transport=transport, **kwargs))
    with pytest.raises(ProviderError) as exc:
        await service.generate_response('Hi', 'Be helpful')
    assert service.api_key not in str(exc.value)
    if status == 429: assert 'quota' in str(exc.value)


@pytest.mark.parametrize('response', ['{}', '{"sentiment":"calm","advice":"good","score":"bad"}', '{"sentiment":"calm","advice":"good","score":999}', '{"sentiment":"calm","advice":"good","score":true}'])
async def test_malformed_coach_never_turns_into_default_score(monkeypatch, response):
    service = GeminiService()
    monkeypatch.setattr(service, '_generate', AsyncMock(return_value=response))
    with pytest.raises(ProviderError, match='No score was assigned'):
        await service.generate_coach_feedback('Hi', 'Coach')


async def test_no_candidate_response_is_error(monkeypatch):
    service = GeminiService(); service.api_key = 'test'
    original = httpx.AsyncClient
    transport = httpx.MockTransport(lambda req: httpx.Response(200, json={'candidates': []}))
    monkeypatch.setattr(httpx, 'AsyncClient', lambda **kwargs: original(transport=transport, **kwargs))
    with pytest.raises(ProviderError, match='no usable response'):
        await service.generate_response('Hi', 'Be helpful')
