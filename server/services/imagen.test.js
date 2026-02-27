import assert from 'node:assert/strict';
import test from 'node:test';
import { extractImageFromGenerateContentResponse } from './imagen.js';

test('extractImageFromGenerateContentResponse returns null for null/undefined response', () => {
  assert.equal(extractImageFromGenerateContentResponse(null), null);
  assert.equal(extractImageFromGenerateContentResponse(undefined), null);
});

test('extractImageFromGenerateContentResponse extracts image from candidates parts', () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [
            {
              inlineData: {
                data: 'base64data',
                mimeType: 'image/jpeg',
              },
            },
          ],
        },
      },
    ],
  };

  const result = extractImageFromGenerateContentResponse(response);
  assert.deepEqual(result, {
    base64: 'base64data',
    mimeType: 'image/jpeg',
  });
});

test('extractImageFromGenerateContentResponse uses default mimeType if missing in parts', () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [
            {
              inlineData: {
                data: 'base64data',
              },
            },
          ],
        },
      },
    ],
  };

  const result = extractImageFromGenerateContentResponse(response);
  assert.deepEqual(result, {
    base64: 'base64data',
    mimeType: 'image/png',
  });
});

test('extractImageFromGenerateContentResponse extracts image from fallback data property', () => {
  const response = {
    data: 'fallbackBase64Data',
  };

  const result = extractImageFromGenerateContentResponse(response);
  assert.deepEqual(result, {
    base64: 'fallbackBase64Data',
    mimeType: 'image/png',
  });
});

test('extractImageFromGenerateContentResponse returns null if no image found in candidates', () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: 'just text',
            },
          ],
        },
      },
    ],
  };

  assert.equal(extractImageFromGenerateContentResponse(response), null);
});

test('extractImageFromGenerateContentResponse handles empty parts array', () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [],
        },
      },
    ],
  };

  assert.equal(extractImageFromGenerateContentResponse(response), null);
});

test('extractImageFromGenerateContentResponse handles missing content/parts structure', () => {
  const response = {
    candidates: [
      {},
    ],
  };
  assert.equal(extractImageFromGenerateContentResponse(response), null);
});

test('extractImageFromGenerateContentResponse finds first valid image part among multiple parts', () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [
            { text: 'some text' },
            {
              inlineData: {
                data: 'imageData',
                mimeType: 'image/webp',
              },
            },
            {
              inlineData: {
                data: 'secondImageData',
              },
            },
          ],
        },
      },
    ],
  };

  const result = extractImageFromGenerateContentResponse(response);
  assert.deepEqual(result, {
    base64: 'imageData',
    mimeType: 'image/webp',
  });
});
