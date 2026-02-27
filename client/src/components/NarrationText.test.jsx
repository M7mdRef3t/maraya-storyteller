import { describe, it, expect } from 'vitest';
import { normalizeBlocks } from './NarrationText';

describe('normalizeBlocks', () => {
  it('should return normalized blocks when valid blocks are provided', () => {
    const blocks = [
      { kind: 'narration', text_ar: 'Scene 1' },
      { kind: 'visual', text_ar: 'Image 1' },
    ];
    const result = normalizeBlocks(blocks, 'Fallback');
    expect(result).toEqual([
      { kind: 'narration', text_ar: 'Scene 1' },
      { kind: 'visual', text_ar: 'Image 1' },
    ]);
  });

  it('should filter out null or invalid blocks', () => {
    const blocks = [
      null,
      { kind: 'narration', text_ar: 'Valid' },
      'invalid string block',
      123,
    ];
    const result = normalizeBlocks(blocks, 'Fallback');
    expect(result).toEqual([{ kind: 'narration', text_ar: 'Valid' }]);
  });

  it('should default kind to "narration" if kind is invalid', () => {
    const blocks = [{ kind: 'unknown', text_ar: 'Text' }];
    const result = normalizeBlocks(blocks, 'Fallback');
    expect(result).toEqual([{ kind: 'narration', text_ar: 'Text' }]);
  });

  it('should trim text_ar and filter out blocks with empty text', () => {
    const blocks = [
      { kind: 'narration', text_ar: '  Trimmed  ' },
      { kind: 'visual', text_ar: '' },
      { kind: 'reflection', text_ar: '   ' },
    ];
    const result = normalizeBlocks(blocks, 'Fallback');
    expect(result).toEqual([{ kind: 'narration', text_ar: 'Trimmed' }]);
  });

  it('should limit the number of blocks to 5', () => {
    const blocks = Array.from({ length: 10 }, (_, i) => ({
      kind: 'narration',
      text_ar: `Block ${i}`,
    }));
    const result = normalizeBlocks(blocks, 'Fallback');
    expect(result).toHaveLength(5);
    expect(result[4].text_ar).toBe('Block 4');
  });

  it('should use fallback text if blocks array is empty', () => {
    const result = normalizeBlocks([], 'Fallback Text');
    expect(result).toEqual([{ kind: 'narration', text_ar: 'Fallback Text' }]);
  });

  it('should use fallback text if all blocks are filtered out', () => {
    const blocks = [{ kind: 'narration', text_ar: '' }];
    const result = normalizeBlocks(blocks, 'Fallback Text');
    expect(result).toEqual([{ kind: 'narration', text_ar: 'Fallback Text' }]);
  });

  it('should return empty array if blocks are invalid and fallback is empty', () => {
    const result = normalizeBlocks([], '');
    expect(result).toEqual([]);
  });

  it('should return empty array if blocks are invalid and fallback is invalid', () => {
    const result = normalizeBlocks(null, null);
    expect(result).toEqual([]);
  });

  it('should trim fallback text', () => {
      const result = normalizeBlocks([], '  Fallback  ');
      expect(result).toEqual([{ kind: 'narration', text_ar: 'Fallback' }]);
  });
});
