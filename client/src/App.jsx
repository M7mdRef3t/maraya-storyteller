import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import StoryCanvas from './components/StoryCanvas.jsx';
import EmotionPicker from './components/EmotionPicker.jsx';
import SpaceUpload from './components/SpaceUpload.jsx';
import SceneRenderer from './components/SceneRenderer.jsx';
import LoadingMirror from './components/LoadingMirror.jsx';
import useWebSocket from './hooks/useWebSocket.js';
import useAudioMood from './hooks/useAudioMood.js';
import useNarrationVoice from './hooks/useNarrationVoice.js';
import {
  APP_STATES,
  AUDIO_MOOD_MAP,
  UI_COPY,
  STORY_MODES,
  getModeUiLanguage,
} from './utils/constants.js';

function normalizeMode(mode) {
  const fallback = 'judge_en';
  return STORY_MODES.some((item) => item.id === mode) ? mode : fallback;
}

export default function App() {
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

  const canvasRef = useRef(null);
  const { isConnected, connect, sendMessage, on, off } = useWebSocket();
  const { unlock: unlockAudio, loadMood, setMood, stop: stopAudio } = useAudioMood();
  const {
    isSupported: voiceSupported,
    warmup: warmupVoice,
    speak: speakVoice,
    stop: stopVoice,
  } = useNarrationVoice();

  useEffect(() => {
    if (!voiceSupported) {
      setVoiceEnabled(false);
    }
  }, [voiceSupported]);

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
  }, [on, off, uiText.loadingError]);

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
  }, [uiText.loadingNext, sendMessage, stopVoice, storyMode]);

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
  }, [stopAudio, stopVoice]);

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

  useEffect(() => {
    if (appState === APP_STATES.LOADING || appState === APP_STATES.ENDING) {
      stopVoice();
    }
  }, [appState, stopVoice]);

  return (
    <div className="app" dir={uiLanguage === 'en' ? 'ltr' : 'rtl'}>
      <StoryCanvas ref={canvasRef} mood={currentMood} />

      <div className="app__overlay">
        {appState === APP_STATES.LANDING && !showSpaceUpload && (
          <EmotionPicker
            mode={storyMode}
            uiLanguage={uiLanguage}
            uiText={uiText}
            musicEnabled={musicEnabled}
            voiceEnabled={voiceEnabled}
            voiceSupported={voiceSupported}
            onModeChange={handleModeChange}
            onToggleMusic={handleToggleMusic}
            onToggleVoice={handleToggleVoice}
            onSelectEmotion={handleSelectEmotion}
            onUploadSpace={() => setShowSpaceUpload(true)}
          />
        )}

        {appState === APP_STATES.LANDING && showSpaceUpload && (
          <SpaceUpload
            uiLanguage={uiLanguage}
            uiText={uiText}
            onUpload={handleUploadSpace}
            onBack={() => setShowSpaceUpload(false)}
          />
        )}

        {appState === APP_STATES.LOADING && (
          <LoadingMirror statusText={statusText} />
        )}

        {appState === APP_STATES.STORY && currentScene && (
          <SceneRenderer
            scene={currentScene}
            uiLanguage={uiLanguage}
            sceneWord={uiText.sceneWord}
            onNarrationBlock={handleNarrationBlock}
            onChoose={handleChoose}
            isFinal={currentScene.is_final}
          />
        )}

        {appState === APP_STATES.ENDING && (
          <div className="ending">
            <p className="ending__message">{endingMessage}</p>
            <button className="ending__restart" onClick={handleRestart}>
              {uiText.restart}
            </button>
          </div>
        )}

        {!isConnected && appState !== APP_STATES.LANDING && (
          <div className="connection-lost">
            {uiText.reconnecting}
          </div>
        )}

        <div className="audio-hud">
          <button
            type="button"
            className={`audio-hud__btn ${musicEnabled ? 'audio-hud__btn--on' : ''}`}
            onClick={handleToggleMusic}
          >
            {uiText.musicLabel}: {musicEnabled ? uiText.musicOn : uiText.musicOff}
          </button>
          <button
            type="button"
            className={`audio-hud__btn ${voiceEnabled ? 'audio-hud__btn--on' : ''}`}
            onClick={handleToggleVoice}
            disabled={!voiceSupported}
            title={!voiceSupported ? uiText.voiceUnavailable : ''}
          >
            {uiText.voiceLabel}: {voiceEnabled ? uiText.voiceOn : uiText.voiceOff}
          </button>
        </div>
      </div>
    </div>
  );
}
