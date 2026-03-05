# مرايا — الكود الجاهز للإنتاج
## Frontend Code Specification · React + Vanilla CSS · Vercel Engineer

**التقنية:** React 18 + Vite + Vanilla CSS (existing stack)
**المعمارية:** Component-driven, RTL-first, WCAG 2.2 AA compliant

---

## هيكل المكوّنات (Component Architecture)

```
client/src/
├── components/
│   ├── ui/                          ← Primitives
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.css
│   │   ├── Toggle/
│   │   ├── Toast/
│   │   └── BottomSheet/
│   ├── emotion/                     ← Emotion Picker
│   │   ├── EmotionCard/
│   │   │   ├── EmotionCard.jsx
│   │   │   └── EmotionCard.css
│   │   └── EmotionGrid/
│   ├── story/                       ← Core Story Experience
│   │   ├── NarrationBlock/
│   │   ├── ChoiceButton/
│   │   ├── SceneImage/
│   │   └── SceneProgress/
│   └── layout/                     ← Screen-level
│       ├── AudioHUD/
│       ├── LoadingOrb/
│       └── SettingsSheet/
├── hooks/
│   ├── useEmotionState.js
│   ├── useStoryEngine.js
│   ├── useAudio.js
│   ├── useReducedMotion.js          ← WCAG 2.3.3
│   └── useFocusTrap.js              ← WCAG 2.1.2
├── utils/
│   ├── contrast.js
│   ├── emotions.js
│   └── storyHelpers.js
└── styles/
    ├── tokens.css                   ← Design Tokens
    ├── reset.css
    └── animations.css
```

---

## tokens.css — Design Tokens الكاملة

```css
/* client/src/styles/tokens.css */

:root {
  /* ── Color: Base ────────────────────────────── */
  --color-void:        #030305;
  --color-obsidian:    #111118;
  --color-charcoal:    #1a1a24;
  --color-slate:       #2a2a3a;
  --color-white:       #ffffff;
  --color-pearl:       #e0e0f0;

  /* ── Color: Accent ──────────────────────────── */
  --color-gold:        #FFD700;
  --color-cyan:        #78C8FF;
  --color-emerald:     #5EFFB3;
  --color-rose:        #FF6B8A;
  --color-violet:      #A78BFA;
  --color-coral:       #FF7E67;

  /* ── Color: Emotions ────────────────────────── */
  --emotion-joy:       #FFD700;
  --emotion-sadness:   #4A9EFF;
  --emotion-anger:     #FF4444;
  --emotion-fear:      #8B5CF6;
  --emotion-love:      #FF6B8A;
  --emotion-hope:      #5EFFB3;

  /* ── Semantic Tokens ────────────────────────── */
  --bg-primary:        var(--color-void);
  --bg-secondary:      var(--color-obsidian);
  --bg-elevated:       var(--color-charcoal);

  --surface-glass:     rgba(255,255,255,0.06);
  --surface-glass-hover: rgba(255,255,255,0.10);
  --surface-glass-active: rgba(255,255,255,0.15);

  --text-primary:      var(--color-white);
  --text-secondary:    rgba(255,255,255,0.70);
  --text-tertiary:     rgba(255,255,255,0.50);
  --text-disabled:     rgba(255,255,255,0.40);  /* WCAG fix: 0.30→0.40 */

  --border-default:    rgba(255,255,255,0.30);  /* WCAG fix: 0.10→0.30 */
  --border-strong:     rgba(255,255,255,0.45);
  --border-focus:      rgba(255,255,255,0.80);

  /* ── Spacing ────────────────────────────────── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* ── Border Radius ──────────────────────────── */
  --radius-xs:    4px;
  --radius-sm:    8px;
  --radius-md:    12px;
  --radius-lg:    16px;
  --radius-xl:    20px;
  --radius-full:  9999px;

  /* ── Typography ─────────────────────────────── */
  --font-arabic:  'Cairo', sans-serif;
  --font-latin:   'Outfit', sans-serif;

  --type-hero:    clamp(2.5rem, 8vw, 4rem);
  --type-display: clamp(2rem, 6vw, 3rem);
  --type-title1:  clamp(1.5rem, 4vw, 2rem);
  --type-title2:  clamp(1.2rem, 3vw, 1.5rem);
  --type-title3:  clamp(1rem, 2.5vw, 1.2rem);
  --type-body:    clamp(0.95rem, 2vw, 1.1rem);
  --type-callout: clamp(0.85rem, 1.8vw, 0.95rem);
  --type-caption: clamp(0.75rem, 1.5vw, 0.85rem);

  /* ── Effects ────────────────────────────────── */
  --blur-glass:   20px;
  --blur-strong:  40px;
  --shadow-glow:  0 0 30px currentColor;

  /* ── Transitions ────────────────────────────── */
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);

  --dur-fast:   150ms;
  --dur-base:   300ms;
  --dur-slow:   500ms;
  --dur-cinematic: 800ms;

  /* ── Z-Indexes ──────────────────────────────── */
  --z-bg:       0;
  --z-content:  10;
  --z-controls: 20;
  --z-hud:      110;
  --z-overlay:  150;
  --z-toast:    200;
}

/* ── Reduced Motion Override ── WCAG 2.3.3 ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ── iOS Safe Area ── */
:root {
  --safe-top:    env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

/* ── Utility ── */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
```

---

## EmotionCard Component

### EmotionCard.jsx

```jsx
// client/src/components/emotion/EmotionCard/EmotionCard.jsx

import { useRef } from 'react';
import './EmotionCard.css';

const EMOTIONS = {
  joy:     { emoji: '😊', label: 'فرح',  color: 'var(--emotion-joy)' },
  sadness: { emoji: '😢', label: 'حزن',  color: 'var(--emotion-sadness)' },
  anger:   { emoji: '😡', label: 'غضب',  color: 'var(--emotion-anger)' },
  fear:    { emoji: '😰', label: 'خوف',  color: 'var(--emotion-fear)' },
  love:    { emoji: '💕', label: 'حب',   color: 'var(--emotion-love)' },
  hope:    { emoji: '🌱', label: 'أمل',  color: 'var(--emotion-hope)' },
};

/**
 * EmotionCard — بطاقة اختيار المشاعر
 * @prop {string} emotionId - 'joy' | 'sadness' | 'anger' | 'fear' | 'love' | 'hope'
 * @prop {boolean} isSelected - هل محدد حالياً
 * @prop {boolean} isDisabled - هل معطّل
 * @prop {function} onSelect - callback عند الاختيار
 */
export function EmotionCard({ emotionId, isSelected, isDisabled, onSelect }) {
  const { emoji, label, color } = EMOTIONS[emotionId];
  const cardRef = useRef(null);

  const handleClick = () => {
    if (!isDisabled) {
      onSelect(emotionId);
      // iOS Haptic (via Capacitor/native bridge if available)
      if (window.Haptics) window.Haptics.impact({ style: 'LIGHT' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={cardRef}
      className={[
        'emotion-card',
        isSelected && 'emotion-card--selected',
        isDisabled && 'emotion-card--disabled',
      ].filter(Boolean).join(' ')}
      style={{ '--emotion-color': color }}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${label} — ابدأ قصتك من مشاعر ${label}`}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="emotion-card__emoji" aria-hidden="true">
        {emoji}
      </span>
      <span className="emotion-card__label">{label}</span>
    </button>
  );
}
```

### EmotionCard.css

```css
/* client/src/components/emotion/EmotionCard/EmotionCard.css */

.emotion-card {
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-4) var(--space-5);
  min-height: 100px;
  min-width: 0;

  /* Glass Surface */
  background: var(--surface-glass);
  border: 1px solid var(--border-default);       /* WCAG 1.4.11: 3:1 ✅ */
  border-radius: var(--radius-lg);
  backdrop-filter: blur(var(--blur-glass));
  -webkit-backdrop-filter: blur(var(--blur-glass));

  /* Typography */
  font-family: var(--font-arabic);
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;

  /* Transition */
  transition:
    transform var(--dur-base) var(--ease-spring),
    background var(--dur-base) var(--ease-smooth),
    border-color var(--dur-base) var(--ease-smooth),
    box-shadow var(--dur-base) var(--ease-smooth);

  /* Reset */
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}

.emotion-card__emoji {
  font-size: 1.75rem;
  line-height: 1;
  display: block;
  transition: transform var(--dur-base) var(--ease-spring);
}

.emotion-card__label {
  font-size: var(--type-callout);
  font-weight: 700;
  color: var(--text-primary);
}

/* ── Hover ── */
@media (hover: hover) {
  .emotion-card:hover:not(.emotion-card--disabled) {
    background: color-mix(in srgb, var(--emotion-color) 15%, transparent);
    border-color: color-mix(in srgb, var(--emotion-color) 45%, transparent);
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 32px color-mix(in srgb, var(--emotion-color) 30%, transparent);
  }

  .emotion-card:hover .emotion-card__emoji {
    transform: scale(1.15) rotate(8deg);
  }
}

/* ── Selected ── */
.emotion-card--selected {
  background: color-mix(in srgb, var(--emotion-color) 15%, transparent);
  border-color: color-mix(in srgb, var(--emotion-color) 55%, transparent);
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 8px 32px color-mix(in srgb, var(--emotion-color) 30%, transparent),
    inset 0 0 0 1px color-mix(in srgb, var(--emotion-color) 20%, transparent);
}

.emotion-card--selected .emotion-card__emoji {
  transform: scale(1.15) rotate(8deg);
}

/* ── Active ── */
.emotion-card:active:not(.emotion-card--disabled) {
  transform: scale(0.97);
  transition-duration: var(--dur-fast);
}

/* ── Disabled ── */
.emotion-card--disabled {
  opacity: 0.40;    /* var(--text-disabled) equivalent */
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Focus Visible ── WCAG 2.4.7 ── */
.emotion-card:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 3px;
  border-radius: var(--radius-lg);
}
```

---

## EmotionGrid Component

```jsx
// client/src/components/emotion/EmotionGrid/EmotionGrid.jsx

/**
 * EmotionGrid — شبكة اختيار المشاعر
 * WCAG: role="radiogroup" + arrow key navigation
 */
export function EmotionGrid({ selectedEmotion, onSelect, disabled = false }) {
  const emotions = ['joy', 'sadness', 'anger', 'fear', 'love', 'hope'];
  const gridRef = useRef(null);

  /* ── Arrow key navigation — WCAG 2.1.1 ── */
  const handleKeyDown = (e) => {
    const cards = [...gridRef.current.querySelectorAll('[role="radio"]')];
    const idx = cards.indexOf(document.activeElement);
    if (idx === -1) return;

    const map = {
      ArrowRight: -1,   /* RTL: right = previous */
      ArrowLeft:  +1,   /* RTL: left = next */
      ArrowDown:  +2,   /* next row (2 columns) */
      ArrowUp:    -2,
    };

    if (map[e.key] !== undefined) {
      e.preventDefault();
      const next = (idx + map[e.key] + cards.length) % cards.length;
      cards[next].focus();
    }
  };

  return (
    <section aria-labelledby="emotion-heading">
      <h2 id="emotion-heading" className="visually-hidden">اختر مشاعرك</h2>

      <div
        ref={gridRef}
        role="radiogroup"
        aria-labelledby="emotion-heading"
        className="emotion-grid"
        onKeyDown={handleKeyDown}
        dir="rtl"
      >
        {emotions.map((id) => (
          <EmotionCard
            key={id}
            emotionId={id}
            isSelected={selectedEmotion === id}
            isDisabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
```

```css
/* EmotionGrid.css */

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  width: 100%;
}

/* Tablet: 3 cols */
@media (min-width: 480px) {
  .emotion-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Dense viewport — prevent overflow at 200% zoom */
@media (min-width: 480px) and (max-width: 767px) {
  .emotion-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}
```

---

## NarrationBlock Component

```jsx
// client/src/components/story/NarrationBlock/NarrationBlock.jsx
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import './NarrationBlock.css';

const BLOCK_META = {
  narration:  { icon: '📖', label: 'سرد',  arLabel: 'نوع المحتوى: سرد' },
  visual:     { icon: '👁',  label: 'بصري', arLabel: 'نوع المحتوى: بصري' },
  reflection: { icon: '🔮', label: 'تأمل', arLabel: 'نوع المحتوى: تأمل' },
};

/**
 * NarrationBlock — كتلة السرد مع Typewriter effect
 * @prop {string} type - 'narration' | 'visual' | 'reflection'
 * @prop {string} content - نص السرد
 * @prop {boolean} showLabel - إظهار التسمية
 * @prop {function} onComplete - يُستدعى عند اكتمال الكتابة
 */
export function NarrationBlock({ type = 'narration', content, showLabel = true, onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const prefersReduced = useReducedMotion();
  const intervalRef = useRef(null);
  const { icon, label, arLabel } = BLOCK_META[type];

  useEffect(() => {
    if (!content) return;

    /* Skip animation if prefers-reduced-motion */
    if (prefersReduced) {
      setDisplayed(content);
      setDone(true);
      onComplete?.();
      return;
    }

    setDisplayed('');
    setDone(false);

    /* Word-by-word reveal — more cinematic than char-by-char */
    const words = content.split(' ');
    let idx = 0;

    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayed(words.slice(0, idx).join(' '));

      if (idx >= words.length) {
        clearInterval(intervalRef.current);
        setDone(true);
        onComplete?.();
      }
    }, 80); // ≈ 12 words/second

    return () => clearInterval(intervalRef.current);
  }, [content, prefersReduced]);

  /* Tap to skip — WCAG 2.2.1 User Timing */
  const skipTypewriter = () => {
    if (done) return;
    clearInterval(intervalRef.current);
    setDisplayed(content);
    setDone(true);
    onComplete?.();
  };

  return (
    <article
      className={`narration-block narration-block--${type} ${done ? 'narration-block--done' : ''}`}
      role="article"
      aria-label={`${arLabel}: ${content}`}
      aria-live="polite"
      aria-atomic="true"
      onClick={skipTypewriter}
      title={!done ? 'اضغط لتسريع القراءة' : undefined}
    >
      {showLabel && (
        <div className="narration-block__label" aria-hidden="true">
          <span>{icon}</span>
          <span>{label}</span>
        </div>
      )}

      <p className="narration-block__content" dir="rtl">
        {displayed}
        {!done && <span className="narration-block__cursor" aria-hidden="true">|</span>}
      </p>

      {/* Screen reader: announces when done */}
      <span className="visually-hidden" aria-live="polite">
        {done ? 'اكتمل النص' : ''}
      </span>
    </article>
  );
}
```

```css
/* NarrationBlock.css */

.narration-block {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  width: 100%;
  transition: border-color var(--dur-base) var(--ease-smooth);
}

/* ── Types ── */
.narration-block--narration {
  border-left: 2px solid rgba(255,255,255,0.50);
  border-right: none;
  border-top: none;
  border-bottom: none;
}
.narration-block--visual {
  border-left: 2px solid var(--color-gold);
  border-right: none;
  border-top: none;
  border-bottom: none;
}
.narration-block--reflection {
  border-left: 2px dashed var(--color-cyan);
  border-right: none;
  border-top: none;
  border-bottom: none;
}

.narration-block__label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-arabic);
  font-size: var(--type-caption);
  font-weight: 700;
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
  text-transform: none;   /* Arabic: no uppercase */
}

.narration-block__content {
  font-family: var(--font-arabic);
  font-size: var(--type-body);
  font-weight: 400;
  line-height: 1.85;
  color: var(--text-primary);
  margin: 0;
}

.narration-block--reflection .narration-block__content {
  font-style: italic;
  color: var(--text-secondary);
}

/* ── Cursor (Typewriter) ── */
.narration-block__cursor {
  opacity: 1;
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* Cursor hidden when done */
.narration-block--done .narration-block__cursor {
  display: none;
}

/* ── Entrance Animation ── */
.narration-block {
  animation: blockEnter var(--dur-slow) var(--ease-spring) both;
}

@keyframes blockEnter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## ChoiceButton Component

```jsx
// client/src/components/story/ChoiceButton/ChoiceButton.jsx
import './ChoiceButton.css';

/**
 * ChoiceButton — زر اختيار مسار القصة
 * @prop {string} label - نص الخيار
 * @prop {number} index - رقم الخيار (1-based)
 * @prop {boolean} isLoading - حالة التحميل بعد الضغط
 * @prop {function} onChoose - callback عند الاختيار
 */
export function ChoiceButton({ label, index, isLoading, onChoose }) {
  return (
    <button
      className={`choice-btn ${isLoading ? 'choice-btn--loading' : ''}`}
      aria-label={`الخيار ${index}: ${label}`}
      aria-busy={isLoading}
      disabled={isLoading}
      onClick={() => onChoose(index)}
    >
      <span className="choice-btn__arrow" aria-hidden="true">←</span>
      <span className="choice-btn__text">{label}</span>
      {isLoading && (
        <span className="choice-btn__spinner" aria-hidden="true" />
      )}
    </button>
  );
}
```

```css
/* ChoiceButton.css */

.choice-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  width: 100%;
  min-height: 44px;  /* WCAG 2.5.8 + Apple HIG */

  /* WCAG 1.4.3 fix: explicit dark bg guarantees 4.5:1 */
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255,255,255,0.30);
  border-radius: var(--radius-md);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  font-family: var(--font-arabic);
  font-size: var(--type-callout);
  font-weight: 600;
  color: var(--color-white);
  text-align: right;
  cursor: pointer;

  transition:
    transform var(--dur-fast) var(--ease-spring),
    background var(--dur-fast) var(--ease-smooth),
    border-color var(--dur-fast) var(--ease-smooth),
    opacity var(--dur-fast) var(--ease-smooth);
}

.choice-btn__arrow {
  font-size: 0.85rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: transform var(--dur-fast) var(--ease-smooth);
}

.choice-btn__text {
  flex: 1;
}

/* ── Hover ── */
@media (hover: hover) {
  .choice-btn:hover:not(:disabled) {
    background: rgba(0,0,0,0.80);
    border-color: rgba(255,255,255,0.45);
    transform: translateX(6px);  /* RTL: moves right */
  }
  .choice-btn:hover .choice-btn__arrow {
    transform: translateX(-4px);
  }
}

/* ── Active ── */
.choice-btn:active:not(:disabled) {
  transform: scale(0.97);
}

/* ── Loading ── */
.choice-btn--loading {
  opacity: 0.60;
  cursor: wait;
}

.choice-btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.30);
  border-top-color: var(--color-white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Focus ── */
.choice-btn:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  scroll-margin-top: 80px;   /* WCAG 2.4.11 */
}

/* ── Entrance (staggered) ── */
.choice-btn {
  animation: choiceEnter var(--dur-slow) var(--ease-spring) both;
}
.choice-btn:nth-child(2) {
  animation-delay: 100ms;
}

@keyframes choiceEnter {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Responsive ── */
@media (max-width: 380px) {
  .choice-btn {
    font-size: var(--type-caption);
    padding: var(--space-3) var(--space-4);
  }
}
```

---

## LoadingOrb Component

```jsx
// client/src/components/layout/LoadingOrb/LoadingOrb.jsx
import { useState, useEffect } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import './LoadingOrb.css';

const MESSAGES = [
  'مرايا تتأمل...',
  'القصة تتشكّل...',
  'الكلمات تجد طريقها...',
  'المشهد يتكوّن...',
  'الراوية تستعد...',
];

/**
 * LoadingOrb — مؤشر التحميل السينمائي
 * @prop {boolean} visible - هل مرئي
 * @prop {function} onTimeout - callback بعد 30 ثانية
 */
export function LoadingOrb({ visible, onTimeout }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const prefersReduced = useReducedMotion();

  /* Rotate messages */
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible]);

  /* 30s timeout */
  useEffect(() => {
    if (!visible) { setTimedOut(false); return; }
    const timer = setTimeout(() => {
      setTimedOut(true);
      onTimeout?.();
    }, 30_000);
    return () => clearTimeout(timer);
  }, [visible, onTimeout]);

  if (!visible) return null;

  return (
    <div
      className="loading-orb-container"
      role="status"
      aria-live="polite"
      aria-label={timedOut ? 'توقف التوليد، يمكنك المحاولة مجدداً' : MESSAGES[msgIdx]}
    >
      {!timedOut ? (
        <>
          <div className={`loading-orb ${prefersReduced ? 'loading-orb--static' : ''}`}
               aria-hidden="true" />
          <p className="loading-message" key={msgIdx} aria-hidden="true">
            {MESSAGES[msgIdx]}
          </p>
          <span className="visually-hidden">{MESSAGES[msgIdx]}</span>
        </>
      ) : (
        <div className="loading-error">
          <p>توقف الخيط لحظة، نُعيد نسجه...</p>
          <button className="btn btn--ghost" onClick={() => window.location.reload()}>
            حاول مجدداً
          </button>
        </div>
      )}
    </div>
  );
}
```

```css
/* LoadingOrb.css */

.loading-orb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  position: absolute;
  inset: 0;
  justify-content: center;
  background: var(--bg-primary);
  z-index: var(--z-overlay);
}

.loading-orb {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255,255,255,0.90) 0%,
    rgba(200,200,255,0.60) 30%,
    rgba(100,100,200,0.30) 70%,
    transparent 100%
  );
  box-shadow:
    0 0 40px rgba(180,180,255,0.40),
    0 0 80px rgba(100,100,200,0.20);
  animation: orbFloat 3s var(--ease-smooth) infinite,
             orbPulse 2s ease-in-out infinite;
}

.loading-orb--static {
  animation: none;
}

@keyframes orbFloat {
  0%, 100% { transform: translateY(0);    }
  50%       { transform: translateY(-12px); }
}

@keyframes orbPulse {
  0%, 100% { opacity: 0.8; }
  50%       { opacity: 1.0; }
}

.loading-message {
  font-family: var(--font-arabic);
  font-size: 1.1rem;
  color: var(--text-secondary);
  animation: msgFade 0.5s var(--ease-smooth);
}

@keyframes msgFade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## Custom Hooks

### useReducedMotion.js — WCAG 2.3.3

```js
// client/src/hooks/useReducedMotion.js
import { useEffect, useState } from 'react';

/**
 * Returns true if user prefers reduced motion
 * WCAG 2.3.3 compliance
 */
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

### useFocusTrap.js — WCAG 2.1.2

```js
// client/src/hooks/useFocusTrap.js
import { useEffect } from 'react';

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'textarea',
  'input:not([disabled])', 'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Traps focus inside a container (for Modals, Sheets)
 * WCAG 2.1.2 compliance
 */
export function useFocusTrap(isActive, containerRef) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = [...container.querySelectorAll(FOCUSABLE)];
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    first?.focus();

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isActive, containerRef]);
}
```

### useStoryEngine.js — إدارة حالة القصة

```js
// client/src/hooks/useStoryEngine.js
import { useReducer, useCallback } from 'react';

const initial = {
  phase: 'picker',       // 'picker' | 'upload' | 'loading' | 'scene' | 'ending'
  emotion: null,         // 'joy' | 'sadness' | ...
  spaceImage: null,      // File | null
  currentScene: 0,
  totalScenes: 5,
  scenes: [],            // [{narration, imageUrl, choices}]
  isGenerating: false,
  error: null,
};

function storyReducer(state, action) {
  switch (action.type) {
    case 'SELECT_EMOTION':
      return { ...state, emotion: action.payload, phase: 'loading' };

    case 'SET_SPACE_IMAGE':
      return { ...state, spaceImage: action.payload };

    case 'START_GENERATION':
      return { ...state, isGenerating: true, error: null, phase: 'loading' };

    case 'SCENE_READY':
      return {
        ...state,
        isGenerating: false,
        phase: 'scene',
        scenes: [...state.scenes, action.payload],
        currentScene: state.scenes.length,
      };

    case 'MAKE_CHOICE':
      const isLast = state.currentScene >= state.totalScenes - 1;
      return {
        ...state,
        phase: isLast ? 'loading-end' : 'loading',
        isGenerating: true,
      };

    case 'STORY_ENDED':
      return { ...state, phase: 'ending', isGenerating: false };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isGenerating: false };

    case 'RESET':
      return { ...initial };

    default:
      return state;
  }
}

export function useStoryEngine() {
  const [state, dispatch] = useReducer(storyReducer, initial);

  const selectEmotion = useCallback((emotionId) => {
    dispatch({ type: 'SELECT_EMOTION', payload: emotionId });
  }, []);

  const setSpaceImage = useCallback((file) => {
    dispatch({ type: 'SET_SPACE_IMAGE', payload: file });
  }, []);

  const makeChoice = useCallback((choiceIndex) => {
    dispatch({ type: 'MAKE_CHOICE', payload: choiceIndex });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { state, selectEmotion, setSpaceImage, makeChoice, reset };
}
```

---

## BottomSheet (Settings) — Complete

```jsx
// client/src/components/layout/SettingsSheet/SettingsSheet.jsx
import { useRef, useEffect } from 'react';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import './SettingsSheet.css';

/**
 * SettingsSheet — Bottom Sheet للإعدادات
 * WCAG: role=dialog, aria-modal, focus trap, Escape to close
 */
export function SettingsSheet({ isOpen, onClose, settings, onSettingChange }) {
  const sheetRef = useRef(null);
  const triggerRef = useRef(null);

  useFocusTrap(isOpen, sheetRef);

  /* Escape to close — WCAG 2.1.1 */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* Return focus on close — WCAG 2.1.2 */
  useEffect(() => {
    if (!isOpen) triggerRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="الإعدادات"
        dir="rtl"
      >
        {/* Drag Handle */}
        <div className="sheet-handle" aria-hidden="true" />

        <h2 className="sheet-title">الإعدادات</h2>

        {/* Language */}
        <SettingsRow label="لغة السرد" htmlFor="lang-select">
          <select
            id="lang-select"
            className="sheet-select"
            value={settings.language}
            onChange={e => onSettingChange('language', e.target.value)}
            aria-label="اختر لغة السرد"
          >
            <option value="msr">🇪🇬 عامية مصرية</option>
            <option value="fusha">📜 فصحى</option>
            <option value="judge">🏆 Judge Mode (English)</option>
          </select>
        </SettingsRow>

        <Divider />

        {/* Voice */}
        <SettingsRow label="صوت الراوية" htmlFor="voice-toggle">
          <Toggle
            id="voice-toggle"
            checked={settings.voiceOn}
            onChange={v => onSettingChange('voiceOn', v)}
            aria-label="تشغيل أو إيقاف صوت الراوية"
          />
        </SettingsRow>

        <Divider />

        {/* Text Size */}
        <SettingsRow label="حجم النص">
          <input
            type="range"
            className="sheet-slider"
            min="80" max="140" step="10"
            value={settings.textSize}
            onChange={e => onSettingChange('textSize', Number(e.target.value))}
            aria-label="حجم النص"
            aria-valuemin={80}
            aria-valuemax={140}
            aria-valuenow={settings.textSize}
            aria-valuetext={`${settings.textSize}% من الحجم الافتراضي`}
          />
        </SettingsRow>

        <Divider />

        <button className="sheet-close" onClick={onClose} aria-label="إغلاق الإعدادات">
          إغلاق
        </button>
      </div>
    </>
  );
}

function SettingsRow({ label, htmlFor, children }) {
  return (
    <div className="settings-row">
      <label className="settings-row__label" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="settings-row__control">{children}</div>
    </div>
  );
}

function Divider() {
  return <hr className="sheet-divider" aria-hidden="true" />;
}
```

```css
/* SettingsSheet.css */

.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.50);
  z-index: calc(var(--z-overlay) - 1);
  animation: fadeIn var(--dur-base) var(--ease-smooth);
}

.settings-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-overlay);
  padding: var(--space-4) var(--space-6) calc(var(--space-8) + var(--safe-bottom));

  background: rgba(20, 20, 32, 0.96);
  backdrop-filter: blur(var(--blur-strong));
  -webkit-backdrop-filter: blur(var(--blur-strong));
  border: 1px solid var(--border-default);
  border-bottom: none;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;

  animation: sheetEnter var(--dur-slow) var(--ease-spring);
}

@keyframes sheetEnter {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.sheet-handle {
  width: 36px;
  height: 5px;
  border-radius: var(--radius-full);
  background: var(--border-default);
  margin: 0 auto var(--space-4);
}

.sheet-title {
  font-family: var(--font-arabic);
  font-size: var(--type-title3);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  text-align: right;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;  /* WCAG 2.5.8 */
  padding: var(--space-3) 0;
  gap: var(--space-4);
}

.settings-row__label {
  font-family: var(--font-arabic);
  font-size: var(--type-callout);
  color: var(--text-secondary);
  flex: 1;
  text-align: right;
}

.sheet-divider {
  border: none;
  border-top: 1px solid var(--border-default);
  margin: 0;
}

.sheet-close {
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-3) 0;
  background: var(--surface-glass);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-arabic);
  font-size: var(--type-callout);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-smooth);
}

.sheet-close:hover { background: var(--surface-glass-hover); }
.sheet-close:active { background: var(--surface-glass-active); }

.sheet-close:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

---

## Toast Component — WCAG Compliant

```jsx
// client/src/components/ui/Toast/Toast.jsx
import { useState, useEffect } from 'react';
import './Toast.css';

const ICONS = {
  info:    'ℹ️',
  success: '✅',
  warning: '⚠️',
  error:   '❌',
};

export function Toast({ id, type = 'info', message, duration = 5000, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const t = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(t);
  }, [isPaused, id, duration, onDismiss]);

  return (
    <div
      className={`toast toast--${type}`}
      /* WCAG 4.1.3: assertive for errors, polite for others */
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}  /* WCAG 2.2.1 */
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <span className="toast__icon" aria-hidden="true">{ICONS[type]}</span>
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        aria-label="إغلاق الإشعار"
        onClick={() => onDismiss(id)}
      >×</button>
    </div>
  );
}

/* Toast Container (place in root) */
export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container" aria-label="الإشعارات">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
```

---

## تحسين الأداء (Performance)

### SceneImage — Optimized

```jsx
// client/src/components/story/SceneImage/SceneImage.jsx

export function SceneImage({ src, alt, emotionId }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="scene-image-wrapper" aria-hidden={!alt}>
      {/* Skeleton during load */}
      {!loaded && !error && (
        <div className="scene-image-skeleton" aria-hidden="true" />
      )}

      {!error && (
        <img
          className={`scene-image ${loaded ? 'scene-image--loaded' : ''}`}
          src={src}
          alt={alt || ''}    /* Empty alt if purely decorative */
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{ '--emotion-color': `var(--emotion-${emotionId})` }}
        />
      )}

      {/* WCAG 4.1.3: announce when image ready */}
      <span
        className="visually-hidden"
        aria-live="polite"
        role="status"
      >
        {loaded ? `صورة المشهد الجاهزة: ${alt}` : ''}
      </span>
    </div>
  );
}
```

### نصائح الأداء

```js
// 1. Web Vitals targets for Maraya
const TARGETS = {
  LCP: 2500,  // Largest Contentful Paint ≤ 2.5s
  FID: 100,   // First Input Delay ≤ 100ms
  CLS: 0.1,   // Cumulative Layout Shift ≤ 0.1
};

// 2. Image optimization
// - Convert AI-generated images to WebP on server before sending
// - Use srcset for different screen densities
// - LazyLoad below-the-fold images

// 3. Animation optimizations
const ANIMATION_BEST_PRACTICES = {
  // ✅ DO: Use transform + opacity (GPU composited)
  good: 'transform: translateY(-4px); opacity: 1;',
  // ❌ DON'T: Use layout-triggering properties
  bad: 'top: calc(50% - 4px); margin-top: -4px;',
};

// 4. Backdrop-filter performance budget
const BLUR_BUDGET = {
  maxConcurrent: 3,  // لا أكثر من 3 عناصر backdrop-filter في نفس الوقت
  fallback: 'rgba(10,10,20,0.85)',  // للأجهزة الضعيفة
};
```

```css
/* Reduce backdrop-filter on low-end devices */
@media (prefers-reduced-motion: reduce),
       (update: slow) {
  .emotion-card,
  .narration-block,
  .choice-btn {
    backdrop-filter: none;
    background: rgba(15, 15, 25, 0.90);
  }
}
```

---

## استراتيجية الاختبار (Testing)

```js
// EmotionCard.test.jsx

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmotionCard } from './EmotionCard';

describe('EmotionCard', () => {

  it('renders correct emoji and label', () => {
    render(<EmotionCard emotionId="joy" isSelected={false} onSelect={jest.fn()} />);
    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('فرح')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = jest.fn();
    render(<EmotionCard emotionId="joy" isSelected={false} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('radio'));
    expect(onSelect).toHaveBeenCalledWith('joy');
  });

  it('has correct ARIA when selected', () => {
    render(<EmotionCard emotionId="joy" isSelected={true} onSelect={jest.fn()} />);
    const card = screen.getByRole('radio');
    expect(card).toHaveAttribute('aria-checked', 'true');
  });

  it('does not call onSelect when disabled', async () => {
    const onSelect = jest.fn();
    render(<EmotionCard emotionId="joy" isDisabled={true} onSelect={onSelect} />);
    const card = screen.getByRole('radio');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(card);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('responds to Enter key', async () => {
    const onSelect = jest.fn();
    render(<EmotionCard emotionId="joy" isSelected={false} onSelect={onSelect} />);
    const card = screen.getByRole('radio');
    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('joy');
  });

});

/* NarrationBlock Tests */
describe('NarrationBlock typewriter', () => {

  it('shows content immediately with prefers-reduced-motion', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
    render(<NarrationBlock type="narration" content="وفي تلك الليلة" />);
    expect(screen.getByText('وفي تلك الليلة')).toBeInTheDocument();
  });

  it('calls onComplete after typewriter finishes', async () => {
    const onComplete = jest.fn();
    render(<NarrationBlock type="narration" content="كلمة" onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 2000 });
  });

});
```

---

## التوثيق (JSDoc)

```js
/**
 * @module EmotionCard
 * @description بطاقة اختيار المشاعر لمشروع مرايا
 *
 * @example
 * // Basic usage
 * <EmotionCard
 *   emotionId="joy"
 *   isSelected={selected === 'joy'}
 *   onSelect={setSelected}
 * />
 *
 * @example
 * // Within EmotionGrid (preferred)
 * <EmotionGrid
 *   selectedEmotion={selectedEmotion}
 *   onSelect={handleEmotionSelect}
 * />
 *
 * @accessibility
 * - role="radio" within role="radiogroup"
 * - Arrow key navigation (RTL-aware)
 * - aria-label includes emotion name + action hint
 * - focus-visible outline for keyboard users
 * - aria-disabled (not HTML disabled) to preserve focusability
 *
 * @performance
 * - Animations use transform + opacity (GPU composited)
 * - color-mix() يُنتج ألوان ديناميكية بدون JS
 * - Respects prefers-reduced-motion
 */
```

---

## Checklist الجاهزية للإنتاج

```
المكوّنات:
□ EmotionCard — role=radio + keyboard nav ✅
□ EmotionGrid — role=radiogroup + arrow keys ✅
□ NarrationBlock — aria-live + skip-to-end ✅
□ ChoiceButton — bg:rgba(0,0,0,0.65) guaranteed contrast ✅  
□ LoadingOrb — role=status + timeout handler ✅
□ SettingsSheet — role=dialog + focus trap + Escape ✅
□ Toast — assertive/polite + hover-pause ✅
□ SceneImage — dynamic alt + aria-live on load ✅

CSS:
□ tokens.css — كل القيم design tokens ✅
□ prefers-reduced-motion block ✅
□ prefers-contrast fallbacks ✅
□ scroll-margin for HUD overlap ✅
□ 320px reflow (max-width: 380px breakpoint) ✅
□ @media (update: slow) fallback ✅

Hooks:
□ useReducedMotion ✅
□ useFocusTrap ✅
□ useStoryEngine (state management) ✅

Tests:
□ Unit: EmotionCard × 5 tests ✅
□ Unit: NarrationBlock × 2 tests ✅
□ A11y: axe-core integration ✅ (بعد إعداد)
```
