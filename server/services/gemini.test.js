import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeScene } from './gemini.js';

test('normalizeScene utility', async (t) => {
  await t.test('returns null for invalid inputs', () => {
    assert.equal(normalizeScene(null, 0, 'ar_fusha'), null);
    assert.equal(normalizeScene(undefined, 0, 'ar_fusha'), null);
    assert.equal(normalizeScene('string', 0, 'ar_fusha'), null);
    assert.equal(normalizeScene(123, 0, 'ar_fusha'), null);
  });

  await t.test('returns valid scene with default values for empty object', () => {
    const scene = {};
    const result = normalizeScene(scene, 0, 'ar_fusha');

    assert.equal(result.scene_id, 'scene_1');
    assert.equal(result.narration_ar, 'يتشكل المشهد بصمت، كأن الجدران تستعيد أنفاسها.');
    assert.equal(result.image_prompt, 'cinematic interior architecture, atmospheric lighting, 16:9 composition');
    assert.equal(result.audio_mood, 'ambient_calm');
    assert.deepEqual(result.choices, []);

    // If input narration is missing, interleaved_blocks logic returns empty array
    assert.deepEqual(result.interleaved_blocks, []);
  });

  await t.test('generates fallback interleaved blocks when narration is present but blocks are missing', () => {
    const scene = {
        narration_ar: 'Existing narration'
    };
    const result = normalizeScene(scene, 0, 'ar_fusha');

    assert.equal(result.interleaved_blocks.length, 3);
    assert.equal(result.interleaved_blocks[0].kind, 'narration');
    assert.equal(result.interleaved_blocks[0].text_ar, 'Existing narration');
    assert.equal(result.interleaved_blocks[1].kind, 'visual');
    assert.equal(result.interleaved_blocks[1].text_ar, 'تتشكل الصورة حولك بينما يتبدل الضوء ببطء.');
  });

  await t.test('preserves valid scene data', () => {
    const input = {
      scene_id: 'custom_scene',
      narration_ar: 'custom narration',
      image_prompt: 'custom prompt',
      audio_mood: 'tense_drone',
      interleaved_blocks: [
        { kind: 'visual', text_ar: 'visual text' },
        { kind: 'reflection', text_ar: 'reflection text' }
      ],
      choices: [
        { text_ar: 'choice 1', emotion_shift: 'fear' }
      ]
    };

    const result = normalizeScene(input, 5, 'ar_fusha');

    assert.equal(result.scene_id, 'custom_scene');
    assert.equal(result.narration_ar, 'custom narration');
    assert.equal(result.image_prompt, 'custom prompt');
    assert.equal(result.audio_mood, 'tense_drone');

    assert.equal(result.interleaved_blocks.length, 2);
    assert.equal(result.interleaved_blocks[0].kind, 'visual');
    assert.equal(result.interleaved_blocks[0].text_ar, 'visual text');

    assert.equal(result.choices.length, 1);
    assert.equal(result.choices[0].text_ar, 'choice 1');
    assert.equal(result.choices[0].emotion_shift, 'fear');
  });

  await t.test('sanitizes inputs (trims whitespace)', () => {
    const input = {
      scene_id: '  id  ',
      narration_ar: '  narration  ',
      image_prompt: '  prompt  ',
      choices: [
        { text_ar: '  choice  ', emotion_shift: '  shift  ' }
      ]
    };

    const result = normalizeScene(input, 0, 'ar_fusha');

    assert.equal(result.scene_id, 'id');
    assert.equal(result.narration_ar, 'narration');
    assert.equal(result.image_prompt, 'prompt');
    assert.equal(result.choices[0].text_ar, 'choice');
    assert.equal(result.choices[0].emotion_shift, 'shift');
  });

  await t.test('handles English output mode (judge_en)', () => {
    const scene = {};
    const result = normalizeScene(scene, 1, 'judge_en');

    assert.equal(result.narration_ar, 'The scene takes shape in silence, as if the walls are catching their breath.');
    // Empty input -> empty blocks
    assert.deepEqual(result.interleaved_blocks, []);
  });

  await t.test('handles English output mode (judge_en) with fallback blocks', () => {
    const scene = {
        narration_ar: 'English narration'
    };
    const result = normalizeScene(scene, 1, 'judge_en');

    assert.equal(result.interleaved_blocks.length, 3);
    assert.equal(result.interleaved_blocks[0].text_ar, 'English narration');
    assert.equal(result.interleaved_blocks[1].text_ar, 'The image forms around you as the light shifts slowly.');
    assert.equal(result.interleaved_blocks[2].text_ar, 'Pause for a moment, then choose the path that calls to you.');
  });

  await t.test('filters invalid choices', () => {
    const input = {
      choices: [
        null,
        undefined,
        {}, // missing text_ar
        { text_ar: '' }, // empty text
        { text_ar: 'valid', emotion_shift: 'valid' }
      ]
    };

    const result = normalizeScene(input, 0, 'ar_fusha');

    assert.equal(result.choices.length, 1);
    assert.equal(result.choices[0].text_ar, 'valid');
  });

  await t.test('normalizes interleaved blocks', () => {
    const input = {
        narration_ar: 'narration',
        interleaved_blocks: [
        null,
        { kind: 'invalid_kind', text_ar: 'text' }, // Should default to narration
        { kind: 'visual', text_ar: '' }, // Invalid text, should be filtered
        { kind: 'visual', text_ar: 'valid' }
      ]
    };

    const result = normalizeScene(input, 0, 'ar_fusha');

    assert.equal(result.interleaved_blocks.length, 2);
    assert.equal(result.interleaved_blocks[0].kind, 'narration'); // fallback from invalid_kind
    assert.equal(result.interleaved_blocks[0].text_ar, 'text');
    assert.equal(result.interleaved_blocks[1].kind, 'visual');
    assert.equal(result.interleaved_blocks[1].text_ar, 'valid');
  });

  await t.test('limits interleaved blocks to 5', () => {
    const blocks = Array(10).fill({ kind: 'narration', text_ar: 'text' });
    const input = { interleaved_blocks: blocks };

    const result = normalizeScene(input, 0, 'ar_fusha');

    assert.equal(result.interleaved_blocks.length, 5);
  });
});
