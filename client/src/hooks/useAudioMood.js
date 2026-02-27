import { useRef, useCallback, useEffect } from 'react';

/**
 * Audio mood crossfade system.
 * Manages ambient background audio that changes based on story mood.
 */

const FADE_DURATION = 2; // seconds

/**
 * Queue for limiting concurrent audio decoding.
 * decodeAudioData can be CPU intensive and block the main thread.
 */
class DecodeQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.next();
    });
  }

  async next() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.running--;
      this.next();
    }
  }
}

// Global queue instance to coordinate across all hook usages if multiple components used it
// (though typically this hook is used once at top level)
const decodeQueue = new DecodeQueue(1);

export default function useAudioMood() {
  const contextRef = useRef(null);
  const currentSourceRef = useRef(null);
  const currentGainRef = useRef(null);
  const currentMoodRef = useRef(null);
  const buffersRef = useRef(new Map());
  const moodUrlsRef = useRef(new Map());
  const loadingRef = useRef(new Map());
  const pendingMoodRef = useRef(null);
  const isUnlockedRef = useRef(false);

  const decodeMood = useCallback(async (moodId, url) => {
    if (!contextRef.current || !url) return null;

    if (buffersRef.current.has(moodId)) {
      return buffersRef.current.get(moodId);
    }

    const inFlight = loadingRef.current.get(moodId);
    if (inFlight) return inFlight;

    const promise = (async () => {
      const candidates = [];
      const seen = new Set();
      const addCandidate = (candidate) => {
        if (!candidate || seen.has(candidate)) return;
        seen.add(candidate);
        candidates.push(candidate);
      };

      addCandidate(url);
      addCandidate(url.includes('?') ? '${url}&cb=${Date.now()}' : '${url}?cb=${Date.now()}');

      if (url.endsWith('.wav')) {
        addCandidate(url.replace(/\.wav(\?.*)?$/, '.mp3'));
      } else if (url.endsWith('.mp3')) {
        addCandidate(url.replace(/\.mp3(\?.*)?$/, '.wav'));
      }

      let lastError = null;
      for (const candidate of candidates) {
        try {
          const response = await fetch(candidate, {
            cache: 'no-store',
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();

          // Use the queue for decoding
          const audioBuffer = await decodeQueue.add(() =>
            contextRef.current.decodeAudioData(arrayBuffer)
          );

          buffersRef.current.set(moodId, audioBuffer);
          return audioBuffer;
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError || new Error('Audio fetch/decode failed');
    })();

    loadingRef.current.set(moodId, promise);

    try {
      return await promise;
    } finally {
      loadingRef.current.delete(moodId);
    }
  }, []);

  const playMood = useCallback(async (moodId) => {
    if (!contextRef.current) return;
    if (moodId === currentMoodRef.current) return;

    const buffer = buffersRef.current.get(moodId);
    if (!buffer) return;

    const ctx = contextRef.current;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }

    const now = ctx.currentTime;

    // Fade out current
    if (currentGainRef.current) {
      currentGainRef.current.gain.setValueAtTime(currentGainRef.current.gain.value, now);
      currentGainRef.current.gain.linearRampToValueAtTime(0, now + FADE_DURATION);

      const oldSource = currentSourceRef.current;
      setTimeout(() => {
        try {
          oldSource?.stop();
        } catch {
          // already stopped
        }
      }, FADE_DURATION * 1000 + 100);
    }

    // Fade in next
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.45, now + FADE_DURATION);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);

    currentSourceRef.current = source;
    currentGainRef.current = gain;
    currentMoodRef.current = moodId;
    pendingMoodRef.current = null;
  }, []);

  // Unlock audio context on first user interaction
  const unlock = useCallback(() => {
    if (isUnlockedRef.current) return;
    isUnlockedRef.current = true;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      contextRef.current = new AudioCtx();
      if (contextRef.current.state === 'suspended') {
        contextRef.current.resume();
      }
    } catch (err) {
      console.error('[audio] Failed to create AudioContext:', err);
    }
  }, []);

  // Pre-load an audio file
  const loadMood = useCallback(async (moodId, url) => {
    if (url) {
      moodUrlsRef.current.set(moodId, url);
    }

    if (!contextRef.current) return;

    try {
      await decodeMood(moodId, moodUrlsRef.current.get(moodId));
      if (pendingMoodRef.current === moodId) {
        await playMood(moodId);
      }
    } catch (err) {
      console.warn(`[audio] Failed to load mood "${moodId}":`, err.message);
    }
  }, [decodeMood, playMood]);

  // Crossfade to a new mood (auto-load if not ready)
  const setMood = useCallback(async (moodId) => {
    if (!contextRef.current) return;
    if (!moodId) return;
    if (moodId === currentMoodRef.current) return;

    if (!buffersRef.current.has(moodId)) {
      pendingMoodRef.current = moodId;
      const url = moodUrlsRef.current.get(moodId);
      if (url) {
        try {
          await decodeMood(moodId, url);
        } catch (err) {
          console.warn(`[audio] Deferred load failed for mood "${moodId}":`, err.message);
          return;
        }
      }
    }

    await playMood(moodId);
  }, [decodeMood, playMood]);

  // Stop all audio
  const stop = useCallback(() => {
    pendingMoodRef.current = null;
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // already stopped
      }
      currentSourceRef.current = null;
      currentGainRef.current = null;
      currentMoodRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (contextRef.current) {
        contextRef.current.close();
      }
    };
  }, [stop]);

  return { unlock, loadMood, setMood, stop };
}
