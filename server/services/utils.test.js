import test from 'node:test';
import assert from 'node:assert/strict';

import { uniqueNonEmpty } from './utils.js';

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
