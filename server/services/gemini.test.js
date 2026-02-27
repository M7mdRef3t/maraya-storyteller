import test from 'node:test';
import assert from 'node:assert/strict';
import { isModelUnavailableError } from './gemini.js';

test('isModelUnavailableError', async (t) => {
  await t.test('returns true for "no longer available" error', () => {
    const error = new Error('The model is no longer available.');
    assert.equal(isModelUnavailableError(error), true);
  });

  await t.test('returns true for "not found" error', () => {
    const error = new Error('Model not found in this region.');
    assert.equal(isModelUnavailableError(error), true);
  });

  await t.test('returns true for "unsupported" error', () => {
    const error = new Error('This operation is unsupported.');
    assert.equal(isModelUnavailableError(error), true);
  });

  await t.test('returns true for "invalid model" error', () => {
    const error = new Error('Invalid model name provided.');
    assert.equal(isModelUnavailableError(error), true);
  });

  await t.test('is case insensitive', () => {
    const error = new Error('MODEL NOT FOUND');
    assert.equal(isModelUnavailableError(error), true);
  });

  await t.test('returns false for unrelated errors', () => {
    const error = new Error('Something went wrong');
    assert.equal(isModelUnavailableError(error), false);
  });

  await t.test('handles null error gracefully', () => {
    assert.equal(isModelUnavailableError(null), false);
  });

  await t.test('handles undefined error gracefully', () => {
    assert.equal(isModelUnavailableError(undefined), false);
  });

  await t.test('handles error object without message', () => {
    assert.equal(isModelUnavailableError({}), false);
  });
});
