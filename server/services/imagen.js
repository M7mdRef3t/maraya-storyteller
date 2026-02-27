/**
 * Imagen 3 Image Generation Service
 *
 * Generates images from scene prompts using Google's Imagen 3.
 * Falls back gracefully if generation fails.
 */

import { GoogleGenAI } from '@google/genai';
import { logError } from '../logger.js';

let ai = null;
let activeStrategy = null;
let strategyQueuePromise = null;
let globalBackoffUntil = 0;

export function initImagen(apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

const IMAGEN_DEFAULT_MODELS = [
  'imagen-4.0-generate-001',
  'imagen-3.0-generate-002',
];

const GEMINI_IMAGE_DEFAULT_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview',
];

function uniqueNonEmpty(values) {
  return [...new Set(values.map((value) => (value || '').trim()).filter(Boolean))];
}

function shouldRetryWithAnotherModel(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('not found')
    || message.includes('unsupported')
    || message.includes('invalid argument')
    || message.includes('no image')
  );
}

export function extractImageFromGenerateContentResponse(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const data = part?.inlineData?.data;
    if (data) {
      return {
        base64: data,
        mimeType: part.inlineData?.mimeType || 'image/png',
      };
    }
  }

  if (response?.data) {
    return {
      base64: response.data,
      mimeType: 'image/png',
    };
  }

  return null;
}

async function generateWithImagenModel(model, prompt) {
  const response = await ai.models.generateImages({
    model,
    prompt: `${prompt}, photorealistic, cinematic composition, ultra high quality`,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const img = response.generatedImages[0];
    return {
      base64: img.image.imageBytes,
      mimeType: 'image/png',
    };
  }

  return null;
}

async function generateWithGeminiImageModel(model, prompt) {
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [{
          text: `Create one cinematic 16:9 still image only. ${prompt}`,
        }],
      },
    ],
    config: {
      responseModalities: ['IMAGE'],
      temperature: 0.8,
    },
  });

  return extractImageFromGenerateContentResponse(response);
}

function buildStrategyCandidates() {
  const configuredImagenModel = process.env.IMAGEN_MODEL || '';
  const configuredGeminiImageModel = process.env.GEMINI_IMAGE_MODEL || '';

  const imagenModels = uniqueNonEmpty([configuredImagenModel, ...IMAGEN_DEFAULT_MODELS]);
  const geminiImageModels = uniqueNonEmpty([configuredGeminiImageModel, ...GEMINI_IMAGE_DEFAULT_MODELS]);

  return [
    ...imagenModels.map((model) => ({ type: 'imagen', model })),
    ...geminiImageModels.map((model) => ({ type: 'gemini-image', model })),
  ];
}

async function resolveStrategyQueue() {
  if (strategyQueuePromise) return strategyQueuePromise;

  // Keep queue setup fast: the generation loop already retries across candidates
  // and handles unsupported/unavailable model errors robustly.
  strategyQueuePromise = Promise.resolve(buildStrategyCandidates());

  return strategyQueuePromise;
}

async function runStrategy(strategy, prompt) {
  if (strategy.type === 'imagen') {
    return generateWithImagenModel(strategy.model, prompt);
  }
  return generateWithGeminiImageModel(strategy.model, prompt);
}

/**
 * Generate an image from a text prompt
 * @returns {Promise<{base64: string, mimeType: string} | null>}
 */
export async function generateImage(prompt) {
  if (!ai) throw new Error('Imagen not initialized');

  if (Date.now() < globalBackoffUntil) {
    return null;
  }

  try {
    const queue = await resolveStrategyQueue();

    if (activeStrategy) {
      try {
        const image = await runStrategy(activeStrategy, prompt);
        if (image) return image;
      } catch (error) {
        if (!shouldRetryWithAnotherModel(error)) {
          throw error;
        }
        activeStrategy = null;
      }
    }

    const failures = [];
    for (const strategy of queue) {
      try {
        const image = await runStrategy(strategy, prompt);
        if (image) {
          activeStrategy = strategy;
          return image;
        }
        failures.push(`${strategy.model}: no image returned`);
      } catch (error) {
        failures.push(`${strategy.model}: ${error.message}`);
        if (!shouldRetryWithAnotherModel(error)) {
          throw error;
        }
      }
    }

    globalBackoffUntil = Date.now() + 60000;
    logError('[maraya-imagen] All image generation strategies failed:', failures.join(' | '));
    return null;
  } catch (error) {
    logError('[maraya-imagen] Image generation failed:', error.message);
    return null;
  }
}
