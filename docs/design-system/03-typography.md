# الطباعة — Typography

> الكلمة في مرايا ليست مجرد نص — بل مشهد.
> كل مستوى طباعي مصمّم ليروي جزءًا من القصة.

---

## 1. عائلات الخطوط

| الدور | الخط | الحمل | الاستخدام |
|-------|------|-------|-----------|
| **Display** | Cairo | 600-700 | عناوين، أسماء المشاهد، النص السردي العربي |
| **UI** | Outfit | 400-700 | أزرار، تسميات، نص واجهة |
| **Arabic Body** | Cairo | 400-500 | نص سردي طويل بالعربية |
| **Mono** | JetBrains Mono | 400 | كود، بيانات فنية، debug |

### تحميل الخطوط

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CSS Fallback Stack

```css
--font-display:     'Cairo', 'Noto Sans Arabic', sans-serif;
--font-ui:          'Outfit', 'Noto Sans Arabic', sans-serif;
--font-arabic-body: 'Cairo', sans-serif;
--font-mono:        'JetBrains Mono', 'Fira Code', monospace;
```

---

## 2. المقياس الطباعي — 9 مستويات

### جدول المقياس

| # | المستوى | الحجم (clamp) | الوزن | الارتفاع | التباعد | الخط |
|---|---------|---------------|-------|----------|---------|------|
| 1 | **Hero** | `clamp(3rem, 8vw, 6rem)` | 700 | 1.1 | 0.02em | Display |
| 2 | **Display** | `clamp(2rem, 5vw, 3.5rem)` | 700 | 1.2 | 0.01em | Display |
| 3 | **Title 1** | `clamp(1.5rem, 3.5vw, 2.5rem)` | 700 | 1.3 | — | Display |
| 4 | **Title 2** | `clamp(1.2rem, 2.8vw, 1.75rem)` | 600 | 1.35 | — | Display |
| 5 | **Title 3** | `clamp(1rem, 2.2vw, 1.3rem)` | 600 | 1.4 | — | Display |
| 6 | **Body** | `clamp(0.95rem, 1.8vw, 1.1rem)` | 400 | 1.65 | — | UI |
| 7 | **Callout** | `clamp(0.875rem, 1.5vw, 1rem)` | 500 | 1.5 | — | UI |
| 8 | **Caption** | `clamp(0.75rem, 1.2vw, 0.85rem)` | 500 | 1.4 | 0.02em | UI |
| 9 | **Overline** | `clamp(0.65rem, 1vw, 0.75rem)` | 700 | 1.3 | 0.08em | UI |

---

## 3. المقياس التفاعلي (Responsive Scale)

كل حجم يستخدم `clamp()` ليتكيّف بسلاسة بين الهاتف وسطح المكتب.

### كيف يعمل clamp()

```
clamp(الحد_الأدنى, الحجم_المفضل, الحد_الأقصى)
```

| الشاشة | Hero | Body | Caption |
|--------|------|------|---------|
| **Mobile** (375px) | ~3rem (48px) | ~0.95rem (15px) | ~0.75rem (12px) |
| **Tablet** (768px) | ~4rem (64px) | ~1rem (16px) | ~0.8rem (13px) |
| **Desktop** (1280px) | ~5.5rem (88px) | ~1.08rem (17px) | ~0.84rem (13px) |
| **Wide** (1536px+) | 6rem (96px) | 1.1rem (18px) | 0.85rem (14px) |

### CSS Implementation

```css
:root {
  /* Hero */
  --type-hero-size:    clamp(3rem, 8vw, 6rem);
  --type-hero-weight:  700;
  --type-hero-height:  1.1;
  --type-hero-spacing: 0.02em;

  /* Display */
  --type-display-size:    clamp(2rem, 5vw, 3.5rem);
  --type-display-weight:  700;
  --type-display-height:  1.2;

  /* Title 1 */
  --type-title1-size:   clamp(1.5rem, 3.5vw, 2.5rem);
  --type-title1-weight: 700;
  --type-title1-height: 1.3;

  /* Title 2 */
  --type-title2-size:   clamp(1.2rem, 2.8vw, 1.75rem);
  --type-title2-weight: 600;
  --type-title2-height: 1.35;

  /* Title 3 */
  --type-title3-size:   clamp(1rem, 2.2vw, 1.3rem);
  --type-title3-weight: 600;
  --type-title3-height: 1.4;

  /* Body */
  --type-body-size:   clamp(0.95rem, 1.8vw, 1.1rem);
  --type-body-weight: 400;
  --type-body-height: 1.65;

  /* Callout */
  --type-callout-size:   clamp(0.875rem, 1.5vw, 1rem);
  --type-callout-weight: 500;
  --type-callout-height: 1.5;

  /* Caption */
  --type-caption-size:    clamp(0.75rem, 1.2vw, 0.85rem);
  --type-caption-weight:  500;
  --type-caption-height:  1.4;
  --type-caption-spacing: 0.02em;

  /* Overline */
  --type-overline-size:      clamp(0.65rem, 1vw, 0.75rem);
  --type-overline-weight:    700;
  --type-overline-height:    1.3;
  --type-overline-spacing:   0.08em;
  --type-overline-transform: uppercase;
}
```

---

## 4. أنماط الطباعة (Type Styles)

### Hero — عنوان الصفحة الرئيسية

```css
.type-hero {
  font-family: var(--font-display);
  font-size: var(--type-hero-size);
  font-weight: var(--type-hero-weight);
  line-height: var(--type-hero-height);
  letter-spacing: var(--type-hero-spacing);
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**الاستخدام**: عنوان "مرايا" في شاشة البداية فقط.

### Display — عناوين الأقسام الرئيسية

```css
.type-display {
  font-family: var(--font-display);
  font-size: var(--type-display-size);
  font-weight: var(--type-display-weight);
  line-height: var(--type-display-height);
  color: var(--text-primary);
}
```

**الاستخدام**: عناوين المشاهد، شاشة النهاية.

### النص السردي (Narration)

```css
.type-narration {
  font-family: var(--font-arabic-body);
  font-size: clamp(1.1rem, 2.8vw, 1.7rem);
  font-weight: 500;
  line-height: 1.85;
  color: var(--text-primary);
  text-shadow: 0 2px 20px rgba(0,0,0,0.9),
               0 0 40px rgba(0,0,0,0.6);
}
```

**الاستخدام**: كتل السرد داخل المشاهد. ارتفاع السطر مرتفع عمداً لتسهيل القراءة بالعربية.

### Overline — تسميات البلوكات

```css
.type-overline {
  font-family: var(--font-ui);
  font-size: var(--type-overline-size);
  font-weight: var(--type-overline-weight);
  line-height: var(--type-overline-height);
  letter-spacing: var(--type-overline-spacing);
  text-transform: var(--type-overline-transform);
}
```

**الاستخدام**: تسميات "NARRATION"، "VISUAL"، "REFLECTION" في البلوكات.

---

## 5. قابلية الوصول في الطباعة

### الحد الأدنى للأحجام

| السياق | الحد الأدنى | التوصية |
|--------|-------------|---------|
| نص الجسم | 16px (1rem) | clamp يمنع تقليص تحت 15px |
| تسميات | 12px (0.75rem) | مقبول مع وزن 500+ |
| أزرار | 14px (0.875rem) | يجب أن يكون مقروءًا بوضوح |
| نص سردي عربي | 17px (1.1rem) | عربي يحتاج حجم أكبر من اللاتيني |

### ارتفاع السطر للقراءة

| النوع | ارتفاع السطر | السبب |
|-------|-------------|-------|
| عناوين | 1.1 – 1.3 | عناوين قصيرة لا تحتاج تباعد كبير |
| نص واجهة | 1.4 – 1.5 | توازن بين الكثافة والقراءة |
| نص سردي | 1.65 – 1.85 | فقرات طويلة بالعربية تحتاج تنفّس |

### دعم تكبير المستخدم

```css
/* لا تستخدم px ثابتة للحجم الأساسي */
html {
  font-size: 100%; /* يحترم تكبير المتصفح */
}

/* استخدم وحدات نسبية */
.text {
  font-size: 1rem;    /* ✅ يتكبّر مع المستخدم */
  font-size: 16px;    /* ❌ ثابت، لا يتكبّر */
}
```

### اختبار القراءة

- ✅ هل النص مقروء على مسافة ذراع؟
- ✅ هل هناك تباين كافٍ مع الخلفية؟
- ✅ هل ارتفاع السطر كافٍ للعربية (بحروفها الطويلة)؟
- ✅ هل التباعد بين الحروف مناسب؟
- ✅ هل الحجم يتكبّر عند تكبير المتصفح (200%)؟
