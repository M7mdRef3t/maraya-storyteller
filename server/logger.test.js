import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeForLog } from './logger.js';

test('sanitizeForLog redacts configured secret values in strings', () => {
  const output = sanitizeForLog('token=abc123SECRETxyz', {
    secrets: ['abc123SECRETxyz'],
  });
  assert.equal(output, 'token=[REDACTED]');
});

test('sanitizeForLog redacts secrets in serialized objects', () => {
  const output = sanitizeForLog({ apiKey: 'MY_SUPER_SECRET' }, {
    secrets: ['MY_SUPER_SECRET'],
  });
  assert.equal(output, '{"apiKey":"[REDACTED]"}');
});

test('sanitizeForLog limits output length', () => {
  const output = sanitizeForLog('a'.repeat(1200), {});
  assert.ok(output.endsWith('... [TRUNCATED]'));
  assert.equal(output.length, 1015);
});

test('sanitizeForLog handles Error differently by mode', () => {
  const err = new Error('boom');
  const prod = sanitizeForLog(err, { isDebug: false });
  const debug = sanitizeForLog(err, { isDebug: true });

  assert.equal(prod, 'boom');
  assert.ok(debug.includes('Error: boom'));
});
