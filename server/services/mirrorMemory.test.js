import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';

import { MirrorMemoryService } from './mirrorMemory.js';

test('MirrorMemoryService stores journeys and builds a snapshot', async () => {
  const service = new MirrorMemoryService({
    filePath: path.join(os.tmpdir(), `maraya-memory-${Date.now()}.json`),
  });

  await service.rememberJourney({
    userId: 'tester',
    outputMode: 'judge_en',
    seedEmotion: 'anxiety',
    emotionHistory: ['anxiety', 'hope'],
    whisperText: 'I feel worried but I want to heal.',
    endingMessage: 'You crossed the corridor into light.',
    secretEndingKey: 'phoenix',
    scenes: [{ narration_ar: 'Scene one.' }, { narration_ar: 'Scene two.' }],
  });

  await service.rememberJourney({
    userId: 'tester',
    outputMode: 'judge_en',
    seedEmotion: 'nostalgia',
    emotionHistory: ['nostalgia', 'loneliness'],
    endingMessage: 'The old courtyard answered softly.',
    scenes: [{ narration_ar: 'Scene three.' }],
  });

  const snapshot = await service.getSnapshot('tester');
  assert.equal(snapshot.rememberedCount, 2);
  assert.equal(snapshot.signature.dominantEmotion, 'anxiety');
  assert.equal(snapshot.recentJourneys.length, 2);

  const prompt = service.buildPromptMemory(snapshot);
  assert.match(prompt, /Mirror Memory Context/);
  assert.match(prompt, /Remembered journeys: 2/);
});
