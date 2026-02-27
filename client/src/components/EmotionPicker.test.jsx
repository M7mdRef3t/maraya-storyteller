import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import EmotionPicker from './EmotionPicker';
import { EMOTIONS, STORY_MODES } from '../utils/constants';

// Mock the props
const mockProps = {
  mode: STORY_MODES[0].id,
  uiLanguage: 'en',
  uiText: {
    title: 'Maraya',
    subtitle: 'What are you carrying today?',
    modeLabel: 'Narrative Mode',
    musicLabel: 'Background Music',
    musicOn: 'On',
    musicOff: 'Off',
    voiceLabel: 'Narration Voice',
    voiceOn: 'On',
    voiceOff: 'Off',
    voiceUnavailable: 'Not supported',
    uploadSpace: 'Show me your space',
  },
  musicEnabled: true,
  voiceEnabled: true,
  voiceSupported: true,
  onModeChange: vi.fn(),
  onToggleMusic: vi.fn(),
  onToggleVoice: vi.fn(),
  onSelectEmotion: vi.fn(),
  onUploadSpace: vi.fn(),
};

describe('EmotionPicker', () => {
  it('renders title and subtitle correctly', () => {
    render(<EmotionPicker {...mockProps} />);
    expect(screen.getByText(mockProps.uiText.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.uiText.subtitle)).toBeInTheDocument();
  });

  it('renders all emotion buttons', () => {
    render(<EmotionPicker {...mockProps} />);
    EMOTIONS.forEach((emotion) => {
      const label = mockProps.uiLanguage === 'en' ? emotion.label_en : emotion.label;
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('calls onModeChange when mode is selected', () => {
    render(<EmotionPicker {...mockProps} />);
    const select = screen.getByLabelText(mockProps.uiText.modeLabel);
    fireEvent.change(select, { target: { value: STORY_MODES[1].id } });
    expect(mockProps.onModeChange).toHaveBeenCalledWith(STORY_MODES[1].id);
  });

  it('calls onToggleMusic when music button is clicked', () => {
    render(<EmotionPicker {...mockProps} />);
    // Find the container for music control
    const musicLabel = screen.getByText(mockProps.uiText.musicLabel);
    const musicContainer = musicLabel.closest('.emotion-picker__voice');
    const musicButton = within(musicContainer).getByRole('button');

    fireEvent.click(musicButton);
    expect(mockProps.onToggleMusic).toHaveBeenCalled();
  });

  it('calls onToggleVoice when voice button is clicked', () => {
    render(<EmotionPicker {...mockProps} />);
    // Find the container for voice control
    const voiceLabel = screen.getByText(mockProps.uiText.voiceLabel);
    const voiceContainer = voiceLabel.closest('.emotion-picker__voice');
    const voiceButton = within(voiceContainer).getByRole('button');

    fireEvent.click(voiceButton);
    expect(mockProps.onToggleVoice).toHaveBeenCalled();
  });

  it('disables voice button when voiceSupported is false', () => {
    render(<EmotionPicker {...mockProps} voiceSupported={false} />);
    const voiceLabel = screen.getByText(mockProps.uiText.voiceLabel);
    const voiceContainer = voiceLabel.closest('.emotion-picker__voice');
    const voiceButton = within(voiceContainer).getByRole('button');

    expect(voiceButton).toBeDisabled();
    expect(voiceButton).toHaveAttribute('title', mockProps.uiText.voiceUnavailable);
  });

  it('calls onSelectEmotion when an emotion is clicked', () => {
    render(<EmotionPicker {...mockProps} />);
    const firstEmotion = EMOTIONS[0];
    const label = mockProps.uiLanguage === 'en' ? firstEmotion.label_en : firstEmotion.label;
    const emotionButton = screen.getByText(label).closest('button');
    fireEvent.click(emotionButton);
    expect(mockProps.onSelectEmotion).toHaveBeenCalledWith(firstEmotion.id);
  });

  it('calls onUploadSpace when upload button is clicked', () => {
    render(<EmotionPicker {...mockProps} />);
    const uploadButton = screen.getByText(mockProps.uiText.uploadSpace).closest('button');
    fireEvent.click(uploadButton);
    expect(mockProps.onUploadSpace).toHaveBeenCalled();
  });

  it('displays correct text for music off state', () => {
    render(<EmotionPicker {...mockProps} musicEnabled={false} />);
    expect(screen.getByText(mockProps.uiText.musicOff)).toBeInTheDocument();
  });

  it('displays correct text for voice off state', () => {
    render(<EmotionPicker {...mockProps} voiceEnabled={false} />);
    expect(screen.getByText(mockProps.uiText.voiceOff)).toBeInTheDocument();
  });
});
