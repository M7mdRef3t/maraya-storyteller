import React, { useEffect, useRef, useState } from 'react';
import StoryCanvas from './components/StoryCanvas.jsx';
import EmotionPicker from './components/emotion/EmotionPicker.jsx';
import SpaceUpload from './components/SpaceUpload.jsx';
import SceneRenderer from './components/story/SceneRenderer.jsx';
import SceneCardShare from './components/story/SceneCardShare.jsx';
import StoryReelExport from './components/story/StoryReelExport.jsx';
import EmotionJourneyMap from './components/story/EmotionJourneyMap.jsx';
import LoadingMirror from './components/layout/LoadingMirror.jsx';
import Transcript from './components/Transcript.jsx';
import BrandMark from './components/BrandMark.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import OnboardingCarousel from './components/OnboardingCarousel.jsx';
import SettingsSheet from './components/layout/SettingsSheet.jsx';
import { ToastContainer } from './components/ui/Toast.jsx';
import useStoryLogic from './hooks/useStoryLogic.js';
import { APP_STATES, JUDGE_MODE_QUERY_PARAM } from './utils/constants.js';

const EMOTION_COLORS = {
  hope: '#5effb3',
  anxiety: '#8b7355',
  confusion: '#7b68ee',
  nostalgia: '#daa520',
  loneliness: '#4682b4',
  wonder: '#ffd700',
};

function toDisplayEmotionLabel(emotion, uiLanguage) {
  const labels = {
    hope: { en: 'hope', ar: 'الأمل' },
    anxiety: { en: 'anxiety', ar: 'القلق' },
    confusion: { en: 'confusion', ar: 'الحيرة' },
    nostalgia: { en: 'nostalgia', ar: 'الحنين' },
    loneliness: { en: 'loneliness', ar: 'الوحدة' },
    wonder: { en: 'wonder', ar: 'الدهشة' },
  };
  const normalized = String(emotion || '').trim().toLowerCase();
  const match = labels[normalized];
  if (!match) return normalized || (uiLanguage === 'en' ? 'feeling' : 'شعور');
  return uiLanguage === 'en' ? match.en : match.ar;
}

function findLastVisualMoment(moments = []) {
  for (let index = moments.length - 1; index >= 0; index -= 1) {
    if (moments[index]?.imageData) return moments[index];
  }
  return null;
}

function loadMomentImage(moment) {
  return new Promise((resolve) => {
    if (!moment?.imageData) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `data:${moment.imageMimeType || 'image/png'};base64,${moment.imageData}`;
  });
}

async function extractSceneAccentColor(moment) {
  const image = await loadMomentImage(moment);
  if (!image) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 18;
  canvas.height = 18;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 24) continue;

    const pixelRed = data[index];
    const pixelGreen = data[index + 1];
    const pixelBlue = data[index + 2];
    const brightness = (pixelRed + pixelGreen + pixelBlue) / 3;
    if (brightness < 18) continue;

    red += pixelRed;
    green += pixelGreen;
    blue += pixelBlue;
    count += 1;
  }

  if (!count) return null;

  return `rgb(${Math.min(255, Math.round((red / count) * 1.08))}, ${Math.min(255, Math.round((green / count) * 1.08))}, ${Math.min(255, Math.round((blue / count) * 1.08))})`;
}

export function buildJudgeFinaleStingProfile(fromEmotion, toEmotion) {
  const pair = `${String(fromEmotion || '').trim().toLowerCase()}->${String(toEmotion || '').trim().toLowerCase()}`;

  const profiles = {
    'confusion->hope': { freqs: [196, 293.66, 440, 659.25], masterGain: 0.078, duration: 0.68 },
    'anxiety->hope': { freqs: [174.61, 261.63, 392, 587.33], masterGain: 0.08, duration: 0.72 },
    'loneliness->hope': { freqs: [164.81, 246.94, 369.99, 554.37], masterGain: 0.076, duration: 0.72 },
    'nostalgia->wonder': { freqs: [220, 329.63, 493.88, 659.25], masterGain: 0.07, duration: 0.7 },
    'hope->wonder': { freqs: [261.63, 392, 523.25, 783.99], masterGain: 0.074, duration: 0.66 },
    'wonder->hope': { freqs: [233.08, 349.23, 523.25, 698.46], masterGain: 0.074, duration: 0.68 },
  };

  if (profiles[pair]) {
    return profiles[pair];
  }

  if (String(toEmotion || '').trim().toLowerCase() === 'hope') {
    return { freqs: [196, 293.66, 392, 587.33], masterGain: 0.074, duration: 0.66 };
  }

  if (String(toEmotion || '').trim().toLowerCase() === 'wonder') {
    return { freqs: [220, 329.63, 493.88, 739.99], masterGain: 0.07, duration: 0.68 };
  }

  return { freqs: [196, 246.94, 311.13, 392], masterGain: 0.062, duration: 0.62 };
}

function playJudgeFinaleSting(stingProfile) {
  if (typeof window === 'undefined') return () => {};
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return () => {};

  const profile = stingProfile || buildJudgeFinaleStingProfile('confusion', 'hope');
  const audioContext = new AudioCtor();
  const now = audioContext.currentTime;
  const master = audioContext.createGain();
  master.connect(audioContext.destination);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(profile.masterGain, now + 0.04);
  master.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);

  profile.freqs.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index === 0 ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(index === 0 ? 0.035 : 0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.5, profile.duration - 0.08));
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(now + (index * 0.015));
    oscillator.stop(now + Math.max(0.5, profile.duration - 0.08));
  });

  const closeTimer = window.setTimeout(() => {
    audioContext.close().catch(() => {});
  }, Math.ceil((profile.duration * 1000) + 280));

  return () => {
    window.clearTimeout(closeTimer);
    audioContext.close().catch(() => {});
  };
}

export default function App() {
  const canvasRef = useRef(null);
  const judgeFinaleVoiceKeyRef = useRef('');
  const judgeFinaleStingKeyRef = useRef('');
  const [imageAnnouncement, setImageAnnouncement] = useState('');
  const [judgeEndingSceneAccent, setJudgeEndingSceneAccent] = useState('');
  const judgeMode = new URLSearchParams(window.location.search).get(JUDGE_MODE_QUERY_PARAM) === '1';

  const {
    appState,
    showSpaceUpload,
    setShowSpaceUpload,
    statusText,
    currentScene,
    currentMood,
    endingMessage,
    transcript,
    storyMode,
    musicEnabled,
    voiceEnabled,
    settingsOpen,
    narrationSpeed,
    voiceSupported,
    uiLanguage,
    uiText,
    isConnected,
    handleNarrationBlock,
    handleSelectEmotion,
    handleUploadSpace,
    handleChoose,
    handleRedirect,
    handleRestart,
    handleModeChange,
    handleToggleVoice,
    handleToggleMusic,
    setNarrationSpeed,
    handleOpenSettings,
    handleCloseSettings,
    handleResetSettings,
    imageStale,
    staleDroppedCount,
    lastAcceptedVersion,
    onboardingIndex,
    handleOnboardingNext,
    handleOnboardingBack,
    handleOnboardingSkip,
    emotionJourney,
    sceneImageData,
    sceneImageMime,
    secretEndingKey,
    mirrorMemory,
    storyMoments,
    lastWhisperText,
    whisperInterpretation,
    whisperInput,
    duoState,
    duoJoinCode,
    toasts,
    canStartStory,
    canRestartStory,
    handleStartJudgeJourney,
    handleDuoNameChange,
    handleDuoJoinCodeChange,
    handleHostDuo,
    handleJoinDuo,
    handleLeaveDuo,
    dismissToast,
  } = useStoryLogic(canvasRef, { judgeMode });

  useEffect(() => {
    if (!currentScene) return;
    const alt = currentScene.visual_desc || currentScene.visual_prompt || currentScene.narration_ar || '';
    const prefix = uiLanguage === 'en' ? 'New scene generated: ' : 'تم توليد مشهد جديد: ';
    if (alt.trim()) {
      setImageAnnouncement(`${prefix}${alt}`);
    }
  }, [currentScene, uiLanguage]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (appState === APP_STATES.STORY) {
        const message = uiLanguage === 'en'
          ? 'Your story progress will be lost. Are you sure you want to leave?'
          : 'ستفقد تقدمك في القصة. هل أنت متأكد من المغادرة؟';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
      return undefined;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [appState, uiLanguage]);

  const currentEmotionColor = emotionJourney.length > 0
    ? EMOTION_COLORS[emotionJourney[emotionJourney.length - 1]] || '#ffd700'
    : '#ffd700';
  const judgeEndingFromEmotion = toDisplayEmotionLabel(emotionJourney[0], uiLanguage);
  const judgeEndingToEmotion = toDisplayEmotionLabel(
    emotionJourney[emotionJourney.length - 1],
    uiLanguage,
  );
  const judgeEndingLine = uiLanguage === 'en'
    ? `From ${judgeEndingFromEmotion} to ${judgeEndingToEmotion}`
    : `من ${judgeEndingFromEmotion} إلى ${judgeEndingToEmotion}`;
  const judgeEndingCaption = uiLanguage === 'en'
    ? 'A judge-only ending burst that makes the transformation feel like a reveal, not a fade-out.'
    : 'خاتمة تحكيمية خاصة تجعل التحوّل يبدو ككشفٍ بصري لا كتلاشي هادئ.';

  const judgeEndingAccent = judgeEndingSceneAccent || currentEmotionColor;

  const judgeFinaleVoiceLine = uiLanguage === 'en'
    ? `Transformation complete. ${judgeEndingLine}.`
    : `اكتمل التحول. ${judgeEndingLine}.`;

  useEffect(() => {
    if (appState !== APP_STATES.ENDING) {
      judgeFinaleVoiceKeyRef.current = '';
      judgeFinaleStingKeyRef.current = '';
    }
  }, [appState]);

  useEffect(() => {
    let active = true;

    if (!judgeMode || appState !== APP_STATES.ENDING) {
      setJudgeEndingSceneAccent('');
      return undefined;
    }

    const lastVisualMoment = findLastVisualMoment(storyMoments);
    if (!lastVisualMoment) {
      setJudgeEndingSceneAccent('');
      return undefined;
    }

    extractSceneAccentColor(lastVisualMoment)
      .then((accent) => {
        if (active) {
          setJudgeEndingSceneAccent(accent || '');
        }
      })
      .catch(() => {
        if (active) {
          setJudgeEndingSceneAccent('');
        }
      });

    return () => {
      active = false;
    };
  }, [appState, judgeMode, storyMoments]);

  useEffect(() => {
    if (!judgeMode || appState !== APP_STATES.ENDING || !voiceEnabled || !voiceSupported) {
      return undefined;
    }

    if (typeof window === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined' || !window.speechSynthesis) {
      return undefined;
    }

    const voiceKey = `${judgeEndingLine}|${endingMessage}|${uiLanguage}`;
    if (judgeFinaleVoiceKeyRef.current === voiceKey) {
      return undefined;
    }
    judgeFinaleVoiceKeyRef.current = voiceKey;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(judgeFinaleVoiceLine);
    utterance.lang = uiLanguage === 'en' ? 'en-US' : 'ar-EG';
    utterance.rate = 1.04;
    utterance.pitch = 1.02;

    const timer = window.setTimeout(() => {
      synth.cancel();
      synth.speak(utterance);
    }, 180);

    return () => {
      window.clearTimeout(timer);
      synth.cancel();
    };
  }, [
    appState,
    endingMessage,
    judgeEndingLine,
    judgeFinaleVoiceLine,
    judgeMode,
    uiLanguage,
    voiceEnabled,
    voiceSupported,
  ]);

  useEffect(() => {
    if (!judgeMode || appState !== APP_STATES.ENDING || !musicEnabled) {
      return undefined;
    }

    const stingKey = `${judgeEndingLine}|${endingMessage}`;
    if (judgeFinaleStingKeyRef.current === stingKey) {
      return undefined;
    }
    judgeFinaleStingKeyRef.current = stingKey;

    return playJudgeFinaleSting(
      buildJudgeFinaleStingProfile(
        emotionJourney[0],
        emotionJourney[emotionJourney.length - 1],
      ),
    );
  }, [appState, emotionJourney, endingMessage, judgeEndingLine, judgeMode, musicEnabled]);

  return (
    <div className={`app app--maraya ${judgeMode ? 'app--judge' : ''}`} dir={uiLanguage === 'en' ? 'ltr' : 'rtl'}>
      <StoryCanvas
        ref={canvasRef}
        mood={currentMood}
        isStale={imageStale}
        uiLanguage={uiLanguage}
        sceneAltText={currentScene?.visual_desc || currentScene?.visual_prompt || currentScene?.narration_ar || ''}
      />

      <div className="app__overlay">
        {appState === 'SPLASH' && (
          <SplashScreen
            uiLanguage={uiLanguage}
            title={uiText.title}
          />
        )}

        {appState === 'ONBOARDING' && (
          <OnboardingCarousel
            uiLanguage={uiLanguage}
            index={onboardingIndex}
            onNext={handleOnboardingNext}
            onBack={handleOnboardingBack}
            onSkip={handleOnboardingSkip}
          />
        )}

        {(appState === APP_STATES.STORY || appState === APP_STATES.ENDING) && (
          <div className="story-brand">
            <BrandMark compact />
          </div>
        )}

        {appState === APP_STATES.LANDING && !showSpaceUpload && (
          <EmotionPicker
            mode={storyMode}
            uiLanguage={uiLanguage}
            uiText={uiText}
            musicEnabled={musicEnabled}
            voiceEnabled={voiceEnabled}
            voiceSupported={voiceSupported}
            canStartStory={canStartStory}
            mirrorMemory={mirrorMemory}
            whisperInput={whisperInput}
            judgeMode={judgeMode}
            duoState={duoState}
            duoJoinCode={duoJoinCode}
            onModeChange={handleModeChange}
            onToggleMusic={handleToggleMusic}
            onToggleVoice={handleToggleVoice}
            onSelectEmotion={handleSelectEmotion}
            onUploadSpace={() => setShowSpaceUpload(true)}
            onStartJudgeJourney={handleStartJudgeJourney}
            onDuoNameChange={handleDuoNameChange}
            onDuoJoinCodeChange={handleDuoJoinCodeChange}
            onHostDuo={handleHostDuo}
            onJoinDuo={handleJoinDuo}
            onLeaveDuo={handleLeaveDuo}
          />
        )}

        {appState === APP_STATES.LANDING && showSpaceUpload && (
          <SpaceUpload
            uiLanguage={uiLanguage}
            uiText={uiText}
            onUpload={handleUploadSpace}
            onBack={() => setShowSpaceUpload(false)}
            disabled={!canStartStory}
          />
        )}

        {appState === APP_STATES.LOADING && (
          <LoadingMirror
            statusText={statusText}
            uiLanguage={uiLanguage}
            whisperText={lastWhisperText}
            whisperReflection={whisperInterpretation?.reflection}
          />
        )}

        {appState === APP_STATES.STORY && (
          <>
            <Transcript
              blocks={transcript}
              uiLanguage={uiLanguage}
              visible={true}
            />
            {currentScene && (
              <>
                <SceneRenderer
                  scene={currentScene}
                  uiLanguage={uiLanguage}
                  sceneWord={uiText.sceneWord}
                  onNarrationBlock={handleNarrationBlock}
                  onChoose={handleChoose}
                  onRedirect={duoState.role === 'guest' ? null : handleRedirect}
                  narrationSpeed={narrationSpeed}
                  isFinal={currentScene.is_final}
                  staleDroppedCount={staleDroppedCount}
                  version={lastAcceptedVersion}
                  judgeMode={judgeMode}
                  duoState={duoState}
                />
                <SceneCardShare
                  scene={currentScene}
                  sceneNumber={currentScene.story_scene_number}
                  emotionColor={currentEmotionColor}
                  imageData={sceneImageData}
                  imageMimeType={sceneImageMime}
                  uiLanguage={uiLanguage}
                />
              </>
            )}
          </>
        )}

        {appState === APP_STATES.ENDING && (
          <div
            className={`ending ${secretEndingKey ? 'ending--secret' : ''} ${judgeMode ? 'ending--judge' : ''}`}
            style={judgeMode ? { '--judge-ending-accent': judgeEndingAccent } : undefined}
          >
            {judgeMode && (
              <div className="ending__judge-hero">
                <div className="ending__judge-aura ending__judge-aura--outer" aria-hidden="true" />
                <div className="ending__judge-aura ending__judge-aura--inner" aria-hidden="true" />
                <p className="ending__judge-badge">
                  {uiLanguage === 'en' ? 'Judge Finale' : 'نهاية التحكيم'}
                </p>
                <h2 className="ending__judge-shift">{judgeEndingLine}</h2>
                <p className="ending__judge-caption">{judgeEndingCaption}</p>
              </div>
            )}
            {secretEndingKey && (
              <p className="ending__secret-badge">
                {uiLanguage === 'en'
                  ? `Secret Ending Unlocked: ${secretEndingKey.toUpperCase()}`
                  : `نهاية سرية: ${secretEndingKey.toUpperCase()}`}
              </p>
            )}
            <p className="ending__message">{endingMessage}</p>
            <StoryReelExport
              moments={storyMoments}
              uiLanguage={uiLanguage}
              endingMessage={endingMessage}
              emotionJourney={emotionJourney}
            />
            <EmotionJourneyMap
              journey={emotionJourney}
              uiLanguage={uiLanguage}
            />
            {canRestartStory ? (
              <button type="button" className="ending__restart" onClick={handleRestart}>
                {uiText.restart}
              </button>
            ) : (
              <p className="ending__duo-note">
                {uiLanguage === 'en'
                  ? `Waiting for ${duoState.partnerName || 'the host'} to start the next duo journey.`
                  : `بانتظار ${duoState.partnerName || 'المضيف'} لبدء الرحلة الثنائية التالية.`}
              </p>
            )}
          </div>
        )}

        <ToastContainer
          toasts={[
            ...toasts,
            ...(!isConnected ? [{
              id: 'connection-lost',
              type: 'warning',
              message: uiText.reconnecting,
              duration: 10000,
            }] : []),
          ]}
          onDismiss={dismissToast}
        />

        {!(judgeMode && appState === APP_STATES.LANDING) && (
        <div className="audio-hud">
          <button
            type="button"
            className="audio-hud__btn"
            onClick={handleOpenSettings}
            aria-label={uiLanguage === 'en' ? 'Open settings' : 'فتح الإعدادات'}
          >
            {uiLanguage === 'en' ? 'Settings' : 'الإعدادات'}
          </button>
          <button
            type="button"
            className={`audio-hud__btn ${musicEnabled ? 'audio-hud__btn--on' : ''}`}
            onClick={handleToggleMusic}
            aria-label={`${uiText.musicLabel}: ${musicEnabled ? uiText.musicOn : uiText.musicOff}`}
          >
            {uiText.musicLabel}: {musicEnabled ? uiText.musicOn : uiText.musicOff}
          </button>
          <button
            type="button"
            className={`audio-hud__btn ${voiceEnabled ? 'audio-hud__btn--on' : ''}`}
            onClick={handleToggleVoice}
            disabled={!voiceSupported}
            title={!voiceSupported ? uiText.voiceUnavailable : ''}
            aria-label={`${uiText.voiceLabel}: ${voiceEnabled ? uiText.voiceOn : uiText.voiceOff}`}
          >
            {uiText.voiceLabel}: {voiceEnabled ? uiText.voiceOn : uiText.voiceOff}
          </button>
        </div>
        )}

        <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {imageAnnouncement}
        </div>

        <SettingsSheet
          open={settingsOpen}
          uiLanguage={uiLanguage}
          musicEnabled={musicEnabled}
          voiceEnabled={voiceEnabled}
          onToggleMusic={handleToggleMusic}
          onToggleVoice={handleToggleVoice}
          narrationSpeed={narrationSpeed}
          onNarrationSpeedChange={setNarrationSpeed}
          onClose={handleCloseSettings}
          onReset={handleResetSettings}
        />
      </div>
    </div>
  );
}
