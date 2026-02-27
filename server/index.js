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
import { log, logDebug, logError } from './logger.js';

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

  return {
    readingSpace: 'المرايا تقرأ مكانك...',
    shapingStory: 'المرايا تتشكل...',
    nextScene: 'المشهد التالي يتشكل...',
    storyComplete: 'وصلتَ إلى نهاية هذه الرحلة. لكنّ المرايا لا تنتهي...',
    startErrorPrefix: 'فشل في بدء القصة:',
    nextError: 'فشل في إنشاء المشهد التالي.',
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

  const sendMessage = (type, data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, ...data }));
    }
  };

  const streamScenes = (scenes, baseSceneCount = 0, uiStrings, outputMode = currentOutputMode) => {
    for (let i = 0; i < scenes.length; i += 1) {
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

      const isFinal = reachedStoryLimit;

      sendMessage('scene', {
        scene: {
          ...scene,
          choices: normalizedChoices,
          image: null,
          scene_index: i,
          total_scenes: scenes.length,
          story_scene_number: storySceneNumber,
          story_total_scenes: MAX_SCENES,
          is_final: isFinal,
        },
      });

      generateImage(scene.image_prompt)
        .then((image) => {
          if (image) {
            sendMessage('scene_image', {
              scene_id: scene.scene_id,
              image: image.base64,
              mimeType: image.mimeType,
            });
          }
        })
        .catch((err) => {
          logDebug(`Image generation failed for scene ${scene.scene_id}:`, err.message);
        });

      if (isFinal) {
        setTimeout(() => {
          sendMessage('story_complete', { message: uiStrings.storyComplete });
        }, 500);
      }
    }
  };

  const handleStartStory = async (payload) => {
    try {
      currentOutputMode = normalizeOutputMode(payload.output_mode || currentOutputMode);
      const uiStrings = buildUiStrings(currentOutputMode);
      let emotion = payload.emotion || 'hope';

      if (payload.image) {
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
      if (sceneCount >= MAX_SCENES) {
        const uiStrings = buildUiStrings(currentOutputMode);
        sendMessage('story_complete', { message: uiStrings.storyComplete });
        return;
      }

      currentOutputMode = normalizeOutputMode(payload.output_mode || currentOutputMode);
      const uiStrings = buildUiStrings(currentOutputMode);

      const choiceText = payload.choice_text || '';
      const emotionShift = payload.emotion_shift || currentEmotion;

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
