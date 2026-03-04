import React, { useRef } from 'react';
import StoryCanvas from './components/StoryCanvas.jsx';
import EmotionPicker from './components/EmotionPicker.jsx';
import SpaceUpload from './components/SpaceUpload.jsx';
import SceneRenderer from './components/SceneRenderer.jsx';
import LoadingMirror from './components/LoadingMirror.jsx';
import Transcript from './components/Transcript.jsx';
import BrandMark from './components/BrandMark.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import OnboardingCarousel from './components/OnboardingCarousel.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';
import useStoryLogic from './hooks/useStoryLogic.js';
import { APP_STATES } from './utils/constants.js';

export default function App() {
  const canvasRef = useRef(null);

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

  return (
    <div className="app app--maraya" dir={uiLanguage === 'en' ? 'ltr' : 'rtl'}>
      <StoryCanvas ref={canvasRef} mood={currentMood} isStale={imageStale} />

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

        {!isConnected && [APP_STATES.LOADING, APP_STATES.STORY, APP_STATES.ENDING].includes(appState) && (
          <div className="connection-lost">
            {uiText.reconnecting}
          </div>
        )}

        <div className="audio-hud">
          <button
            type="button"
            className="audio-hud__btn"
            onClick={handleOpenSettings}
          >
            {uiLanguage === 'en' ? 'Settings' : 'الإعدادات'}
          </button>
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
