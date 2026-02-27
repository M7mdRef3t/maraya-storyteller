import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioMoodManager } from './AudioMoodManager.js';

// Mock AudioContext globally
class MockAudioContext {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 0;
    this.destination = {};
  }
  resume() {
    return Promise.resolve();
  }
  decodeAudioData() {
    return Promise.resolve({});
  }
  createBufferSource() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null,
      loop: false
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        value: 0,
      },
      connect: vi.fn(),
    };
  }
  close() {
    return Promise.resolve();
  }
}

describe('AudioMoodManager', () => {
  let manager;

  beforeEach(() => {
    // Setup globals
    global.window = {
      AudioContext: MockAudioContext,
      webkitAudioContext: MockAudioContext
    };
    global.fetch = vi.fn();

    manager = new AudioMoodManager();
  });

  it('should initialize correctly', () => {
    expect(manager.context).toBeNull();
    expect(manager.currentMood).toBeNull();
    expect(manager.isUnlocked).toBe(false);
  });

  it('should create audio context on unlock', () => {
    manager.unlock();
    expect(manager.context).toBeInstanceOf(MockAudioContext);
    expect(manager.isUnlocked).toBe(true);
  });

  it('should load mood successfully', async () => {
    manager.unlock();
    const moodId = 'test-mood';
    const url = 'http://example.com/test.mp3';

    global.fetch.mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    });

    await manager.loadMood(moodId, url);

    expect(manager.buffers.has(moodId)).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should set mood and play', async () => {
    manager.unlock();
    const moodId = 'test-mood';

    // Pre-populate buffer to simulate loaded state
    manager.buffers.set(moodId, {});

    await manager.setMood(moodId);

    expect(manager.currentMood).toBe(moodId);
    expect(manager.currentSource).toBeDefined();
    expect(manager.currentGain).toBeDefined();
  });

  it('should stop audio', async () => {
    manager.unlock();

    // Setup state manually to simulate playing
    manager.currentSource = { stop: vi.fn() };
    manager.currentGain = {};
    manager.currentMood = 'playing';

    manager.stop();

    expect(manager.currentSource).toBeNull();
    expect(manager.currentGain).toBeNull();
    expect(manager.currentMood).toBeNull();
  });

  it('should dispose correctly', () => {
    manager.unlock();

    // Spy on close
    const closeSpy = vi.spyOn(manager.context, 'close');

    manager.dispose();

    expect(closeSpy).toHaveBeenCalled();
    expect(manager.context).toBeNull();
    expect(manager.buffers.size).toBe(0);
    expect(manager.moodUrls.size).toBe(0);
    expect(manager.loading.size).toBe(0);
    expect(manager.isUnlocked).toBe(false);
  });
});
