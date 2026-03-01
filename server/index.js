import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { initGemini, generateScenes, analyzeSpace } from './services/gemini.js';
import { initImagen, generateImage } from './services/imagen.js';
import {
  buildStorytellerPrompt,
  buildSpaceAnalysisPrompt,
  normalizeOutputMode,
} from './prompts/storyteller.js';
import { validateEmotion, validateChoiceText, validateBase64 } from './validators.js';
import { log, logDebug, logError } from './logger.js';

// TTS & Narration
import { generateNarrationAudio } from './services/tts/index.js';
import { chunkArabic } from './utils/tts/chunkArabic.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  logError('GEMINI_API_KEY is not set in .env');
  process.exit(1);
}
initGemini(API_KEY);
initImagen(API_KEY);
log('Gemini & Imagen services initialized');

const app = express();
const server = createServer(app);

function verifyClient(info, cb) {
  const origin = info.req.headers.origin;
  const host = (info.req.headers.host || '').toLowerCase();

  if (!origin) {
    return cb(true);
  }

  try {
    const originHost = new URL(origin).host.toLowerCase();
    if (host && originHost === host) {
      return cb(true);
    }
  } catch {
    logDebug(`Blocked WebSocket connection with invalid origin format: ${origin}`);
    return cb(false, 403, 'Forbidden');
  }

  const allowedOrigins = [
    'http://localhost:5180',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:5180',
  ];

  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean));
  }

  if (allowedOrigins.includes(origin)) {
    return cb(true);
  }

  logDebug(`Blocked WebSocket connection from untrusted origin: ${origin}`);
  return cb(false, 403, 'Forbidden');
}

const wss = new WebSocketServer({
  server,
  verifyClient,
  maxPayload: 5 * 1024 * 1024,
});

app.use(express.json());
app.get('/health', (req, res) => res.send('OK'));

const MAX_SCENES = 7;

function buildUiStrings(outputMode) {
  if (outputMode === 'judge_en') {
    return {
      readingSpace: 'Maraya is reading your space...',
      shapingStory: 'Maraya is taking shape...',
      nextScene: 'The next scene is taking shape...',
      storyComplete: 'You have reached the end of this journey. But mirrors never truly end...',
      startErrorPrefix: 'Failed to start story:',
      nextError: 'Failed to generate the next scene.',
    };
  }

  if (outputMode === 'ar_egyptian') {
    return {
      readingSpace: 'مرايا بتقرا المكان بتاعك...',
      shapingStory: 'مرايا بتتشكّل...',
      nextScene: 'المشهد اللي بعده بيتشكّل...',
      storyComplete: 'وصلت لنهاية الرحلة... بس المرايات عمرها ما بتخلص.',
      startErrorPrefix: 'القصة ما بدأتش:',
      nextError: 'ما قدرناش نكمّل المشهد اللي بعده.',
    };
  }

  if (outputMode === 'ar_educational') {
    return {
      readingSpace: 'المرايا تحلل مساحتك التعليمية...',
      shapingStory: 'المرايا تبدأ الجلسة التعليمية...',
      nextScene: 'المشهد التعليمي التالي يتشكل...',
      storyComplete: 'أتممت الجلسة التعليمية بنجاح. العلم هو المفتاح.',
      startErrorPrefix: 'حدث خطأ في بدء الجلسة:',
      nextError: 'تعذر تحميل الجزء التعليمي التالي.',
    };
  }

  return {
    readingSpace: 'المرايا تقرأ مكانك بحسٍّ شاعري...',
    shapingStory: 'المرايا تتشكل من صميم خيالك...',
    nextScene: 'المشهد التالي يتجلى في الأفق...',
    storyComplete: 'وصلتَ إلى نهاية هذه الرحلة الروحية. لكنّ المرايا لا تنتهي...',
    startErrorPrefix: 'فشل في بدء التجربة:',
    nextError: 'فشل في استحضار المشهد التالي.',
  };
}

function buildFallbackChoices(outputMode) {
  if (outputMode === 'judge_en') {
    return [
      { text_ar: 'Walk toward the brighter corridor and face what is waiting.', emotion_shift: 'hope' },
      { text_ar: 'Stay still and listen to the echo before moving.', emotion_shift: 'nostalgia' },
    ];
  }

  if (outputMode === 'ar_egyptian') {
    return [
      { text_ar: 'تتحرك نحية الممر المنوّر وتواجه اللي مستنيك.', emotion_shift: 'hope' },
      { text_ar: 'تفضل مكانك شوية وتسمع صدى المكان قبل ما تتحرك.', emotion_shift: 'nostalgia' },
    ];
  }

  if (outputMode === 'ar_educational') {
    return [
      { text_ar: 'توجّه نحو المصدر الضوئي لتفهم القاعدة الأساسية.', emotion_shift: 'hope' },
      { text_ar: 'توقف وراجع ما تعلمته قبل المتابعة.', emotion_shift: 'nostalgia' },
    ];
  }

  return [
    { text_ar: 'تمضي نحو الممر الأكثر نورًا وتواجه ما ينتظرك.', emotion_shift: 'hope' },
    { text_ar: 'تتريّث لحظة وتنصت لصدى المكان قبل المتابعة.', emotion_shift: 'nostalgia' },
  ];
}

wss.on('connection', (ws) => {
  log('Client connected');

  let conversationHistory = [];
  let currentEmotion = 'hope';
  let currentOutputMode = 'judge_en';
  let sceneCount = 0;
  let currentSceneVersion = 0;
  let abortController = new AbortController();

  const sendMessage = (type, data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, v: currentSceneVersion, ...data }));
    }
  };

  const streamScenes = (scenes, baseSceneCount = 0, uiStrings, outputMode = currentOutputMode, signal = abortController.signal) => {
    let isFinal = false;

    // First loop: stream the text for all scenes immediately
    for (let i = 0; i < scenes.length; i += 1) {
      if (signal && signal.aborted) return;
      const scene = scenes[i];
      const storySceneNumber = baseSceneCount + i + 1;
      const reachedStoryLimit = storySceneNumber >= MAX_SCENES;
      const hasChoices = Array.isArray(scene.choices) && scene.choices.length > 0;

      const normalizedChoices = reachedStoryLimit
        ? []
        : (hasChoices ? scene.choices.slice(0, 2) : buildFallbackChoices(outputMode));

      if (!reachedStoryLimit && !hasChoices) {
        logDebug(
          `Scene ${scene.scene_id} returned empty choices before final scene; applied fallback choices`,
        );
      }

      if (reachedStoryLimit) isFinal = true;

      sendMessage('scene', {
        scene: {
          ...scene,
          choices: normalizedChoices,
          image: null,
          scene_index: i,
          total_scenes: scenes.length,
          story_scene_number: storySceneNumber,
          story_total_scenes: MAX_SCENES,
          is_final: reachedStoryLimit,
        },
      });
    }

    // Second loop: background sequential image generation to avoid API rate limits (N+1 parallel spam)
    (async () => {
      for (const scene of scenes) {
        if (signal && signal.aborted) return;
        try {
          const image = await generateImage(scene.image_prompt);
          if (image) {
            sendMessage('scene_image', {
              scene_id: scene.scene_id,
              image: image.base64,
              mimeType: image.mimeType,
            });
          }
        } catch (err) {
          logDebug(`Image generation failed for scene ${scene.scene_id}:`, err?.message || err);
        }
      }

      if (isFinal) {
        setTimeout(() => {
          sendMessage('story_complete', { message: uiStrings.storyComplete });
        }, 500);
      }
    })();

    // Third loop: Background narration generation with OpenAI TTS
    (async () => {
      // Small delay to allow frontend to start showing the scene
      await new Promise((r) => setTimeout(r, 1000));

      for (const scene of scenes) {
        if (signal && signal.aborted) return;
        try {
          const textToNarrate = scene.narration_ar || '';
          if (!textToNarrate) continue;

          // Split into manageable chunks for pacing
          const chunks = chunkArabic(textToNarrate);
          logDebug(`[tts] Generated ${chunks.length} chunks for scene ${scene.scene_id}`);

          sendMessage('audio_start', { sceneId: scene.scene_id, count: chunks.length });

          for (let i = 0; i < chunks.length; i++) {
            if (signal && signal.aborted) return;
            const chunkText = chunks[i];

            // 1. Send meta data first
            sendMessage('audio_meta', {
              sceneId: scene.scene_id,
              index: i,
              text: chunkText,
              format: 'mp3',
            });

            // 2. Generate and send binary audio data via dispatcher
            const audioPromise = generateNarrationAudio({
              text: chunkText,
              outputMode: currentOutputMode
            });
            const audioBuffer = await audioPromise;

            if (signal && signal.aborted) return;

            if (ws.readyState === WebSocket.OPEN) {
              // Send raw binary frame
              ws.send(audioBuffer, { binary: true });
              logDebug(`[tts] Sent audio chunk ${i} for scene ${scene.scene_id}`);
            }
          }

          sendMessage('audio_end', { sceneId: scene.scene_id });
        } catch (err) {
          logError(`[tts] Narration failed for scene ${scene.scene_id}:`, err?.message || err);
        }
      }
    })();
  };

  const handleStartStory = async (payload) => {
    try {
      currentSceneVersion += 1;
      abortController.abort();
      abortController = new AbortController();
      currentOutputMode = normalizeOutputMode(payload.output_mode || currentOutputMode);
      const uiStrings = buildUiStrings(currentOutputMode);
      let emotion = validateEmotion(payload.emotion || 'hope');

      if (payload.image) {
        if (!validateBase64(payload.image)) {
          logError('Invalid base64 image data received');
          throw new Error('Invalid image data');
        }
        log('Analyzing uploaded space image...');
        sendMessage('status', { text: uiStrings.readingSpace });

        try {
          const spacePrompt = buildSpaceAnalysisPrompt(currentOutputMode);
          const analysis = await analyzeSpace(spacePrompt, payload.image, payload.mimeType);
          emotion = analysis.detected_emotion || 'hope';

          sendMessage('space_reading', {
            emotion,
            reading: analysis.space_reading || '',
          });
          log(`Space analysis: detected emotion = ${emotion}`);
        } catch (err) {
          logError('Space analysis failed, using default emotion:', err.message);
          emotion = 'hope';
        }
      }

      currentEmotion = emotion;
      sceneCount = 0;
      conversationHistory = [
        {
          role: 'user',
          parts: [{ text: `Emotion: ${emotion}. Output mode: ${currentOutputMode}. Start the story.` }],
        },
      ];

      log(`Starting story with emotion=${emotion}, mode=${currentOutputMode}`);
      sendMessage('status', { text: uiStrings.shapingStory });

      const systemPrompt = buildStorytellerPrompt(emotion, false, currentOutputMode);
      const scenes = await generateScenes(systemPrompt, conversationHistory, currentOutputMode);

      if (!scenes || scenes.length === 0) {
        throw new Error('No scenes generated');
      }

      conversationHistory.push({
        role: 'model',
        parts: [{ text: JSON.stringify({ scenes }) }],
      });

      sceneCount = scenes.length;
      log(`Generated ${scenes.length} initial scenes`);
      streamScenes(scenes, 0, uiStrings, currentOutputMode);
    } catch (error) {
      const uiStrings = buildUiStrings(currentOutputMode);
      logError('Error starting story:', error.message);
      logDebug('Full error:', error);
      sendMessage('error', { message: `${uiStrings.startErrorPrefix} ${error.message}` });
    }
  };

  const handleChoice = async (payload) => {
    try {
      currentSceneVersion += 1;
      abortController.abort();
      abortController = new AbortController();
      if (sceneCount >= MAX_SCENES) {
        const uiStrings = buildUiStrings(currentOutputMode);
        sendMessage('story_complete', { message: uiStrings.storyComplete });
        return;
      }

      currentOutputMode = normalizeOutputMode(payload.output_mode || currentOutputMode);
      const uiStrings = buildUiStrings(currentOutputMode);

      let choiceText = validateChoiceText(payload.choice_text || '');
      if (currentOutputMode.startsWith('ar')) {
        const { normalizeArabicText } = await import('./services/utils.js');
        choiceText = normalizeArabicText(choiceText);
      }
      const emotionShift = validateEmotion(payload.emotion_shift || currentEmotion);

      if (emotionShift && emotionShift !== currentEmotion) {
        currentEmotion = emotionShift;
      }

      conversationHistory.push({
        role: 'user',
        parts: [{ text: `User chose: "${choiceText}". Emotion shift: ${emotionShift}. Continue the story.` }],
      });

      log(`User choice received: "${choiceText}" | mode=${currentOutputMode}`);
      sendMessage('status', { text: uiStrings.nextScene });

      const isNearEnd = sceneCount >= MAX_SCENES - 1;
      const systemPrompt = buildStorytellerPrompt(
        currentEmotion,
        true,
        currentOutputMode,
        isNearEnd,
      );

      const scenes = await generateScenes(systemPrompt, conversationHistory, currentOutputMode);
      if (!scenes || scenes.length === 0) {
        throw new Error('No scenes generated');
      }

      conversationHistory.push({
        role: 'model',
        parts: [{ text: JSON.stringify({ scenes }) }],
      });

      const baseSceneCount = sceneCount;
      sceneCount += scenes.length;
      log(`Generated ${scenes.length} follow-up scenes (total: ${sceneCount})`);
      streamScenes(scenes, baseSceneCount, uiStrings, currentOutputMode);
    } catch (error) {
      const uiStrings = buildUiStrings(currentOutputMode);
      logError('Error handling choice:', error.message || error);
      sendMessage('error', { message: uiStrings.nextError });
    }
  };

  const handleRedirect = async (payload) => {
    try {
      const { sceneId, atIndex, command, intensity } = payload;

      currentSceneVersion += 1;
      // 1. Abort current background generation (images + TTS)
      abortController.abort();
      abortController = new AbortController();
      const signal = abortController.signal;

      const uiStrings = buildUiStrings(currentOutputMode);

      // 2. Acknowledge and command client to clear queues & reset timeline
      sendMessage('redirect_ack', { sceneId, fromIndex: atIndex });
      sendMessage('audio_cancel', { sceneId, fromIndex: atIndex });
      sendMessage('timeline_reset', { sceneId, fromIndex: atIndex });

      log(`Redirect received for scene ${sceneId} at index ${atIndex}: ${command} (Intensity: ${intensity})`);

      const redirectCommand = { command, intensity };

      // Update System prompt to force hard pivot
      const redirectPrompt = buildStorytellerPrompt(
        currentEmotion,
        true,
        currentOutputMode,
        false,
        redirectCommand
      );

      // We explicitly log this as a surgical memory command in context
      conversationHistory.push({
        role: 'user',
        parts: [{ text: `[LIVE REDIRECTION] Cancel the previous trajectory. Hard pivot tone/pacing to "${command}" with intensity ${intensity}. Regenerate seamlessly from scene ${sceneId}, index ${atIndex}. Output exactly 1 scene.` }]
      });

      const scenes = await generateScenes(redirectPrompt, conversationHistory, currentOutputMode);
      if (!scenes || scenes.length === 0) {
        throw new Error('No redirect scenes generated');
      }

      conversationHistory.push({
        role: 'model',
        parts: [{ text: JSON.stringify({ scenes }) }],
      });

      const baseSceneCount = sceneCount;
      sceneCount += scenes.length;
      log(`Generated ${scenes.length} redirect scenes`);

      // 3. Stream new segments normally
      streamScenes(scenes, baseSceneCount, uiStrings, currentOutputMode, signal);

    } catch (error) {
      logError('Redirect failed:', error.message);
      sendMessage('error', { message: 'Failed to redirect timeline.' });
    }
  };

  ws.on('message', (data, isBinary) => {
    if (isBinary) return;

    try {
      const message = JSON.parse(data.toString());
      logDebug('Received:', message.type);

      switch (message.type) {
        case 'start_story':
          handleStartStory(message);
          break;
        case 'choose':
          handleChoice(message);
          break;
        case 'redirect':
          handleRedirect(message);
          break;
        default:
          logDebug('Unknown message type:', message.type);
      }
    } catch (error) {
      logError('Failed to parse client message:', error.message);
    }
  });

  ws.on('close', () => {
    log('Client disconnected');
    conversationHistory = [];
  });
});

const clientDistCandidates = [
  path.join(__dirname, 'client/dist'),
  path.join(__dirname, '../client/dist'),
];
const clientDistPath = clientDistCandidates.find((candidate) => existsSync(candidate));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
}

app.get('/{*any}', (req, res) => {
  if (clientDistPath) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  return res.status(503).send('Frontend build is missing. Backend is running.');
});

const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 8080 : 3002);
server.listen(PORT, () => {
  log(`Server listening on port ${PORT}`);
  log(`Log level: ${LOG_LEVEL}`);
});
