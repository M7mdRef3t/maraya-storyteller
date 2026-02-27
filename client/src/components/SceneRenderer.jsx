import React, { useState, useCallback, useEffect, useRef } from 'react';
import NarrationText from './NarrationText.jsx';
import ChoiceButtons from './ChoiceButtons.jsx';

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
  uiLanguage = 'ar',
  sceneWord = 'المشهد',
}) {
  const [showChoices, setShowChoices] = useState(false);
  const revealTimerRef = useRef(null);
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
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

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

      <NarrationText
        blocks={scene.interleaved_blocks}
        text={scene.narration_ar}
        uiLanguage={uiLanguage}
        onBlockStart={onNarrationBlock}
        onComplete={handleNarrationComplete}
        speed={45}
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
    </div>
  );
}
