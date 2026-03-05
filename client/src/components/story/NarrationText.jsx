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
      return () => {};
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

  const completedBlocks = isComplete
    ? normalizedBlocks
    : normalizedBlocks.slice(0, activeBlockIndex);
  const visibleCompletedBlocks = completedBlocks.slice(-3);

  const activeBlock = !isComplete ? normalizedBlocks[activeBlockIndex] : null;

  return (
    <div className="narration-text" onClick={handleClick} aria-live="polite" aria-atomic="false">
      <div className="narration-text__stack" style={{ transition: 'all 0.5s ease-out' }}>
        {visibleCompletedBlocks.map((block, idx) => (
          <p
            key={`${block.kind}_${idx}`}
            className={`narration-text__block narration-text__block--${block.kind}`}
            style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            <span className="narration-text__label">{labels[block.kind] || labels.narration}</span>
            <span className="narration-text__content">{block.text_ar}</span>
          </p>
        ))}

        {activeBlock && (
          <p
            className={`narration-text__block narration-text__block--${activeBlock.kind}`}
            style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            <span className="narration-text__label">{labels[activeBlock.kind] || labels.narration}</span>
            <span className="narration-text__content">
              {activeBlock.text_ar.split(' ').map((word, wIdx) => (
                <React.Fragment key={wIdx}>
                  <span
                    style={{
                      opacity: wIdx < activeWordCount ? 1 : 0,
                      filter: wIdx < activeWordCount ? 'blur(0px)' : 'blur(4px)',
                      transform: wIdx < activeWordCount ? 'translateY(0)' : 'translateY(2px)',
                      transition: 'opacity 0.6s ease, filter 0.6s ease, transform 0.6s ease',
                      display: 'inline-block',
                    }}
                  >
                    {word}
                  </span>{' '}
                </React.Fragment>
              ))}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
