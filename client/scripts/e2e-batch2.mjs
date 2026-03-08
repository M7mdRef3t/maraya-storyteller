import { chromium } from 'playwright';

const appUrl = process.env.E2E_URL || 'http://127.0.0.1:5180';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
const page = await context.newPage();

await page.addInitScript(() => {
  localStorage.setItem('maraya_onboarding_seen', '1');

  window.MediaStream = class {
    constructor(tracks = []) {
      this._tracks = tracks;
    }

    getTracks() {
      return this._tracks;
    }

    getVideoTracks() {
      return [];
    }

    getAudioTracks() {
      return [];
    }
  };

  window.AudioContext = class {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
    }

    createMediaStreamDestination() {
      return { stream: new window.MediaStream() };
    }

    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
      };
    }

    createOscillator() {
      return {
        frequency: {
          setValueAtTime() {},
        },
        connect() {},
        start() {},
        stop() {},
        type: 'sine',
      };
    }

    resume() {
      return Promise.resolve();
    }

    close() {
      return Promise.resolve();
    }
  };

  window.webkitAudioContext = window.AudioContext;

  window.MediaRecorder = class {
    static isTypeSupported() {
      return true;
    }

    constructor() {
      this.ondataavailable = null;
      this.onstop = null;
    }

    start() {}

    stop() {
      setTimeout(() => {
        this.ondataavailable?.({ data: new Blob(['ok'], { type: 'video/webm' }) });
        this.onstop?.();
      }, 20);
    }
  };

  HTMLCanvasElement.prototype.captureStream = function captureStream() {
    return new window.MediaStream();
  };

  URL.createObjectURL = () => 'blob:maraya-reel';
  URL.revokeObjectURL = () => {};

  class MockSpeechRecognition {
    start() {
      this.onstart?.();
      const finalResult = [{ transcript: 'I need a softer tomorrow.' }];
      finalResult.isFinal = true;
      setTimeout(() => {
        this.onresult?.({ results: [finalResult] });
      }, 80);
      setTimeout(() => {
        this.onend?.();
      }, 140);
    }

    stop() {
      this.onend?.();
    }
  }

  window.SpeechRecognition = MockSpeechRecognition;

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
        this.onmessage?.({
          data: JSON.stringify({
            type: 'memory_snapshot',
            snapshot: {
              rememberedCount: 3,
              signature: { dominantEmotion: 'hope' },
              recentJourneys: [
                {
                  id: 'j1',
                  seedEmotion: 'hope',
                  finalEmotion: 'wonder',
                  endingMessage: 'The mirror opened into a garden.',
                  endedAt: '2026-03-08T00:00:00.000Z',
                },
                {
                  id: 'j2',
                  seedEmotion: 'nostalgia',
                  finalEmotion: 'loneliness',
                  endingMessage: 'A courtyard answered with dust and light.',
                  endedAt: '2026-03-07T00:00:00.000Z',
                },
              ],
            },
          }),
        });
      }, 20);
    }

    send(payload) {
      const msg = JSON.parse(payload);

      if (msg.type === 'duo_host') {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              type: 'duo_state',
              room: {
                roomId: 'AB12CD',
                role: 'host',
                status: 'ready',
                partnerName: 'Layla',
                members: [
                  { sessionId: 'self', name: 'Mirror-A1', isHost: true },
                  { sessionId: 'peer', name: 'Layla', isHost: false },
                ],
                canStart: true,
                storyStarted: false,
                votes: [],
                mismatch: false,
                readyCount: 0,
                requiredVotes: 2,
                selectedChoiceIndex: null,
              },
            }),
          });
        }, 50);
      }

      if (msg.type === 'start_story') {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              type: 'whisper_interpreted',
              transcript: msg.whisper_text,
              emotion: 'hope',
              confidence: 0.8,
            }),
          });

          this.onmessage?.({
            data: JSON.stringify({
              type: 'scene',
              v: 1,
              scene: {
                scene_id: 'scene_1',
                narration_ar: 'A silver hallway opens with a patient glow, as if the walls already knew your name.',
                interleaved_blocks: [
                  { kind: 'narration', text_ar: 'A silver hallway opens with a patient glow, as if the walls already knew your name.' },
                  { kind: 'reflection', text_ar: 'The next step belongs to both of you now.' },
                ],
                choices: [
                  { text_ar: 'Step into the brighter arch', emotion_shift: 'hope' },
                  { text_ar: 'Wait and read the echoes', emotion_shift: 'nostalgia' },
                ],
                story_scene_number: 1,
                story_total_scenes: 2,
                is_final: false,
                audio_mood: 'ambient_calm',
              },
            }),
          });

          this.onmessage?.({
            data: JSON.stringify({
              type: 'duo_vote_update',
              votes: [{ sessionId: 'peer', name: 'Layla', choiceIndex: 1 }],
              mismatch: false,
              readyCount: 1,
              requiredVotes: 2,
              selfVoteIndex: null,
            }),
          });
        }, 220);
      }

      if (msg.type === 'duo_vote' && msg.choiceIndex === 0) {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              type: 'duo_vote_update',
              votes: [
                { sessionId: 'peer', name: 'Layla', choiceIndex: 1 },
                { sessionId: 'self', name: 'Mirror-A1', choiceIndex: 0 },
              ],
              mismatch: true,
              readyCount: 2,
              requiredVotes: 2,
              selfVoteIndex: 0,
            }),
          });
        }, 120);
      }

      if (msg.type === 'duo_vote' && msg.choiceIndex === 1) {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              type: 'duo_vote_update',
              votes: [
                { sessionId: 'peer', name: 'Layla', choiceIndex: 1 },
                { sessionId: 'self', name: 'Mirror-A1', choiceIndex: 1 },
              ],
              mismatch: false,
              readyCount: 2,
              requiredVotes: 2,
              selfVoteIndex: 1,
            }),
          });
        }, 60);

        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              type: 'scene',
              v: 2,
              scene: {
                scene_id: 'scene_2',
                narration_ar: 'The mirror settles into a garden made of remembered light.',
                interleaved_blocks: [
                  { kind: 'narration', text_ar: 'The mirror settles into a garden made of remembered light.' },
                ],
                choices: [],
                story_scene_number: 2,
                story_total_scenes: 2,
                is_final: true,
                audio_mood: 'triumphant_rise',
              },
            }),
          });
        }, 150);

        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              type: 'story_complete',
              v: 2,
              message: 'You reached a resting place the mirror will remember.',
            }),
          });
        }, 360);
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

await page.locator('.emotion-picker').waitFor({ timeout: 90000 });

await page.getByRole('button', { name: /Whisper to Maraya|اهمس لمرايا/i }).waitFor({ timeout: 30000 });
await page.locator('.mirror-memory-panel').waitFor({ timeout: 30000 });
await page.locator('.duo-mode-panel').waitFor({ timeout: 30000 });

await page.locator('.duo-mode-panel__btn--primary').click();
await page.locator('.duo-mode-panel__room strong').getByText('AB12CD', { exact: true }).waitFor({ timeout: 30000 });

await page.getByRole('button', { name: /Whisper to Maraya|Listening|اهمس لمرايا|أسمعك الآن/i }).click();
await page.locator('.scene-renderer').waitFor({ timeout: 90000 });
await page.locator('.choice-button').first().waitFor({ timeout: 90000 });

await page.getByText(/Layla has voted|قام Layla بالتصويت|شريكك/i).waitFor({ timeout: 30000 });

await page.locator('.choice-button').first().click();
await page.getByText(/Votes are split|الأصوات منقسمة/i).waitFor({ timeout: 30000 });

await page.locator('.choice-button').nth(1).click();
await page.locator('.ending').waitFor({ timeout: 90000 });
await page.getByRole('button', { name: /Export Story Reel|Story Reel|صدّر/i }).waitFor({ timeout: 30000 });
await page.getByRole('button', { name: /Export Story Reel|Story Reel|صدّر/i }).click();
await page.getByText(/Story reel exported|تم تصدير Story Reel/i).waitFor({ timeout: 30000 });

console.log('[e2e-batch2] Passed: Mirror Memory, Duo host, Whisper start, Duo mismatch, Ending reel export');

await context.close();
await browser.close();
