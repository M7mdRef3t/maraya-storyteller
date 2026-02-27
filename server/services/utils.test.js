import test from 'node:test';
import assert from 'node:assert/strict';

import { uniqueNonEmpty, buildUiStrings } from './utils.js';

test('buildUiStrings utility', async (t) => {
  await t.test('returns English strings for judge_en mode', () => {
    const strings = buildUiStrings('judge_en');
    assert.equal(strings.readingSpace, 'Maraya is reading your space...');
    assert.equal(strings.shapingStory, 'Maraya is taking shape...');
    assert.equal(strings.nextScene, 'The next scene is taking shape...');
    assert.equal(strings.storyComplete, 'You have reached the end of this journey. But mirrors never truly end...');
    assert.equal(strings.startErrorPrefix, 'Failed to start story:');
    assert.equal(strings.nextError, 'Failed to generate the next scene.');
  });

  await t.test('returns Egyptian Arabic strings for ar_egyptian mode', () => {
    const strings = buildUiStrings('ar_egyptian');
    assert.equal(strings.readingSpace, 'مرايا بتقرا المكان بتاعك...');
    assert.equal(strings.shapingStory, 'مرايا بتتشكّل...');
    assert.equal(strings.nextScene, 'المشهد اللي بعده بيتشكّل...');
    assert.equal(strings.storyComplete, 'وصلت لنهاية الرحلة... بس المرايات عمرها ما بتخلص.');
    assert.equal(strings.startErrorPrefix, 'القصة ما بدأتش:');
    assert.equal(strings.nextError, 'ما قدرناش نكمّل المشهد اللي بعده.');
  });

  await t.test('returns Standard Arabic strings for default/unknown mode', () => {
    const strings = buildUiStrings('unknown_mode');
    assert.equal(strings.readingSpace, 'المرايا تقرأ مكانك...');
    assert.equal(strings.shapingStory, 'المرايا تتشكل...');
    assert.equal(strings.nextScene, 'المشهد التالي يتشكل...');
    assert.equal(strings.storyComplete, 'وصلتَ إلى نهاية هذه الرحلة. لكنّ المرايا لا تنتهي...');
    assert.equal(strings.startErrorPrefix, 'فشل في بدء القصة:');
    assert.equal(strings.nextError, 'فشل في إنشاء المشهد التالي.');
  });

  await t.test('returns object with all required keys', () => {
    const strings = buildUiStrings('judge_en');
    const requiredKeys = [
      'readingSpace',
      'shapingStory',
      'nextScene',
      'storyComplete',
      'startErrorPrefix',
      'nextError',
    ];
    for (const key of requiredKeys) {
      assert.ok(key in strings, `Missing key: ${key}`);
    }
  });
});

test('uniqueNonEmpty utility', async (t) => {
  await t.test('returns unique values preserving first-seen order', () => {
    const input = ['a', 'b', 'a', 'c', 'b'];
    assert.deepStrictEqual(uniqueNonEmpty(input), ['a', 'b', 'c']);
  });

  await t.test('trims whitespace from values', () => {
    const input = ['  a  ', 'b  ', '  c'];
    assert.deepStrictEqual(uniqueNonEmpty(input), ['a', 'b', 'c']);
  });

  await t.test('filters out empty or whitespace-only values', () => {
    const input = ['a', '', '   ', 'b', null, undefined];
    assert.deepStrictEqual(uniqueNonEmpty(input), ['a', 'b']);
  });

  await t.test('deduplicates values after normalization', () => {
    const input = ['a', ' a ', 'b', 'b '];
    assert.deepStrictEqual(uniqueNonEmpty(input), ['a', 'b']);
  });

  await t.test('supports non-string primitives safely', () => {
    const input = [1, '1', true, ' true ', false, null];
    assert.deepStrictEqual(uniqueNonEmpty(input), ['1', 'true', 'false']);
  });

  await t.test('returns empty array for invalid or empty input', () => {
    assert.deepStrictEqual(uniqueNonEmpty([]), []);
    assert.deepStrictEqual(uniqueNonEmpty(['', '  ']), []);
    assert.deepStrictEqual(uniqueNonEmpty(null), []);
    assert.deepStrictEqual(uniqueNonEmpty(undefined), []);
  });
});
