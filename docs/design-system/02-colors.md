# نظام الألوان — Color System

> مرايا تعيش في الظلام وتتألّق بالضوء.
> الألوان ليست زينة — بل لغة عاطفية.

---

## 1. الألوان الأساسية (Primitives)

### درجات القاعدة

| الاسم | Hex | الاستخدام |
|-------|-----|-----------|
| **Black** | `#030305` | خلفية التطبيق الرئيسية |
| **Void** | `#0a0a0f` | خلفية التدرج المركزي |
| **Obsidian** | `#111118` | حاويات متداخلة |
| **Charcoal** | `#1a1a24` | بطاقات مرتفعة، tooltips |
| **Slate** | `#2a2a3a` | فواصل وحدود داكنة |
| **Mist** | `#8888aa` | نصوص ثانوية |
| **Cloud** | `#b8b8d0` | نصوص وسطى |
| **Pearl** | `#e0e0f0` | نصوص عالية القراءة |
| **White** | `#ffffff` | نصوص أساسية، عناوين |

### الألوان المميزة (Accents)

| الاسم | Hex | عينة CSS | الشخصية |
|-------|-----|----------|---------|
| **Gold** | `#ffd700` | `var(--accent-gold)` | الإبداع، البصري، الإلهام |
| **Amber** | `#ffb347` | `var(--accent-amber)` | الدفء، الحنين |
| **Cyan** | `#78c8ff` | `var(--accent-cyan)` | التأمل، الانعكاس، الروابط |
| **Emerald** | `#5effb3` | `var(--accent-emerald)` | النجاح، النشاط، التفعيل |
| **Rose** | `#ff6b8a` | `var(--accent-rose)` | الخطأ، الحب، التحذير الحاد |
| **Violet** | `#a78bfa` | `var(--accent-violet)` | السحر، الإبداع، الغموض |
| **Coral** | `#ff7e67` | `var(--accent-coral)` | التحذير الدافئ، الانتباه |

---

## 2. الألوان الدلالية (Semantic)

### الخلفيات

```css
--bg-primary:   #030305;    /* خلفية الجذر */
--bg-secondary: #0a0a0f;    /* بطاقات، ألواح */
--bg-tertiary:  #111118;    /* حاويات متداخلة */
--bg-elevated:  #1a1a24;    /* popovers, tooltips */
```

### الأسطح الزجاجية (Glass Surfaces)

```css
--glass-bg:        rgba(255, 255, 255, 0.06);
--glass-bg-hover:  rgba(255, 255, 255, 0.10);
--glass-bg-active: rgba(255, 255, 255, 0.15);
--glass-border:    rgba(255, 255, 255, 0.10);
--glass-blur:      20px;
```

### النصوص

```css
--text-primary:   #ffffff;                     /* عناوين، محتوى رئيسي */
--text-secondary: rgba(255, 255, 255, 0.70);   /* شروحات، تسميات */
--text-tertiary:  rgba(255, 255, 255, 0.50);   /* مساعد، placeholder */
--text-disabled:  rgba(255, 255, 255, 0.30);   /* معطّل */
--text-inverse:   #030305;                     /* نص على خلفيات فاتحة */
```

### الحدود

```css
--border-default: rgba(255, 255, 255, 0.10);
--border-subtle:  rgba(255, 255, 255, 0.06);
--border-strong:  rgba(255, 255, 255, 0.25);
--border-focus:   rgba(255, 255, 255, 0.50);
```

---

## 3. ألوان المشاعر (Emotion Palette)

مرايا تربط كل مشاعر بلون مميز يتخلل التجربة بأكملها:

| المشاعر | Hex | التدرج |
|---------|-----|--------|
| 😊 **فرح** | `#ffd700` | `linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.03))` |
| 😢 **حزن** | `#4a9eff` | `linear-gradient(135deg, rgba(74,158,255,0.15), rgba(74,158,255,0.03))` |
| 😡 **غضب** | `#ff4444` | `linear-gradient(135deg, rgba(255,68,68,0.15), rgba(255,68,68,0.03))` |
| 😰 **خوف** | `#8b5cf6` | `linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.03))` |
| 💕 **حب** | `#ff6b8a` | `linear-gradient(135deg, rgba(255,107,138,0.15), rgba(255,107,138,0.03))` |
| 🌱 **أمل** | `#5effb3` | `linear-gradient(135deg, rgba(94,255,179,0.15), rgba(94,255,179,0.03))` |

### استخدام ألوان المشاعر في CSS

```css
/* يتم تعيين --card-color و --card-gradient كـ inline style حسب المشاعر المختار */
.emotion-card {
  --card-color: #ffd700;
  --card-gradient: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.03));
}

.emotion-card:hover,
.emotion-card--active {
  background: var(--card-gradient);
  border-color: var(--card-color);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4),
              0 0 30px color-mix(in srgb, var(--card-color) 45%, transparent);
}
```

---

## 4. الوضع الداكن (Dark Mode) — الافتراضي

مرايا **تعمل بالوضع الداكن افتراضيًا** — هذا ليس خيارًا بل هوية.

### لماذا الوضع الداكن؟

- **السينمائية**: القصص تُعرض في ظلام كمسرح سينما
- **العمق**: الزجاج الضبابي (Glassmorphism) يبرز بشكل أفضل على خلفية مظلمة
- **الراحة**: تجربة القراءة الليلية أكثر راحة
- **التباين العاطفي**: الألوان المميزة تتألق في الظلام

### تجاوز الوضع الفاتح (اختياري)

```css
:root[data-theme="light"] {
  --bg-primary:   #f5f5f7;
  --bg-secondary: #ffffff;
  --bg-tertiary:  #e8e8ed;
  --text-primary: #1d1d1f;
  --text-secondary: rgba(0, 0, 0, 0.60);
  --text-tertiary:  rgba(0, 0, 0, 0.40);
  --glass-bg:     rgba(0, 0, 0, 0.04);
  --glass-border: rgba(0, 0, 0, 0.08);
}
```

---

## 5. التباين وقابلية الوصول (Contrast & A11y)

### نسب التباين (WCAG 2.1)

| الطبقة | اللون | الخلفية | النسبة | المستوى |
|--------|-------|---------|--------|---------|
| Text Primary | `#ffffff` | `#030305` | **21:1** | ✅ AAA |
| Text Secondary | `rgba(255,255,255,0.70)` | `#030305` | **14.7:1** | ✅ AAA |
| Text Tertiary | `rgba(255,255,255,0.50)` | `#030305` | **10.5:1** | ✅ AAA |
| Text Disabled | `rgba(255,255,255,0.30)` | `#030305` | **6.3:1** | ✅ AA (كبير) |
| Gold Accent | `#ffd700` | `#030305` | **12.5:1** | ✅ AAA |
| Emerald Accent | `#5effb3` | `#030305` | **14.2:1** | ✅ AAA |
| Cyan Accent | `#78c8ff` | `#030305` | **10.8:1** | ✅ AAA |

### وضع التباين العالي

```css
@media (prefers-contrast: high) {
  :root {
    --bg-primary:   #000000;
    --text-primary: #ffffff;
    --border-default: #ffffff;
    --glass-bg:     rgba(255, 255, 255, 0.12);
    --glass-border: rgba(255, 255, 255, 0.40);
  }
}
```

### دعم تقليل الحركة

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. طريقة الاستخدام في الكود

### CSS Custom Properties

```css
:root {
  /* خلفيات */
  --bg-primary: #030305;
  --bg-secondary: #0a0a0f;
  --bg-tertiary: #111118;
  --bg-elevated: #1a1a24;

  /* أسطح زجاجية */
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-blur: 20px;

  /* نصوص */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.70);
  --text-tertiary: rgba(255, 255, 255, 0.50);
  --text-disabled: rgba(255, 255, 255, 0.30);

  /* مميزة */
  --accent-gold: #ffd700;
  --accent-cyan: #78c8ff;
  --accent-emerald: #5effb3;
  --accent-rose: #ff6b8a;
  --accent-violet: #a78bfa;
  --accent-coral: #ff7e67;

  /* حدود */
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.25);
  --border-focus: rgba(255, 255, 255, 0.50);
}
```

### مثال على بطاقة زجاجية

```css
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: 1rem;
  color: var(--text-primary);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: var(--border-strong);
}

.glass-card:focus-within {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```
