# المكوّنات — Components (30+)

> كل مكوّن في مرايا هو ممثل على المسرح — له دور ومظهر وحالات وقواعد.

---

## الفهرس

### أساسيات (Foundation)
1. [GlassCard](#1-glasscard)
2. [Button](#2-button)
3. [IconButton](#3-iconbutton)
4. [Badge](#4-badge)
5. [Tag](#5-tag)
6. [Divider](#6-divider)
7. [Spacer](#7-spacer)

### إدخال (Input)
8. [TextInput](#8-textinput)
9. [Select](#9-select)
10. [Toggle](#10-toggle)
11. [Checkbox](#11-checkbox)
12. [Radio](#12-radio)
13. [Slider](#13-slider)
14. [Dropzone](#14-dropzone)

### عرض البيانات (Data Display)
15. [Avatar](#15-avatar)
16. [EmotionCard](#16-emotioncard)
17. [NarrationBlock](#17-narrationblock)
18. [SceneProgress](#18-sceneprogress)
19. [ChatBubble](#19-chatbubble)
20. [Tooltip](#20-tooltip)
21. [Skeleton](#21-skeleton)

### ملاحة (Navigation)
22. [TopBar](#22-topbar)
23. [LiveRedirectBar](#23-liveredirectbar)
24. [Breadcrumb](#24-breadcrumb)
25. [TabBar](#25-tabbar)

### تراكب (Overlay)
26. [Modal](#26-modal)
27. [Drawer](#27-drawer)
28. [Toast](#28-toast)
29. [ContextMenu](#29-contextmenu)

### تجربة (Experience)
30. [LoadingOrb](#30-loadingorb)
31. [ChoiceButton](#31-choicebutton)
32. [AudioHUD](#32-audiohud)
33. [DebugTag](#33-debugtag)
34. [EmotionPicker](#34-emotionpicker)
35. [SceneRenderer](#35-scenerenderer)
36. [EndingScreen](#36-endingscreen)

---

## 1. GlassCard

> البطاقة الزجاجية — العنصر البنائي الأساسي لكل سطح في مرايا.

### البنية (Structure)

```html
<div class="glass-card" role="region" aria-label="[وصف]">
  <div class="glass-card__header">
    <h3 class="glass-card__title">العنوان</h3>
  </div>
  <div class="glass-card__body">
    <!-- المحتوى -->
  </div>
  <div class="glass-card__footer">
    <!-- إجراءات -->
  </div>
</div>
```

### الحالات

| الحالة | الخلفية | الحدود | التأثير |
|--------|---------|--------|---------|
| **Default** | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.10)` | — |
| **Hover** | `rgba(255,255,255,0.10)` | `rgba(255,255,255,0.20)` | — |
| **Active** | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.25)` | — |
| **Focus** | `rgba(255,255,255,0.06)` | — | `outline: 2px solid rgba(255,255,255,0.50)` |
| **Disabled** | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.05)` | `opacity: 0.45` |

### CSS

```css
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);              /* 16px */
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  padding: var(--space-6);                       /* 24px */
  transition: all 0.3s var(--ease-smooth);
}
```

### قابلية الوصول
- ✅ `role="region"` مع `aria-label`
- ✅ `focus-within` يظهر حلقة التركيز
- ✅ تباين WCAG AA+ على كل المحتوى

---

## 2. Button

> الأزرار هي نقاط الاتصال الأساسية — يجب أن تكون واضحة ومغرية.

### المتغيرات (Variants)

| المتغير | المظهر | الاستخدام |
|---------|--------|-----------|
| **Primary** | خلفية زجاجية مضيئة | الإجراء الرئيسي |
| **Secondary** | حدود فقط | إجراء ثانوي |
| **Ghost** | شفاف بالكامل | إجراء خفيف |
| **Danger** | خلفية حمراء خفيفة | حذف، إلغاء خطير |
| **Accent** | تدرج لوني مميز | CTA بارز |

### الأحجام

| الحجم | ارتفاع | padding | font-size |
|-------|--------|---------|-----------|
| **sm** | 32px | 4px 12px | 0.82rem |
| **md** | 40px | 8px 20px | 0.95rem |
| **lg** | 48px | 12px 28px | 1.05rem |
| **xl** | 56px | 16px 36px | 1.15rem |

### البنية

```html
<button class="btn btn--primary btn--md" type="button">
  <span class="btn__icon" aria-hidden="true">✨</span>
  <span class="btn__label">ابدأ الرحلة</span>
</button>
```

### الحالات

| الحالة | التأثير |
|--------|---------|
| **Default** | الخلفية والحدود الافتراضية |
| **Hover** | خلفية أفتح، حدود أقوى، `translateY(-2px)` |
| **Active/Pressed** | `scale(0.97)` |
| **Focus** | `outline: 2px solid var(--border-focus)`, `outline-offset: 2px` |
| **Disabled** | `opacity: 0.45`, `cursor: not-allowed` |
| **Loading** | أيقونة spinner، نص مخفي بصريًا |

### CSS

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-full);
  font-family: var(--font-ui);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s var(--ease-smooth);
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn--primary {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-color: var(--glass-border);
  color: var(--text-primary);
}

.btn--primary:hover {
  background: rgba(255,255,255,0.12);
  border-color: var(--border-strong);
  transform: translateY(-2px);
}

.btn:active { transform: scale(0.97); }

.btn:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
```

### قابلية الوصول
- ✅ `type="button"` دائمًا (ما لم يكن submit)
- ✅ `aria-label` إذا كان الزر أيقونة فقط
- ✅ `aria-busy="true"` أثناء التحميل
- ✅ `aria-disabled="true"` بدلاً من `disabled` عند الحاجة للتركيز
- ✅ حد أدنى لحجم اللمس: 44×44px

---

## 3. IconButton

### البنية

```html
<button class="icon-btn" type="button" aria-label="كتم الصوت">
  <span class="icon-btn__icon" aria-hidden="true">🔇</span>
</button>
```

### CSS

```css
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s var(--ease-spring);
}

.icon-btn:hover {
  background: rgba(255,255,255,0.10);
  color: var(--text-primary);
  transform: scale(1.15);
}
```

### قابلية الوصول
- ✅ `aria-label` مطلوب دائمًا
- ✅ حجم لمس ≥ 44px

---

## 4. Badge

### البنية

```html
<span class="badge badge--gold">جديد</span>
```

### المتغيرات

| المتغير | اللون | الاستخدام |
|---------|-------|-----------|
| **default** | أبيض/رمادي | معلومات عامة |
| **gold** | ذهبي | بصري، مميز |
| **cyan** | سماوي | انعكاس، تأمل |
| **emerald** | أخضر | نجاح، نشط |
| **rose** | وردي | خطأ، انتباه |

### CSS

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-family: var(--font-ui);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: rgba(255,255,255,0.10);
  color: var(--text-primary);
  border: 1px solid rgba(255,255,255,0.20);
}

.badge--gold {
  background: rgba(255,215,0,0.15);
  color: #ffe88f;
  border-color: rgba(255,215,0,0.40);
}
```

---

## 5. Tag

### البنية

```html
<span class="tag">
  <span class="tag__label">🔥 سرد</span>
  <button class="tag__remove" aria-label="إزالة">×</button>
</span>
```

### CSS

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  font-size: 0.82rem;
  color: var(--text-secondary);
}
```

---

## 6. Divider

### البنية

```html
<hr class="divider" role="separator" />
<hr class="divider divider--glow" role="separator" />
```

### CSS

```css
.divider {
  border: none;
  height: 1px;
  background: var(--border-default);
  margin-block: var(--space-6);
}

.divider--glow {
  background: linear-gradient(90deg,
    transparent,
    rgba(255,255,255,0.15) 50%,
    transparent
  );
}
```

---

## 7. Spacer

### البنية

```html
<div class="spacer spacer--md" aria-hidden="true"></div>
```

### CSS

```css
.spacer--xs  { height: var(--space-2); }
.spacer--sm  { height: var(--space-4); }
.spacer--md  { height: var(--space-8); }
.spacer--lg  { height: var(--space-12); }
.spacer--xl  { height: var(--space-16); }
```

---

## 8. TextInput

### البنية

```html
<div class="input-group">
  <label class="input-group__label" for="story-title">عنوان القصة</label>
  <input
    class="input-group__field"
    id="story-title"
    type="text"
    placeholder="أدخل العنوان..."
    aria-describedby="story-title-hint"
  />
  <span class="input-group__hint" id="story-title-hint">اختياري</span>
</div>
```

### الحالات

| الحالة | الحدود | الاستخدام |
|--------|--------|-----------|
| **Default** | `rgba(255,255,255,0.25)` | الحالة الطبيعية |
| **Focus** | `outline: 2px solid rgba(255,255,255,0.35)` | أثناء الكتابة |
| **Error** | `border-color: var(--accent-rose)` | خطأ في التحقق |
| **Disabled** | `opacity: 0.45` | معطّل |

### CSS

```css
.input-group__field {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.25);
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-family: var(--font-ui);
  font-size: 0.95rem;
  backdrop-filter: blur(8px);
  transition: all 0.2s var(--ease-smooth);
}

.input-group__field:focus {
  outline: 2px solid rgba(255,255,255,0.35);
  outline-offset: 2px;
}
```

### قابلية الوصول
- ✅ `<label>` مرتبط عبر `for`/`id`
- ✅ `aria-describedby` للتلميحات
- ✅ `aria-invalid="true"` عند الخطأ
- ✅ `aria-errormessage` مرتبط برسالة الخطأ

---

## 9. Select

### البنية

```html
<div class="input-group">
  <label class="input-group__label" for="mode-select">نمط السرد</label>
  <select class="select" id="mode-select">
    <option value="msr">🇪🇬 عامية مصرية</option>
    <option value="fusha">📜 فصحى</option>
    <option value="judge">🏆 Judge Mode (English)</option>
  </select>
</div>
```

### CSS

```css
.select {
  min-width: 280px;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.25);
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-family: var(--font-ui);
  font-size: 0.95rem;
  backdrop-filter: blur(8px);
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* custom chevron */
  background-repeat: no-repeat;
  background-position: left 0.7rem center; /* RTL-aware */
}

[dir='ltr'] .select {
  background-position: right 0.7rem center;
}
```

---

## 10. Toggle

### البنية

```html
<button
  class="toggle"
  role="switch"
  aria-checked="false"
  aria-label="تفعيل الصوت"
>
  <span class="toggle__label">الصوت</span>
  <span class="toggle__track">
    <span class="toggle__thumb"></span>
  </span>
</button>
```

### الحالات

| الحالة | Visual |
|--------|--------|
| **Off** | track رمادي شفاف، thumb يسار |
| **On** | track أخضر، thumb يمين، glow |
| **Disabled** | `opacity: 0.45` |

### CSS

```css
.toggle__track {
  width: 44px;
  height: 24px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.20);
  position: relative;
  transition: all 0.3s var(--ease-spring);
}

.toggle[aria-checked="true"] .toggle__track {
  background: rgba(40,120,90,0.4);
  border-color: rgba(94,255,179,0.7);
}

.toggle__thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 1px;
  inset-inline-start: 1px;
  transition: all 0.3s var(--ease-spring);
}

.toggle[aria-checked="true"] .toggle__thumb {
  inset-inline-start: 21px;
}
```

### قابلية الوصول
- ✅ `role="switch"`
- ✅ `aria-checked`
- ✅ يتبدل بـ Space/Enter

---

## 11. Checkbox

### البنية

```html
<label class="checkbox">
  <input type="checkbox" class="checkbox__input" />
  <span class="checkbox__box" aria-hidden="true"></span>
  <span class="checkbox__label">أوافق على الشروط</span>
</label>
```

### CSS

```css
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox__box {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-xs);
  border: 2px solid rgba(255,255,255,0.30);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s var(--ease-smooth);
}

.checkbox__input:checked + .checkbox__box {
  background: var(--accent-emerald);
  border-color: var(--accent-emerald);
}

.checkbox__input:focus-visible + .checkbox__box {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

---

## 12. Radio

### البنية

```html
<fieldset class="radio-group">
  <legend class="radio-group__legend">اختر النمط</legend>
  <label class="radio">
    <input type="radio" name="mode" class="radio__input" />
    <span class="radio__circle" aria-hidden="true"></span>
    <span class="radio__label">شاعري</span>
  </label>
</fieldset>
```

### CSS

```css
.radio__circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.30);
  position: relative;
  transition: all 0.2s var(--ease-smooth);
}

.radio__input:checked + .radio__circle {
  border-color: var(--accent-violet);
}

.radio__input:checked + .radio__circle::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-violet);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

---

## 13. Slider

### البنية

```html
<div class="slider-group">
  <label class="slider-group__label" for="volume">الصوت</label>
  <input
    type="range"
    class="slider"
    id="volume"
    min="0"
    max="100"
    value="75"
    aria-valuetext="75%"
  />
  <output class="slider-group__output">75%</output>
</div>
```

### CSS

```css
.slider {
  width: 100%;
  height: 4px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.15);
  appearance: none;
  outline: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--accent-violet);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(167,139,250,0.4);
  transition: transform 0.2s var(--ease-spring);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
```

---

## 14. Dropzone

### البنية

```html
<div class="dropzone" role="button" tabindex="0" aria-label="ارفع صورة المكان">
  <input type="file" class="visually-hidden" accept="image/*" id="space-upload" />
  <span class="dropzone__icon">📸</span>
  <span class="dropzone__text">اسحب صورة هنا أو اضغط للرفع</span>
</div>
```

### الحالات

| الحالة | المظهر |
|--------|--------|
| **Default** | حدود متقطعة خفيفة |
| **Hover** | حدود أقوى، خلفية خفيفة |
| **DragOver** | حدود لامعة، خلفية أكثر | 
| **Has File** | يظهر preview بدل النص |
| **Error** | حدود حمراء |

### CSS

```css
.dropzone {
  width: 100%;
  aspect-ratio: 16/10;
  border: 2px dashed rgba(255,255,255,0.15);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.3s var(--ease-smooth);
}

.dropzone:hover,
.dropzone--active {
  border-color: rgba(255,255,255,0.30);
  background: rgba(255,255,255,0.03);
}

.dropzone:focus-within {
  outline: 2px solid var(--border-focus);
  outline-offset: 4px;
  border-color: rgba(255,255,255,0.50);
}
```

### قابلية الوصول
- ✅ `role="button"` + `tabindex="0"`
- ✅ `<input>` مخفي بصريًا وليس `display: none`
- ✅ `focus-within` يطبّق حلقة تركيز

---

## 15. Avatar

### البنية

```html
<div class="avatar avatar--md" role="img" aria-label="صورة المستخدم">
  <img class="avatar__img" src="..." alt="" />
</div>
```

### الأحجام

| الحجم | القطر |
|-------|-------|
| **xs** | 24px |
| **sm** | 32px |
| **md** | 40px |
| **lg** | 56px |
| **xl** | 80px |

### CSS

```css
.avatar {
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--glass-border);
  background: var(--glass-bg);
}

.avatar--md { width: 40px; height: 40px; }

.avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## 16. EmotionCard

> بطاقة اختيار المشاعر — نقطة بداية الرحلة في مرايا.

### البنية

```html
<button
  class="emotion-card"
  style="--card-color: #ffd700; --card-gradient: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.03))"
  aria-pressed="false"
>
  <span class="emotion-card__icon" aria-hidden="true">😊</span>
  <span class="emotion-card__label">فرح</span>
</button>
```

### الحالات

| الحالة | التأثير |
|--------|---------|
| **Default** | خلفية زجاجية، حدود خفيفة |
| **Hover** | تدرج لوني، `translateY(-4px) scale(1.03)`، glow |
| **Active/Selected** | نفس hover مع `aria-pressed="true"` |
| **Pressed** | `scale(0.97)` |

### CSS

```css
.emotion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: 1.5rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  cursor: pointer;
  transition: all 0.4s var(--ease-spring);
  color: #fff;
  font-family: var(--font-ui);
}

.emotion-card:hover,
.emotion-card[aria-pressed="true"] {
  background: var(--card-gradient);
  border-color: var(--card-color);
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4),
              0 0 30px color-mix(in srgb, var(--card-color) 45%, transparent);
}
```

### قابلية الوصول
- ✅ `aria-pressed` لحالة التحديد
- ✅ `aria-hidden` على الأيقونة
- ✅ حجم لمس ≥ 44px

---

## 17. NarrationBlock

> كتلة السرد — القلب النابض لعرض القصة.

### البنية

```html
<div class="narration-block narration-block--narration" role="article">
  <span class="narration-block__label">📖 سرد</span>
  <p class="narration-block__content">
    في تلك الليلة، كان القمر يبدو أقرب من أيّ وقت مضى...
    <span class="narration-block__cursor" aria-hidden="true">▎</span>
  </p>
</div>
```

### المتغيرات

| النوع | لون الحدود | لون التسمية |
|-------|------------|-------------|
| **narration** | `rgba(255,255,255,0.20)` | أبيض |
| **visual** | `rgba(255,215,0,0.45)` | `#ffe88f` |
| **reflection** | `rgba(120,200,255,0.45)` | `#d8f1ff` |

### CSS Key Snippet

```css
.narration-block {
  padding: 0.8rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(0,0,0,0.32);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
}

.narration-block--visual {
  border-color: rgba(255,215,0,0.45);
}

.narration-block--reflection {
  border-color: rgba(120,200,255,0.45);
}

.narration-block__content {
  font-family: var(--font-arabic-body);
  font-size: clamp(1.1rem, 2.8vw, 1.7rem);
  font-weight: 500;
  line-height: 1.85;
  color: var(--text-primary);
  text-shadow: 0 2px 20px rgba(0,0,0,0.9);
}
```

---

## 18. SceneProgress

### البنية

```html
<div class="scene-progress" role="status" aria-live="polite">
  المشهد 3 من 5
</div>
```

### CSS

```css
.scene-progress {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255,255,255,0.38);
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.96);
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 700;
}
```

### قابلية الوصول
- ✅ `role="status"` + `aria-live="polite"` لإعلان التحديثات

---

## 19. ChatBubble

### البنية

```html
<div class="chat-bubble chat-bubble--narration">
  <span class="chat-bubble__label">سرد</span>
  <p class="chat-bubble__text">نص الفقاعة...</p>
</div>
```

### المتغيرات

| النوع | المحاذاة | الخلفية | الحدود |
|-------|---------|---------|--------|
| **narration** | بداية | شفافة | أبيض خفيف |
| **visual** | وسط | ذهبي خفيف | ذهبي |
| **reflection** | بداية | سماوي خفيف | سماوي |

### CSS

```css
.chat-bubble {
  padding: 0.8rem 1.2rem;
  border-radius: 1.2rem;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  max-width: 90%;
  animation: bubblePeek 0.5s var(--ease-spring);
}

.chat-bubble--narration {
  align-self: flex-start;
  border-end-start-radius: 0.2rem;
}

.chat-bubble--visual {
  align-self: center;
  background: rgba(255,215,0,0.05);
  border-color: rgba(255,215,0,0.20);
}
```

---

## 20. Tooltip

### البنية

```html
<div class="tooltip-wrapper">
  <button aria-describedby="tip-1">🔊</button>
  <div class="tooltip" id="tip-1" role="tooltip">تشغيل الصوت</div>
</div>
```

### CSS

```css
.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: var(--z-tooltip);
}

.tooltip-wrapper:hover .tooltip,
.tooltip-wrapper:focus-within .tooltip {
  opacity: 1;
}
```

### قابلية الوصول
- ✅ `role="tooltip"`
- ✅ `aria-describedby` يربط المحفّز بالـ tooltip

---

## 21. Skeleton

### البنية

```html
<div class="skeleton skeleton--text" aria-hidden="true"></div>
<div class="skeleton skeleton--card" aria-hidden="true"></div>
<div class="skeleton skeleton--circle" aria-hidden="true"></div>
```

### CSS

```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton--text { height: 16px; width: 80%; }
.skeleton--card { height: 120px; width: 100%; border-radius: var(--radius-lg); }
.skeleton--circle { height: 40px; width: 40px; border-radius: 50%; }

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
```

---

## 22. TopBar

### البنية

```html
<header class="top-bar" role="banner">
  <div class="top-bar__start">
    <h1 class="top-bar__title">مرايا</h1>
  </div>
  <div class="top-bar__end">
    <button class="icon-btn" aria-label="الإعدادات">⚙️</button>
  </div>
</header>
```

### CSS

```css
.top-bar {
  position: fixed;
  top: 0;
  inset-inline: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: var(--space-4);
  background: rgba(3,3,5,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  z-index: var(--z-bar);
}
```

---

## 23. LiveRedirectBar

> شريط الإجراءات العائم — للتنقل بين المشاعر أثناء القصة.

### البنية

```html
<nav class="live-bar" role="navigation" aria-label="تغيير المشاعر">
  <button class="live-bar__btn" aria-label="فرح">😊</button>
  <button class="live-bar__btn" aria-label="حزن">😢</button>
  <button class="live-bar__btn" aria-label="غضب">😡</button>
</nav>
```

### CSS

```css
.live-bar {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-4);
  background: rgba(10,10,15,0.6);
  backdrop-filter: blur(25px);
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255,255,255,0.15);
  z-index: var(--z-bar);
  animation: fadeInUp 0.5s var(--ease-spring);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

.live-bar__btn {
  font-size: 1.8rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  filter: grayscale(100%) opacity(0.5);
  transition: all 0.3s var(--ease-spring);
}

.live-bar__btn:hover {
  filter: grayscale(0%) opacity(1);
  transform: scale(1.3) rotate(8deg);
  background: rgba(255,255,255,0.10);
}
```

---

## 24. Breadcrumb

### البنية

```html
<nav class="breadcrumb" aria-label="التنقل">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item"><a href="#">الرئيسية</a></li>
    <li class="breadcrumb__separator" aria-hidden="true">/</li>
    <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">المشهد 3</li>
  </ol>
</nav>
```

### CSS

```css
.breadcrumb__list {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.breadcrumb__item a {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb__item a:hover { color: var(--text-primary); }

.breadcrumb__item--current { color: var(--text-primary); }
```

---

## 25. TabBar

### البنية

```html
<div class="tab-bar" role="tablist">
  <button class="tab" role="tab" aria-selected="true">القصة</button>
  <button class="tab" role="tab" aria-selected="false">الإعدادات</button>
</div>
```

### CSS

```css
.tab-bar {
  display: flex;
  gap: var(--space-1);
  background: rgba(0,0,0,0.3);
  padding: 4px;
  border-radius: var(--radius-md);
}

.tab {
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s var(--ease-smooth);
}

.tab[aria-selected="true"] {
  background: var(--glass-bg);
  color: var(--text-primary);
}
```

---

## 26. Modal

### البنية

```html
<div class="modal-backdrop" aria-hidden="true"></div>
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal__header">
    <h2 class="modal__title" id="modal-title">تأكيد</h2>
    <button class="icon-btn modal__close" aria-label="إغلاق">✕</button>
  </div>
  <div class="modal__body">
    <p>هل تريد إعادة بدء القصة؟</p>
  </div>
  <div class="modal__footer">
    <button class="btn btn--secondary">إلغاء</button>
    <button class="btn btn--primary">تأكيد</button>
  </div>
</div>
```

### CSS

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: calc(var(--z-modal) - 1);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 480px);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  z-index: var(--z-modal);
  animation: fadeInUp 0.4s var(--ease-spring);
}
```

### قابلية الوصول
- ✅ `role="dialog"` + `aria-modal="true"`
- ✅ `aria-labelledby` مرتبط بالعنوان
- ✅ حبس التركيز (Focus Trap)
- ✅ إغلاق بـ Escape

---

## 27. Drawer

### البنية

```html
<aside class="drawer drawer--end" role="dialog" aria-modal="true" aria-label="القائمة">
  <div class="drawer__header">
    <button class="icon-btn" aria-label="إغلاق">✕</button>
  </div>
  <div class="drawer__body">
    <!-- المحتوى -->
  </div>
</aside>
```

### CSS

```css
.drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  width: min(85vw, 360px);
  background: var(--bg-secondary);
  border-inline-start: 1px solid var(--border-default);
  z-index: var(--z-modal);
  transform: translateX(100%);
  transition: transform 0.4s var(--ease-spring);
}

[dir='rtl'] .drawer--end { right: 0; }
[dir='ltr'] .drawer--end { right: 0; }

.drawer--open {
  transform: translateX(0);
}
```

---

## 28. Toast

### البنية

```html
<div class="toast toast--success" role="alert" aria-live="assertive">
  <span class="toast__icon" aria-hidden="true">✅</span>
  <span class="toast__message">تم حفظ القصة بنجاح</span>
  <button class="toast__close" aria-label="إغلاق">✕</button>
</div>
```

### المتغيرات

| النوع | الحدود | الأيقونة |
|-------|--------|---------|
| **info** | cyan | ℹ️ |
| **success** | emerald | ✅ |
| **warning** | coral | ⚠️ |
| **error** | rose | ❌ |

### CSS

```css
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(120%);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0.8rem 1.2rem;
  border-radius: var(--radius-lg);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  backdrop-filter: blur(20px);
  animation: toastIn 0.5s var(--ease-spring) forwards;
  z-index: var(--z-tooltip);
}

@keyframes toastIn {
  to { transform: translateX(-50%) translateY(0); }
}
```

### قابلية الوصول
- ✅ `role="alert"` + `aria-live="assertive"`
- ✅ يختفي تلقائيًا بعد 5 ثوانٍ
- ✅ زر إغلاق يدوي

---

## 29. ContextMenu

### البنية

```html
<div class="context-menu" role="menu">
  <button class="context-menu__item" role="menuitem">نسخ</button>
  <button class="context-menu__item" role="menuitem">مشاركة</button>
  <hr class="divider" role="separator" />
  <button class="context-menu__item context-menu__item--danger" role="menuitem">حذف</button>
</div>
```

### CSS

```css
.context-menu {
  min-width: 180px;
  padding: var(--space-1);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-tooltip);
}

.context-menu__item {
  width: 100%;
  padding: 8px 12px;
  text-align: start;
  background: transparent;
  border: none;
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}

.context-menu__item:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.context-menu__item--danger:hover {
  background: rgba(255,107,138,0.15);
  color: var(--accent-rose);
}
```

### قابلية الوصول
- ✅ `role="menu"` + `role="menuitem"`
- ✅ تنقّل Arrow keys
- ✅ إغلاق بـ Escape

---

## 30. LoadingOrb

> كرة الضوء العائمة — مؤشر التحميل السينمائي.

### البنية

```html
<div class="loading-orb" role="status" aria-label="جاري التحميل...">
  <div class="loading-orb__sphere">
    <div class="loading-orb__inner"></div>
  </div>
  <div class="loading-orb__reflection" aria-hidden="true"></div>
  <p class="loading-orb__text" aria-hidden="true">مرايا تتأمل...</p>
</div>
```

### CSS

```css
.loading-orb {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  animation: fadeInUp 0.6s var(--ease-spring);
}

.loading-orb__sphere {
  width: 80px;
  height: 80px;
  position: relative;
  animation: float 3s ease-in-out infinite;
}

.loading-orb__inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%,
    rgba(255,255,255,0.3),
    rgba(255,255,255,0.05) 50%,
    transparent
  );
  border: 1px solid rgba(255,255,255,0.10);
  animation: orbPulse 2s ease-in-out infinite;
}

.loading-orb__text {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--text-tertiary);
  animation: pulse 2s infinite;
}
```

### قابلية الوصول
- ✅ `role="status"` + `aria-label`
- ✅ النص المتحرّك `aria-hidden` لأنه زخرفي

---

## 31. ChoiceButton

> زر الاختيار السردي — يحدد مسار القصة.

### البنية

```html
<button class="choice-btn">
  <span class="choice-btn__text">افتح الباب الغامض</span>
  <span class="choice-btn__arrow" aria-hidden="true">←</span>
</button>
```

### CSS

```css
.choice-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.8rem;
  background: linear-gradient(135deg,
    rgba(255,255,255,0.08) 0%,
    rgba(255,255,255,0.03) 100%
  );
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 1.2rem;
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s var(--ease-bounce);
  box-shadow: var(--shadow-md);
}

.choice-btn:hover {
  background: linear-gradient(135deg,
    rgba(255,255,255,0.15) 0%,
    rgba(255,255,255,0.06) 100%
  );
  border-color: rgba(255,255,255,0.30);
  transform: translateX(-6px) scale(1.02);
  box-shadow: 0 8px 25px rgba(255,255,255,0.10);
}

[dir='ltr'] .choice-btn:hover {
  transform: translateX(6px) scale(1.02);
}
```

---

## 32. AudioHUD

> لوحة التحكم بالصوت — ثابتة في الزاوية.

### البنية

```html
<div class="audio-hud" role="toolbar" aria-label="أدوات الصوت">
  <button class="audio-hud__btn audio-hud__btn--on" aria-pressed="true">
    🔊 الصوت مفعّل
  </button>
  <button class="audio-hud__btn" aria-pressed="false">
    🎤 الميكروفون
  </button>
</div>
```

### CSS

```css
.audio-hud {
  position: fixed;
  top: 1rem;
  inset-inline-end: 1rem;
  z-index: var(--z-hud);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.audio-hud__btn {
  min-width: 170px;
  padding: 0.45rem 0.7rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.26);
  background: rgba(0,0,0,0.52);
  color: rgba(255,255,255,0.92);
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s var(--ease-smooth);
}

.audio-hud__btn--on {
  border-color: rgba(110,255,185,0.75);
  background: rgba(38,120,88,0.45);
  color: #deffea;
}
```

### قابلية الوصول
- ✅ `role="toolbar"` + `aria-label`
- ✅ `aria-pressed` لأزرار toggle

---

## 33. DebugTag

### البنية

```html
<div class="debug-tag debug-tag--visible" aria-hidden="true">
  <span>v2.1</span>
  <span class="debug-tag__version">α</span>
</div>
```

### CSS

```css
.debug-tag {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--radius-xs);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  pointer-events: none;
  z-index: var(--z-tooltip);
  opacity: 0;
  transition: all 0.4s var(--ease-smooth);
}

.debug-tag--visible { opacity: 1; }
```

---

## 34. EmotionPicker

> شاشة اختيار المشاعر الكاملة.

### البنية

```html
<section class="emotion-picker" role="main" aria-label="اختر مشاعرك">
  <header class="emotion-picker__header">
    <h1 class="emotion-picker__title">مرايا</h1>
    <p class="emotion-picker__subtitle">اختر مشاعرك، واترك المرآة تحكي</p>
  </header>

  <div class="emotion-picker__controls">
    <!-- Mode select + voice toggle -->
  </div>

  <div class="emotion-picker__grid" role="radiogroup" aria-label="المشاعر">
    <!-- EmotionCard × 6 -->
  </div>

  <button class="emotion-picker__upload">
    <span class="emotion-picker__upload-icon">📸</span>
    أو ارفع صورة مكانك
  </button>
</section>
```

### قابلية الوصول
- ✅ `role="radiogroup"` لمجموعة البطاقات
- ✅ `aria-label` على كل قسم
- ✅ التنقل بالأسهم بين البطاقات

---

## 35. SceneRenderer

> مشهد القصة الكامل — يضم السرد والخيارات والصور.

### البنية

```html
<main class="scene-renderer" role="main" aria-label="المشهد الحالي">
  <div class="scene-progress" role="status">المشهد 2 من 5</div>
  
  <!-- الصورة المولّدة (خلفية) -->
  <img class="scene-renderer__bg" src="..." alt="[وصف المشهد]" />
  
  <!-- كتلة السرد -->
  <div class="narration-block">...</div>
  
  <!-- أزرار الاختيار -->
  <div class="choice-buttons">...</div>
</main>
```

### CSS

```css
.scene-renderer {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: var(--space-8);
  padding-bottom: var(--space-16);
  gap: var(--space-8);
}

.scene-renderer__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
  z-index: 0;
}
```

---

## 36. EndingScreen

> شاشة الختام — رسالة وداع ودعوة لإعادة الرحلة.

### البنية

```html
<section class="ending" role="main" aria-label="نهاية القصة">
  <p class="ending__message">
    انتهت الرحلة... لكن المرآة لا تنسى.
    كل مشاعر تركتها هنا أصبحت جزءًا من حكايتك.
  </p>
  <button class="btn btn--primary btn--lg ending__restart">
    🔄 ابدأ رحلة جديدة
  </button>
</section>
```

### CSS

```css
.ending {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  text-align: center;
  padding: var(--space-8);
  animation: fadeInUp 1s var(--ease-spring);
}

.ending__message {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 500px;
}
```

---

## Connection Lost (Bonus — #37)

### البنية

```html
<div class="connection-lost" role="alert" aria-live="assertive">
  ⚠️ فُقد الاتصال... جاري إعادة المحاولة
</div>
```

### CSS

```css
.connection-lost {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1.5rem;
  background: rgba(255,80,60,0.2);
  border: 1px solid rgba(255,80,60,0.3);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.85rem;
  animation: pulse 2s infinite;
  z-index: var(--z-bar);
}
```

### قابلية الوصول
- ✅ `role="alert"` + `aria-live="assertive"` لإعلان فوري
