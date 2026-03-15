import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeInterleavedBlocks, normalizeScene, normalizeSpaceAnalysis } from './gemini.js';

test('normalizeInterleavedBlocks returns empty array for invalid scene', () => {
  assert.deepEqual(normalizeInterleavedBlocks(null), []);
  assert.deepEqual(normalizeInterleavedBlocks(undefined), []);
  assert.deepEqual(normalizeInterleavedBlocks('invalid'), []);
});

test('normalizeInterleavedBlocks keeps valid blocks and normalizes invalid kind', () => {
  const result = normalizeInterleavedBlocks({
    interleaved_blocks: [
      { kind: 'invalid_kind', text_ar: 'A' },
      { kind: 'visual', text_ar: ' B ' },
      { kind: 'reflection', text_ar: '' },
      null,
    ],
  });

  assert.deepEqual(result, [
    { kind: 'narration', text_ar: 'A' },
    { kind: 'visual', text_ar: 'B' },
  ]);
});

test('normalizeInterleavedBlocks uses localized fallback in judge_en', () => {
  const result = normalizeInterleavedBlocks(
    { narration_ar: 'Narration', interleaved_blocks: [] },
    'judge_en',
  );

  assert.equal(result.length, 3);
  assert.equal(result[1].text_ar, 'The image forms around you as the light shifts slowly.');
});

test('normalizeScene returns null for invalid input', () => {
  assert.equal(normalizeScene(null, 0, 'ar_fusha'), null);
  assert.equal(normalizeScene(undefined, 0, 'ar_fusha'), null);
});

test('normalizeScene sets defaults for ar_fusha', () => {
  const result = normalizeScene({}, 0, 'ar_fusha');

  assert.equal(result.scene_id, 'scene_1');
  assert.equal(result.audio_mood, 'ambient_calm');
  assert.equal(result.narration_ar, 'يتشكل المشهد بصمت، كأن الجدران تستعيد أنفاسها.');
  assert.deepEqual(result.choices, []);
});

test('normalizeScene sets defaults for judge_en', () => {
  const result = normalizeScene({}, 1, 'judge_en');

  assert.equal(
    result.narration_ar,
    'The scene takes shape in silence, as if the walls are catching their breath.',
  );
});

test('normalizeScene trims and filters choices', () => {
  const result = normalizeScene(
    {
      scene_id: ' custom ',
      narration_ar: ' n ',
      image_prompt: ' p ',
      carried_artifact: '  mirror shard ',
      symbolic_anchor: '  fragile clarity ',
      ritual_phase: ' reflection ',
      mythic_echo: '  the room keeps your threshold alive ',
      choices: [
        { text_ar: '  valid  ', emotion_shift: '  wonder ' },
        { text_ar: '   ' },
        null,
      ],
    },
    0,
    'ar_fusha',
  );

  assert.equal(result.scene_id, 'custom');
  assert.equal(result.narration_ar, 'n');
  assert.equal(result.image_prompt, 'p');
  assert.equal(result.carried_artifact, 'mirror shard');
  assert.equal(result.symbolic_anchor, 'fragile clarity');
  assert.equal(result.ritual_phase, 'reflection');
  assert.equal(result.mythic_echo, 'the room keeps your threshold alive');
  assert.deepEqual(result.choices, [{ text_ar: 'valid', emotion_shift: 'wonder' }]);
});

test('normalizeSpaceAnalysis falls back to space reading when mythic reading is missing', () => {
  const result = normalizeSpaceAnalysis({
    detected_emotion: 'wonder',
    space_reading: 'A warm corridor waiting for a return.',
  });

  assert.deepEqual(result, {
    detected_emotion: 'wonder',
    space_reading: 'A warm corridor waiting for a return.',
    mythic_reading: 'A warm corridor waiting for a return.',
  });
});
