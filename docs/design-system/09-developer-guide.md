# دليل المطوّرين — Developer Guide

> كل ما تحتاجه لتبدأ البناء مع نظام تصميم مرايا.

---

## 1. البدء السريع

### تثبيت الخطوط

أضف في `index.html` داخل `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### تضمين الـ Tokens

انسخ المتغيرات إلى `:root` في ملف CSS الرئيسي:

```css
:root {
  /* === Fonts === */
  --font-display:     'Cairo', sans-serif;
  --font-ui:          'Outfit', 'Noto Sans Arabic', sans-serif;
  --font-arabic-body: 'Cairo', sans-serif;
  --font-mono:        'JetBrains Mono', 'Fira Code', monospace;

  /* === Easing === */
  --ease-spring:  cubic-bezier(0.22, 1, 0.36, 1);
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce:  cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* === Colors: Backgrounds === */
  --bg-primary:   #030305;
  --bg-secondary: #0a0a0f;
  --bg-tertiary:  #111118;
  --bg-elevated:  #1a1a24;

  /* === Colors: Glass === */
  --glass-bg:     rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-blur:   20px;

  /* === Colors: Text === */
  --text-primary:   #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.70);
  --text-tertiary:  rgba(255, 255, 255, 0.50);
  --text-disabled:  rgba(255, 255, 255, 0.30);

  /* === Colors: Accents === */
  --accent-gold:    #ffd700;
  --accent-cyan:    #78c8ff;
  --accent-emerald: #5effb3;
  --accent-rose:    #ff6b8a;
  --accent-violet:  #a78bfa;
  --accent-coral:   #ff7e67;

  /* === Colors: Borders === */
  --border-default: rgba(255, 255, 255, 0.10);
  --border-subtle:  rgba(255, 255, 255, 0.06);
  --border-strong:  rgba(255, 255, 255, 0.25);
  --border-focus:   rgba(255, 255, 255, 0.50);

  /* === Spacing (8px base) === */
  --space-0:  0px;
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;

  /* === Radius === */
  --radius-none: 0px;
  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-2xl:  24px;
  --radius-full: 999px;

  /* === Shadows === */
  --shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md:  0 4px 15px rgba(0, 0, 0, 0.2);
  --shadow-lg:  0 8px 25px rgba(0, 0, 0, 0.3);
  --shadow-xl:  0 12px 40px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 30px rgba(255, 255, 255, 0.1);

  /* === Z-index === */
  --z-base:       0;
  --z-content:    10;
  --z-transcript: 20;
  --z-narration:  30;
  --z-bar:        100;
  --z-hud:        110;
  --z-modal:      150;
  --z-tooltip:    200;

  /* === Grid === */
  --grid-columns: 12;
  --grid-gutter:  24px;
  --grid-margin:  16px;
  --grid-max:     1440px;
}

@media (min-width: 768px)  { :root { --grid-margin: 32px; } }
@media (min-width: 1024px) { :root { --grid-margin: 64px; } }
@media (min-width: 1536px) { :root { --grid-margin: 80px; } }
```

---

## 2. تسمية CSS — نظام BEM

مرايا تتّبع **BEM (Block Element Modifier)**:

```
.block
.block__element
.block--modifier
.block__element--modifier
```

### أمثلة

```css
.emotion-card              /* Block */
.emotion-card__icon        /* Element */
.emotion-card__label       /* Element */
.emotion-card--active      /* Modifier */

.narration-block           /* Block */
.narration-block__content  /* Element */
.narration-block--visual   /* Modifier */
.narration-block--reflection /* Modifier */
```

### القواعد

1. **Block** = مكوّن مستقل (`emotion-card`, `glass-card`, `btn`)
2. **Element** = جزء من Block (`__icon`, `__label`, `__text`)
3. **Modifier** = حالة أو نوع (`--active`, `--visual`, `--lg`)
4. لا تتخطى مستوى واحد (`emotion-card__icon--large` ✅ / `emotion-card__icon__inner` ❌)

---

## 3. هيكل ملفات CSS

```
client/src/
├── App.css              ← ملف CSS الوحيد (حاليًا)
│   ├── Reset & Root     ← :root tokens, *, html/body
│   ├── Layout           ← .app, .app__overlay
│   ├── Components       ← كل مكوّن مع فاصل واضح
│   └── Animations       ← @keyframes
```

### التوسّع المستقبلي (موصى به)

```
client/src/styles/
├── tokens.css           ← CSS Custom Properties فقط
├── reset.css            ← Reset و base styles
├── layout.css           ← Grid, container, pages
├── animations.css       ← @keyframes
├── utilities.css        ← Utility classes
└── components/
    ├── button.css
    ├── glass-card.css
    ├── emotion-card.css
    ├── narration-block.css
    └── ...
```

---

## 4. كتابة مكوّن جديد — خطوات

### الخطوة 1: حدد البنية

```html
<div class="new-component" role="[role]" aria-label="[label]">
  <div class="new-component__header">...</div>
  <div class="new-component__body">...</div>
</div>
```

### الخطوة 2: اكتب CSS بالـ Tokens

```css
/* =============================================================================
   New Component
   ============================================================================= */

.new-component {
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  
  /* Glass surface */
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  
  /* Spacing */
  padding: var(--space-6);
  
  /* Typography */
  font-family: var(--font-ui);
  color: var(--text-primary);
  
  /* Motion */
  transition: all 0.3s var(--ease-smooth);
  animation: fadeInUp 0.6s var(--ease-spring);
}

/* States */
.new-component:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: var(--border-strong);
}

.new-component:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.new-component:disabled,
.new-component--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

/* Elements */
.new-component__header { ... }
.new-component__body   { ... }

/* Modifiers */
.new-component--compact { padding: var(--space-3); }
.new-component--accent  { border-color: var(--accent-gold); }
```

### الخطوة 3: أضف قابلية الوصول

```jsx
function NewComponent({ title, children }) {
  return (
    <div
      className="new-component"
      role="region"
      aria-label={title}
    >
      <div className="new-component__header">
        <h3>{title}</h3>
      </div>
      <div className="new-component__body">
        {children}
      </div>
    </div>
  );
}
```

### الخطوة 4: اختبر

- [ ] يظهر صحيحًا في Dark Mode
- [ ] يعمل في RTL و LTR
- [ ] التركيز بلوحة المفاتيح يعمل
- [ ] حلقة التركيز مرئية
- [ ] حجم اللمس ≥ 44px (إن كان تفاعليًا)
- [ ] قارئ الشاشة يقرا المحتوى بشكل منطقي
- [ ] يعمل على mobile (375px)
- [ ] `prefers-reduced-motion` يوقف الحركة

---

## 5. دعم RTL

### الإعدادات الأساسية

```html
<html lang="ar" dir="rtl">
```

### قواعد CSS

| ❌ Physical | ✅ Logical |
|------------|-----------|
| `left` | `inset-inline-start` |
| `right` | `inset-inline-end` |
| `margin-left` | `margin-inline-start` |
| `padding-right` | `padding-inline-end` |
| `border-left` | `border-inline-start` |
| `text-align: left` | `text-align: start` |
| `float: left` | لا تستخدم float |

### عكس الأيقونات

```css
[dir='rtl'] .choice-btn__arrow {
  transform: scaleX(-1); /* يعكس الأسهم */
}
```

### تجاوزات RTL-specific

```css
/* إذا لم تنفع logical properties */
[dir='rtl'] .transcript {
  left: auto;
  right: 3rem;
}
```

---

## 6. الأداء — أفضل الممارسات

### CSS

- **تجنب `*` selectors** في CSS المخصص
- **قلّل طبقات `backdrop-filter`** — كل طبقة تكلف GPU
- **استخدم `will-change` باعتدال** — وأزلها بعد الحركة
- **استخدم `transform` و `opacity`** للحركة — لا تحرّك `width/height/top/left`

### Images

```css
/* Lazy loading */
<img loading="lazy" decoding="async" ... />

/* Responsive */
<img
  srcset="scene-400.webp 400w, scene-800.webp 800w"
  sizes="(max-width: 768px) 100vw, 800px"
  src="scene-800.webp"
  alt="[وصف]"
/>
```

### Fonts

```css
/* font-display: swap لمنع FOIT */
@font-face {
  font-family: 'Cairo';
  font-display: swap;
}
```

---

## 7. إضافة متغير مشاعر جديد

### 1. أضف في `01-tokens.json`

```json
"excitement": { "$value": "#ff9500", "$type": "color" }
```

### 2. أضف في CSS

```css
/* في EmotionPicker أو مكوّن مشابه */
/* يتم تطبيقه عبر inline style: */
style="--card-color: #ff9500; --card-gradient: linear-gradient(135deg, rgba(255,149,0,0.15), rgba(255,149,0,0.03))"
```

### 3. أضف الـ Emoji والتسمية في JSX

```jsx
{ id: 'excitement', emoji: '🤩', label: 'حماس', color: '#ff9500' }
```

---

## 8. قائمة تدقيق المكوّن (Component Checklist)

استخدم هذه القائمة قبل نشر أي مكوّن جديد:

### التصميم
- [ ] يستخدم design tokens فقط (لا ألوان/أحجام hardcoded)
- [ ] يتبع تسمية BEM
- [ ] الحالات موثّقة: default, hover, active, focus, disabled
- [ ] يدعم RTL (logical properties)
- [ ] يعمل على mobile (375px+)

### قابلية الوصول
- [ ] ARIA roles و attributes مناسبة
- [ ] `aria-label` / `aria-labelledby` للعناصر المعقدة
- [ ] حلقة focus-visible مرئية
- [ ] حجم لمس ≥ 44px
- [ ] تباين WCAG AA+
- [ ] يعمل مع `prefers-reduced-motion`
- [ ] قابل للتنقل بلوحة المفاتيح

### الأداء
- [ ] لا `backdrop-filter` متداخلة أكثر من 3
- [ ] حركات تستخدم `transform/opacity` فقط
- [ ] صور `loading="lazy"`
- [ ] لا `will-change` مستمر

### الجودة
- [ ] لا CSS مكرر
- [ ] مرتب ومقروء مع comments section headers
- [ ] مُختبر على Chrome, Safari, Firefox
- [ ] مُختبر مع قارئ شاشة

---

## 9. مرجع سريع — الألوان الأكثر استخدامًا

```css
/* Copy-paste ready */
var(--bg-primary)       /* #030305 — خلفية التطبيق */
var(--glass-bg)         /* rgba(255,255,255,0.06) — سطح زجاجي */
var(--glass-border)     /* rgba(255,255,255,0.10) — حدود زجاجية */
var(--text-primary)     /* #ffffff — نص رئيسي */
var(--text-secondary)   /* rgba(255,255,255,0.70) — نص ثانوي */
var(--text-tertiary)    /* rgba(255,255,255,0.50) — نص خفيف */
var(--border-focus)     /* rgba(255,255,255,0.50) — حلقة تركيز */
var(--accent-gold)      /* #ffd700 — بصري/إبداعي */
var(--accent-emerald)   /* #5effb3 — نجاح/نشط */
var(--accent-rose)      /* #ff6b8a — خطأ/خطر */
var(--ease-spring)      /* cubic-bezier(0.22,1,0.36,1) — حركة حيوية */
var(--ease-smooth)      /* cubic-bezier(0.4,0,0.2,1) — حركة ناعمة */
```

---

## 10. مرجع سريع — نقاط القطع

```css
/* Breakpoints */
@media (min-width: 480px)  { /* sm  — هواتف كبيرة */ }
@media (min-width: 768px)  { /* md  — أجهزة لوحية */ }
@media (min-width: 1024px) { /* lg  — محمول صغير */ }
@media (min-width: 1280px) { /* xl  — سطح مكتب */ }
@media (min-width: 1536px) { /* xxl — شاشة واسعة */ }

/* Accessibility */
@media (prefers-reduced-motion: reduce) { /* إيقاف الحركة */ }
@media (prefers-contrast: high)         { /* تباين عالي */ }
@media (prefers-color-scheme: light)    { /* وضع فاتح */ }
```
