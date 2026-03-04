# شبكة 12 عمود — Grid System

> تخطيط مرايا سينمائي — وسط الشاشة هو المسرح، والأطراف هي الأجنحة.

---

## 1. المواصفات الأساسية

| الخاصية | القيمة |
|---------|--------|
| **عدد الأعمدة** | 12 |
| **الفجوة (Gutter)** | 24px |
| **العرض الأقصى** | 1440px |
| **المحاذاة** | مركزية |
| **الاتجاه الافتراضي** | RTL |

---

## 2. هوامش الشبكة حسب الشاشة

| نقطة القطع | العرض | الهامش الجانبي | أعمدة فعّالة |
|-----------|-------|------------|-------------|
| **xs** | 0 – 479px | 16px | 4 |
| **sm** | 480 – 767px | 16px | 4 |
| **md** | 768 – 1023px | 32px | 8 |
| **lg** | 1024 – 1279px | 64px | 12 |
| **xl** | 1280 – 1535px | 64px | 12 |
| **xxl** | 1536px+ | 80px | 12 |

---

## 3. CSS Implementation

### المتغيرات الأساسية

```css
:root {
  --grid-columns: 12;
  --grid-gutter:  24px;
  --grid-margin:  16px;
  --grid-max:     1440px;
}

@media (min-width: 768px) {
  :root { --grid-margin: 32px; }
}
@media (min-width: 1024px) {
  :root { --grid-margin: 64px; }
}
@media (min-width: 1536px) {
  :root { --grid-margin: 80px; }
}
```

### الحاوية

```css
.container {
  width: 100%;
  max-width: var(--grid-max);
  margin-inline: auto;
  padding-inline: var(--grid-margin);
}
```

### الشبكة

```css
.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
}

/* Responsive column reduction */
@media (max-width: 767px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .grid { grid-template-columns: repeat(8, 1fr); }
}
```

### أدوات الامتداد (Span Utilities)

```css
.col-1  { grid-column: span 1; }
.col-2  { grid-column: span 2; }
.col-3  { grid-column: span 3; }
.col-4  { grid-column: span 4; }
.col-5  { grid-column: span 5; }
.col-6  { grid-column: span 6; }
.col-7  { grid-column: span 7; }
.col-8  { grid-column: span 8; }
.col-9  { grid-column: span 9; }
.col-10 { grid-column: span 10; }
.col-11 { grid-column: span 11; }
.col-12 { grid-column: span 12; }

/* responsive overrides */
@media (max-width: 767px) {
  .col-sm-4 { grid-column: span 4; }
}
@media (min-width: 768px) {
  .col-md-4 { grid-column: span 4; }
  .col-md-6 { grid-column: span 6; }
  .col-md-8 { grid-column: span 8; }
}
@media (min-width: 1024px) {
  .col-lg-3 { grid-column: span 3; }
  .col-lg-4 { grid-column: span 4; }
  .col-lg-6 { grid-column: span 6; }
  .col-lg-8 { grid-column: span 8; }
}
```

---

## 4. تخطيطات شائعة

### تخطيط المحتوى المركزي (سينمائي)

```
┌──────────────────────────────────────────────┐
│  margin  │          8 columns          │  margin  │
│          │     ┌────────────────┐      │          │
│          │     │   المحتوى      │      │          │
│          │     └────────────────┘      │          │
└──────────────────────────────────────────────┘
```

```css
.layout-cinematic {
  grid-column: 3 / 11;  /* 8 أعمدة وسطى */
}
@media (max-width: 767px) {
  .layout-cinematic { grid-column: 1 / -1; }
}
```

### تخطيط بطاقات المشاعر (3×2 grid)

```css
.emotion-picker__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 500px;
}

@media (max-width: 480px) {
  .emotion-picker__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### تخطيط الشاشة الكاملة

```css
.layout-fullscreen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 2rem;
}
```

---

## 5. RTL و LTR

الشبكة تعمل بشكل صحيح في كلا الاتجاهين بفضل CSS Logical Properties:

```css
/* ✅ صحيح — يعمل RTL و LTR */
.container {
  padding-inline: var(--grid-margin);
  margin-inline: auto;
}

/* ❌ خاطئ — يتطلب تعديلات RTL يدوية */
.container {
  padding-left: var(--grid-margin);
  padding-right: var(--grid-margin);
}
```

### القواعد:

1. استخدم `inline-start` / `inline-end` بدل `left` / `right`
2. استخدم `block-start` / `block-end` بدل `top` / `bottom` (عند الحاجة)
3. استخدم `margin-inline` / `padding-inline`
4. استخدم `inset-inline-start` / `inset-inline-end` بدل `left` / `right` في positioning
