import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useWebSocket from './useWebSocket.js';
import useAudioMood from './useAudioMood.js';
import useNarrationVoice from './useNarrationVoice.js';
import {
  APP_STATES,
  AUDIO_MOOD_MAP,
  UI_COPY,
  getModeUiLanguage,
  normalizeMode,
} from '../utils/constants.js';

export default function useStoryLogic(canvasRef) {
  const [appState, setAppState] = useState(APP_STATES.LANDING);
  const [showSpaceUpload, setShowSpaceUpload] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [currentScene, setCurrentScene] = useState(null);
  const [currentMood, setCurrentMood] = useState('ambient_calm');
  const [endingMessage, setEndingMessage] = useState('');
  const [sceneQueue, setSceneQueue] = useState([]);
  const [spaceReading, setSpaceReading] = useState(null);
  const [storyMode, setStoryMode] = useState('judge_en');
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastAcceptedVersion, setLastAcceptedVersion] = useState(0);
  const [imageStale, setImageStale] = useState(false);
  const [staleDroppedCount, setStaleDroppedCount] = useState(0);
  const redirectTimerRef = useRef(null);
  const imageFallbackTimerRef = useRef(null);

  const uiLanguage = getModeUiLanguage(storyMode);
  const uiText = useMemo(() => UI_COPY[uiLanguage] || UI_COPY.en, [uiLanguage]);

  const { isConnected, connect, sendMessage, on, off } = useWebSocket();
  const { unlock: unlockAudio, loadMood, setMood, stop: stopAudio } = useAudioMood();
  const {
    isSupported: voiceSupported,
    warmup: warmupVoice,
    speak: speakVoice,
    queueAudioChunk,
    stop: stopVoice,
  } = useNarrationVoice();

  // Voice support check
  useEffect(() => {
    if (!voiceSupported) {
      setVoiceEnabled(false);
    }
  }, [voiceSupported]);

  // Document language/direction
  useEffect(() => {
    const dir = uiLanguage === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = uiLanguage;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [uiLanguage]);

  // Connect WebSocket on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      connect();
    }, 0);
    return () => clearTimeout(timer);
  }, [connect]);

  // Register WebSocket message handlers
  useEffect(() => {
    on('status', (msg) => {
      if (msg.v < lastAcceptedVersion) {
        setStaleDroppedCount(prev => prev + 1);
        return;
      }
      setStatusText(msg.text);
    });

    on('space_reading', (msg) => {
      if (msg.v < lastAcceptedVersion) {
        setStaleDroppedCount(prev => prev + 1);
        return;
      }
      setSpaceReading(msg.reading);
    });

    on('scene', (msg) => {
      if (msg.v < lastAcceptedVersion) {
        setStaleDroppedCount(prev => prev + 1);
        return;
      }
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      if (imageFallbackTimerRef.current) clearTimeout(imageFallbackTimerRef.current);

      setLastAcceptedVersion(msg.v);
      setImageStale(true);

      // Reset image fallback timer for current scene
      imageFallbackTimerRef.current = setTimeout(() => {
        // Explicitly handled in UI if stale
      }, 900);

      const scene = msg.scene;
      setSceneQueue((prev) => [...prev, scene]);
    });

    on('scene_image', (msg) => {
      if (msg.v < lastAcceptedVersion) {
        setStaleDroppedCount(prev => prev + 1);
        return;
      }
      if (imageFallbackTimerRef.current) clearTimeout(imageFallbackTimerRef.current);
      setImageStale(false);

      if (canvasRef.current) {
        canvasRef.current.setImage(msg.image, msg.mimeType);
      }
    });

    on('story_complete', (msg) => {
      if (msg.v < lastAcceptedVersion) return;
      setEndingMessage(msg.message);
      setAppState(APP_STATES.ENDING);
    });

    on('error', (msg) => {
      if (msg.v < lastAcceptedVersion) return;
      setStatusText(msg.message || uiText.loadingError);
      setTimeout(() => setAppState(APP_STATES.LANDING), 3000);
    });

    on('audio_chunk', (chunk) => {
      if (chunk.v < lastAcceptedVersion) {
        setStaleDroppedCount(prev => prev + 1);
        return;
      }
      if (!voiceEnabled) return;
      queueAudioChunk({ ...chunk, version: chunk.v }, (meta) => {
        // Playback start trigger
      });
    });

    on('redirect_ack', (msg) => {
      if (msg.v < lastAcceptedVersion) return;
      setLastAcceptedVersion(msg.v);
      stopVoice();
    });

    on('audio_cancel', (msg) => {
      if (msg.v < lastAcceptedVersion) return;
      stopVoice();
    });

    on('timeline_reset', (msg) => {
      if (msg.v < lastAcceptedVersion) return;
      setSceneQueue([]);
    });

    return () => {
      off('status');
      off('space_reading');
      off('scene');
      off('scene_image');
      off('story_complete');
      off('error');
      off('audio_chunk');
      off('redirect_ack');
      off('audio_cancel');
      off('timeline_reset');
    };
  }, [on, off, uiText.loadingError, canvasRef, voiceEnabled, queueAudioChunk, stopVoice, lastAcceptedVersion]);

  // Process scene queue: show scenes one at a time
  useEffect(() => {
    if (sceneQueue.length > 0 && appState === APP_STATES.LOADING) {
      const nextScene = sceneQueue[0];
      setCurrentScene(nextScene);
      setCurrentMood(nextScene.audio_mood || 'ambient_calm');
      setAppState(APP_STATES.STORY);
      setSceneQueue((prev) => prev.slice(1));
    }
  }, [sceneQueue, appState]);

  // Update audio mood when it changes
  useEffect(() => {
    if (!musicEnabled) {
      stopAudio();
      return;
    }
    if (currentMood) {
      setMood(currentMood);
    }
  }, [currentMood, musicEnabled, setMood, stopAudio]);

  // Stop voice on state change
  useEffect(() => {
    if (appState === APP_STATES.LOADING || appState === APP_STATES.ENDING) {
      stopVoice();
    }
  }, [appState, stopVoice]);

  const preloadMoods = useCallback(() => {
    Object.entries(AUDIO_MOOD_MAP).forEach(([id, config]) => {
      loadMood(id, `/audio/${config.file}`);
    });
  }, [loadMood]);

  const getVoiceLang = useCallback((mode) => {
    if (mode === 'judge_en') return 'en-US';
    if (mode === 'ar_fusha') return 'ar-SA';
    return 'ar-EG';
  }, []);

  const handleNarrationBlock = useCallback((block) => {
    if (!voiceEnabled || !voiceSupported) return;
    if (!block?.text_ar) return;
    if (block.kind === 'visual') return;
    speakVoice(block.text_ar, { lang: getVoiceLang(storyMode) });
  }, [voiceEnabled, voiceSupported, speakVoice, getVoiceLang, storyMode]);

  const handleSelectEmotion = useCallback((emotionId) => {
    unlockAudio();
    preloadMoods();
    warmupVoice();

    setAppState(APP_STATES.LOADING);
    setStatusText(uiText.loadingStory);
    setCurrentScene(null);
    setSceneQueue([]);
    sendMessage('start_story', { emotion: emotionId, output_mode: storyMode });
  }, [unlockAudio, preloadMoods, warmupVoice, uiText.loadingStory, sendMessage, storyMode]);

  const handleUploadSpace = useCallback((base64, mimeType) => {
    unlockAudio();
    preloadMoods();
    warmupVoice();

    setAppState(APP_STATES.LOADING);
    setStatusText(uiText.analyzingSpace);
    setCurrentScene(null);
    setSceneQueue([]);
    sendMessage('start_story', { image: base64, mimeType, output_mode: storyMode });
  }, [unlockAudio, preloadMoods, warmupVoice, uiText.analyzingSpace, sendMessage, storyMode]);

  const handleChoose = useCallback((choice) => {
    const choiceText = choice?.text_ar || choice?.text_en || choice?.text || '';

    setAppState(APP_STATES.LOADING);
    setStatusText(uiText.loadingNext);
    setCurrentScene(null);
    setSceneQueue([]);

    if (canvasRef.current) {
      canvasRef.current.clearImage();
    }
    stopVoice();

    sendMessage('choose', {
      choice_text: choiceText,
      emotion_shift: choice.emotion_shift,
      output_mode: storyMode,
    });
  }, [uiText.loadingNext, sendMessage, stopVoice, storyMode, canvasRef]);

  const handleRedirect = useCallback((command, intensity = 0.8) => {
    if (!currentScene) return;

    setAppState(APP_STATES.LOADING);
    setStatusText(uiLanguage === 'ar' ? 'يتم تعديل المسار...' : 'Re-planning...');

    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    redirectTimerRef.current = setTimeout(() => {
      setStatusText(uiLanguage === 'ar' ? 'ضبط المزاج...' : 'Adjusting mood...');
    }, 600);

    stopVoice();

    sendMessage('redirect', {
      sceneId: currentScene.scene_id,
      atIndex: 0,
      command,
      intensity,
      output_mode: storyMode
    });
  }, [currentScene, uiLanguage, sendMessage, stopVoice, storyMode]);

  useEffect(() => {
    // Spam test harness
    window.runMarayaSpamTest = () => {
      console.log("--- STARTING SPAM TEST ---");
      let count = 0;
      const commands = ["Nightmare", "Hope", "Darker", "Cinematic", "Witty"];
      const interval = setInterval(() => {
        const cmd = commands[Math.floor(Math.random() * commands.length)];
        console.log(`[SPAM] Sending redirect ${count + 1}/10: ${cmd}`);
        handleRedirect(cmd, 0.8);
        count++;
        if (count >= 10) {
          clearInterval(interval);
          console.log("--- SPAM TEST COMPLETE ---");
        }
      }, 1200);
    };
    return () => { delete window.runMarayaSpamTest; };
  }, [handleRedirect]);

  const handleRestart = useCallback(() => {
    setAppState(APP_STATES.LANDING);
    setShowSpaceUpload(false);
    setCurrentScene(null);
    setSceneQueue([]);
    setEndingMessage('');
    setSpaceReading(null);
    stopAudio();
    stopVoice();
    if (canvasRef.current) {
      canvasRef.current.clearImage();
    }
  }, [stopAudio, stopVoice, canvasRef]);

  const handleModeChange = useCallback((nextMode) => {
    const normalized = normalizeMode(nextMode);
    setStoryMode(normalized);
    stopVoice();
  }, [stopVoice]);

  const handleToggleVoice = useCallback(() => {
    if (!voiceSupported) return;
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopVoice();
      }
      return next;
    });
  }, [voiceSupported, stopVoice]);

  const handleToggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopAudio();
      } else {
        unlockAudio();
        preloadMoods();
        if (currentMood) {
          setMood(currentMood);
        }
      }
      return next;
    });
  }, [currentMood, preloadMoods, setMood, stopAudio, unlockAudio]);

  return {
    appState,
    setAppState,
    showSpaceUpload,
    setShowSpaceUpload,
    statusText,
    currentScene,
    currentMood,
    endingMessage,
    spaceReading,
    storyMode,
    musicEnabled,
    voiceEnabled,
    voiceSupported,
    imageStale,
    uiLanguage,
    uiText,
    isConnected,
    staleDroppedCount,
    lastAcceptedVersion,
    handleNarrationBlock,
    handleSelectEmotion,
    handleUploadSpace,
    handleChoose,
    handleRedirect,
    handleRestart,
    handleModeChange,
    handleToggleVoice,
    handleToggleMusic,
  };
}
