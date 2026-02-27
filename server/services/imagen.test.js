import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRetryWithAnotherModel } from './imagen.js';

test('shouldRetryWithAnotherModel logic', async (t) => {
  await t.test('returns true for retryable error messages', () => {
    const retryableErrors = [
      'Model not found',
      'This feature is unsupported',
      'Invalid argument provided',
      'No image returned from API',
      'NOT FOUND', // Case insensitivity check
      'UnSuPpOrTeD', // Mixed case check
    ];

    retryableErrors.forEach((msg) => {
      assert.equal(
        shouldRetryWithAnotherModel({ message: msg }),
        true,
        `Expected error "${msg}" to be retryable`
      );
    });
  });

  await t.test('returns false for non-retryable error messages', () => {
    const nonRetryableErrors = [
      'Internal server error',
      'Quota exceeded',
      'Rate limit exceeded',
      'Unknown error',
      'Connection timed out',
    ];

    nonRetryableErrors.forEach((msg) => {
      assert.equal(
        shouldRetryWithAnotherModel({ message: msg }),
        false,
        `Expected error "${msg}" to NOT be retryable`
      );
    });
  });

  await t.test('handles edge cases gracefully', () => {
    // null error
    assert.equal(shouldRetryWithAnotherModel(null), false);

    // undefined error
    assert.equal(shouldRetryWithAnotherModel(undefined), false);

    // empty object
    assert.equal(shouldRetryWithAnotherModel({}), false);

    // object with no message property
    assert.equal(shouldRetryWithAnotherModel({ code: 404 }), false);

    // message is not a string (should be stringified)
    assert.equal(shouldRetryWithAnotherModel({ message: 123 }), false);

    // message is null
    assert.equal(shouldRetryWithAnotherModel({ message: null }), false);
  });
});
