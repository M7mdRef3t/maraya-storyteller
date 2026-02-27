import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeInterleavedBlocks } from './gemini.js';

test('normalizeInterleavedBlocks utility', async (t) => {
  await t.test('Standard Input: preserves valid blocks', () => {
    const scene = {
      interleaved_blocks: [
        { kind: 'narration', text_ar: 'Scene description' },
        { kind: 'visual', text_ar: 'Visual description' },
        { kind: 'reflection', text_ar: 'Internal thought' }
      ]
    };
    const result = normalizeInterleavedBlocks(scene);
    assert.deepStrictEqual(result, [
      { kind: 'narration', text_ar: 'Scene description' },
      { kind: 'visual', text_ar: 'Visual description' },
      { kind: 'reflection', text_ar: 'Internal thought' }
    ]);
  });

  await t.test('Filtering: removes invalid blocks', () => {
    const scene = {
      interleaved_blocks: [
        null, // should be filtered
        undefined, // should be filtered
        { kind: 'narration' }, // missing text_ar -> filtered
        { text_ar: 'No kind' }, // missing kind -> defaults to 'narration', text 'No kind' -> kept
        { kind: 'visual', text_ar: '' }, // empty text -> filtered
        { kind: 'visual', text_ar: '   ' }, // whitespace text -> filtered
        'not an object' // filtered
      ]
    };

    const result = normalizeInterleavedBlocks(scene);

    // Based on code analysis:
    // null/undefined -> filtered
    // { kind: 'narration' } -> text defaults to '', filtered
    // { text_ar: 'No kind' } -> kind defaults to 'narration', text is 'No kind' -> kept
    // { kind: 'visual', text_ar: '' } -> text is '', filtered
    // { kind: 'visual', text_ar: '   ' } -> text trimmed to '', filtered
    // 'not an object' -> filtered

    assert.deepStrictEqual(result, [
      { kind: 'narration', text_ar: 'No kind' }
    ]);
  });

  await t.test('Kind Normalization: defaults invalid kind to narration', () => {
    const scene = {
      interleaved_blocks: [
        { kind: 'invalid_kind', text_ar: 'Some text' }
      ]
    };
    const result = normalizeInterleavedBlocks(scene);
    assert.deepStrictEqual(result, [
      { kind: 'narration', text_ar: 'Some text' }
    ]);
  });

  await t.test('Limiting: restricts output to 5 blocks', () => {
    const blocks = Array.from({ length: 10 }, (_, i) => ({
      kind: 'narration',
      text_ar: `Block ${i}`
    }));
    const scene = { interleaved_blocks: blocks };
    const result = normalizeInterleavedBlocks(scene);

    assert.equal(result.length, 5);
    assert.equal(result[0].text_ar, 'Block 0');
    assert.equal(result[4].text_ar, 'Block 4');
  });

  await t.test('Fallback (English): returns English fallback when blocks missing', () => {
    const scene = {
      narration_ar: 'Main narration text',
      interleaved_blocks: []
    };
    const result = normalizeInterleavedBlocks(scene, 'judge_en');

    assert.equal(result.length, 3);
    assert.deepStrictEqual(result[0], { kind: 'narration', text_ar: 'Main narration text' });
    assert.deepStrictEqual(result[1], { kind: 'visual', text_ar: 'The image forms around you as the light shifts slowly.' });
    assert.deepStrictEqual(result[2], { kind: 'reflection', text_ar: 'Pause for a moment, then choose the path that calls to you.' });
  });

  await t.test('Fallback (Arabic): returns Arabic fallback when blocks missing', () => {
    const scene = {
      narration_ar: 'Main narration text',
      interleaved_blocks: []
    };
    // Default mode
    const result = normalizeInterleavedBlocks(scene);

    assert.equal(result.length, 3);
    assert.deepStrictEqual(result[0], { kind: 'narration', text_ar: 'Main narration text' });
    assert.deepStrictEqual(result[1], { kind: 'visual', text_ar: 'تتشكل الصورة حولك بينما يتبدل الضوء ببطء.' });
    assert.deepStrictEqual(result[2], { kind: 'reflection', text_ar: 'توقف لحظة، ثم اختر المسار الذي يليق بقلبك.' });
  });

  await t.test('Empty Result: returns empty array when no content exists', () => {
    const scene = {
      interleaved_blocks: [],
      // narration_ar is missing or empty
    };
    const result = normalizeInterleavedBlocks(scene);
    assert.deepStrictEqual(result, []);

    const sceneWithEmptyNarration = {
      interleaved_blocks: [],
      narration_ar: '   '
    };
    assert.deepStrictEqual(normalizeInterleavedBlocks(sceneWithEmptyNarration), []);
  });

  await t.test('Invalid Input: returns empty array for invalid scene', () => {
    assert.deepStrictEqual(normalizeInterleavedBlocks(null), []);
    assert.deepStrictEqual(normalizeInterleavedBlocks(undefined), []);
    assert.deepStrictEqual(normalizeInterleavedBlocks('not-a-scene'), []);
  });
});
