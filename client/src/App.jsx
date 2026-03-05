import React, { useEffect, useRef, useState } from 'react';
import StoryCanvas from './components/StoryCanvas.jsx';
import EmotionPicker from './components/emotion/EmotionPicker.jsx';
import SpaceUpload from './components/SpaceUpload.jsx';
import SceneRenderer from './components/story/SceneRenderer.jsx';
import LoadingMirror from './components/layout/LoadingMirror.jsx';
import Transcript from './components/Transcript.jsx';
import BrandMark from './components/BrandMark.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import OnboardingCarousel from './components/OnboardingCarousel.jsx';
import SettingsSheet from './components/layout/SettingsSheet.jsx';
import { ToastContainer } from './components/ui/Toast.jsx';
import useStoryLogic from './hooks/useStoryLogic.js';
import { APP_STATES } from './utils/constants.js';

export default function App() {
  const canvasRef = useRef(null);
  const [imageAnnouncement, setImageAnnouncement] = useState('');

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
  } = useStoryLogic(canvasRef);

  useEffect(() => {
    if (!currentScene) return;
    const alt = currentScene.visual_desc || currentScene.visual_prompt || currentScene.narration_ar || '';
    const prefix = uiLanguage === 'en' ? 'New scene generated: ' : 'تم توليد مشهد جديد: ';
    if (alt.trim()) {
      setImageAnnouncement(`${prefix}${alt}`);
    }
  }, [currentScene, uiLanguage]);

  return (
    <div className="app app--maraya" dir={uiLanguage === 'en' ? 'ltr' : 'rtl'}>
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
          <LoadingMirror statusText={statusText} uiLanguage={uiLanguage} />
        )}

        {appState === APP_STATES.STORY && (
          <>
            <Transcript
              blocks={transcript}
              uiLanguage={uiLanguage}
              visible={true}
            />
            {currentScene && (
              <SceneRenderer
                scene={currentScene}
                uiLanguage={uiLanguage}
                sceneWord={uiText.sceneWord}
                onNarrationBlock={handleNarrationBlock}
                onChoose={handleChoose}
                onRedirect={handleRedirect}
                narrationSpeed={narrationSpeed}
                isFinal={currentScene.is_final}
                staleDroppedCount={staleDroppedCount}
                version={lastAcceptedVersion}
              />
            )}
          </>
        )}

        {appState === APP_STATES.ENDING && (
          <div className="ending">
            <p className="ending__message">{endingMessage}</p>
            <button type="button" className="ending__restart" onClick={handleRestart}>
              {uiText.restart}
            </button>
          </div>
        )}

        <ToastContainer
          toasts={!isConnected ? [{
            id: 'connection-lost',
            type: 'warning',
            message: uiText.reconnecting,
            duration: 10000,
          }] : []}
          onDismiss={() => {}}
        />

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
