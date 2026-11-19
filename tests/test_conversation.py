import asyncio
import base64
import sys
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
import pytest_asyncio

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'orator-backend-v2'))
import main
from services.gemini_service import ProviderError

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def app(monkeypatch):
    events = []
    async def emit(event, message, room):
        events.append((room, message['type'], message['data']))
        if message['type'] == 'speech':
            main.playback[room][1].set()
    monkeypatch.setattr(main.sio, 'emit', emit)
    monkeypatch.setattr(main.gemini_service, 'generate_response', AsyncMock(return_value='A real test response.'))
    monkeypatch.setattr(main.gemini_service, 'generate_coach_feedback', AsyncMock(return_value={'sentiment': 'calm', 'advice': 'Give an example.', 'score': 80}))
    monkeypatch.setattr(main.gemini_service, 'transcribe_audio', AsyncMock(return_value='My recorded words.'))
    monkeypatch.setattr(main.deepgram_service, 'api_key', '')
    monkeypatch.setattr(main.elevenlabs_service, 'api_key', '')
    await main.connect('one', {})
    await main.connect('two', {})
    yield events
    for sid in list(main.session_manager.sessions):
        await main.disconnect(sid)


async def finish(sid='one'):
    task = main.tasks.get(sid)
    if task:
        await asyncio.wait_for(task, 2)


async def test_user_message_not_duplicated_and_history_is_session_local(app):
    await main.message('one', {'type': 'text', 'data': 'First turn'})
    await finish()
    first = main.gemini_service.generate_response.call_args
    assert first.args[0] == 'First turn'
    assert first.args[2] == []
    await main.message('one', {'type': 'text', 'data': 'Second turn'})
    await finish()
    history = main.gemini_service.generate_response.call_args.args[2]
    assert [m['role'] for m in history] == ['user', 'model']
    assert history[0]['parts'] == ['First turn']
    assert main.session_manager.get('two').messages == []
    assert not any(room == 'two' and kind == 'transcript' for room, kind, _ in app)


async def test_complete_recording_uses_actual_mime_and_transcript(app):
    await main.message('one', {'type': 'audio', 'data': {'audio': base64.b64encode(b'container').decode(), 'mimeType': 'audio/mp4;codecs=mp4a'}})
    await finish()
    main.gemini_service.transcribe_audio.assert_awaited_once_with(b'container', 'audio/mp4')
    assert ('one', 'transcript', {'speaker': 'user', 'text': 'My recorded words.'}) in app


@pytest.mark.parametrize('data', [None, {}, {'audio': '!!!', 'mimeType': 'audio/webm'}, {'audio': '', 'mimeType': 'audio/wav'}, {'audio': 'AAAA', 'mimeType': 'text/html'}])
async def test_bad_audio_does_not_call_provider(app, data):
    await main.message('one', {'type': 'audio', 'data': data})
    await finish()
    main.gemini_service.transcribe_audio.assert_not_awaited()
    assert any(kind == 'error' for _, kind, _ in app)
    assert not any(kind == 'transcript' for _, kind, _ in app)


async def test_provider_failure_is_error_not_fake_reply_or_score(app):
    main.gemini_service.generate_response.side_effect = ProviderError('Quota reached.')
    await main.message('one', {'type': 'text', 'data': 'Hi'})
    await finish()
    assert ('one', 'error', 'Quota reached.') in app
    assert not any(kind in ('speech', 'coach') or (kind == 'transcript' and value['speaker'] != 'user') for _, kind, value in app)
    assert main.session_manager.get('one').messages == []


async def test_failed_coach_preserves_reply_without_assigning_fake_score(app):
    await main.message('one', {'type': 'mode', 'data': 'dojo'})
    main.gemini_service.generate_coach_feedback.side_effect = ProviderError('No score assigned.')
    await main.message('one', {'type': 'text', 'data': 'I would like a raise.'})
    await finish()
    assert any(kind == 'speech' for _, kind, _ in app)
    assert not any(kind == 'coach' for _, kind, _ in app)
    assert ('one', 'notice', 'No score assigned.') in app


async def test_reset_cancels_inflight_reply_and_clears_history(app):
    entered = asyncio.Event()
    async def delayed(*args):
        entered.set()
        await asyncio.Event().wait()
    main.gemini_service.generate_response.side_effect = delayed
    await main.message('one', {'type': 'text', 'data': 'Old turn'})
    await asyncio.wait_for(entered.wait(), 1)
    await main.message('one', {'type': 'reset', 'data': True})
    assert not main.tasks
    assert main.session_manager.get('one').messages == []
    assert not any(kind == 'speech' for _, kind, _ in app)


async def test_busy_turn_rejected_and_disconnect_cleans_tasks(app):
    entered = asyncio.Event()
    async def delayed(*args):
        entered.set()
        await asyncio.Event().wait()
    main.gemini_service.generate_response.side_effect = delayed
    await main.message('one', {'type': 'text', 'data': 'First'})
    await asyncio.wait_for(entered.wait(), 1)
    await main.message('one', {'type': 'text', 'data': 'Duplicate'})
    assert main.gemini_service.generate_response.await_count == 1
    assert any(kind == 'error' and 'wait' in value for _, kind, value in app)
    await main.disconnect('one')
    assert 'one' not in main.tasks and 'one' not in main.playback
    assert main.session_manager.get('one') is None


async def test_persona_id_selects_real_prompt_and_rejects_unknown_ids(app):
    await main.message('one', {'type': 'sandbox_config', 'data': {'persona': 'mentor'}})
    await main.message('one', {'type': 'text', 'data': 'Help me think.'})
    await finish()
    assert main.gemini_service.generate_response.call_args.args[1] == main.get_sandbox_prompt('mentor')
    await main.message('one', {'type': 'sandbox_config', 'data': {'persona': 'arbitrary prompt'}})
    assert main.session_manager.get('one').persona_id == 'mentor'
    assert ('one', 'error', 'Unknown persona.') in app


async def test_debate_alternates_and_stops_after_six_turns(app):
    await main.message('one', {'type': 'mode', 'data': 'arena'})
    await main.message('one', {'type': 'start_debate', 'data': {'topic': 'Public transport'}})
    await finish()
    speakers = [value['speaker'] for _, kind, value in app if kind == 'transcript']
    assert speakers == ['ai_a', 'ai_b'] * 3
    assert not main.session_manager.get('one').arena_is_running
    assert ('one', 'debate_state', False) in app


async def test_mode_switch_completes_before_following_turn(app, monkeypatch):
    original = main.cancel_work
    entered = asyncio.Event()
    release = asyncio.Event()
    async def delayed_cancel(sid):
        entered.set()
        await release.wait()
        await original(sid)
    monkeypatch.setattr(main, 'cancel_work', delayed_cancel)
    change = asyncio.create_task(main.message('one', {'type': 'mode', 'data': 'dojo'}))
    await entered.wait()
    turn = asyncio.create_task(main.message('one', {'type': 'text', 'data': 'I would like a raise.'}))
    await asyncio.sleep(0)
    main.gemini_service.generate_response.assert_not_awaited()
    release.set()
    await asyncio.gather(change, turn)
    await finish()
    main.gemini_service.generate_coach_feedback.assert_awaited_once()


@pytest.mark.parametrize('data', [{'type': 'scenario', 'data': {}}, {'type': 'sandbox_config', 'data': {'persona': []}}])
async def test_malformed_configuration_is_reported_without_crashing(app, data):
    await main.message('one', data)
    assert any(kind == 'error' for _, kind, _ in app)
