import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * NarrationText - interleaved RTL/LTR stream renderer.
 * Supports both legacy single narration text and new interleaved scene blocks.
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
  speed = 50,
}) {
  const normalizedBlocks = useMemo(() => normalizeBlocks(blocks, text), [blocks, text]);
  const labels = KIND_LABELS[uiLanguage] || KIND_LABELS.en;

  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);

  const charIndexRef = useRef(0);
  const rafRef = useRef(null);
  const blockAdvanceTimerRef = useRef(null);
  const completionFiredRef = useRef(false);
  const lastTsRef = useRef(0);
  const carryMsRef = useRef(0);

  const clearTimers = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (blockAdvanceTimerRef.current) {
      clearTimeout(blockAdvanceTimerRef.current);
      blockAdvanceTimerRef.current = null;
    }
  };

  const spanRef = useRef(null);

  useEffect(() => {
    clearTimers();
    setDisplayedText('');
    setIsComplete(false);
    setActiveBlockIndex(0);
    charIndexRef.current = 0;
    completionFiredRef.current = false;
    lastTsRef.current = 0;
    carryMsRef.current = 0;

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

    const typeBlock = (blockIndex) => {
      const block = normalizedBlocks[blockIndex];
      if (!block) {
        finishAll();
        return;
      }

      setActiveBlockIndex(blockIndex);
      // Don't spam React state, wipe the DOM node instead if available.
      if (spanRef.current) {
        spanRef.current.textContent = '';
      }
      charIndexRef.current = 0;
      lastTsRef.current = 0;
      carryMsRef.current = 0;

      onBlockStart?.({
        index: blockIndex,
        kind: block.kind,
        text_ar: block.text_ar,
      });

      const blockText = block.text_ar;
      const intervalMs = Math.max(18, speed);
      const chunkSize = blockText.length > 220 ? 3 : blockText.length > 140 ? 2 : 1;

      const tick = (ts) => {
        if (!spanRef.current) {
          // Skip if unmounted during loop
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (!lastTsRef.current) {
          lastTsRef.current = ts;
        }

        const elapsed = ts - lastTsRef.current;
        lastTsRef.current = ts;
        carryMsRef.current += elapsed;

        const steps = Math.floor(carryMsRef.current / intervalMs);
        if (steps > 0) {
          carryMsRef.current -= steps * intervalMs;

          const nextIndex = Math.min(blockText.length, charIndexRef.current + (steps * chunkSize));
          if (nextIndex !== charIndexRef.current) {
            charIndexRef.current = nextIndex;
            // First Principles: Update DOM directly. Bypasses React reconciliation tree entirely.
            spanRef.current.textContent = blockText.slice(0, nextIndex);
          }

          if (nextIndex >= blockText.length) {
            rafRef.current = null;
            setDisplayedText(blockText); // Sync state once at end

            if (blockIndex >= normalizedBlocks.length - 1) {
              setActiveBlockIndex(normalizedBlocks.length);
              finishAll();
              return;
            }

            blockAdvanceTimerRef.current = setTimeout(() => {
              typeBlock(blockIndex + 1);
            }, 320);
            return;
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    typeBlock(0);

    return () => {
      clearTimers();
    };
  }, [normalizedBlocks, speed, onComplete, onBlockStart]);

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

  const activeBlock = !isComplete ? normalizedBlocks[activeBlockIndex] : null;

  return (
    <div className="narration-text" onClick={handleClick}>
      <div className="narration-text__stack">
        {completedBlocks.map((block, idx) => (
          <p key={`${block.kind}_${idx}`} className={`narration-text__block narration-text__block--${block.kind}`}>
            <span className="narration-text__label">{labels[block.kind] || labels.narration}</span>
            <span className="narration-text__content">{block.text_ar}</span>
          </p>
        ))}

        {activeBlock && (
          <p className={`narration-text__block narration-text__block--${activeBlock.kind}`}>
            <span className="narration-text__label">{labels[activeBlock.kind] || labels.narration}</span>
            <span className="narration-text__content">
              <span ref={spanRef}>{displayedText}</span>
              {!isComplete && <span className="narration-text__cursor">|</span>}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
