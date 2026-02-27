import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

test('initImagen initializes GoogleGenAI with provided apiKey', async (t) => {
  if (!mock.module) {
    t.skip('mock.module is unavailable in this Node runtime');
    return;
  }

  const apiKey = 'test-api-key';
  let constructorCalledWith = null;

  class MockGoogleGenAI {
    constructor(config) {
      constructorCalledWith = config;
    }
  }

  const moduleMock = mock.module('@google/genai', {
    namedExports: {
      GoogleGenAI: MockGoogleGenAI,
    },
  });

  try {
    const { initImagen } = await import(`./imagen.js?test=${Date.now()}`);
    initImagen(apiKey);
    assert.deepEqual(constructorCalledWith, { apiKey });
  } finally {
    moduleMock.restore();
  }
});
