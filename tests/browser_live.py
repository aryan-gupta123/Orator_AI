"""Explicit live smoke test. Uses provider quota; not collected by pytest.

Run with the app running: python tests/browser_live.py --live --audio /path/to/synthetic.wav
Requires Playwright and an installed Chromium. No personal recording is used.
"""
import argparse
import json
import os
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', action='store_true', help='Allow real provider requests')
    parser.add_argument('--url', default='http://localhost:3000')
    parser.add_argument('--audio', help='Synthetic speech WAV for browser microphone testing')
    args = parser.parse_args()
    if not args.live:
        parser.error('--live is required because this check uses provider quota')
    from playwright.sync_api import sync_playwright, expect
    output = Path(__file__).resolve().parents[1] / 'validation'
    output.mkdir(exist_ok=True)
    with sync_playwright() as p:
        launch = ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
        if args.audio:
            launch += ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
                       f'--use-file-for-fake-audio-capture={Path(args.audio).resolve()}']
        browser = p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=launch)
        page = browser.new_page(viewport={'width': 1440, 'height': 1050}, permissions=['microphone'])
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        report = {}
        try:
            page.goto(args.url, wait_until='domcontentloaded')
            expect(page.get_by_text('Live', exact=True)).to_be_visible(timeout=20000)
            page.get_by_role('button', name='Mute responses').click()
            if args.audio:
                page.get_by_role('button', name='Start recording', exact=True).click()
                expect(page.get_by_role('button', name='Stop recording and send')).to_be_visible()
                page.wait_for_timeout(6500)
                page.get_by_role('button', name='Stop recording and send').click()
            else:
                page.get_by_role('textbox', name='Your message').fill('I am nervous about my interview tomorrow. Can you help me practice?')
                page.get_by_role('button', name='Send', exact=True).click()
            page.wait_for_function("""() =>
              [...document.querySelectorAll('[role=alert]')].some(el => el.textContent.trim()) ||
              [...document.querySelectorAll('span')].some(el => el.textContent === 'Orator')
            """, timeout=90000)
            assert not any(text.strip() for text in page.get_by_role('alert').all_text_contents())
            expect(page.get_by_text('Orator', exact=True)).to_have_count(2)
            expect(page.get_by_role('button', name='Start recording', exact=True)).to_be_enabled(timeout=20000)
            print('Sandbox reply complete', flush=True)
            report['sandbox'] = page.locator('body').inner_text()
            page.screenshot(path=str(output / ('voice-live.png' if args.audio else 'sandbox-live.png')), full_page=True)
            page.get_by_role('button', name='Dojo').click()
            expect(page.get_by_role('heading', name='Training Dojo')).to_be_visible()
            expect(page.get_by_text('Orator', exact=True)).to_have_count(1)
            page.get_by_role('textbox', name='Your message').fill('Over six months I delivered our migration on schedule and reduced repeated support work. I would like a raise reflecting these contributions.')
            page.get_by_role('button', name='Send', exact=True).click()
            page.wait_for_function("""() =>
              [...document.querySelectorAll('[role=alert]')].some(el => el.textContent.trim()) ||
              [...document.querySelectorAll('span')].some(el => el.textContent === 'Orator')
            """, timeout=90000)
            assert not any(text.strip() for text in page.get_by_role('alert').all_text_contents())
            expect(page.get_by_text('Orator', exact=True)).to_have_count(2)
            expect(page.get_by_role('button', name='Start recording', exact=True)).to_be_enabled(timeout=20000)
            expect(page.get_by_text('to receive feedback', exact=True)).not_to_be_visible(timeout=10000)
            print('Dojo reply and coaching complete', flush=True)
            report['dojo'] = page.locator('body').inner_text()
            assert not any(text.strip() for text in page.get_by_role('alert').all_text_contents())
            assert 'to receive feedback' not in report['dojo']
            assert not any(text.strip() for text in page.get_by_role('status').all_text_contents())
            page.screenshot(path=str(output / 'dojo-live.png'), full_page=True)
            page.get_by_role('button', name='Arena').click()
            expect(page.get_by_role('heading', name='Debate Arena')).to_be_visible()
            page.get_by_role('textbox', name='Debate topic').fill('Should cities make public transit free?')
            page.get_by_role('button', name='Start', exact=True).click()
            expect(page.get_by_role('button', name='Pause', exact=True)).to_be_visible(timeout=5000)
            page.get_by_role('button', name='Pause', exact=True).click()
            expect(page.get_by_role('button', name='Start', exact=True)).to_be_visible(timeout=10000)
            page.wait_for_timeout(1000)
            report['arena_cancel'] = True
            report['browser_errors'] = errors
            assert not errors
            page.screenshot(path=str(output / 'arena-stopped.png'), full_page=True)
            (output / 'browser-live-report.json').write_text(json.dumps(report, indent=2))
            print(json.dumps(report, indent=2))
        except Exception:
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
            print(page.locator('body').inner_text())
            raise
        finally:
            browser.close()


if __name__ == '__main__':
    main()
