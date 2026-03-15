import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App, { buildJudgeFinaleStingProfile } from './App.jsx';
import { APP_STATES } from './utils/constants.js';

const mockUseStoryLogic = vi.fn();

vi.mock('./hooks/useStoryLogic.js', () => ({
  default: (...args) => mockUseStoryLogic(...args),
}));

vi.mock('./components/StoryCanvas.jsx', () => ({
  default: React.forwardRef(function MockStoryCanvas(_, ref) {
    return <div ref={ref} data-testid="story-canvas" />;
  }),
}));

vi.mock('./components/emotion/EmotionPicker.jsx', () => ({ default: () => <div /> }));
vi.mock('./components/SpaceUpload.jsx', () => ({ default: () => <div /> }));
vi.mock('./components/story/SceneRenderer.jsx', () => ({ default: () => <div /> }));
vi.mock('./components/story/SceneCardShare.jsx', () => ({ default: () => <div /> }));
vi.mock('./components/story/StoryReelExport.jsx', () => ({ default: () => <div>Story Reel Export</div> }));
vi.mock('./components/story/EmotionJourneyMap.jsx', () => ({ default: () => <div>Emotion Journey Map</div> }));
vi.mock('./components/layout/LoadingMirror.jsx', () => ({ default: () => <div /> }));
vi.mock('./components/Transcript.jsx', () => ({ default: () => <div /> }));
vi.mock('./components/BrandMark.jsx', () => ({ default: () => <div>Brand</div> }));
vi.mock('./components/SplashScreen.jsx', () => ({ default: () => <div /> }));
vi.mock('./components/OnboardingCarousel.jsx', () => ({ default: () => <div /> }));
vi.mock('./components/layout/SettingsSheet.jsx', () => ({ default: () => null }));
vi.mock('./components/ui/Toast.jsx', () => ({ ToastContainer: () => null }));

function createHookState() {
  return {
    appState: APP_STATES.ENDING,
    showSpaceUpload: false,
    setShowSpaceUpload: vi.fn(),
    statusText: '',
    currentScene: {
      scene_id: 'scene_3',
      story_scene_number: 3,
      is_final: true,
    },
    currentMood: 'hopeful_strings',
    endingMessage: 'You reached a bright threshold the mirror will remember.',
    spaceReading: '',
    spaceMyth: '',
    transcript: [],
    storyMode: 'judge_en',
    musicEnabled: true,
    voiceEnabled: true,
    biometricsEnabled: false,
    spatialModeEnabled: false,
    settingsOpen: false,
    narrationSpeed: 45,
    voiceSupported: true,
    uiLanguage: 'en',
    uiText: {
      title: 'Maraya',
      subtitle: 'Subtitle',
      restart: 'Start a New Journey',
      reconnecting: 'Reconnecting...',
      musicLabel: 'Background Music',
      musicOn: 'On',
      musicOff: 'Off',
      voiceLabel: 'Narration Voice',
      voiceOn: 'On',
      voiceOff: 'Off',
      voiceUnavailable: 'Unavailable',
      sceneWord: 'Scene',
    },
    isConnected: true,
    handleNarrationBlock: vi.fn(),
    handleSelectEmotion: vi.fn(),
    handleUploadSpace: vi.fn(),
    handleChoose: vi.fn(),
    handleRedirect: vi.fn(),
    handleRestart: vi.fn(),
    handleModeChange: vi.fn(),
    handleToggleVoice: vi.fn(),
    handleToggleMusic: vi.fn(),
    handleToggleBiometrics: vi.fn(),
    handleToggleSpatialMode: vi.fn(),
    setNarrationSpeed: vi.fn(),
    handleOpenSettings: vi.fn(),
    handleCloseSettings: vi.fn(),
    handleResetSettings: vi.fn(),
    imageStale: false,
    staleDroppedCount: 0,
    lastAcceptedVersion: 3,
    onboardingIndex: 0,
    handleOnboardingNext: vi.fn(),
    handleOnboardingBack: vi.fn(),
    handleOnboardingSkip: vi.fn(),
    emotionJourney: ['confusion', 'hope'],
    sceneImageData: null,
    sceneImageMime: null,
    secretEndingKey: null,
    mirrorMemory: null,
    storyMoments: [],
    lastWhisperText: 'I feel lost, but I want to find hope.',
    whisperInterpretation: {
      reflection: 'Whatever is still reaching for light in you is already alive.',
    },
    whisperInput: {
      isSupported: true,
      isListening: false,
      start: vi.fn(),
      stop: vi.fn(),
    },
    duoState: {
      role: 'solo',
      roomId: '',
      partnerName: '',
      readyCount: 0,
    },
    duoJoinCode: '',
    toasts: [],
    canStartStory: true,
    canRestartStory: true,
    handleStartJudgeJourney: vi.fn(),
    handleDuoNameChange: vi.fn(),
    handleDuoJoinCodeChange: vi.fn(),
    handleHostDuo: vi.fn(),
    handleJoinDuo: vi.fn(),
    handleLeaveDuo: vi.fn(),
    dismissToast: vi.fn(),
    setMusicVolume: vi.fn(),
  };
}

describe('App judge finale voice cue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.pushState({}, '', '/?judge=1');

    class MockUtterance {
      constructor(text) {
        this.text = text;
        this.lang = 'en-US';
        this.rate = 1;
        this.pitch = 1;
      }
    }

    window.SpeechSynthesisUtterance = MockUtterance;
    window.speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
    };

    mockUseStoryLogic.mockReturnValue(createHookState());
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('speaks the judge finale transformation line at the ending', () => {
    render(<App />);

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(window.speechSynthesis.speak.mock.calls[0][0].text).toBe(
      'Transformation complete. From confusion to hope.',
    );
  });

  it('varies the musical sting profile by emotional transformation', () => {
    expect(buildJudgeFinaleStingProfile('confusion', 'hope')).toEqual(
      expect.objectContaining({
        freqs: [196, 293.66, 440, 659.25],
      }),
    );

    expect(buildJudgeFinaleStingProfile('hope', 'wonder')).toEqual(
      expect.objectContaining({
        freqs: [261.63, 392, 523.25, 783.99],
      }),
    );
  });

  it('holds the ending in afterglow before revealing restart actions', () => {
    render(<App />);

    expect(screen.getByText('Proof of Transformation')).not.toBeNull();
    expect(screen.getByText('What entered as confusion left as hope.')).not.toBeNull();
    expect(screen.getByText('Let the afterglow settle before you carry it onward.')).not.toBeNull();
    expect(screen.queryByText('Start a New Journey')).toBeNull();
    expect(screen.queryByText('Story Reel Export')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('Start a New Journey')).not.toBeNull();
    expect(screen.getByText('Story Reel Export')).not.toBeNull();
    expect(screen.queryByText('Let the afterglow settle before you carry it onward.')).toBeNull();
  });
});
