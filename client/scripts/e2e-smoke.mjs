import { chromium } from 'playwright';

const appUrl = process.env.E2E_URL || 'http://127.0.0.1:5180';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.addInitScript(() => {
  localStorage.setItem('maraya_onboarding_seen', '1');

  class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor() {
      this.readyState = MockWebSocket.CONNECTING;
      this.onopen = null;
      this.onmessage = null;
      this.onclose = null;
      this.onerror = null;

      setTimeout(() => {
        this.readyState = MockWebSocket.OPEN;
        this.onopen?.();
      }, 20);
    }

    send(payload) {
      let msg;
      try {
        msg = JSON.parse(payload);
      } catch {
        return;
      }

      if (msg.type === 'start_story') {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              type: 'scene',
              v: 1,
              scene: {
                scene_id: 'scene_1',
                narration_ar: 'في تلك الليلة بدأت الحكاية.',
                interleaved_blocks: [{ kind: 'narration', text_ar: 'في تلك الليلة بدأت الحكاية.' }],
                choices: [
                  { text_ar: 'أكمل الطريق', text_en: 'Continue', emotion_shift: 'hope' },
                  { text_ar: 'توقف للحظة', text_en: 'Pause', emotion_shift: 'calm' },
                ],
                story_scene_number: 1,
                story_total_scenes: 2,
                is_final: false,
                audio_mood: 'ambient_calm',
              },
            }),
          });
        }, 250);
      }

      if (msg.type === 'choose') {
        setTimeout(() => {
          this.onmessage?.({ data: JSON.stringify({ type: 'story_complete', v: 2, message: 'تمت النهاية.' }) });
        }, 250);
      }
    }

    close() {
      this.readyState = MockWebSocket.CLOSED;
      this.onclose?.();
    }
  }

  window.WebSocket = MockWebSocket;
});

await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

// Landing
await page.locator('.emotion-picker__grid[role="radiogroup"]').waitFor({ timeout: 90000 });
await page.locator('.emotion-picker__grid [role="radio"]').first().click();

// Story + Settings
await page.locator('.scene-renderer').first().waitFor({ timeout: 90000 });
await page.getByRole('button', { name: /Settings|الإعدادات/i }).click();
await page.locator('.settings-sheet[role="dialog"]').waitFor({ timeout: 30000 });
await page.getByRole('button', { name: /Close|إغلاق/i }).first().click();

// Make a choice -> Ending
await page.locator('.choice-button').first().waitFor({ timeout: 90000 });
await page.locator('.choice-button').first().click();
await page.locator('.ending').waitFor({ timeout: 90000 });

// Unified status UI mounted (toast layer exists even with no active items).
const toastLayerCount = await page.locator('.toast-container').count();
if (toastLayerCount < 1) {
  throw new Error('Toast container is not mounted.');
}

console.log('[e2e-smoke] Passed: Landing, Story, Settings, Ending, Toast UI');

await context.close();
await browser.close();
