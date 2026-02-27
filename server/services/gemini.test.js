import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

test('initGemini initializes GoogleGenAI with API key', async (t) => {
  const mockGoogleGenAI = mock.fn();

  // Mock the module before importing the subject
  mock.module('@google/genai', {
    namedExports: {
      GoogleGenAI: mockGoogleGenAI,
    },
  });

  // Import the subject module dynamically to ensure the mock is used
  const { initGemini } = await import('./gemini.js');

  const apiKey = 'test-api-key';
  initGemini(apiKey);

  assert.strictEqual(mockGoogleGenAI.mock.callCount(), 1);
  assert.deepStrictEqual(mockGoogleGenAI.mock.calls[0].arguments, [{ apiKey }]);
});
