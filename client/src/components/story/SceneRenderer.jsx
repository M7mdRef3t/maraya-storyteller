import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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

function getDuoMessage(uiLanguage, duoState) {
  if (!duoState || duoState.role === 'solo') return '';
  if (duoState.status === 'reconnecting') {
    return uiLanguage === 'en'
      ? `Waiting for ${duoState.partnerName || 'your partner'} to reconnect.`
      : `بانتظار ${duoState.partnerName || 'شريكك'} ليعيد الاتصال.`;
  }
  if (duoState.mismatch) {
    return uiLanguage === 'en'
      ? 'Votes are split. Align on one path to move forward.'
      : 'الأصوات منقسمة. اتفقوا على مسار واحد للمتابعة.';
  }
  if (duoState.selectedChoiceIndex != null && duoState.readyCount < duoState.requiredVotes) {
    return uiLanguage === 'en'
      ? `Your vote is in. Waiting for ${duoState.partnerName || 'your partner'}.`
      : `تم تسجيل صوتك. بانتظار ${duoState.partnerName || 'شريكك'}.`;
  }
  if (duoState.readyCount > 0 && duoState.selectedChoiceIndex == null) {
    return uiLanguage === 'en'
      ? `${duoState.partnerName || 'Your partner'} has voted.`
      : `قام ${duoState.partnerName || 'شريكك'} بالتصويت.`;
  }
  return uiLanguage === 'en'
    ? 'Choose together to unlock the next scene.'
    : 'اختارا معاً لفتح المشهد التالي.';
}

/**
 * SceneRenderer - Orchestrates the cinematic reveal of a single scene.
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
  judgeMode = false,
  duoState = null,
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

  const voteCounts = useMemo(() => {
    const next = {};
    for (const vote of duoState?.votes || []) {
      if (typeof vote.choiceIndex === 'number') {
        next[vote.choiceIndex] = (next[vote.choiceIndex] || 0) + 1;
      }
    }
    return next;
  }, [duoState?.votes]);

  const redirectCommands = useMemo(() => (
    judgeMode
      ? REDIRECT_COMMANDS.filter((cmd) => ['darker', 'hope', 'cinematic'].includes(cmd.id))
      : REDIRECT_COMMANDS
  ), [judgeMode]);

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
        <div className={`live-redirect-shell ${judgeMode ? 'live-redirect-shell--judge' : ''}`}>
          {judgeMode && (
            <p className="judge-story-cue">
              {uiLanguage === 'en'
                ? 'WOW moment: change the scene live while the narration is unfolding.'
                : 'لحظة الإبهار: غيّر المشهد حيّاً أثناء انكشاف السرد.'}
            </p>
          )}
          <div className="live-redirect-bar">
            {redirectCommands.map((cmd) => (
              <button
                key={cmd.id}
                type="button"
                className={`live-redirect-btn ${judgeMode ? 'live-redirect-btn--judge' : ''}`}
                onClick={() => onRedirect(cmd.label.en, cmd.intensity)}
                title={cmd.label[uiLanguage]}
              >
                <span className="live-redirect-btn__icon">{cmd.icon}</span>
                {judgeMode && <span className="live-redirect-btn__label">{cmd.label[uiLanguage]}</span>}
              </button>
            ))}
          </div>
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

      {!isFinal && duoState?.role !== 'solo' && (
        <div className={`duo-scene-status ${duoState?.mismatch ? 'duo-scene-status--warning' : ''}`}>
          {getDuoMessage(uiLanguage, duoState)}
        </div>
      )}

      {!isFinal ? (
        <ChoiceButtons
          choices={scene.choices}
          uiLanguage={uiLanguage}
          onChoose={onChoose}
          visible={showChoices}
          selectedIndex={duoState?.selectedChoiceIndex ?? null}
          voteCounts={voteCounts}
        />
      ) : (
        <div className={`scene-final ${showChoices ? 'scene-final--visible' : ''}`}>
          <p className="scene-final__text">{finalLabel}</p>
        </div>
      )}

      <div className={`debug-tag ${showDebug ? 'debug-tag--visible' : ''}`}>
        <span className="debug-tag__version">v{version}</span>
        {staleDroppedCount > 0 && (
          <span className="debug-tag__stale"> • stale_dropped: {staleDroppedCount}</span>
        )}
      </div>
    </div>
  );
}
