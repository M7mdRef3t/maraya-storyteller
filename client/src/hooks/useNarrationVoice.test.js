import { describe, it, expect } from 'vitest';
import { getVoiceCandidates } from './useNarrationVoice';

describe('getVoiceCandidates', () => {
  const voices = [
    { name: 'Voice 1', lang: 'en-US' },
    { name: 'Voice 2', lang: 'en-GB' },
    { name: 'Voice 3', lang: 'es-ES' },
    { name: 'Voice 4', lang: 'fr-FR' },
  ];

  it('finds an exact match', () => {
    const result = getVoiceCandidates(voices, 'en-US');
    expect(result).toEqual({ name: 'Voice 1', lang: 'en-US' });
  });

  it('finds a prefix match when exact match is missing', () => {
    // requesting en-AU, should fallback to en-US or en-GB based on order
    // 'en-AU' base is 'en'. 'en-US' starts with 'en'.
    const result = getVoiceCandidates(voices, 'en-AU');
    expect(result).toEqual({ name: 'Voice 1', lang: 'en-US' });
  });

  it('is case insensitive', () => {
    const result = getVoiceCandidates(voices, 'EN-us');
    expect(result).toEqual({ name: 'Voice 1', lang: 'en-US' });
  });

  it('returns null if no match found', () => {
    const result = getVoiceCandidates(voices, 'de-DE');
    expect(result).toBeNull();
  });

  it('handles empty voice list', () => {
    const result = getVoiceCandidates([], 'en-US');
    expect(result).toBeNull();
  });

  it('handles null/undefined lang input', () => {
    // If lang is null, target becomes ''. base becomes ''.
    // voices.find(v => v.lang.toLowerCase() === '') -> likely undefined.
    // voices.find(v => v.lang.toLowerCase().startsWith('')) -> this returns the first voice!
    // We want it to return null if lang is not provided.
    expect(getVoiceCandidates(voices, null)).toBeNull();
    expect(getVoiceCandidates(voices, undefined)).toBeNull();
  });

  it('handles voice object missing lang property safely', () => {
    const brokenVoices = [
      { name: 'Broken Voice' }, // missing lang
      { name: 'Voice 1', lang: 'en-US' },
    ];

    // To properly test the crash, we need to ensure the exact match doesn't short-circuit it.
    // Let's search for something that doesn't match exactly.
    // Search for 'es-ES'.
    // Exact match: 'en-US' != 'es-es'. 'Broken Voice'.lang is undefined.
    // The exact match logic: voice.lang?.toLowerCase() === target.
    // undefined === 'es-es' -> false.

    // Prefix match:
    // target 'es-es', base 'es'.
    // broken voice: voice.lang is undefined.
    // voice.lang?.toLowerCase() is undefined.
    // undefined.startsWith('es') -> THROWS ERROR.

    // This should throw if the bug exists.
    const result = getVoiceCandidates(brokenVoices, 'es-ES');
    expect(result).toBeNull();
  });
});
