import { promises as fs } from 'node:fs';
import path from 'node:path';

import { createOptionalFirestore, isCredentialError } from './persistenceSupport.js';
import { logError } from '../logger.js';

const DEFAULT_FILE_PATH = path.join(process.cwd(), 'server', '.data', 'mirror-memory.json');
const DEFAULT_COLLECTION = 'mirror_memory_profiles';

function emptyStore() {
  return { profiles: {} };
}

function ensureProfile(store, userId) {
  if (!store.profiles[userId]) {
    store.profiles[userId] = {
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      journeys: [],
    };
  }
  return store.profiles[userId];
}

function buildSignature(journeys) {
  const totals = new Map();

  for (const journey of journeys) {
    for (const emotion of journey.emotionHistory || []) {
      totals.set(emotion, (totals.get(emotion) || 0) + 1);
    }
    if (journey.seedEmotion) {
      totals.set(journey.seedEmotion, (totals.get(journey.seedEmotion) || 0) + 1);
    }
  }

  const entries = Array.from(totals.entries()).sort((left, right) => right[1] - left[1]);
  return {
    dominantEmotion: entries[0]?.[0] || 'hope',
    counts: Object.fromEntries(entries),
  };
}

export class MirrorMemoryService {
  constructor({ filePath = DEFAULT_FILE_PATH, collectionName = DEFAULT_COLLECTION } = {}) {
    this.filePath = filePath;
    this.collectionName = collectionName;
    this.db = createOptionalFirestore('Mirror Memory');
    this.store = null;
    this.writeQueue = Promise.resolve();
  }

  usingFirestore() {
    return Boolean(this.db);
  }

  disableFirestore(error) {
    logError('[mirror-memory] Firestore unavailable; falling back to file.', error);
    this.db = null;
  }

  async loadStore() {
    if (this.store) return this.store;

    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      this.store = JSON.parse(raw);
    } catch (error) {
      this.store = emptyStore();
    }

    return this.store;
  }

  async getProfile(userId) {
    if (this.usingFirestore()) {
      try {
        const snapshot = await this.db.collection(this.collectionName).doc(userId).get();
        if (snapshot.exists) {
          return ensureProfile({ profiles: { [userId]: snapshot.data() } }, userId);
        }
      } catch (error) {
        if (isCredentialError(error)) {
          this.disableFirestore(error);
          return this.getProfile(userId);
        }
        throw error;
      }
    }

    const store = await this.loadStore();
    return ensureProfile(store, userId);
  }

  async saveProfile(profile) {
    if (!profile?.userId) return;

    if (this.usingFirestore()) {
      try {
        await this.db.collection(this.collectionName).doc(profile.userId).set(profile);
        return;
      } catch (error) {
        if (isCredentialError(error)) {
          this.disableFirestore(error);
          return this.saveProfile(profile);
        }
        throw error;
      }
    }

    const store = await this.loadStore();
    store.profiles[profile.userId] = profile;
    await this.persistStore();
  }

  async persistStore() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const payload = JSON.stringify(this.store, null, 2);
    this.writeQueue = this.writeQueue.then(() => fs.writeFile(this.filePath, payload, 'utf8'));
    await this.writeQueue;
  }

  async rememberJourney({
    userId,
    outputMode,
    seedEmotion,
    emotionHistory,
    whisperText,
    spaceReading,
    endingMessage,
    secretEndingKey,
    scenes,
  }) {
    const profile = await this.getProfile(userId);
    const sceneCount = Array.isArray(scenes) ? scenes.length : 0;
    const finalEmotion = Array.isArray(emotionHistory) && emotionHistory.length > 0
      ? emotionHistory[emotionHistory.length - 1]
      : seedEmotion;

    profile.journeys.push({
      id: `journey_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      outputMode,
      seedEmotion,
      finalEmotion,
      emotionHistory: Array.isArray(emotionHistory) ? emotionHistory.slice(-12) : [],
      whisperText: whisperText || '',
      spaceReading: spaceReading || '',
      summary: Array.isArray(scenes) && scenes.length > 0
        ? scenes.map((scene) => scene.narration_ar).join(' ').slice(0, 420)
        : '',
      endingMessage: endingMessage || '',
      secretEndingKey: secretEndingKey || null,
      sceneCount,
      endedAt: new Date().toISOString(),
    });

    profile.journeys = profile.journeys.slice(-16);
    profile.updatedAt = new Date().toISOString();
    await this.saveProfile(profile);
    return this.getSnapshot(userId);
  }

  async getSnapshot(userId) {
    const profile = await this.getProfile(userId);
    const recentJourneys = [...profile.journeys].reverse().slice(0, 4);
    return {
      userId,
      rememberedCount: profile.journeys.length,
      recentJourneys,
      signature: buildSignature(profile.journeys),
    };
  }

  buildPromptMemory(snapshot) {
    if (!snapshot || snapshot.rememberedCount < 1) return '';

    const lines = (snapshot.recentJourneys || []).slice(0, 3).map((journey, index) => (
      `- Memory ${index + 1}: began in ${journey.seedEmotion}, ended in ${journey.finalEmotion}. `
      + `Ending note: "${journey.endingMessage || journey.summary}".`
    ));

    return [
      'Mirror Memory Context:',
      `- Remembered journeys: ${snapshot.rememberedCount}`,
      `- Dominant emotional signature: ${snapshot.signature?.dominantEmotion || 'hope'}`,
      ...lines,
    ].join('\n');
  }
}

const mirrorMemoryService = new MirrorMemoryService();
export default mirrorMemoryService;
