import React from 'react';

/**
 * ChoiceButtons - Floating glassmorphism interactive choices.
 * Appears at the bottom of the screen after narration completes.
 */
export default function ChoiceButtons({ choices, uiLanguage = 'ar', onChoose, visible }) {
  if (!choices || choices.length === 0 || !visible) return null;

  const arrow = uiLanguage === 'en' ? '→' : '←';

  return (
    <div className={`choice-buttons ${visible ? 'choice-buttons--visible' : ''}`} style={{ pointerEvents: visible ? 'auto' : 'none' }}>
      {choices.map((choice, index) => (
        <button
          key={index}
          type="button"
          className="choice-button"
          onClick={() => onChoose(choice)}
        >
          <span className="choice-button__text">{choice.text_ar}</span>
          <span className="choice-button__arrow">{arrow}</span>
        </button>
      ))}
    </div>
  );
}
