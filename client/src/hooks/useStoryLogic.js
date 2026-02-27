import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const uiLanguage = getModeUiLanguage(storyMode);
  const uiText = useMemo(() => UI_COPY[uiLanguage] || UI_COPY.en, [uiLanguage]);

  const { isConnected, connect, sendMessage, on, off } = useWebSocket();
  const { unlock: unlockAudio, loadMood, setMood, stop: stopAudio } = useAudioMood();
  const {
    isSupported: voiceSupported,
    warmup: warmupVoice,
    speak: speakVoice,
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
      setStatusText(msg.text);
    });

    on('space_reading', (msg) => {
      setSpaceReading(msg.reading);
    });

    on('scene', (msg) => {
      const scene = msg.scene;
      setSceneQueue((prev) => [...prev, scene]);
    });

    on('scene_image', (msg) => {
      if (canvasRef.current) {
        canvasRef.current.setImage(msg.image, msg.mimeType);
      }
    });

    on('story_complete', (msg) => {
      setEndingMessage(msg.message);
      setAppState(APP_STATES.ENDING);
    });

    on('error', (msg) => {
      setStatusText(msg.message || uiText.loadingError);
      setTimeout(() => setAppState(APP_STATES.LANDING), 3000);
    });

    return () => {
      off('status');
      off('space_reading');
      off('scene');
      off('scene_image');
      off('story_complete');
      off('error');
    };
  }, [on, off, uiText.loadingError, canvasRef]);

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
    uiLanguage,
    uiText,
    isConnected,
    handleNarrationBlock,
    handleSelectEmotion,
    handleUploadSpace,
    handleChoose,
    handleRestart,
    handleModeChange,
    handleToggleVoice,
    handleToggleMusic,
  };
}
