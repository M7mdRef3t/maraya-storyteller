import { useRef, useCallback, useEffect } from 'react';

export function getVoiceCandidates(voices, lang) {
  const target = (lang || '').toLowerCase();
  const base = target.split('-')[0];

  const exact = voices.find((voice) => voice.lang?.toLowerCase() === target);
  if (exact) return exact;

  if (!base) return null;

  const prefix = voices.find((voice) => (voice.lang || '').toLowerCase().startsWith(base));
  if (prefix) return prefix;

  return null;
}

export default function useNarrationVoice() {
  const synthRef = useRef(null);
  const voicesRef = useRef([]);
  const supportedRef = useRef(
    typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && 'SpeechSynthesisUtterance' in window,
  );

  const isSupported = supportedRef.current;

  const refreshVoices = useCallback(() => {
    if (!synthRef.current) return;
    const voices = synthRef.current.getVoices?.() || [];
    voicesRef.current = voices;
  }, []);

  useEffect(() => {
    if (!isSupported) return () => {};

    synthRef.current = window.speechSynthesis;
    refreshVoices();

    const onVoicesChanged = () => refreshVoices();
    synthRef.current.addEventListener?.('voiceschanged', onVoicesChanged);

    return () => {
      synthRef.current?.cancel();
      synthRef.current?.removeEventListener?.('voiceschanged', onVoicesChanged);
    };
  }, [isSupported, refreshVoices]);

  const stop = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
  }, []);

  const speak = useCallback((text, opts = {}) => {
    if (!isSupported || !synthRef.current) return;

    const content = typeof text === 'string' ? text.trim() : '';
    if (!content) return;

    const lang = opts.lang || 'en-US';
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = lang;
    utterance.rate = opts.rate || (lang.startsWith('ar') ? 0.96 : 1.0);
    utterance.pitch = opts.pitch || 1.0;
    utterance.volume = opts.volume || 0.95;

    const selectedVoice = getVoiceCandidates(voicesRef.current, lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  }, [isSupported]);

  const warmup = useCallback(() => {
    if (!isSupported) return;
    refreshVoices();
  }, [isSupported, refreshVoices]);

  return { isSupported, warmup, speak, stop };
}
