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
  detectSecretEnding,
  getStorySceneLimit,
} from './prompts/storyteller.js';
import { validateEmotion, validateChoiceText, validateBase64 } from './validators.js';
import { log, logDebug, logError } from './logger.js';

// TTS & Narration
import { generateNarrationAudio } from './services/tts/index.js';
import paefService from './services/paef.js';
import mirrorMemoryService from './services/mirrorMemory.js';
import duoRoomStore from './services/duoRoomStore.js';
import { buildFallbackScenes } from './services/storyFallback.js';
import { inferEmotionFromWhisper } from './services/whisperEmotion.js';

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
const DUO_RECONNECT_GRACE_MS = Number(process.env.DUO_RECONNECT_GRACE_MS || 60000);

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
  path: '/ws',
  maxPayload: 5 * 1024 * 1024,
});


app.use(express.json());
app.post('/telemetry/client', express.text({ type: ['text/plain', 'application/json'], limit: '64kb' }), (req, res) => {
  let payload = {};
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      payload = JSON.parse(req.body);
    } catch {
      payload = { raw: req.body };
    }
  }
  log('[telemetry:client]', {
    ...payload,
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
  });
  res.status(202).json({ ok: true });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gemini: {
      configured: Boolean(API_KEY),
      model: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
      timeoutMs: Number(process.env.GEMINI_REQUEST_TIMEOUT_MS || 15000),
      retries: Number(process.env.GEMINI_MAX_RETRIES || 2),
    },
    persistence: {
      mirrorMemory: mirrorMemoryService.usingFirestore?.() ? 'firestore' : 'file',
      duoRooms: duoRoomStore.usingFirestore?.() ? 'firestore' : 'file',
    },
    duo: {
      activeRooms: duoRooms.size,
      reconnectGraceMs: DUO_RECONNECT_GRACE_MS,
    },
  });
});

function buildUiStrings(outputMode) {
  if (outputMode === 'judge_en') {
    return {
      readingSpace: 'Maraya is reading your space...',
      shapingStory: 'Maraya is taking shape...',
      nextScene: 'The next scene is taking shape...',
      storyComplete: 'You have reached the end of this journey. But mirrors never truly end...',
      startErrorPrefix: 'Failed to start story:',
      nextError: 'Failed to generate the next scene.',
      recoveryNotice: 'Maraya stabilized the scene locally so the journey can continue.',
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
      recoveryNotice: 'Ù…Ø±Ø§ÙŠØ§ Ø«Ø¨ØªØª Ø§Ù„Ù…Ø´Ù‡Ø¯ Ù…Ø¤Ù‚ØªÙ‹Ø§ Ø¹Ø´Ø§Ù† Ø§Ù„Ø±Ø­Ù„Ø© ØªÙƒÙ…Ù„.',
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
      recoveryNotice: 'Ø§Ø³ØªØ¹Ø§Ø¯Øª Ø§Ù„Ù…Ø±Ø§ÙŠØ§ Ø§Ù„Ù…Ø´Ù‡Ø¯ Ù…Ø¤Ù‚ØªÙ‹Ø§ Ù„ØªÙƒÙ…Ù„ Ø§Ù„Ø±Ø­Ù„Ø©.',
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

const ROOM_MEMBER_LIMIT = 2;
const ROOM_BROADCAST_TYPES = new Set([
  'status',
  'space_reading',
  'scene',
  'scene_image',
  'story_complete',
  'error',
  'audio_start',
  'audio_meta',
  'audio_end',
  'redirect_ack',
  'audio_cancel',
  'timeline_reset',
  'intervention_plan',
  'secret_ending_unlocked',
  'whisper_interpreted',
  'notice',
]);
const duoRooms = new Map();
const duoRoomExpiryTimers = new Map();
const expiredRoomCleanupTimer = setInterval(() => {
  duoRoomStore.cleanupExpired().catch((error) => {
    logDebug('[duo] Failed to clean expired persisted rooms:', error?.message || error);
  });
}, 5 * 60 * 1000);

if (typeof expiredRoomCleanupTimer.unref === 'function') {
  expiredRoomCleanupTimer.unref();
}

function normalizeRoomId(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
}

function createRoomId() {
  let roomId = '';
  do {
    roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (duoRooms.has(roomId));
  return roomId;
}

function sendSocketJson(socket, type, v, data = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type, v, ...data }));
}

function broadcastRoomBinary(room, buffer) {
  room.members.forEach((member) => {
    if (member.ws?.readyState === WebSocket.OPEN) {
      member.ws.send(buffer, { binary: true });
    }
  });
}

function buildPersistedPendingVote(pendingVote) {
  if (!pendingVote) return null;
  return {
    sceneId: pendingVote.sceneId,
    choices: pendingVote.choices,
    votes: Array.from(pendingVote.votes.values()),
    requiredVotes: pendingVote.requiredVotes,
    mismatch: pendingVote.mismatch,
    recoveryNotice: 'Ø§Ø³ØªØ¹Ø§Ø¯Øª Ø§Ù„Ù…Ø±Ø§ÙŠØ§ Ø§Ù„Ù…Ø´Ù‡Ø¯ Ù…Ø¤Ù‚ØªÙ‹Ø§ Ù„ÙƒÙŠ ØªÙˆØ§ØµÙ„ Ø§Ù„Ø±Ø­Ù„Ø©.',
  };
}

function hydratePendingVote(snapshot) {
  if (!snapshot) return null;
  return {
    sceneId: snapshot.sceneId || '',
    choices: Array.isArray(snapshot.choices) ? snapshot.choices : [],
    votes: new Map(
      Array.isArray(snapshot.votes)
        ? snapshot.votes.map((vote) => [vote.sessionId, vote])
        : [],
    ),
    requiredVotes: Number.isFinite(snapshot.requiredVotes) ? snapshot.requiredVotes : ROOM_MEMBER_LIMIT,
    mismatch: Boolean(snapshot.mismatch),
  };
}

function ensureRoomTimestamps(room) {
  const nowIso = new Date().toISOString();
  room.createdAt = room.createdAt || nowIso;
  room.updatedAt = nowIso;
}

function getRoomSnapshot(room) {
  ensureRoomTimestamps(room);
  return {
    id: room.id,
    hostSessionId: room.hostSessionId,
    storyStarted: Boolean(room.storyStarted),
    pendingVote: buildPersistedPendingVote(room.pendingVote),
    members: Array.from(room.members.values()).map((member) => ({
      sessionId: member.sessionId,
      userId: member.userId,
      name: member.name,
      connected: Boolean(member.connected),
      lastSeenAt: member.lastSeenAt || room.updatedAt,
    })),
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    expiresAt: room.expiresAt || null,
  };
}

async function persistRoom(room) {
  ensureRoomTimestamps(room);
  await duoRoomStore.saveRoom(getRoomSnapshot(room));
}

async function deletePersistedRoom(roomId) {
  duoRooms.delete(roomId);
  const timer = duoRoomExpiryTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    duoRoomExpiryTimers.delete(roomId);
  }
  await duoRoomStore.deleteRoom(roomId);
}

function scheduleRoomExpiry(room, reason = 'disconnect') {
  room.expiresAt = new Date(Date.now() + DUO_RECONNECT_GRACE_MS).toISOString();
  const existingTimer = duoRoomExpiryTimers.get(room.id);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    deletePersistedRoom(room.id).catch((error) => {
      logDebug(`[duo] Failed to expire room ${room.id} after ${reason}:`, error?.message || error);
    });
  }, DUO_RECONNECT_GRACE_MS + 100);

  duoRoomExpiryTimers.set(room.id, timer);
}

function clearRoomExpiry(room) {
  room.expiresAt = null;
  const timer = duoRoomExpiryTimers.get(room.id);
  if (timer) {
    clearTimeout(timer);
    duoRoomExpiryTimers.delete(room.id);
  }
}

function restoreRoomFromSnapshot(snapshot) {
  if (!snapshot?.id) return null;

  return {
    id: snapshot.id,
    hostSessionId: snapshot.hostSessionId,
    members: new Map(
      (snapshot.members || []).map((member) => [member.sessionId, {
        sessionId: member.sessionId,
        userId: member.userId,
        name: member.name,
        connected: Boolean(member.connected),
        ws: null,
        lastSeenAt: member.lastSeenAt,
      }]),
    ),
    storyStarted: Boolean(snapshot.storyStarted),
    pendingVote: hydratePendingVote(snapshot.pendingVote),
    controller: null,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
    expiresAt: snapshot.expiresAt || null,
  };
}

function serializeRoomForMember(room, sessionId) {
  const members = Array.from(room.members.values()).map((member) => ({
    sessionId: member.sessionId,
    name: member.name,
    isHost: member.sessionId === room.hostSessionId,
    connected: Boolean(member.connected),
  }));
  const connectedCount = members.filter((member) => member.connected).length;
  const disconnectedPartner = members.find((member) => member.sessionId !== sessionId && !member.connected);
  const selfVoteIndex = room.pendingVote?.votes.get(sessionId)?.choiceIndex ?? null;
  const votes = room.pendingVote
    ? Array.from(room.pendingVote.votes.values()).map((vote) => ({
      sessionId: vote.sessionId,
      name: vote.name,
      choiceIndex: vote.choiceIndex,
    }))
    : [];

  return {
    roomId: room.id,
    role: room.hostSessionId === sessionId ? 'host' : 'guest',
    status: room.storyStarted
      ? (disconnectedPartner ? 'reconnecting' : 'active')
      : (connectedCount < ROOM_MEMBER_LIMIT
        ? (room.members.size >= ROOM_MEMBER_LIMIT ? 'reconnecting' : 'waiting')
        : 'ready'),
    partnerName: members.find((member) => member.sessionId !== sessionId)?.name || '',
    members,
    canStart: room.hostSessionId === sessionId && connectedCount >= ROOM_MEMBER_LIMIT,
    storyStarted: Boolean(room.storyStarted),
    votes,
    mismatch: Boolean(room.pendingVote?.mismatch),
    readyCount: room.pendingVote?.votes.size || 0,
    requiredVotes: room.pendingVote?.requiredVotes || ROOM_MEMBER_LIMIT,
    selectedChoiceIndex: selfVoteIndex,
    notice: disconnectedPartner
      ? `Waiting for ${disconnectedPartner.name || 'your partner'} to reconnect.`
      : '',
  };
}

function emitRoomState(room, v = 0, extra = {}) {
  room.members.forEach((member) => {
    sendSocketJson(member.ws, 'duo_state', v, {
      room: {
        ...serializeRoomForMember(room, member.sessionId),
        ...extra,
      },
    });
  });
}

wss.on('connection', (ws, req) => {
  log('Client connected');

  // Basic extraction of sessionId/userId from query params if passed, else fallback
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('sessionId') || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const userId = url.searchParams.get('userId') || 'anonymous';

  // Initialize PAEF Session in Firestore
  paefService.ensureSessionDoc({ userId, sessionId }).catch(err => {
    logError('[paef] Failed to ensure session doc on connection', err);
  });

  let conversationHistory = [];
  let currentEmotion = 'hope';
  let currentTimeOfDay = null;
  let emotionHistory = [];
  let currentJourneyScenes = [];
  let currentWhisperText = '';
  let currentSpaceReading = '';
  let currentMythicReading = '';
  let currentSecretEndingKey = null;
  let activeDuoRoomId = null;
  let duoRole = 'solo';
  let duoDisplayName = `Mirror-${sessionId.slice(-4)}`;

  let currentOutputMode = 'judge_en';
  let sceneCount = 0;
  let currentSceneVersion = 0;
  let abortController = new AbortController();

  const getActiveRoom = () => (activeDuoRoomId ? duoRooms.get(activeDuoRoomId) || null : null);
  const isRoomController = () => {
    const room = getActiveRoom();
    return Boolean(room && room.hostSessionId === sessionId);
  };

  const sendPrivateMessage = (type, data = {}) => {
    sendSocketJson(ws, type, currentSceneVersion, data);
  };

  const sendBinary = (buffer) => {
    const room = getActiveRoom();
    if (room && isRoomController()) {
      broadcastRoomBinary(room, buffer);
      return;
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(buffer, { binary: true });
    }
  };

  const sendMessage = (type, data = {}) => {
    const room = getActiveRoom();
    if (room && isRoomController() && ROOM_BROADCAST_TYPES.has(type)) {
      room.members.forEach((member) => {
        sendSocketJson(member.ws, type, currentSceneVersion, data);
      });
      return;
    }
    sendPrivateMessage(type, data);
  };

  const emitVoteUpdate = () => {
    const room = getActiveRoom();
    if (!room) return;

    const votes = room.pendingVote
      ? Array.from(room.pendingVote.votes.values()).map((vote) => ({
        sessionId: vote.sessionId,
        name: vote.name,
        choiceIndex: vote.choiceIndex,
      }))
      : [];

    room.members.forEach((member) => {
      sendSocketJson(member.ws, 'duo_vote_update', currentSceneVersion, {
        votes,
        mismatch: Boolean(room.pendingVote?.mismatch),
        readyCount: room.pendingVote?.votes.size || 0,
        requiredVotes: room.pendingVote?.requiredVotes || ROOM_MEMBER_LIMIT,
        selfVoteIndex: room.pendingVote?.votes.get(member.sessionId)?.choiceIndex ?? null,
      });
    });
  };

  const refreshMemorySnapshot = async (targetUserId = userId, targetWs = ws) => {
    const snapshot = await mirrorMemoryService.getSnapshot(targetUserId);
    sendSocketJson(targetWs, 'memory_snapshot', currentSceneVersion, { snapshot });
    return snapshot;
  };

  const persistActiveRoom = async () => {
    const room = getActiveRoom();
    if (!room) return;
    await persistRoom(room);
  };

  const sendNotice = (message, level = 'warning') => {
    if (!message) return;
    sendMessage('notice', { level, message });
  };

  const getLatestJourneySymbolicState = () => {
    const latestScene = currentJourneyScenes[currentJourneyScenes.length - 1] || null;
    if (!latestScene) return null;

    return {
      carriedArtifact: String(latestScene.carried_artifact || '').trim(),
      symbolicAnchor: String(latestScene.symbolic_anchor || '').trim(),
      ritualPhase: String(latestScene.ritual_phase || '').trim(),
      mythicEcho: String(latestScene.mythic_echo || '').trim(),
    };
  };

  const buildSymbolicContinuityParts = () => {
    const parts = [];
    const latestSymbolicState = getLatestJourneySymbolicState();

    if (currentMythicReading) {
      parts.push({ text: `Mythic reading from the user's real space: ${currentMythicReading}` });
    }

    if (latestSymbolicState) {
      const fragments = [];
      if (latestSymbolicState.carriedArtifact) {
        fragments.push(`carried artifact "${latestSymbolicState.carriedArtifact}"`);
      }
      if (latestSymbolicState.symbolicAnchor) {
        fragments.push(`symbolic anchor "${latestSymbolicState.symbolicAnchor}"`);
      }
      if (latestSymbolicState.ritualPhase) {
        fragments.push(`ritual phase "${latestSymbolicState.ritualPhase}"`);
      }
      if (latestSymbolicState.mythicEcho) {
        fragments.push(`mythic echo "${latestSymbolicState.mythicEcho}"`);
      }

      if (fragments.length > 0) {
        parts.push({
          text: `Maintain symbolic continuity from the previous scene through ${fragments.join(', ')}.`,
        });
      }
    }

    return parts;
  };

  const resetStoryState = () => {
    abortController.abort();
    abortController = new AbortController();
    conversationHistory = [];
    emotionHistory = [];
    sceneCount = 0;
    currentJourneyScenes = [];
    currentWhisperText = '';
    currentSpaceReading = '';
    currentMythicReading = '';
    currentSecretEndingKey = null;
    const room = getActiveRoom();
    if (room) {
      room.storyStarted = false;
      room.pendingVote = null;
      room.updatedAt = new Date().toISOString();
    }
  };

  const persistMirrorMemory = async (endingMessage) => {
    const room = getActiveRoom();
    const members = room && isRoomController()
      ? Array.from(room.members.values())
      : [{ userId, ws }];

    for (const member of members) {
      const snapshot = await mirrorMemoryService.rememberJourney({
        userId: member.userId,
        outputMode: currentOutputMode,
        seedEmotion: emotionHistory[0] || currentEmotion,
        emotionHistory,
        whisperText: currentWhisperText,
        spaceReading: currentSpaceReading,
        mythicReading: currentMythicReading || currentSpaceReading,
        endingMessage,
        secretEndingKey: currentSecretEndingKey,
        scenes: currentJourneyScenes,
      });
      sendSocketJson(member.ws, 'memory_snapshot', currentSceneVersion, { snapshot });
    }
  };

  const generateScenesResilient = async ({
    purpose,
    systemPrompt,
    outputMode,
    uiStrings,
    fallbackOptions,
  }) => {
    try {
      const scenes = await generateScenes(systemPrompt, conversationHistory, outputMode);
      if (!scenes || scenes.length === 0) {
        throw new Error('No scenes generated');
      }
      return scenes;
    } catch (error) {
      logError(`[story] ${purpose} failed; using local fallback scene.`, error);
      sendNotice(uiStrings.recoveryNotice, 'warning');
      return buildFallbackScenes(fallbackOptions);
    }
  };

  const streamScenes = (scenes, baseSceneCount = 0, uiStrings, outputMode = currentOutputMode, signal = abortController.signal) => {
    let isFinal = false;
    const room = getActiveRoom();
    const storySceneLimit = getStorySceneLimit(outputMode);

    // First loop: stream the text for all scenes immediately
    for (let i = 0; i < scenes.length; i += 1) {
      if (signal && signal.aborted) return;
      const scene = scenes[i];
      const storySceneNumber = baseSceneCount + i + 1;
      const reachedStoryLimit = storySceneNumber >= storySceneLimit;
      const hasChoices = Array.isArray(scene.choices) && scene.choices.length > 0;

      const normalizedChoices = reachedStoryLimit
        ? []
        : (hasChoices ? scene.choices.slice(0, 2) : buildFallbackChoices(outputMode));
      const shouldEndScene = reachedStoryLimit || normalizedChoices.length === 0;

      if (!reachedStoryLimit && !hasChoices) {
        logDebug(
          `Scene ${scene.scene_id} returned empty choices before final scene; applied fallback choices`,
        );
      }

      if (shouldEndScene) isFinal = true;

      currentJourneyScenes.push({
        scene_id: scene.scene_id,
        narration_ar: scene.narration_ar,
        audio_mood: scene.audio_mood,
        story_scene_number: storySceneNumber,
        carried_artifact: scene.carried_artifact || '',
        symbolic_anchor: scene.symbolic_anchor || '',
        ritual_phase: scene.ritual_phase || '',
        mythic_echo: scene.mythic_echo || '',
      });

      sendMessage('scene', {
        scene: {
          ...scene,
          choices: normalizedChoices,
          image: null,
          scene_index: i,
          total_scenes: scenes.length,
          story_scene_number: storySceneNumber,
          story_total_scenes: storySceneLimit,
          is_final: shouldEndScene,
        },
      });

      if (room && isRoomController()) {
        room.storyStarted = true;
        if (shouldEndScene) {
          room.pendingVote = null;
        } else {
          room.pendingVote = {
            sceneId: scene.scene_id,
            choices: normalizedChoices,
            votes: new Map(),
            requiredVotes: Math.min(room.members.size, ROOM_MEMBER_LIMIT),
            mismatch: false,
          };
        }
      }
    }

    if (room && isRoomController()) {
      persistRoom(room).catch((error) => {
        logDebug('[duo] Failed to persist room during streaming:', error?.message || error);
      });
      emitRoomState(room, currentSceneVersion);
      emitVoteUpdate();
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
          persistMirrorMemory(uiStrings.storyComplete).catch((error) => {
            logDebug('Failed to persist mirror memory:', error?.message || error);
          });
          if (room && isRoomController()) {
            room.storyStarted = false;
            room.pendingVote = null;
            persistRoom(room).catch((error) => {
              logDebug('[duo] Failed to persist completed room:', error?.message || error);
            });
            emitRoomState(room, currentSceneVersion);
            emitVoteUpdate();
          }
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
              outputMode: currentOutputMode,
              mood: scene.audio_mood || currentEmotion
            });
            const audioBuffer = await audioPromise;

            if (signal && signal.aborted) return;

            sendBinary(audioBuffer);
            logDebug(`[tts] Sent audio chunk ${i} for scene ${scene.scene_id}`);
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
      resetStoryState();
      currentOutputMode = normalizeOutputMode(payload.output_mode || currentOutputMode);
      const uiStrings = buildUiStrings(currentOutputMode);
      let emotion = validateEmotion(payload.emotion || 'hope');
      currentWhisperText = validateChoiceText(payload.whisper_text || '');

      if (currentWhisperText) {
        const whisperResult = inferEmotionFromWhisper(currentWhisperText);
        emotion = whisperResult.emotion;
        sendMessage('whisper_interpreted', {
          transcript: currentWhisperText,
          emotion,
          confidence: whisperResult.confidence,
        });
      }

      currentSpaceReading = '';
      currentMythicReading = '';

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
          currentSpaceReading = analysis.space_reading || '';
          currentMythicReading = analysis.mythic_reading || currentSpaceReading;

          sendMessage('space_reading', {
            emotion,
            reading: currentSpaceReading,
            mythicReading: currentMythicReading,
          });
          log(`Space analysis: detected emotion = ${emotion}`);
        } catch (err) {
          logError('Space analysis failed, using default emotion:', err.message);
          sendNotice(uiStrings.recoveryNotice, 'warning');
          emotion = 'hope';
        }
      }

      currentEmotion = emotion;

      if (typeof payload.localHour === 'number') {
        const h = payload.localHour;
        if (h >= 5 && h < 12) currentTimeOfDay = 'Morning';
        else if (h >= 12 && h < 17) currentTimeOfDay = 'Afternoon';
        else if (h >= 17 && h < 20) currentTimeOfDay = 'Evening';
        else currentTimeOfDay = 'Night';
      } else {
        currentTimeOfDay = null;
      }

      emotionHistory = [emotion];
      sceneCount = 0;
      currentSecretEndingKey = null;
      const memorySnapshot = await mirrorMemoryService.getSnapshot(userId);
      const memoryContext = mirrorMemoryService.buildPromptMemory(memorySnapshot);
      const room = getActiveRoom();
      const duoContext = room && room.members.size >= 2
        ? `Duo story participants: ${Array.from(room.members.values()).map((member) => member.name).join(' and ')}. Keep the shared point of view emotionally meaningful for both.`
        : '';
      const introParts = [
        { text: `Emotion: ${emotion}. Output mode: ${currentOutputMode}. Start the story.` },
      ];
      if (payload.custom_context) {
        introParts.push({ text: `Custom emotional context from user: "${payload.custom_context}".` });
      }
      if (currentWhisperText) {
        introParts.push({ text: `Whispered seed: "${currentWhisperText}".` });
      }
      if (currentSpaceReading) {
        introParts.push({ text: `Space reading: ${currentSpaceReading}` });
      }
      if (currentMythicReading && currentMythicReading !== currentSpaceReading) {
        introParts.push({ text: `Mythic reading: ${currentMythicReading}` });
      }
      if (memoryContext) {
        introParts.push({ text: memoryContext });
      }
      if (duoContext) {
        introParts.push({ text: duoContext });
      }

      conversationHistory = [
        {
          role: 'user',
          parts: introParts,
        },
      ];

      log(`Starting story with emotion=${emotion}, mode=${currentOutputMode}`);
      sendMessage('status', { text: uiStrings.shapingStory });

      const systemPrompt = buildStorytellerPrompt(emotion, false, currentOutputMode, false, null, null, currentTimeOfDay);
      const scenes = await generateScenesResilient({
        purpose: 'start_story',
        systemPrompt,
        outputMode: currentOutputMode,
        uiStrings,
        fallbackOptions: {
          emotion,
          outputMode: currentOutputMode,
          stage: 'opening',
          sceneNumber: 1,
          mythicReading: currentMythicReading || currentSpaceReading,
        },
      });

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
      if (sceneCount >= getStorySceneLimit(currentOutputMode)) {
        const uiStrings = buildUiStrings(currentOutputMode);
        sendMessage('story_complete', { message: uiStrings.storyComplete });
        persistMirrorMemory(uiStrings.storyComplete).catch((error) => {
          logDebug('Failed to persist mirror memory:', error?.message || error);
        });
        return;
      }

      currentOutputMode = normalizeOutputMode(payload.output_mode || currentOutputMode);
      const uiStrings = buildUiStrings(currentOutputMode);
      const room = getActiveRoom();
      if (room && isRoomController()) {
        room.pendingVote = null;
        emitVoteUpdate();
      }

      const duoAlignment = Boolean(payload.duoAlignment);

      let choiceText = validateChoiceText(payload.choice_text || '');
      if (currentOutputMode.startsWith('ar')) {
        const { normalizeArabicText } = await import('./services/utils.js');
        choiceText = normalizeArabicText(choiceText);
      }
      const emotionShift = validateEmotion(payload.emotion_shift || currentEmotion);

      if (emotionShift && emotionShift !== currentEmotion) {
        currentEmotion = emotionShift;
      }
      emotionHistory.push(currentEmotion);

      conversationHistory.push({
        role: 'user',
        parts: [
          { text: `User chose: "${choiceText}". Emotion shift: ${emotionShift}. Continue the story.` },
          ...buildSymbolicContinuityParts(),
        ],
      });

      log(`User choice received: "${choiceText}" | mode=${currentOutputMode}`);
      sendMessage('status', { text: uiStrings.nextScene });

      const storySceneLimit = getStorySceneLimit(currentOutputMode);
      const isNearEnd = sceneCount >= storySceneLimit - 1;

      // Detect secret ending based on emotion pattern
      const secretEnding = isNearEnd ? detectSecretEnding(emotionHistory, currentOutputMode) : null;
      if (secretEnding) {
        currentSecretEndingKey = secretEnding.key;
        log(`Secret ending unlocked: ${secretEnding.key}`);
        sendMessage('secret_ending_unlocked', { key: secretEnding.key });
      }

      const systemPrompt = buildStorytellerPrompt(
        currentEmotion,
        true,
        currentOutputMode,
        isNearEnd,
        null,
        secretEnding,
        currentTimeOfDay,
        duoAlignment,
      );

      const scenes = await generateScenesResilient({
        purpose: 'choice',
        systemPrompt,
        outputMode: currentOutputMode,
        uiStrings,
        fallbackOptions: {
          emotion: currentEmotion,
          outputMode: currentOutputMode,
          stage: 'continue',
          choiceText,
          sceneNumber: sceneCount + 1,
          allowFinalEnding: isNearEnd,
          mythicReading: currentMythicReading || currentSpaceReading,
        },
      });

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

  const executeRedirect = async (payload, isVersionGated = false) => {
    try {
      const { sceneId, atIndex, command, intensity, v } = payload;

      if (isVersionGated && v < currentSceneVersion) {
        log(`[paef] Ignored stale redirect_execute (payload.v: ${v} < current: ${currentSceneVersion})`);
        return;
      }

      currentSceneVersion += 1;
      const symbolicContinuityParts = buildSymbolicContinuityParts();
      // 1. Abort current background generation (images + TTS)
      abortController.abort();
      abortController = new AbortController();
      const signal = abortController.signal;
      currentJourneyScenes = [];
      currentSecretEndingKey = null;

      const uiStrings = buildUiStrings(currentOutputMode);
      const room = getActiveRoom();
      if (room && isRoomController()) {
        room.pendingVote = null;
        emitVoteUpdate();
      }

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
        parts: [
          { text: `[LIVE REDIRECTION] Cancel the previous trajectory. Hard pivot tone/pacing to "${command}" with intensity ${intensity}. Regenerate seamlessly from scene ${sceneId}, index ${atIndex}. Output exactly 1 scene.` },
          ...symbolicContinuityParts,
        ]
      });

      const scenes = await generateScenesResilient({
        purpose: 'redirect',
        systemPrompt: redirectPrompt,
        outputMode: currentOutputMode,
        uiStrings,
        fallbackOptions: {
          emotion: currentEmotion,
          outputMode: currentOutputMode,
          stage: 'redirect',
          redirectCommand: command,
          sceneNumber: sceneCount + 1,
          mythicReading: currentMythicReading || currentSpaceReading,
        },
      });

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

  const buildSoloRoomState = (error = '') => ({
    roomId: '',
    role: 'solo',
    status: 'idle',
    partnerName: '',
    members: [],
    canStart: false,
    storyStarted: false,
    votes: [],
    mismatch: false,
    readyCount: 0,
    requiredVotes: ROOM_MEMBER_LIMIT,
    selectedChoiceIndex: null,
    notice: '',
    ...(error ? { error } : {}),
  });

  const leaveActiveRoom = (hostLeftMessage = 'The host closed the duo room.') => {
    const room = getActiveRoom();
    if (!room) {
      duoRole = 'solo';
      activeDuoRoomId = null;
      return;
    }

    const wasHost = room.hostSessionId === sessionId;
    room.members.delete(sessionId);
    activeDuoRoomId = null;
    duoRole = 'solo';

    if (wasHost) {
      room.members.forEach((member) => {
        sendSocketJson(member.ws, 'duo_closed', currentSceneVersion, { message: hostLeftMessage });
      });
      deletePersistedRoom(room.id).catch((error) => {
        logDebug('[duo] Failed to delete host-closed room:', error?.message || error);
      });
      return;
    }

    if (room.members.size === 0) {
      deletePersistedRoom(room.id).catch((error) => {
        logDebug('[duo] Failed to delete empty room:', error?.message || error);
      });
      return;
    }

    clearRoomExpiry(room);
    room.pendingVote = null;
    room.storyStarted = false;
    room.updatedAt = new Date().toISOString();
    persistRoom(room).catch((error) => {
      logDebug('[duo] Failed to persist guest leave:', error?.message || error);
    });
    emitRoomState(room, currentSceneVersion);
  };

  const handleUnexpectedRoomDisconnect = () => {
    const room = getActiveRoom();
    if (!room) return;

    const member = room.members.get(sessionId);
    if (!member) return;

    member.connected = false;
    member.ws = null;
    member.lastSeenAt = new Date().toISOString();
    room.pendingVote = room.pendingVote
      ? {
        ...room.pendingVote,
        votes: new Map(
          Array.from(room.pendingVote.votes.entries()).filter(([voteSessionId]) => {
            const voteMember = room.members.get(voteSessionId);
            return voteMember?.connected !== false;
          }),
        ),
      }
      : null;

    scheduleRoomExpiry(room, 'socket-close');
    persistRoom(room).catch((error) => {
      logDebug('[duo] Failed to persist disconnected room:', error?.message || error);
    });
    emitRoomState(room, currentSceneVersion);
    emitVoteUpdate();
  };

  const hostDuoRoom = (name) => {
    if (activeDuoRoomId) {
      leaveActiveRoom();
    }

    duoDisplayName = String(name || duoDisplayName).trim().slice(0, 32) || duoDisplayName;
    const roomId = createRoomId();
    const room = {
      id: roomId,
      hostSessionId: sessionId,
      members: new Map([
        [sessionId, {
          sessionId,
          userId,
          name: duoDisplayName,
          ws,
          connected: true,
          lastSeenAt: new Date().toISOString(),
        }],
      ]),
      storyStarted: false,
      pendingVote: null,
      controller: {
        handleStartStory,
        handleChoice,
        executeRedirect,
      },
    };

    duoRooms.set(roomId, room);
    activeDuoRoomId = roomId;
    duoRole = 'host';
    clearRoomExpiry(room);
    persistRoom(room).catch((error) => {
      logDebug('[duo] Failed to persist hosted room:', error?.message || error);
    });
    emitRoomState(room, currentSceneVersion);
  };

  const joinDuoRoom = (roomId, name) => {
    const normalized = normalizeRoomId(roomId);
    const room = duoRooms.get(normalized);

    if (!room) {
      sendPrivateMessage('duo_state', { room: buildSoloRoomState('Room not found.') });
      return;
    }

    if (room.storyStarted) {
      sendPrivateMessage('duo_state', { room: buildSoloRoomState('This room is already in a live story.') });
      return;
    }

    if (room.members.size >= ROOM_MEMBER_LIMIT) {
      sendPrivateMessage('duo_state', { room: buildSoloRoomState('This duo room is full.') });
      return;
    }

    if (activeDuoRoomId) {
      leaveActiveRoom();
    }

    duoDisplayName = String(name || duoDisplayName).trim().slice(0, 32) || duoDisplayName;
    room.members.set(sessionId, {
      sessionId,
      userId,
      name: duoDisplayName,
      ws,
      connected: true,
      lastSeenAt: new Date().toISOString(),
    });
    activeDuoRoomId = normalized;
    duoRole = 'guest';
    clearRoomExpiry(room);
    persistRoom(room).catch((error) => {
      logDebug('[duo] Failed to persist joined room:', error?.message || error);
    });
    emitRoomState(room, currentSceneVersion);
  };

  const resetDuoRoom = () => {
    const room = getActiveRoom();
    if (!room) return;

    currentSceneVersion += 1;
    resetStoryState();
    room.storyStarted = false;
    room.pendingVote = null;
    room.members.forEach((member) => {
      sendSocketJson(member.ws, 'duo_story_reset', currentSceneVersion, {
        message: 'The duo journey was reset.',
      });
    });
    persistRoom(room).catch((error) => {
      logDebug('[duo] Failed to persist duo reset:', error?.message || error);
    });
    emitRoomState(room, currentSceneVersion);
  };

  const recordDuoVote = (message) => {
    const room = getActiveRoom();
    if (!room || !room.pendingVote) return;

    const choiceIndex = Number(message.choiceIndex);
    const choice = room.pendingVote.choices[choiceIndex];
    const member = room.members.get(sessionId);
    if (!choice || !member) return;

    room.pendingVote.votes.set(sessionId, {
      sessionId,
      name: member.name,
      choiceIndex,
      choiceText: choice.text_ar,
      emotionShift: choice.emotion_shift,
      outputMode: normalizeOutputMode(message.output_mode || currentOutputMode),
    });

    const voteChoices = Array.from(room.pendingVote.votes.values()).map((vote) => vote.choiceIndex);
    room.pendingVote.mismatch = room.pendingVote.votes.size >= room.pendingVote.requiredVotes
      && new Set(voteChoices).size > 1;

    persistRoom(room).catch((error) => {
      logDebug('[duo] Failed to persist duo vote:', error?.message || error);
    });
    emitVoteUpdate();

    if (room.pendingVote.votes.size < room.pendingVote.requiredVotes) {
      return;
    }

    const uniqueChoices = new Set(voteChoices);
    if (uniqueChoices.size !== 1) {
      return;
    }

    const selectedVote = room.pendingVote.votes.values().next().value;
    room.pendingVote = null;
    emitVoteUpdate();

    if (room.controller?.handleChoice) {
      room.controller.handleChoice({
        choice_text: selectedVote.choiceText,
        emotion_shift: selectedVote.emotionShift,
        output_mode: selectedVote.outputMode,
        duoAlignment: true,
      });
    }
  };

  const restorePersistedRoom = async () => {
    const snapshot = await duoRoomStore.findRoomBySession(sessionId);
    if (!snapshot) return;

    if (snapshot.expiresAt && Date.parse(snapshot.expiresAt) <= Date.now()) {
      await duoRoomStore.deleteRoom(snapshot.id);
      return;
    }

    let room = duoRooms.get(snapshot.id);
    if (!room) {
      room = restoreRoomFromSnapshot(snapshot);
      duoRooms.set(snapshot.id, room);
    }

    const member = room.members.get(sessionId);
    if (!member) return;

    clearRoomExpiry(room);
    member.ws = ws;
    member.connected = true;
    member.lastSeenAt = new Date().toISOString();
    activeDuoRoomId = room.id;
    duoRole = room.hostSessionId === sessionId ? 'host' : 'guest';
    duoDisplayName = member.name || duoDisplayName;
    if (duoRole === 'host') {
      room.controller = {
        handleStartStory,
        handleChoice,
        executeRedirect,
      };
    }
    await persistRoom(room);
    emitRoomState(room, currentSceneVersion);
    emitVoteUpdate();
  };

  restorePersistedRoom().catch((error) => {
    logDebug('[duo] Failed to restore persisted room:', error?.message || error);
  });

  refreshMemorySnapshot().catch((error) => {
    logDebug('Failed to load mirror memory snapshot:', error?.message || error);
  });

  ws.on('message', (data, isBinary) => {
    if (isBinary) return;

    try {
      const message = JSON.parse(data.toString());
      logDebug('Received:', message.type);

      switch (message.type) {
        case 'duo_host':
          hostDuoRoom(message.name);
          break;
        case 'duo_join':
          joinDuoRoom(message.roomId, message.name);
          break;
        case 'duo_leave':
          leaveActiveRoom('The host closed the duo room.');
          sendPrivateMessage('duo_state', { room: buildSoloRoomState() });
          break;
        case 'duo_reset':
          resetDuoRoom();
          break;
        case 'duo_vote':
          recordDuoVote(message);
          break;
        case 'start_story':
          if (duoRole === 'guest') {
            sendPrivateMessage('duo_state', {
              room: {
                ...buildSoloRoomState('Only the host can start a duo story.'),
                ...(getActiveRoom() ? serializeRoomForMember(getActiveRoom(), sessionId) : {}),
              },
            });
            break;
          }
          if (getActiveRoom()) {
            const room = getActiveRoom();
            const connectedMembers = Array.from(room.members.values()).filter((member) => member.connected).length;
            if (connectedMembers < ROOM_MEMBER_LIMIT) {
              sendPrivateMessage('duo_state', {
                room: {
                  ...serializeRoomForMember(room, sessionId),
                  error: 'A second player has not joined yet.',
                },
              });
              break;
            }
            room.storyStarted = true;
            room.pendingVote = null;
            persistRoom(room).catch((error) => {
              logDebug('[duo] Failed to persist story start:', error?.message || error);
            });
            emitRoomState(room, currentSceneVersion);
          }
          handleStartStory(message);
          break;
        case 'choose':
          if (duoRole === 'guest') break;
          handleChoice(message);
          break;
        case 'redirect':
          // Backward compatibility: execute immediately
          if (duoRole === 'guest') break;
          executeRedirect(message, false);
          break;
        case 'redirect_intent':
          if (duoRole === 'guest') break;
          // 1. Immediately send Ack for Proof and UI responsiveness
          sendMessage('redirect_ack', {
            sceneId: message.sceneId,
            fromIndex: message.atIndex,
            v: currentSceneVersion,
            serverTs: Date.now()
          });

          // 2. Compute intervention plan (with 500ms timeout guard built-in)
          paefService.computeInterventionPlan(
            { userId, sessionId },
            {
              command: message.command,
              context: message.context || {},
              v: currentSceneVersion,
              sceneId: message.sceneId,
              atIndex: message.atIndex
            }
          ).then(plan => {
            sendMessage('intervention_plan', { v: currentSceneVersion, plan });
          }).catch(err => {
            logError('[paef] Intervention computation failed:', err);
            sendMessage('intervention_plan', {
              v: currentSceneVersion,
              plan: { delayMs: 0, style: "none", message: "", bypassWindowMs: 0 }
            });
          });
          break;
        case 'redirect_execute':
          if (duoRole === 'guest') break;
          log(`[paef] Executing redirect (appliedDelayMs: ${message.appliedDelayMs || 0}, bypass: ${message.bypass})`);
          // Version-gated execution
          executeRedirect(message, true);
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
    if (activeDuoRoomId) {
      handleUnexpectedRoomDisconnect();
    }
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
