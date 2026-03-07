import React, { useState, useEffect, useRef, useMemo } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion.js';

/**
 * NarrationText - interleaved RTL/LTR stream renderer.
 * Upgraded to use cinematic soft-fading transitions instead of rigid typewriters.
 */
const KIND_LABELS = {
  ar: {
    narration: 'السرد',
    visual: 'الصورة',
    reflection: 'الصدى',
  },
  en: {
    narration: 'Narration',
    visual: 'Visual',
    reflection: 'Reflection',
  },
};

function normalizeBlocks(blocks, fallbackText) {
  if (Array.isArray(blocks) && blocks.length > 0) {
    const normalized = blocks
      .map((block) => {
        if (!block || typeof block !== 'object') return null;
        const kind = ['narration', 'visual', 'reflection'].includes(block.kind) ? block.kind : 'narration';
        const textAr = typeof block.text_ar === 'string' ? block.text_ar.trim() : '';
        if (!textAr) return null;
        return { kind, text_ar: textAr };
      })
      .filter(Boolean)
      .slice(0, 5);

    if (normalized.length > 0) return normalized;
  }

  const fallback = typeof fallbackText === 'string' ? fallbackText.trim() : '';
  if (!fallback) return [];
  return [{ kind: 'narration', text_ar: fallback }];
}

export default function NarrationText({
  text,
  blocks,
  uiLanguage = 'ar',
  onComplete,
  onBlockStart,
  speed = 45,
}) {
  const prefersReducedMotion = useReducedMotion();
  const normalizedBlocks = useMemo(() => normalizeBlocks(blocks, text), [blocks, text]);
  const labels = KIND_LABELS[uiLanguage] || KIND_LABELS.en;

  const [isComplete, setIsComplete] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [activeWordCount, setActiveWordCount] = useState(0);

  const timerRef = useRef(null);
  const completionFiredRef = useRef(false);

  const clearTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    clearTimers();
    setIsComplete(false);
    setActiveBlockIndex(0);
    setActiveWordCount(0);
    completionFiredRef.current = false;

    if (!normalizedBlocks.length) {
      setIsComplete(true);
      if (!completionFiredRef.current) {
        completionFiredRef.current = true;
        onComplete?.();
      }
      return () => { };
    }

    const finishAll = () => {
      setIsComplete(true);
      if (!completionFiredRef.current) {
        completionFiredRef.current = true;
        onComplete?.();
      }
    };

    const playBlock = (blockIndex) => {
      const block = normalizedBlocks[blockIndex];
      if (!block) {
        finishAll();
        return;
      }

      setActiveBlockIndex(blockIndex);
      setActiveWordCount(0);

      onBlockStart?.({
        index: blockIndex,
        kind: block.kind,
        text_ar: block.text_ar,
      });

      const words = block.text_ar.split(' ');
      const totalWords = words.length;
      const intervalMs = prefersReducedMotion ? 1 : Math.max(30, speed + (totalWords > 30 ? -10 : 0));

      timerRef.current = setInterval(() => {
        setActiveWordCount((prev) => {
          const next = prev + 1;
          if (next >= totalWords) {
            clearInterval(timerRef.current);

            setTimeout(() => {
              if (blockIndex >= normalizedBlocks.length - 1) {
                setActiveBlockIndex(normalizedBlocks.length);
                finishAll();
              } else {
                playBlock(blockIndex + 1);
              }
            }, prefersReducedMotion ? 0 : 600);
          }
          return next;
        });
      }, intervalMs);
    };

    playBlock(0);

    return () => {
      clearTimers();
    };
  }, [normalizedBlocks, speed, onComplete, onBlockStart, prefersReducedMotion]);

  const handleClick = () => {
    if (!isComplete && normalizedBlocks.length > 0) {
      clearTimers();
      setActiveBlockIndex(normalizedBlocks.length);
      setIsComplete(true);
      if (!completionFiredRef.current) {
        completionFiredRef.current = true;
        onComplete?.();
      }
    }
  };

  // C4: Limit to showing only the active block or the single most recent completed one
  // to ensure a focused, sequential reading experience as per design critique.
  const activeBlock = normalizedBlocks[activeBlockIndex];
  const completedBlocks = normalizedBlocks.slice(0, activeBlockIndex);
  const displayBlock = activeBlock || (completedBlocks.length > 0 ? completedBlocks[completedBlocks.length - 1] : null);

  return (
    <div className="narration-text" onClick={handleClick} aria-live="polite" aria-atomic="false">
      <div className="narration-text__stack" style={{ transition: 'all 0.5s var(--ease-spring)' }}>
        {displayBlock && (
          <p
            key={activeBlock ? `active_${activeBlockIndex}` : `last_${completedBlocks.length}`}
            className={`narration-text__block narration-text__block--${displayBlock.kind}`}
            style={{
              animation: 'fadeInUp 0.8s var(--ease-spring)',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span className="narration-text__label">{labels[displayBlock.kind] || labels.narration}</span>
            <span className="narration-text__content">
              {activeBlock ? (
                displayBlock.text_ar.split(' ').map((word, wIdx) => (
                  <React.Fragment key={wIdx}>
                    <span
                      style={{
                        opacity: wIdx < activeWordCount ? 1 : 0,
                        filter: wIdx < activeWordCount ? 'blur(0px)' : 'blur(4px)',
                        transform: wIdx < activeWordCount ? 'translateY(0) scale(1)' : 'translateY(4px) scale(0.9)',
                        fontVariationSettings: wIdx < activeWordCount ? '"wght" var(--font-wght)' : '"wght" 200',
                        transition: 'opacity 0.6s var(--ease-spring), filter 0.6s var(--ease-spring), transform 0.6s var(--ease-spring), font-variation-settings 0.8s var(--ease-spring)',
                        display: 'inline-block',
                      }}
                    >
                      {word}
                    </span>{' '}
                  </React.Fragment>
                ))
              ) : (
                displayBlock.text_ar
              )}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
