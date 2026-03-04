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

  // PAEF Step B Refs
  const intentThrottleRef = useRef(null);
  const planFallbackTimerRef = useRef(null);
  const interventionDelayTimerRef = useRef(null);
  const pendingIntentRef = useRef(null);

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

  const [transcript, setTranscript] = useState([]);

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

    on('intervention_plan', (msg) => {
      // Ignore if older version or plan corresponds to previous scene
      if (msg.v < lastAcceptedVersion) return;

      // Clear fallback timer since we got the plan!
      if (planFallbackTimerRef.current) {
        clearTimeout(planFallbackTimerRef.current);
        planFallbackTimerRef.current = null;
      }

      const plan = msg.plan || { delayMs: 0, style: 'none' };
      const intent = pendingIntentRef.current;

      if (!intent) return; // Weird state

      // If there's a delay, we might show UI (if style is micro_text)
      if (plan.delayMs > 0 && plan.style === 'micro_text') {
        setStatusText(plan.message || (uiLanguage === 'ar' ? 'خذ نفساً عميقاً..' : 'Take a breath...'));
      }

      // Schedule the actual execute
      if (interventionDelayTimerRef.current) clearTimeout(interventionDelayTimerRef.current);

      interventionDelayTimerRef.current = setTimeout(() => {
        executePendingIntent(intent, plan.delayMs, false);
      }, plan.delayMs);
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
      setTranscript([]);
    });

    return () => {
      off('status');
      off('space_reading');
      off('scene');
      off('scene_image');
      off('story_complete');
      off('error');
      off('audio_chunk');
      off('intervention_plan');
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
    setTranscript((prev) => {
      // Avoid duplicate blocks if same version
      const alreadyHas = prev.some(b => b.text_ar === block.text_ar && b.kind === block.kind);
      if (alreadyHas) return prev;
      return [...prev, block];
    });

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
    setTranscript([]);
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
    setTranscript([]);
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

  const executePendingIntent = useCallback((intent, appliedDelayMs, bypass) => {
    setStatusText(uiLanguage === 'ar' ? 'يتم تعديل المسار...' : 'Re-planning...');
    stopVoice();

    // Clear pending state
    pendingIntentRef.current = null;

    sendMessage('redirect_execute', {
      sceneId: intent.sceneId,
      atIndex: intent.atIndex,
      command: intent.command,
      intensity: intent.intensity,
      output_mode: intent.output_mode,
      v: intent.v,
      bypass,
      appliedDelayMs
    });
  }, [sendMessage, stopVoice, uiLanguage]);

  const handleRedirect = useCallback((command, intensity = 0.8) => {
    if (!currentScene) return;

    setStatusText(uiLanguage === 'ar' ? 'تجهيز القرار...' : 'Preparing input...');

    // 1. Save intent (overwriting any previous pending intent from spamming)
    pendingIntentRef.current = {
      sceneId: currentScene.scene_id,
      atIndex: 0,
      command,
      intensity,
      output_mode: storyMode,
      v: lastAcceptedVersion
    };

    // 2. Clear any existing timers (Debouncing the intent to prevent WS spam)
    if (intentThrottleRef.current) clearTimeout(intentThrottleRef.current);
    if (planFallbackTimerRef.current) clearTimeout(planFallbackTimerRef.current);
    if (interventionDelayTimerRef.current) clearTimeout(interventionDelayTimerRef.current);

    intentThrottleRef.current = setTimeout(() => {
      const intent = pendingIntentRef.current;
      if (!intent) return;

      // 3. Send Intent
      sendMessage('redirect_intent', {
        sceneId: intent.sceneId,
        atIndex: intent.atIndex,
        command: intent.command,
        intensity: intent.intensity,
        output_mode: intent.output_mode,
        v: intent.v,
        context: {
          timeSinceLastRedirectMs: 0 // Mock for now, can be computed if needed
        }
      });

      // 4. Start Fallback Guard (800ms)
      planFallbackTimerRef.current = setTimeout(() => {
        // If plan never arrives, bypass PAEF entirely to keep stream alive
        console.warn("[paef] Fallback timer triggered (800ms). Bypassing intervention.");
        if (pendingIntentRef.current) {
          executePendingIntent(pendingIntentRef.current, 0, true);
        }
      }, 800);

    }, 200); // 200ms throttle

  }, [currentScene, uiLanguage, sendMessage, storyMode, lastAcceptedVersion, executePendingIntent]);

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
    setTranscript([]);
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
    transcript,
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
