import React, { useState } from 'react';
import { EMOTIONS, STORY_MODES } from '../utils/constants.js';

/**
 * EmotionPicker - Landing screen with emotion and mode selection.
 */
export default function EmotionPicker({
  mode,
  uiLanguage,
  uiText,
  musicEnabled,
  voiceEnabled,
  voiceSupported,
  onModeChange,
  onToggleMusic,
  onToggleVoice,
  onSelectEmotion,
  onUploadSpace,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="emotion-picker">
      <div className="emotion-picker__header">
        <h1 className="emotion-picker__title">{uiText.title}</h1>
        <p className="emotion-picker__subtitle">{uiText.subtitle}</p>
      </div>

      <div className="emotion-picker__controls">
        <label className="emotion-picker__mode-label" htmlFor="story-mode-select">
          {uiText.modeLabel}
        </label>
        <select
          id="story-mode-select"
          className="emotion-picker__mode-select"
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
        >
          {STORY_MODES.map((item) => (
            <option key={item.id} value={item.id}>
              {uiLanguage === 'en' ? item.label_en : item.label_ar}
            </option>
          ))}
        </select>

        <div className="emotion-picker__voice">
          <span className="emotion-picker__voice-label">{uiText.musicLabel}</span>
          <button
            type="button"
            className={`emotion-picker__voice-toggle ${
              musicEnabled ? 'emotion-picker__voice-toggle--on' : ''
            }`}
            onClick={onToggleMusic}
          >
            {musicEnabled ? uiText.musicOn : uiText.musicOff}
          </button>
        </div>

        <div className="emotion-picker__voice">
          <span className="emotion-picker__voice-label">{uiText.voiceLabel}</span>
          <button
            type="button"
            className={`emotion-picker__voice-toggle ${
              voiceEnabled ? 'emotion-picker__voice-toggle--on' : ''
            }`}
            onClick={onToggleVoice}
            disabled={!voiceSupported}
            title={!voiceSupported ? uiText.voiceUnavailable : ''}
          >
            {voiceEnabled ? uiText.voiceOn : uiText.voiceOff}
          </button>
        </div>
      </div>

      <div className="emotion-picker__grid">
        {EMOTIONS.map((emotion) => (
          <button
            key={emotion.id}
            className={`emotion-card ${hoveredId === emotion.id ? 'emotion-card--active' : ''}`}
            style={{
              '--card-color': emotion.color,
              '--card-gradient': emotion.gradient,
            }}
            onMouseEnter={() => setHoveredId(emotion.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectEmotion(emotion.id)}
          >
            <span className="emotion-card__icon">{emotion.icon}</span>
            <span className="emotion-card__label">{uiLanguage === 'en' ? emotion.label_en : emotion.label}</span>
          </button>
        ))}
      </div>

      <button className="emotion-picker__upload" onClick={onUploadSpace}>
        <span className="emotion-picker__upload-icon">📷</span>
        <span>{uiText.uploadSpace}</span>
      </button>
    </div>
  );
}
