import { test } from 'node:test';
import assert from 'node:assert';
import { MessageSchema, StartStorySchema, ChooseSchema } from './validators.js';

test('StartStorySchema', async (t) => {
  await t.test('valid start_story', () => {
    const valid = {
      type: 'start_story',
      output_mode: 'judge_en',
      emotion: 'hope',
      image: 'base64data...',
      mimeType: 'image/jpeg',
    };
    const result = StartStorySchema.safeParse(valid);
    assert.ok(result.success);
    assert.deepStrictEqual(result.data, valid);
  });

  await t.test('valid start_story minimal', () => {
    const valid = {
      type: 'start_story',
    };
    const result = StartStorySchema.safeParse(valid);
    assert.ok(result.success);
  });

  await t.test('invalid type for emotion (should be string)', () => {
    const invalid = {
      type: 'start_story',
      emotion: 123, // Invalid type
    };
    const result = StartStorySchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  await t.test('extra fields forbidden', () => {
    const invalid = {
      type: 'start_story',
      extra_field: 'not_allowed',
    };
    const result = StartStorySchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });
});

test('ChooseSchema', async (t) => {
  await t.test('valid choose', () => {
    const valid = {
      type: 'choose',
      output_mode: 'ar_egyptian',
      choice_text: 'Go left',
      emotion_shift: 'anxiety',
    };
    const result = ChooseSchema.safeParse(valid);
    assert.ok(result.success);
  });

  await t.test('valid choose minimal', () => {
    const valid = {
      type: 'choose',
    };
    const result = ChooseSchema.safeParse(valid);
    assert.ok(result.success);
  });

  await t.test('invalid type for output_mode (should be string)', () => {
    const invalid = {
      type: 'choose',
      output_mode: 123, // Invalid type
    };
    const result = ChooseSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  await t.test('extra fields forbidden', () => {
    const invalid = {
      type: 'choose',
      unknown: 'field',
    };
    const result = ChooseSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });
});

test('MessageSchema (Discriminated Union)', async (t) => {
  await t.test('parses start_story correctly', () => {
    const msg = { type: 'start_story', emotion: 'wonder' };
    const result = MessageSchema.safeParse(msg);
    assert.ok(result.success);
    assert.strictEqual(result.data.type, 'start_story');
  });

  await t.test('parses choose correctly', () => {
    const msg = { type: 'choose', choice_text: 'Hello' };
    const result = MessageSchema.safeParse(msg);
    assert.ok(result.success);
    assert.strictEqual(result.data.type, 'choose');
  });

  await t.test('fails on unknown type', () => {
    const msg = { type: 'unknown_type' };
    const result = MessageSchema.safeParse(msg);
    assert.strictEqual(result.success, false);
  });
});
