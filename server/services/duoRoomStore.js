import { promises as fs } from 'node:fs';
import path from 'node:path';

import { createOptionalFirestore, isCredentialError } from './persistenceSupport.js';
import { logDebug, logError } from '../logger.js';

const DEFAULT_FILE_PATH = path.join(process.cwd(), 'server', '.data', 'duo-rooms.json');
const DEFAULT_COLLECTION = 'duo_rooms';

function emptyStore() {
  return { rooms: {} };
}

function normalizeTimestamp(value, fallback = new Date().toISOString()) {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : fallback;
}

function normalizeRoomSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || !snapshot.id) return null;

  const nowIso = new Date().toISOString();
  const members = Array.isArray(snapshot.members)
    ? snapshot.members
      .map((member) => {
        if (!member || typeof member !== 'object' || !member.sessionId) return null;
        return {
          sessionId: String(member.sessionId),
          userId: String(member.userId || 'anonymous'),
          name: String(member.name || `Mirror-${String(member.sessionId).slice(-4)}`),
          connected: Boolean(member.connected),
          lastSeenAt: normalizeTimestamp(member.lastSeenAt, nowIso),
        };
      })
      .filter(Boolean)
    : [];

  return {
    id: String(snapshot.id),
    hostSessionId: String(snapshot.hostSessionId || ''),
    storyStarted: Boolean(snapshot.storyStarted),
    pendingVote: snapshot.pendingVote && typeof snapshot.pendingVote === 'object'
      ? {
        sceneId: String(snapshot.pendingVote.sceneId || ''),
        choices: Array.isArray(snapshot.pendingVote.choices) ? snapshot.pendingVote.choices : [],
        votes: Array.isArray(snapshot.pendingVote.votes) ? snapshot.pendingVote.votes : [],
        requiredVotes: Number.isFinite(snapshot.pendingVote.requiredVotes) ? snapshot.pendingVote.requiredVotes : 2,
        mismatch: Boolean(snapshot.pendingVote.mismatch),
      }
      : null,
    members,
    createdAt: normalizeTimestamp(snapshot.createdAt, nowIso),
    updatedAt: normalizeTimestamp(snapshot.updatedAt, nowIso),
    expiresAt: snapshot.expiresAt ? normalizeTimestamp(snapshot.expiresAt, nowIso) : null,
  };
}

export class DuoRoomStore {
  constructor({
    filePath = DEFAULT_FILE_PATH,
    collectionName = DEFAULT_COLLECTION,
  } = {}) {
    this.filePath = filePath;
    this.collectionName = collectionName;
    this.db = createOptionalFirestore('Duo rooms');
    this.store = null;
    this.writeQueue = Promise.resolve();
  }

  usingFirestore() {
    return Boolean(this.db);
  }

  disableFirestore(error) {
    logError('[duo-room-store] Firestore unavailable; falling back to file.', error);
    this.db = null;
  }

  async loadStore() {
    if (this.store) return this.store;

    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      this.store = JSON.parse(raw);
    } catch {
      this.store = emptyStore();
    }

    return this.store;
  }

  async persistStore() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const payload = JSON.stringify(this.store, null, 2);
    this.writeQueue = this.writeQueue.then(() => fs.writeFile(this.filePath, payload, 'utf8'));
    await this.writeQueue;
  }

  async saveRoom(snapshot) {
    const normalized = normalizeRoomSnapshot(snapshot);
    if (!normalized) return null;

    if (this.usingFirestore()) {
      try {
        await this.db.collection(this.collectionName).doc(normalized.id).set(normalized);
        return normalized;
      } catch (error) {
        if (isCredentialError(error)) {
          this.disableFirestore(error);
          return this.saveRoom(normalized);
        }
        throw error;
      }
    }

    const store = await this.loadStore();
    store.rooms[normalized.id] = normalized;
    await this.persistStore();
    return normalized;
  }

  async getRoom(roomId) {
    const normalizedRoomId = String(roomId || '').trim();
    if (!normalizedRoomId) return null;

    if (this.usingFirestore()) {
      try {
        const snap = await this.db.collection(this.collectionName).doc(normalizedRoomId).get();
        return snap.exists ? normalizeRoomSnapshot(snap.data()) : null;
      } catch (error) {
        if (isCredentialError(error)) {
          this.disableFirestore(error);
          return this.getRoom(normalizedRoomId);
        }
        throw error;
      }
    }

    const store = await this.loadStore();
    return normalizeRoomSnapshot(store.rooms[normalizedRoomId]) || null;
  }

  async findRoomBySession(sessionId) {
    const normalizedSessionId = String(sessionId || '').trim();
    if (!normalizedSessionId) return null;

    if (this.usingFirestore()) {
      try {
        const snapshot = await this.db.collection(this.collectionName).get();
        for (const doc of snapshot.docs) {
          const room = normalizeRoomSnapshot(doc.data());
          if (room?.members.some((member) => member.sessionId === normalizedSessionId)) {
            return room;
          }
        }
        return null;
      } catch (error) {
        if (isCredentialError(error)) {
          this.disableFirestore(error);
          return this.findRoomBySession(normalizedSessionId);
        }
        throw error;
      }
    }

    const store = await this.loadStore();
    return Object.values(store.rooms)
      .map((room) => normalizeRoomSnapshot(room))
      .find((room) => room?.members.some((member) => member.sessionId === normalizedSessionId))
      || null;
  }

  async deleteRoom(roomId) {
    const normalizedRoomId = String(roomId || '').trim();
    if (!normalizedRoomId) return;

    if (this.usingFirestore()) {
      try {
        await this.db.collection(this.collectionName).doc(normalizedRoomId).delete();
        return;
      } catch (error) {
        if (isCredentialError(error)) {
          this.disableFirestore(error);
          return this.deleteRoom(normalizedRoomId);
        }
        throw error;
      }
    }

    const store = await this.loadStore();
    delete store.rooms[normalizedRoomId];
    await this.persistStore();
  }

  async cleanupExpired(now = Date.now()) {
    if (this.usingFirestore()) {
      try {
        const snapshot = await this.db.collection(this.collectionName).get();
        for (const doc of snapshot.docs) {
          const room = normalizeRoomSnapshot(doc.data());
          if (room?.expiresAt && Date.parse(room.expiresAt) <= now) {
            await this.db.collection(this.collectionName).doc(room.id).delete();
          }
        }
        return;
      } catch (error) {
        if (isCredentialError(error)) {
          this.disableFirestore(error);
          return this.cleanupExpired(now);
        }
        throw error;
      }
    }

    const store = await this.loadStore();
    Object.entries(store.rooms).forEach(([roomId, room]) => {
      const expiresAt = Date.parse(room?.expiresAt || '');
      if (Number.isFinite(expiresAt) && expiresAt <= now) {
        delete store.rooms[roomId];
      }
    });
    await this.persistStore();
  }
}

const duoRoomStore = new DuoRoomStore();
export default duoRoomStore;

