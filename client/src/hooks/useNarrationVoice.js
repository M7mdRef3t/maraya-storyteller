import { useRef, useCallback, useEffect } from 'react';

/**
 * useNarrationVoice - High Performance AI Narration Playback
 * Supports both Browser Synthesis (Legacy) and Native AI Audio Streaming (OpenAI).
 */
export default function useNarrationVoice() {
  const audioContextRef = useRef(null);
  const queueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Initialize Audio Context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const stop = useCallback(() => {
    // 1. Stop Browser Synth
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    // 2. Clear Queue and stop audio playback
    queueRef.current = [];
    isPlayingRef.current = false;
    // Note: To fully stop AudioContext buffer source, we'd need to track it. 
    // For simplicity, we just clear the queue so nothing else plays.
  }, []);

  const playNextInQueue = useCallback(async () => {
    if (isPlayingRef.current || queueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const { blob, meta, onStart } = queueRef.current.shift();

    try {
      initAudio();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      onStart?.(meta);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        isPlayingRef.current = false;
        playNextInQueue();
      };

      source.start(0);
    } catch (err) {
      console.error('[voice] Playback failed:', err);
      isPlayingRef.current = false;
      playNextInQueue();
    }
  }, [initAudio]);

  const queueAudioChunk = useCallback((chunk, onStart) => {
    queueRef.current.push({ ...chunk, onStart });
    if (!isPlayingRef.current) {
      playNextInQueue();
    }
  }, [playNextInQueue]);

  // Legacy fallback for English or Browser-only modes
  const speakLegacy = useCallback((text, opts = {}) => {
    if (!synthRef.current) return;
    const content = typeof text === 'string' ? text.trim() : '';
    if (!content) return;

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = opts.lang || 'en-US';
    utterance.rate = 1.0;

    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  }, []);

  const warmup = useCallback(() => {
    initAudio();
  }, [initAudio]);

  return {
    isSupported: true,
    warmup,
    speak: speakLegacy, // Backward compat
    queueAudioChunk,
    stop
  };
}
