import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';

import { DuoRoomStore } from './duoRoomStore.js';

test('DuoRoomStore persists and retrieves room snapshots in file mode', async () => {
  const store = new DuoRoomStore({
    filePath: path.join(os.tmpdir(), `maraya-duo-room-${Date.now()}.json`),
  });

  await store.saveRoom({
    id: 'ROOM42',
    hostSessionId: 'host-session',
    storyStarted: false,
    members: [
      {
        sessionId: 'host-session',
        userId: 'host-user',
        name: 'Host',
        connected: true,
        lastSeenAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: null,
  });

  const room = await store.getRoom('ROOM42');
  assert.equal(room.id, 'ROOM42');
  assert.equal(room.members.length, 1);

  const bySession = await store.findRoomBySession('host-session');
  assert.equal(bySession?.id, 'ROOM42');
});

test('DuoRoomStore cleans up expired rooms', async () => {
  const store = new DuoRoomStore({
    filePath: path.join(os.tmpdir(), `maraya-duo-room-expired-${Date.now()}.json`),
  });

  await store.saveRoom({
    id: 'OLD123',
    hostSessionId: 'host-session',
    storyStarted: false,
    members: [
      {
        sessionId: 'host-session',
        userId: 'host-user',
        name: 'Host',
        connected: false,
        lastSeenAt: new Date(Date.now() - 10_000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 10_000).toISOString(),
    updatedAt: new Date(Date.now() - 10_000).toISOString(),
    expiresAt: new Date(Date.now() - 1_000).toISOString(),
  });

  await store.cleanupExpired(Date.now());
  const room = await store.getRoom('OLD123');
  assert.equal(room, null);
});

