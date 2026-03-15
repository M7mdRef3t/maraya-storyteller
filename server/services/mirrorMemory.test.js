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
    mythicReading: 'the doorway kept a warm seam of light',
    endingMessage: 'You crossed the corridor into light.',
    secretEndingKey: 'phoenix',
    scenes: [
      { narration_ar: 'Scene one.', carried_artifact: 'mirror shard', symbolic_anchor: 'fragile clarity' },
      { narration_ar: 'Scene two.', carried_artifact: 'glowing ember', symbolic_anchor: 'stored warmth' },
    ],
  });

  await service.rememberJourney({
    userId: 'tester',
    outputMode: 'judge_en',
    seedEmotion: 'nostalgia',
    emotionHistory: ['nostalgia', 'loneliness'],
    endingMessage: 'The old courtyard answered softly.',
    scenes: [{ narration_ar: 'Scene three.', carried_artifact: 'mirror shard', symbolic_anchor: 'fragile clarity' }],
  });

  const snapshot = await service.getSnapshot('tester');
  assert.equal(snapshot.rememberedCount, 2);
  assert.equal(snapshot.signature.dominantEmotion, 'anxiety');
  assert.equal(snapshot.recentJourneys.length, 2);
  assert.equal(snapshot.lastTransformation.line, 'From nostalgia to loneliness');
  assert.equal(snapshot.recurringSymbols[0], 'mirror shard');
  assert.match(snapshot.arcSummary.recentArc, /nostalgia -> loneliness/);
  assert.match(snapshot.arcSummary.lastMythicReading, /warm seam of light/);

  const prompt = service.buildPromptMemory(snapshot);
  assert.match(prompt, /Mirror Memory Context/);
  assert.match(prompt, /Remembered journeys: 2/);
  assert.match(prompt, /Recurring symbols: mirror shard/);
  assert.match(prompt, /Last mythic reading/);
});
