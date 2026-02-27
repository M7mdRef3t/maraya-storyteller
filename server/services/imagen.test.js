import assert from 'node:assert/strict';
import { test, mock, describe, beforeEach } from 'node:test';
import { generateImage, initImagen } from './imagen.js';

// Define mocks
const generateImagesMock = mock.fn();
const generateContentMock = mock.fn();

const mockClient = {
  models: {
    generateImages: generateImagesMock,
    generateContent: generateContentMock,
  }
};

describe('Imagen Service', () => {
  beforeEach(() => {
    generateImagesMock.mock.resetCalls();
    generateContentMock.mock.resetCalls();

    // Inject mock client
    initImagen('test-key', mockClient);
  });

  test('generateImage uses Imagen strategy first and succeeds', async () => {
    generateImagesMock.mock.mockImplementation(async () => {
      return {
        generatedImages: [{ image: { imageBytes: 'base64data_imagen' } }],
      };
    });

    const result = await generateImage('test prompt');

    assert.deepEqual(result, { base64: 'base64data_imagen', mimeType: 'image/png' });
    assert.strictEqual(generateImagesMock.mock.callCount(), 1);
  });

  test('generateImage falls back to Gemini Image strategy on Imagen failure', async () => {
    generateImagesMock.mock.mockImplementation(async () => {
      throw new Error('404 Not Found');
    });

    generateContentMock.mock.mockImplementation(async () => {
      return {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: 'base64data_gemini',
                    mimeType: 'image/jpeg',
                  },
                },
              ],
            },
          },
        ],
      };
    });

    const result = await generateImage('test prompt');

    assert.deepEqual(result, { base64: 'base64data_gemini', mimeType: 'image/jpeg' });
    // Expect at least one call to Imagen (likely 2 given the default list has 2 models)
    assert.ok(generateImagesMock.mock.callCount() >= 1);
    // Expect at least one call to Gemini
    assert.strictEqual(generateContentMock.mock.callCount(), 1);
  });

  test('generateImage returns null if all strategies fail', async () => {
    generateImagesMock.mock.mockImplementation(async () => {
      throw new Error('404 Not Found');
    });
    generateContentMock.mock.mockImplementation(async () => {
      throw new Error('404 Not Found');
    });

    const result = await generateImage('test prompt');

    assert.strictEqual(result, null);
    assert.ok(generateImagesMock.mock.callCount() >= 2);
    assert.ok(generateContentMock.mock.callCount() >= 2);
  });
});
