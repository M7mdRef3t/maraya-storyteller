import React, { useRef, useState } from 'react';
import { EMOTIONS, STORY_MODES } from '../../utils/constants.js';
import BrandMark from '../BrandMark.jsx';

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
  const [selectedId, setSelectedId] = useState(null);
  const optionRefs = useRef([]);

  const handleEmotionKeyDown = (event, index) => {
    const isHorizontalKey = event.key === 'ArrowRight' || event.key === 'ArrowLeft';
    const isVerticalKey = event.key === 'ArrowDown' || event.key === 'ArrowUp';
    if (!isHorizontalKey && !isVerticalKey) return;

    event.preventDefault();
    const total = EMOTIONS.length;
    const columns = window.innerWidth <= 480 ? 2 : 3;
    let nextIndex = index;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % total;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + total) % total;
    if (event.key === 'ArrowDown') nextIndex = (index + columns) % total;
    if (event.key === 'ArrowUp') nextIndex = (index - columns + total) % total;

    const nextEmotion = EMOTIONS[nextIndex];
    setSelectedId(nextEmotion.id);
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="emotion-picker">
      <div className="emotion-picker__header">
        <BrandMark className="emotion-picker__brand" withWordmark />
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
          aria-label={uiText.modeLabel}
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

      <div
        className="emotion-picker__grid"
        role="radiogroup"
        aria-label={uiLanguage === 'en' ? 'Emotion choices' : 'اختيارات المشاعر'}
      >
        {EMOTIONS.map((emotion, index) => (
          <button
            key={emotion.id}
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selectedId === emotion.id}
            tabIndex={selectedId === null ? (index === 0 ? 0 : -1) : (selectedId === emotion.id ? 0 : -1)}
            className={`emotion-card ${(hoveredId === emotion.id || selectedId === emotion.id) ? 'emotion-card--active' : ''}`}
            style={{
              '--card-color': emotion.color,
              '--card-gradient': emotion.gradient,
            }}
            onMouseEnter={() => setHoveredId(emotion.id)}
            onMouseLeave={() => setHoveredId(null)}
            onKeyDown={(event) => handleEmotionKeyDown(event, index)}
            onClick={() => {
              setSelectedId(emotion.id);
              onSelectEmotion(emotion.id);
            }}
          >
            <span className="emotion-card__icon">{emotion.icon}</span>
            <span className="emotion-card__label">{uiLanguage === 'en' ? emotion.label_en : emotion.label}</span>
          </button>
        ))}
      </div>

      <button type="button" className="emotion-picker__upload" onClick={onUploadSpace}>
        <span className="emotion-picker__upload-icon">📷</span>
        <span>{uiText.uploadSpace}</span>
      </button>
    </div>
  );
}

