import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEmotion, validateChoiceText, validateBase64 } from './validators.js';

test('validateEmotion', async (t) => {
  await t.test('accepts valid emotions', () => {
    assert.equal(validateEmotion('hope'), 'hope');
    assert.equal(validateEmotion('anxiety'), 'anxiety');
  });

  await t.test('defaults to hope for invalid emotions', () => {
    assert.equal(validateEmotion('InvalidEmotion'), 'hope');
    assert.equal(validateEmotion(''), 'hope');
    assert.equal(validateEmotion(null), 'hope');
    assert.equal(validateEmotion(123), 'hope');
  });

  await t.test('handles case sensitivity and whitespace', () => {
    assert.equal(validateEmotion('  Hope  '), 'hope');
    assert.equal(validateEmotion('Anxiety'), 'anxiety');
  });
});

test('validateChoiceText', async (t) => {
  await t.test('returns cleaned text', () => {
    assert.equal(validateChoiceText('Valid choice'), 'Valid choice');
  });

  await t.test('trims whitespace', () => {
    assert.equal(validateChoiceText('   Trim me   '), 'Trim me');
  });

  await t.test('removes control characters', () => {
    assert.equal(validateChoiceText('No\nNewlines'), 'NoNewlines');
    assert.equal(validateChoiceText('Control\x00Char'), 'ControlChar');
  });

  await t.test('limits length to 200 chars', () => {
    const longText = 'a'.repeat(300);
    const result = validateChoiceText(longText);
    assert.equal(result.length, 200);
    assert.equal(result, 'a'.repeat(200));
  });

  await t.test('handles empty or invalid input', () => {
    assert.equal(validateChoiceText(''), '');
    assert.equal(validateChoiceText(null), '');
  });
});

test('validateBase64', async (t) => {
  await t.test('accepts valid base64', () => {
    // "Hello" in base64 is "SGVsbG8="
    assert.equal(validateBase64('SGVsbG8='), true);
    // "test" -> "dGVzdA=="
    assert.equal(validateBase64('dGVzdA=='), true);
  });

  await t.test('rejects invalid base64', () => {
    assert.equal(validateBase64('Invalid!Char'), false);
    assert.equal(validateBase64('Short'), false); // length 5, not multiple of 4
    assert.equal(validateBase64(''), false);
    assert.equal(validateBase64(null), false);
    // Incorrect padding length check (if we were strict about padding char placement, but current regex allows = anywhere? No, regex ends with ={0,2})
    // Actually current regex /^[A-Za-z0-9+/]*={0,2}$/ allows empty string before =, but length check catches it?
    // "==" length 2 -> fail
  });
});
