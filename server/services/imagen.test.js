import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeModelName } from './imagen.js';

test('normalizeModelName utility', async (t) => {
  await t.test('removes "models/" prefix', () => {
    assert.equal(normalizeModelName('models/imagen-3.0'), 'imagen-3.0');
    assert.equal(normalizeModelName('models/gemini-1.5-pro'), 'gemini-1.5-pro');
  });

  await t.test('keeps model name without prefix as is', () => {
    assert.equal(normalizeModelName('imagen-3.0'), 'imagen-3.0');
    assert.equal(normalizeModelName('gemini-1.5-pro'), 'gemini-1.5-pro');
  });

  await t.test('trims whitespace', () => {
    assert.equal(normalizeModelName('  imagen-3.0  '), 'imagen-3.0');
    assert.equal(normalizeModelName('  models/imagen-3.0  '), 'imagen-3.0');
  });

  await t.test('handles empty or invalid inputs gracefully', () => {
    assert.equal(normalizeModelName(''), '');
    assert.equal(normalizeModelName(null), '');
    assert.equal(normalizeModelName(undefined), '');
    assert.equal(normalizeModelName(123), '');
    assert.equal(normalizeModelName({}), '');
  });
});
