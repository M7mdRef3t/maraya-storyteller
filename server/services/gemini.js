/**
 * Gemini Structured Output Service
 *
 * Uses Gemini text models with forced JSON schema output
 * to generate structured story scenes.
 */

import { GoogleGenAI } from '@google/genai';
import { uniqueNonEmpty } from './utils.js';

let ai = null;

export function initGemini(apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

const AUDIO_MOOD_ENUM = [
  'ambient_calm',
  'tense_drone',
  'hopeful_strings',
  'mysterious_wind',
  'triumphant_rise',
];

const INTERLEAVED_KIND_ENUM = ['narration', 'visual', 'reflection'];
const GEMINI_TEXT_FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

// JSON schema for structured scene output
const SCENE_SCHEMA = {
  type: 'object',
  properties: {
    scenes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          scene_id: {
            type: 'string',
            description: 'Unique scene identifier',
          },
          narration_ar: {
            type: 'string',
            description: 'Poetic narration in the target language, 2-3 sentences using architectural metaphors',
          },
          image_prompt: {
            type: 'string',
            description: 'Detailed English image generation prompt with architectural style, cinematic lighting, 16:9 composition',
          },
          audio_mood: {
            type: 'string',
            enum: AUDIO_MOOD_ENUM,
          },
          interleaved_blocks: {
            type: 'array',
            minItems: 2,
            maxItems: 5,
            items: {
              type: 'object',
              properties: {
                kind: {
                  type: 'string',
                  enum: INTERLEAVED_KIND_ENUM,
                  description: 'Interleaved block type in the scene stream',
                },
                text_ar: {
                  type: 'string',
                  description: 'Text content in the target language for this block',
                },
              },
              required: ['kind', 'text_ar'],
            },
          },
          choices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text_ar: {
                  type: 'string',
                  description: 'Choice text in the target language',
                },
                emotion_shift: {
                  type: 'string',
                  description: 'The emotional direction this choice leads to',
                },
              },
              required: ['text_ar', 'emotion_shift'],
            },
          },
        },
        required: ['scene_id', 'narration_ar', 'image_prompt', 'audio_mood', 'interleaved_blocks', 'choices'],
      },
    },
  },
  required: ['scenes'],
};

function isModelUnavailableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('no longer available')
    || message.includes('not found')
    || message.includes('unsupported')
    || message.includes('invalid model')
  );
}

function getTextModelCandidates() {
  return uniqueNonEmpty([process.env.GEMINI_TEXT_MODEL || '', ...GEMINI_TEXT_FALLBACK_MODELS]);
}

async function generateContentWithModelFallback({ contents, config, purpose }) {
  const models = getTextModelCandidates();
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`[gemini] ${purpose} with model:`, model);
      return await ai.models.generateContent({
        model,
        contents,
        config,
      });
    } catch (error) {
      lastError = error;
      if (!isModelUnavailableError(error)) {
        throw error;
      }
      console.warn(`[gemini] Model unavailable for ${purpose}: ${model} -> ${error.message}`);
    }
  }

  throw lastError || new Error('No available Gemini text model');
}

function normalizeInterleavedBlocks(scene, outputMode) {
  if (!scene || typeof scene !== 'object') return [];

  const isEnglish = outputMode === 'judge_en';

  const blocks = Array.isArray(scene.interleaved_blocks) ? scene.interleaved_blocks : [];
  const normalized = blocks
    .map((block) => {
      if (!block || typeof block !== 'object') return null;
      const kind = INTERLEAVED_KIND_ENUM.includes(block.kind) ? block.kind : 'narration';
      const text = typeof block.text_ar === 'string' ? block.text_ar.trim() : '';
      if (!text) return null;
      return { kind, text_ar: text };
    })
    .filter(Boolean)
    .slice(0, 5);

  if (normalized.length > 0) return normalized;

  const narration = typeof scene.narration_ar === 'string' ? scene.narration_ar.trim() : '';
  if (!narration) return [];

  // Backward-compatible fallback
  if (isEnglish) {
    return [
      { kind: 'narration', text_ar: narration },
      { kind: 'visual', text_ar: 'The image forms around you as the light shifts slowly.' },
      { kind: 'reflection', text_ar: 'Pause for a moment, then choose the path that calls to you.' },
    ];
  }

  return [
    { kind: 'narration', text_ar: narration },
    { kind: 'visual', text_ar: 'تتشكل الصورة حولك بينما يتبدل الضوء ببطء.' },
    { kind: 'reflection', text_ar: 'توقف لحظة، ثم اختر المسار الذي يليق بقلبك.' },
  ];
}

function normalizeScene(scene, index, outputMode) {
  if (!scene || typeof scene !== 'object') return null;

  const isEnglish = outputMode === 'judge_en';

  const sceneId =
    typeof scene.scene_id === 'string' && scene.scene_id.trim()
      ? scene.scene_id.trim()
      : `scene_${index + 1}`;

  const defaultNarration = isEnglish
    ? 'The scene takes shape in silence, as if the walls are catching their breath.'
    : 'يتشكل المشهد بصمت، كأن الجدران تستعيد أنفاسها.';

  const narration =
    typeof scene.narration_ar === 'string' && scene.narration_ar.trim()
      ? scene.narration_ar.trim()
      : defaultNarration;

  const imagePrompt =
    typeof scene.image_prompt === 'string' && scene.image_prompt.trim()
      ? scene.image_prompt.trim()
      : 'cinematic interior architecture, atmospheric lighting, 16:9 composition';

  const audioMood = AUDIO_MOOD_ENUM.includes(scene.audio_mood) ? scene.audio_mood : 'ambient_calm';

  const choices = Array.isArray(scene.choices)
    ? scene.choices
      .map((choice) => {
        if (!choice || typeof choice !== 'object') return null;
        const textAr = typeof choice.text_ar === 'string' ? choice.text_ar.trim() : '';
        if (!textAr) return null;
        const emotionShift = typeof choice.emotion_shift === 'string' && choice.emotion_shift.trim()
          ? choice.emotion_shift.trim()
          : 'hope';
        return { text_ar: textAr, emotion_shift: emotionShift };
      })
      .filter(Boolean)
    : [];

  return {
    scene_id: sceneId,
    narration_ar: narration,
    image_prompt: imagePrompt,
    audio_mood: audioMood,
    interleaved_blocks: normalizeInterleavedBlocks(scene, outputMode),
    choices,
  };
}

/**
 * Generate story scenes using Gemini structured output
 */
export async function generateScenes(systemPrompt, conversationHistory, outputMode = 'ar_fusha') {
  if (!ai) throw new Error('Gemini not initialized');

  console.log('[gemini] Conversation history length:', conversationHistory.length);

  const response = await generateContentWithModelFallback({
    purpose: 'scene generation',
    contents: conversationHistory,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: SCENE_SCHEMA,
      temperature: 0.9,
      topP: 0.95,
    },
  });

  const text = response.text;
  console.log('[gemini] Response received, length:', text?.length || 0);
  console.log('[gemini] First 200 chars:', text?.substring(0, 200));

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response from Gemini: ${error.message}`);
  }

  const rawScenes = Array.isArray(parsed?.scenes) ? parsed.scenes : [];
  const scenes = rawScenes
    .map((scene, index) => normalizeScene(scene, index, outputMode))
    .filter(Boolean);

  console.log('[gemini] Parsed scenes count:', scenes.length);
  return scenes;
}

/**
 * Analyze a space/room image to detect emotion
 */
export async function analyzeSpace(systemPrompt, imageBase64, mimeType) {
  if (!ai) throw new Error('Gemini not initialized');

  const response = await generateContentWithModelFallback({
    purpose: 'space analysis',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64,
            },
          },
          { text: 'حلّل هذا المكان.' },
        ],
      },
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const text = response.text;
  return JSON.parse(text);
}
