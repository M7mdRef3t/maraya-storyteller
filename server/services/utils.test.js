import test from 'node:test';
import assert from 'node:assert/strict';

import { uniqueNonEmpty, TaskQueue } from './utils.js';

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

test('TaskQueue utility', async (t) => {
  await t.test('executes tasks respecting concurrency limit', async () => {
    const queue = new TaskQueue(2);
    let active = 0;
    let maxActive = 0;
    const task = async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 10));
      active--;
    };

    await Promise.all([
      queue.add(task),
      queue.add(task),
      queue.add(task),
      queue.add(task),
      queue.add(task)
    ]);

    assert.equal(maxActive, 2);
  });

  await t.test('returns task results correctly', async () => {
    const queue = new TaskQueue(1);
    const result = await queue.add(async () => 'success');
    assert.equal(result, 'success');
  });

  await t.test('handles task errors gracefully', async () => {
    const queue = new TaskQueue(1);
    await assert.rejects(
      queue.add(async () => { throw new Error('fail'); }),
      /fail/
    );
    // Ensure subsequent tasks still run
    const result = await queue.add(async () => 'recovered');
    assert.equal(result, 'recovered');
  });
});
