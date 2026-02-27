import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFallbackChoices } from './storyteller.js';

test('buildFallbackChoices returns English choices for judge_en mode', () => {
  const choices = buildFallbackChoices('judge_en');
  assert.equal(choices.length, 2);
  assert.ok(choices[0].text_ar.startsWith('Walk toward'));
  assert.ok(choices[1].text_ar.startsWith('Stay still'));
});

test('buildFallbackChoices returns Egyptian Arabic choices for ar_egyptian mode', () => {
  const choices = buildFallbackChoices('ar_egyptian');
  assert.equal(choices.length, 2);
  assert.ok(choices[0].text_ar.includes('تتحرك نحية الممر'));
  assert.ok(choices[1].text_ar.includes('تفضل مكانك'));
});

test('buildFallbackChoices returns Fusha choices for default/unknown mode', () => {
  const modes = ['ar_fusha', 'unknown_mode', undefined, null];

  modes.forEach(mode => {
    const choices = buildFallbackChoices(mode);
    assert.equal(choices.length, 2, `Failed for mode: ${mode}`);
    assert.ok(choices[0].text_ar.includes('تمضي نحو الممر'), `Failed for mode: ${mode}`);
    assert.ok(choices[1].text_ar.includes('تتريّث لحظة'), `Failed for mode: ${mode}`);
  });
});
