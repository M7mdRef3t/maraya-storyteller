import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getModeUiLanguage } from './constants.js';

describe('getModeUiLanguage', () => {
  it('should return "en" for "judge_en"', () => {
    assert.strictEqual(getModeUiLanguage('judge_en'), 'en');
  });

  it('should return "ar" for "ar_fusha"', () => {
    assert.strictEqual(getModeUiLanguage('ar_fusha'), 'ar');
  });

  it('should return "ar" for "ar_egyptian"', () => {
    assert.strictEqual(getModeUiLanguage('ar_egyptian'), 'ar');
  });

  it('should return "en" for unknown mode', () => {
    assert.strictEqual(getModeUiLanguage('unknown_mode'), 'en');
  });

  it('should return "en" for null', () => {
    assert.strictEqual(getModeUiLanguage(null), 'en');
  });

  it('should return "en" for undefined', () => {
    assert.strictEqual(getModeUiLanguage(undefined), 'en');
  });
});
