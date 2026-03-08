import test from 'node:test';
import assert from 'node:assert/strict';

import { inferEmotionFromWhisper } from './whisperEmotion.js';

test('inferEmotionFromWhisper detects Arabic anxiety cues', () => {
  const result = inferEmotionFromWhisper('أنا متوتر وخايف من بكرة');
  assert.equal(result.emotion, 'anxiety');
  assert.ok(result.confidence > 0.3);
});

test('inferEmotionFromWhisper detects English nostalgia cues', () => {
  const result = inferEmotionFromWhisper('I keep remembering home and old memories.');
  assert.equal(result.emotion, 'nostalgia');
});

test('inferEmotionFromWhisper falls back to hope when no keywords match', () => {
  const result = inferEmotionFromWhisper('plain neutral statement');
  assert.equal(result.emotion, 'hope');
});
