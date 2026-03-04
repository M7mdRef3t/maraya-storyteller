import React, { useState, useCallback, useEffect, useRef } from 'react';
import NarrationText from './NarrationText.jsx';
import ChoiceButtons from './ChoiceButtons.jsx';

const REDIRECT_COMMANDS = [
  { id: 'darker', icon: '🔥', label: { ar: 'أغمق', en: 'Darker' }, intensity: 0.55 },
  { id: 'hope', icon: '✨', label: { ar: 'أمل أكثر', en: 'More Hope' }, intensity: 0.60 },
  { id: 'nightmare', icon: '😱', label: { ar: 'كابوس', en: 'Nightmare' }, intensity: 0.85 },
  { id: 'witty', icon: '😂', label: { ar: 'خفيف وساخر', en: 'Light & Witty' }, intensity: 0.70 },
  { id: 'cinematic', icon: '🎬', label: { ar: 'سينمائي بطيء', en: 'Cinematic' }, intensity: 0.65 },
  { id: 'fast', icon: '⚡', label: { ar: 'إيقاع سريع', en: 'Fast-paced' }, intensity: 0.75 },
];

/**
 * SceneRenderer - Orchestrates the cinematic reveal of a single scene.
 *
 * Sequence:
 * 1. Scene image fades in on StoryCanvas (handled externally)
 * 2. Narration text typewriter begins
 * 3. Choice buttons appear after narration completes
 */
export default function SceneRenderer({
  scene,
  onChoose,
  isFinal,
  onNarrationBlock,
  onRedirect,
  narrationSpeed = 45,
  uiLanguage = 'ar',
  sceneWord = 'المشهد',
  staleDroppedCount = 0,
  version = 0,
}) {
  const [showChoices, setShowChoices] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const revealTimerRef = useRef(null);
  const debugTimerRef = useRef(null);
  const finalLabel = uiLanguage === 'en' ? '— End of Journey —' : '— نهاية الرحلة —';

  const progressCurrent = Number.isFinite(scene?.story_scene_number)
    ? scene.story_scene_number
    : (Number.isFinite(scene?.scene_index) ? scene.scene_index + 1 : null);

  const progressTotal = Number.isFinite(scene?.story_total_scenes)
    ? scene.story_total_scenes
    : (Number.isFinite(scene?.total_scenes) ? scene.total_scenes : null);

  useEffect(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setShowChoices(false);
  }, [scene?.scene_id]);

  useEffect(() => () => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    if (debugTimerRef.current) clearTimeout(debugTimerRef.current);
  }, []);

  // Show debug overlay on version change (redirect)
  useEffect(() => {
    if (version > 0) {
      setShowDebug(true);
      if (debugTimerRef.current) clearTimeout(debugTimerRef.current);
      debugTimerRef.current = setTimeout(() => {
        setShowDebug(false);
      }, 3000);
    }
  }, [version]);

  const handleNarrationComplete = useCallback(() => {
    // Delay choice appearance for dramatic effect.
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
    }
    revealTimerRef.current = setTimeout(() => {
      setShowChoices(true);
      revealTimerRef.current = null;
    }, 800);
  }, []);

  if (!scene) return null;

  return (
    <div className="scene-renderer">
      {progressCurrent && progressTotal ? (
        <div className="scene-progress">{sceneWord} {progressCurrent}/{progressTotal}</div>
      ) : null}

      {!isFinal && onRedirect && (
        <div className="live-redirect-bar">
          {REDIRECT_COMMANDS.map(cmd => (
            <button
              key={cmd.id}
              type="button"
              className="live-redirect-btn"
              onClick={() => onRedirect(cmd.label.en, cmd.intensity)}
              title={cmd.label[uiLanguage]}
            >
              {cmd.icon}
            </button>
          ))}
        </div>
      )}

      <NarrationText
        blocks={scene.interleaved_blocks}
        text={scene.narration_ar}
        uiLanguage={uiLanguage}
        onBlockStart={onNarrationBlock}
        onComplete={handleNarrationComplete}
        speed={narrationSpeed}
      />

      {!isFinal ? (
        <ChoiceButtons
          choices={scene.choices}
          uiLanguage={uiLanguage}
          onChoose={onChoose}
          visible={showChoices}
        />
      ) : (
        <div className={`scene-final ${showChoices ? 'scene-final--visible' : ''}`}>
          <p className="scene-final__text">{finalLabel}</p>
        </div>
      )}

      {/* Subtle Debug Overlay for Documentation Proof */}
      <div className={`debug-tag ${showDebug ? 'debug-tag--visible' : ''}`}>
        <span className="debug-tag__version">v{version}</span>
        {staleDroppedCount > 0 && (
          <span className="debug-tag__stale"> • stale_dropped: {staleDroppedCount}</span>
        )}
      </div>
    </div>
  );
}
