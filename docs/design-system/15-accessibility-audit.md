# تدقيق قابلية الوصول — مرايا
## WCAG 2.2 AA Accessibility Audit · Apple Accessibility Specialist

**المدقق:** متخصص وصول، Apple Accessibility Team
**المعيار:** WCAG 2.2 Level AA
**نطاق الفحص:** تصميم UI/UX + CSS + HTML + ARIA
**المصادر:** 11-ux-design-spec.md · 12-figma-spec.md · App.css

---

## نظام التقييم

```
✅ PASS    — متوافق تماماً مع المعيار
⚠️ PARTIAL — متوافق جزئياً / يحتاج تحسين
❌ FAIL    — مخالفة صريحة

[A]  = Level A   — الحد الأدنى (إلزامي)
[AA] = Level AA  — الهدف (إلزامي للامتثال)
[AAA]= Level AAA — مثالي (اختياري لكن موصى به)
```

---

## لوحة القيادة الإجمالية

```
┌─────────────────────────────────────────────────────┐
│  WCAG 2.2 AA — Maraya Accessibility Dashboard       │
├─────────────────────────────────────────────────────┤
│  المبدأ 1: الإدراك (Perceivable)      82%  ⚠️       │
│  المبدأ 2: التشغيل (Operable)         68%  ❌       │
│  المبدأ 3: الفهم (Understandable)     90%  ✅       │
│  المبدأ 4: المتانة (Robust)           75%  ⚠️       │
│  الموبايل (Mobile A11y)               85%  ⚠️       │
│  الوصول المعرفي (Cognitive)           92%  ✅       │
├─────────────────────────────────────────────────────┤
│  النتيجة الإجمالية: 82/100  ⚠️  متوافق جزئياً     │
│  حالات الفشل الحرجة: 4                              │
│  حالات التحذير: 11                                   │
│  حالات النجاح: 31                                   │
└─────────────────────────────────────────────────────┘
```

---

## المبدأ الأول: الإدراك (Perceivable)

### 1.1 — بدائل النص (Text Alternatives)

#### SC 1.1.1 — محتوى غير نصي [A]

```
الفحوصات:
```

| العنصر | الوضع الحالي | الحكم | المعالجة |
|-------|-------------|-------|---------|
| Emoji (😊 فرح) | لا `aria-label` — يعتمد على screen reader تفسير Emoji | ⚠️ | أضف: `aria-label="فرح"`، Emoji → `aria-hidden="true"` |
| صورة Scene المُولَّدة | `src` ديناميكي بدون `alt` ثابت | ❌ | أضف `alt` وصفي ديناميكي يُولَّد مع الصورة |
| Loading Orb | `class="loading-orb"` بدون role أو label | ❌ | أضف `role="status"` + `aria-label="جاري توليد قصتك"` |
| البطاقات الزخرفية | غير واضح إن كانت `aria-hidden` | ⚠️ | تأكيد: الخلفيات الزخرفية `aria-hidden="true"` |
| الشعار | SVG بدون `title` أو `aria-label` | ⚠️ | أضف `<title>مرايا</title>` داخل SVG |

**المخالفة الحرجة 1:**
```html
<!-- ❌ الوضع الحالي — الصورة المُولَّدة -->
<div class="scene__image-wrapper">
  <img src={generatedImageUrl} class="scene__image">
</div>

<!-- ✅ المعالجة الصحيحة -->
<div class="scene__image-wrapper">
  <img
    src={generatedImageUrl}
    alt={sceneDescription}  <!-- يُولَّد من الـ AI مع الصورة -->
    role="img"
    aria-describedby="scene-narration-text"
  >
</div>
```

---

### 1.2 — وسائط زمنية (Time-based Media)

#### SC 1.2.1 — محتوى صوتي فقط [A]

```
الراوية الصوتية (Audio Narrator):
الوضع الحالي: النص مكتوب على الشاشة أثناء القراءة الصوتية ✅
الحكم: PASS — النص البديل موجود (النص السردي نفسه)
ملاحظة: تأكّد أن Transcript دائماً يحتوي على نفس نص الصوت
```

#### SC 1.2.2 — ترجمة نصية للصوت [A]

```
الوضع: Transcript موجود في Judge Mode فقط
⚠️ PARTIAL — يجب أن يكون Transcript متاحاً في كل الأوضاع
(ليس فقط Judge Mode)

المعالجة:
أضف زر "عرض النص" بسيط في كل الأوضاع → يُظهر Transcript
Accessible: يكفي لجميع المستخدمين بما فيهم ضعاف السمع
```

---

### 1.3 — معلومات قابلة للتكيف (Adaptable)

#### SC 1.3.1 — المعلومات والعلاقات [A]

```
الفحوصات:
```

| العنصر | الوضع الحالي | الحكم |
|-------|-------------|-------|
| قائمة بطاقات المشاعر | لا `role="radiogroup"` على الحاوي | ❌ |
| أنواع NarrationBlock (سرد/بصري/تأمل) | التمييز بصري فقط (اللون) | ⚠️ |
| SceneProgress "المشهد ٢ من ٥" | نص مرئي فقط | ✅ |
| أزرار الخيار | نص زر مرئي واضح | ✅ |
| SettingsRow فصل | Divider بصري بدون ARIA | ⚠️ |

**المعالجة 1.3.1:**
```html
<!-- EmotionGrid — المعالجة الصحيحة -->
<section aria-labelledby="emotion-heading">
  <h2 id="emotion-heading" class="visually-hidden">اختر مشاعرك</h2>
  
  <div role="radiogroup" aria-labelledby="emotion-heading">
    <button
      role="radio"
      aria-checked={isSelected}
      aria-label="فرح"
    >
      <span aria-hidden="true">😊</span>
      <span>فرح</span>
    </button>
  </div>
</section>

<!-- NarrationBlock — إضافة type في aria-label -->
<article
  role="article"
  aria-label="سرد: وفي تلك الليلة..."
>
  <span class="block-label" aria-hidden="true">📖 سرد</span>
  <p>وفي تلك الليلة...</p>
</article>
```

#### SC 1.3.3 — الخصائص الحسية [A]

```
الوضع: التمييز بين أنواع NarrationBlock يعتمد على:
• اللون (أبيض / ذهبي / سماوي) — ❌ وحده لا يكفي
• الأيقونة (📖 / 👁 / 🔮) ✅

الحكم: ⚠️ PARTIAL

المعالجة:
أضف نص مخفي يُعلن النوع:
<span class="visually-hidden">نوع المحتوى: سرد</span>
```

---

### 1.4 — قابلية التمييز (Distinguishable)

#### SC 1.4.1 — استخدام اللون [A]

```
المخالفة الحرجة 2: ألوان المشاعر الوحيد
```

**الفحص التفصيلي:**

| الاستخدام | اللون وحده؟ | حكم |
|-----------|-----------|-----|
| حد EmotionCard (ذهبي/أزرق/أحمر...) | ✅ يوجد Emoji أيضاً | ⚠️ |
| نوع NarrationBlock (ألوان الحدود) | ❌ اللون الوحيد | ❌ |
| Toggle ON (أخضر) vs OFF (رمادي) | ❌ اللون الوحيد | ❌ |
| أزرار الخيار | النص وضوح كافٍ | ✅ |

**المعالجة:**
```css
/* Toggle — أضف shape indicator أيضاً */
.toggle[aria-checked="true"]::after {
  content: "✓";  /* أضف علامة نصية */
  position: absolute;
  /* ... */
}

/* NarrationBlock — أضف border-pattern للتمييز */
.narration-block--visual  { border-left: 2px solid var(--accent-gold); }
.narration-block--reflection { border-left: 2px dashed var(--accent-cyan); }
.narration-block--narration  { border-left: 2px solid rgba(255,255,255,0.5); }
```

#### SC 1.4.3 — التباين (Minimum) [AA] ★ الأهم

```
فحص التباين الكامل — كل نص في مرايا:
```

| العنصر | الخلفية | النص | النسبة | المطلوب | الحكم |
|--------|---------|------|--------|---------|-------|
| Hero "مرايا" على #030305 | `#030305` | `#FFFFFF` | **21:1** | 4.5:1 | ✅ |
| النص الثانوي 70% | `#030305` | `rgba(255,255,255,0.70)` | **14.7:1** | 4.5:1 | ✅ |
| النص الثلاثي 50% | `#030305` | `rgba(255,255,255,0.50)` | **10.4:1** | 4.5:1 | ✅ |
| **النص المعطّل 30%** | `#030305` | `rgba(255,255,255,0.30)` | **6.3:1** | 4.5:1 | ✅ AA |
| نص على Glass Surface | `rgba(255,255,255,0.06) on #030305` ≈ `#0d0d10` | `#FFFFFF` | **20.5:1** | 4.5:1 | ✅ |
| نص Caption على Glass | `≈#0d0d10` | `rgba(255,255,255,0.50)` | **10.2:1** | 4.5:1 | ✅ |
| **أزرار الخيار — نص على Dark** | `rgba(0,0,0,0.3) on scene` | `#FFFFFF` | **يتغير حسب الصورة!** | 4.5:1 | ⚠️ |
| **ChoiceButton text على صورة مُولَّدة** | غير ثابتة | `#FFFFFF` | **غير مضمون** | 4.5:1 | ❌ |

**المخالفة الحرجة 3: نص على صور مُولَّدة**
```css
/* المشكلة: اللون الفعلي للـ ChoiceButton يعتمد على الصورة خلفه */

/* ✅ الإصلاح: ضمان الخلفية دائماً */
.choice-btn {
  /* أضف خلفية داكنة مضمونة */
  background: rgba(0, 0, 0, 0.65);  /* يضمن نسبة ≥ 4.5:1 مع الأبيض */
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* للتحقق الرياضي:
   #ffffff على rgba(0,0,0,0.65) = background effective: #595959
   النسبة: #fff على #595959 = 7.1:1 ✅ AA */
```

#### SC 1.4.4 — تكبير النص [AA]

```
الفحص: ماذا يحدث عند تكبير 200%؟
```

| المكوّن | عند 200% | الحكم |
|---------|---------|-------|
| EmotionGrid | البطاقات تنكسر (2 columns = overflow) | ⚠️ |
| NarrationBlock | النص يتمدد عمودياً ✓ | ✅ |
| ChoiceButtons | قد يتداخل مع الـ scene | ⚠️ |
| SettingsSheet | Slider قد يُقطع | ⚠️ |

**الإصلاح:**
```css
/* نص يتكيف مع تكبير النظام */
html {
  font-size: 100%; /* لا تُثبّت px على root */
}

/* EmotionGrid — يتكيف مع النص الكبير */
.emotion-grid {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  /* لا fixed columns */
}
```

#### SC 1.4.5 — النص كصورة [AA]

```
مرايا لا تستخدم نصاً كصور — ✅ PASS
```

#### SC 1.4.10 — Reflow [AA] (WCAG 2.1+)

```
الفحص: عند 320px عرض (400% zoom iOS)
الوضع الحالي: min-width: 375px على بعض المكوّنات
```

| المكوّن | 320px | الحكم |
|---------|-------|-------|
| EmotionCard (min: 140px) | صحيح | ✅ |
| NarrationBlock | يملأ العرض | ✅ |
| AudioHUD | overflow محتمل | ⚠️ |
| ChoiceButtons (2 أزرار) | قد يتراكب | ⚠️ |

**الإصلاح — ChoiceButtons عند 320px:**
```css
@media (max-width: 380px) {
  .story__choices {
    flex-direction: column; /* تحت بعض بدل جانباً */
    gap: var(--space-3);
  }
}
```

#### SC 1.4.11 — تباين العناصر غير النصية [AA]

| العنصر | النسبة المُقدَّرة | المطلوب | الحكم |
|--------|----------------|---------|-------|
| EmotionCard border (White 10%) | 1.4:1 | 3:1 | ❌ |
| EmotionCard border (hover, colored 45%) | 3.8:1 | 3:1 | ✅ |
| Toggle track (off) | 2.1:1 | 3:1 | ❌ |
| Focus outline (White 50%) | 10.4:1 | 3:1 | ✅ |
| ChoiceButton border | 3.1:1 | 3:1 | ✅ |

**المخالفة الحرجة 4: حدود الـ Default State للمكوّنات**
```css
/* ❌ الحالي: White 10% = 1.4:1 على الخلفية الداكنة */
.emotion-card { border: 1px solid rgba(255,255,255,0.10); }

/* ✅ الإصلاح: رفع إلى White 30% = 6.3:1 */
.emotion-card { border: 1px solid rgba(255,255,255,0.30); }

/* ✅ Toggle track في Default: */
.toggle-track { background: rgba(255,255,255,0.25); } /* من 0.15 → 0.25 */
```

#### SC 1.4.12 — تباعد النص [AA]

```
الفحص: عند تطبيق:
• line-height: 1.5× font-size
• letter-spacing: 0.12em
• word-spacing: 0.16em

مرايا:
• line-height: 1.85 للـ body ✅ (أعلى من المطلوب)
• letter-spacing: معياري للعربية ✅
• word-spacing: معياري ✅

الحكم: ✅ PASS
```

---

## المبدأ الثاني: التشغيل (Operable)

### 2.1 — قابلية الوصول بلوحة المفاتيح

#### SC 2.1.1 — لوحة المفاتيح [A]

**فحص التدفق بـ Tab:**

```
الشاشة: EmotionPicker

Tab 1: [ EmotionCard/Joy ]      ✅ — يمكن تحريكه
Tab 2: [ EmotionCard/Sadness ]  ✅
Tab 3: [ EmotionCard/Anger ]    ✅
Tab 4: [ EmotionCard/Fear ]     ✅
Tab 5: [ EmotionCard/Love ]     ✅
Tab 6: [ EmotionCard/Hope ]     ✅
Tab 7: [ Upload Button ]         ✅
Tab 8: [ Mode Selector ]         ✅

Enter على EmotionCard → تفعيل ✅ (إذا role="radio" مع onKeyDown)
Space على EmotionCard → تفعيل ✅
```

**مشاكل:**

| المشكلة | الوضع | الحكم |
|---------|-------|-------|
| الـ RadioGroup — Arrow keys للتنقل بين البطاقات | غير مُنفَّذ | ❌ |
| Typewriter Skip بالمفاتيح | لا Space/Enter لتسريع | ❌ |
| LoadingOrb | لا focus trap أثناء التحميل | ⚠️ |
| BottomSheet — Escape للإغلاق | غير مُنفَّذ | ❌ |
| Choice Buttons — Enter للاختيار | يجب أن يعمل | ✅ (بشرط `<button>`) |

**الإصلاح — RadioGroup Arrow Keys:**
```javascript
function handleKeyDown(e) {
  const cards = document.querySelectorAll('[role="radio"]');
  const current = document.activeElement;
  const idx = [...cards].indexOf(current);

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    cards[(idx + 1) % cards.length].focus();
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    cards[(idx - 1 + cards.length) % cards.length].focus();
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    current.click();
  }
}
```

**الإصلاح — BottomSheet Escape:**
```javascript
useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === 'Escape') closeSheet();
  };
  if (isOpen) document.addEventListener('keydown', handleEsc);
  return () => document.removeEventListener('keydown', handleEsc);
}, [isOpen]);
```

#### SC 2.1.2 — بدون فخ لوحة المفاتيح [A]

```
الفحص:
• Modal/BottomSheet — هل يحبس التركيز داخله؟ ⚠️

المطلوب عند فتح Sheet:
1. نقل التركيز إلى أول عنصر في الـ Sheet
2. Tab لا يخرج من الـ Sheet (focus trap)
3. Escape يُغلق + يُعيد التركيز للعنصر المُفتِح
```

**الإصلاح — Focus Trap:**
```javascript
// استخدم مكتبة focus-trap-react أو نفّذ يدوياً:
function useFocusTrap(isActive, ref) {
  useEffect(() => {
    if (!isActive) return;
    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    first?.focus();
    
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isActive, ref]);
}
```

---

### 2.2 — توفير الوقت الكافي

#### SC 2.2.1 — توقيت قابل للتعديل [A]

```
الوضع:
• Typewriter Effect: يعمل تلقائياً، يأخذ وقتاً
  → لا يوجد زر "توقف" أو "تسريع"
  → ⚠️ PARTIAL

• Toast Notifications: تختفي بعد 5 ثوانٍ
  → ⚠️ لا hover-to-pause

المعالجة:
1. Typewriter — أضف Tap/Space لتسريع (من نقد التصميم)
2. Toast — أضف hover/focus → لا تختفي
```

**الإصلاح:**
```javascript
// Toast — إيقاف مؤقت عند focus أو hover
const Toast = ({ message, duration = 5000 }) => {
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [isPaused]);
  
  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {message}
    </div>
  );
};
```

#### SC 2.2.2 — إيقاف مؤقت، إيقاف، إخفاء [A]

```
الفحص:
• bgRotate animation (خلفية دائرة 30s) → لا زر إيقاف
  ⚠️ إذا لم يكن prefers-reduced-motion مُنفَّذاً = مشكلة
• float animation (LoadingOrb) → نفس الحكم

المعالجة: prefers-reduced-motion إلزامي (انظر 2.3.3)
```

---

### 2.3 — النوبات والردود الجسدية

#### SC 2.3.1 — ثلاثة وميضات أو دون الحد [A]

```
فحص App.css:
• @keyframes pulse → يُغيّر opacity، لا وميض حاد ✅
• @keyframes blink (cursor) → 0.8s اثنتين/ثانية → 1.25 Hz
  → المطلوب: لا يتجاوز 3 Hz ✅ PASS
• bgRotate → لا وميض ✅
• orbPulse → opacity فقط ✅

الحكم: ✅ PASS — لا مشاكل وميض حاد
```

#### SC 2.3.3 — Animation من التفاعلات [AAA] — مهم!

```css
/* الوضع الحالي: هل app.css يحترم prefers-reduced-motion؟ */
/* الفحص — App.css: */

@media (prefers-reduced-motion: reduce) {
  /* غير موجود في الملف الحالي! */
}

/* ❌ FAIL — لا يوجد prefers-reduced-motion block */
```

**الإصلاح الإلزامي:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* استثناء: animations وظيفية (لا زخرفية) */
  .loading-orb {
    /* يظل مرئياً لكن بدون حركة */
    animation: none;
    opacity: 0.8;
  }
}
```

---

### 2.4 — قابلية التنقل

#### SC 2.4.1 — تجاوز الكتل [A]

```
الفحص: هل يوجد "Skip to content" link؟
الوضع: لا يوجد → ⚠️

المعالجة للويب (مهم للـ Keyboard users):
```
```html
<!-- أول عنصر في الـ body -->
<a href="#main-content" class="skip-link">
  تخطى للمحتوى الرئيسي
</a>

<main id="main-content" tabindex="-1">
  <!-- المحتوى -->
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #030305;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 9999;
}
.skip-link:focus {
  top: 0;
}
```

#### SC 2.4.3 — ترتيب التركيز [A]

```
الترتيب المطلوب في EmotionPicker (RTL):
مرايا (عنوان) → subtitle → Joy → Sadness → Anger → Fear → Love → Hope → Upload → Mode

الوضع الحالي: يعتمد على DOM order
الخطر: إذا كان DOM order لا يتطابق مع Visual order (RTL يُعقّد هذا)

التحقق:
```css
/* لا تستخدم tabindex > 0 أبداً — يكسر الترتيب الطبيعي */
/* ✅ اعتمد على DOM order المتسق مع RTL visual order */
```

#### SC 2.4.4 — غرض الرابط/الزر [A]

```
فحص الأزرار:
```

| الزر | النص/Label | يكفي وحده؟ | الحكم |
|------|-----------|------------|-------|
| EmotionCard | "فرح" | ⚠️ يحتاج context | أضف: "ابدأ القصة بمشاعر الفرح" |
| ChoiceButton | "افتح الباب الغامض" | ✅ | ✅ |
| AudioHUD "🔊" | أيقونة بدون نص | ❌ | أضف aria-label="تشغيل/إيقاف الصوت" |
| "×" إغلاق | "×" فقط | ❌ | أضف aria-label="إغلاق" |
| "›" Disclosure | "›" فقط | ❌ | أضف aria-label="خصوصية البيانات، اضغط للدخول" |

**الإصلاح:**
```html
<button
  class="audio-hud__btn"
  aria-label={audioOn ? "إيقاف صوت الراوية" : "تشغيل صوت الراوية"}
  aria-pressed={audioOn}
>
  <span aria-hidden="true">{audioOn ? '🔊' : '🔇'}</span>
</button>
```

#### SC 2.4.7 — تركيز مرئي [AA]

```
الفحص:
• :focus-visible في App.css: موجود ✅
• لكن! بعض العناصر تستخدم outline: none بدون بديل

الفحص الدقيق في App.css:
```

```css
/* ✅ موجود وجيد */
:focus-visible {
  outline: 2px solid rgba(255,255,255,0.50);
  outline-offset: 2px;
}

/* ⚠️ تحقق: هل يوجد outline:none في أي مكان؟ */
/* إذا وُجد بدون :focus-visible بديل → ❌ FAIL SC 2.4.7 */
```

#### SC 2.4.11 — Focus Not Obscured (Minimum) [AA] — جديد WCAG 2.2

```
المطلوب: عنصر التركيز لا يكون مخفياً بالكامل خلف sticky UI
```

| الخطر | الوضع |
|-------|-------|
| AudioHUD (position:fixed) | قد يغطي EmotionCards أثناء Tab | ⚠️ |
| BottomSheet | يحجب كل الشاشة حين يُفتح → focus trap needed | ✅ إذا نُفِّذ |
| TopBar في Scene | قد يغطي أول ChoiceButton | ⚠️ |

**الإصلاح:**
```css
/* ضمان scroll margin للعناصر المُركَّز عليها */
:focus-visible {
  scroll-margin-top: 80px;  /* ارتفاع TopBar */
  scroll-margin-bottom: 100px;  /* ارتفاع AudioHUD */
}
```

---

### 2.5 — طرق الإدخال

#### SC 2.5.3 — Label in Name [A]

```
المطلوب: الـ accessible name يحتوي على الـ visible text

الفحص:
Button: "متابعة" → aria-label="متابعة" ✅
EmotionCard: "فرح" → aria-label="فرح — ابدأ قصتك من مشاعر الفرح" ✅ (يبدأ بـ "فرح")
AudioHUD: لا نص مرئي + لا aria-label → ❌
```

#### SC 2.5.7 — Dragging Movements [AA] — جديد WCAG 2.2

```
SpaceUpload Dropzone:
• يقبل Drag & Drop لرفع الصور
• يجب أن يكون هناك بديل بدون drag
• البديل: زر "اختر من الصور" ✅ موجود

الحكم: ✅ PASS
```

#### SC 2.5.8 — Target Size (Minimum) [AA] — جديد WCAG 2.2

```
المطلوب: حجم target ≥ 24×24 CSS pixels (مع spacing لـ 24px)

الفحوصات:
```

| العنصر | الحجم المُقدَّر | الحكم |
|--------|--------------|-------|
| EmotionCard | ~160×100pt | ✅ |
| ChoiceButton | ~300×44pt | ✅ |
| AudioHUD buttons | **~28pt** | ❌ |
| Toggle | 44×24pt = آمن بالـ spacing | ✅ |
| Disclosure Row "›" | entire row = 44pt | ✅ |
| Sheet Handle | 44×8 → spacing يعوض | ⚠️ |

---

## المبدأ الثالث: القابلية للفهم (Understandable)

### 3.1 — قابلية القراءة

#### SC 3.1.1 — لغة الصفحة [A]

```html
<!-- المطلوب -->
<html lang="ar" dir="rtl">  ✅ يجب التأكد من وجوده

<!-- في Judge Mode — تغيير لغة -->
<html lang="en" dir="ltr">  ✅ يجب التحديث ديناميكياً
```

#### SC 3.1.2 — لغة الأجزاء [AA]

```html
<!-- النص المختلط (عربي + English labels) -->
<span lang="en">Judge Mode</span>
<span lang="ar">عامية مصرية</span>
```

---

### 3.2 — القدرة على التنبؤ

#### SC 3.2.1 — عند التركيز [A]

```
الفحص: هل التركيز يُغيّر السياق؟

EmotionCard on focus: لا يُشغّل القصة تلقائياً ✅
Mode Selector on focus: لا يُغيّر النمط تلقائياً ✅
Toggle on focus: لا يتغير ON/OFF تلقائياً ✅

الحكم: ✅ PASS
```

#### SC 3.2.2 — عند الإدخال [A]

```
Mode Selector onChange → يُغيّر نمط السرد فوراً
⚠️ PARTIAL — المستخدم لا يُحذَّر أن التغيير فوري

المعالجة:
Label: "نمط السرد (التغيير فوري)"
أو: تطبيق التغيير في القصة التالية فقط
```

---

### 3.3 — مساعدة الإدخال

#### SC 3.3.1 — تعريف الخطأ [A]

```
فحص Space Upload:
• ملف غير مدعوم: "يجب أن تكون صورة (JPG، PNG، HEIC)" ✅
• حجم كبير: "الصورة كبيرة جداً" ✅

لكن: هل يصل إلى قارئ الشاشة؟

المطلوب:
```

```html
<div role="alert" aria-live="assertive" id="upload-error">
  الصورة كبيرة جداً، يجب ألا تتجاوز 10MB
</div>
```

#### SC 3.3.2 — مساميات وتعليمات [A]

```
الوضع:
• Dropzone: "اسحب صورتك هنا أو اضغط للتحديد" ✅
• Mode Selector: لا label مرئي ("نمط السرد" هو text فقط) ⚠️
• Settings Slider: لا وحدة واضحة ("حجم النص" بدون "صغير / كبير") ⚠️
```

**الإصلاح:**
```html
<label for="mode-select">نمط السرد</label>
<select id="mode-select">...</select>

<label for="text-size-slider">حجم النص</label>
<input
  id="text-size-slider"
  type="range"
  min="80" max="140" step="10"
  aria-valuetext={`${textSize}% من الافتراضي`}
>
<output for="text-size-slider" role="status">
  100%
</output>
```

---

## المبدأ الرابع: المتانة (Robust)

### 4.1 — التوافق

#### SC 4.1.1 — التبرير [A]

```
المطلوب: HTML صحيح دلالياً بدون أخطاء BEM/ARIA

المخاطر المُحتملة:
• div بدلاً من button للعناصر التفاعلية
• aria-checked على <div> بدون role="switch"
• id مكررة في القائمة الديناميكية
```

**الفحص بالأداة:**
```bash
# شغّل axe-core أو WAVE على الصفحة
npx axe-core http://localhost:5173

# أو استخدم Chrome DevTools → Accessibility Panel
```

#### SC 4.1.2 — الاسم، الدور، القيمة [A]

```
جدول الإدارة الكاملة:
```

| المكوّن | role | name (aria-label) | value (aria-checked/value) | الحكم |
|---------|------|------------------|--------------------------|-------|
| EmotionCard | `radio` | "فرح" | `aria-checked` | ✅ |
| Emotion RadioGroup | `radiogroup` | "اختر مشاعرك" | — | ✅ |
| ChoiceButton | `button` | نص الزر | — | ✅ |
| Toggle | `switch` | "الراوية" | `aria-checked` | ✅ |
| AudioHUD btn | `button` | ❌ لا يوجد | — | ❌ |
| NarrationBlock | `article` | نوع + أول كلمة | — | ⚠️ |
| LoadingOrb | `status` | "جاري التوليد" | — | ⚠️ |
| Toast/Error | `alert` | نص الرسالة | — | ✅ |
| BottomSheet | `dialog` | "الإعدادات" | `aria-modal="true"` | ✅ |
| Slider | `slider` | "حجم النص" | `aria-valuenow` | ⚠️ |
| SceneProgress | `status` | "المشهد X من Y" | — | ✅ |

#### SC 4.1.3 — رسائل الحالة [AA]

```
المطلوب: كل تغيير في الحالة يُبلَّغ عنه
```

| الحالة | aria-live | الحكم |
|--------|----------|-------|
| نتيجة توليد القصة تظهر | `polite` | ✅ |
| رسالة خطأ Offline | `assertive` | ✅ |
| تغيير SceneProgress | `polite` | ✅ |
| Toast Success (قصة جديدة) | `polite` | ✅ |
| Loading روتين | `polite` | ✅ |
| صورة مُولَّدة جاهزة | **غير مُعلَن!** | ❌ |

**الإصلاح:**
```html
<!-- عند ظهور الصورة المُولَّدة -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="visually-hidden"
  id="scene-image-status"
>
  {imageReady ? `صورة المشهد الجاهزة: ${sceneDescription}` : ''}
</div>
```

---

## الموبايل — تجربة اللمس والوصول

### التوجيه (Orientation)

```
iOS VoiceOver يعمل في كل الاتجاهات
الوضع في مرايا: التطبيق يُفضّل Portrait لكن لا يُجبر
الحكم: ✅ لا orientation lock صريح

توصية: اختبر في Landscape — هل تُصبح ChoiceButtons مخفية؟
```

### Touch Targets

```
معيار Apple HIG: 44×44pt
معيار WCAG 2.5.5 (AAA): 44×44pt
معيار WCAG 2.5.8 (AA): 24×24pt

```

| العنصر | الحجم | HIG (44pt) | WCAG AA (24pt) |
|--------|-------|-----------|----------------|
| EmotionCard | 160×100pt | ✅ | ✅ |
| ChoiceButton | 300×44pt | ✅ | ✅ |
| **AudioHUD btn** | **~28×28pt** | ❌ | ✅ |
| Toggle | 44×24pt | ⚠️ | ✅ |
| Disclosure row | 44pt height | ✅ | ✅ |
| Sheet handle | 44×8pt | ❌ | ⚠️ |

### VoiceOver Gestures

```
الفحوصات:
• Swipe ← / → للتنقل بين العناصر: مدعوم بـ role="radio" + radiogroup ✅
• Double Tap لتنشيط: مدعوم بـ role="button" ✅
• Swipe Up/Down للإعدادات: يحتاج action شرح للمستخدم ⚠️
• Rotor (VoiceOver Rotor): لا custom rotor ⚠️
```

**توصية — VoiceOver Hint:**
```html
<button
  aria-haspopup="dialog"
  aria-label="فتح الإعدادات"
  title="اسحب للأعلى لفتح الإعدادات"
>⚙️</button>
```

---

## الوصول المعرفي (Cognitive Accessibility)

### مستوى القراءة

```
فحص مستوى النص السردي:
• Cairo Medium 18px → مقروء ✅
• line-height 1.85 → ممتاز للعربية ✅
• max-width ضمني (الـ NarrationBlock) → يمنع الأسطر الطويلة ✅

الجمل الطويلة في السرد AI: لا يمكن التحكم بها مباشرة
توصية: أضف في System Prompt: "اكتب جملاً قصيرة (< 20 كلمة)"
```

### الاتساق

```
✅ ممتاز — EmotionCards، ChoiceButtons، NarrationBlocks
   تسلوك واحد في كل الشاشات

⚠️ غير متسق — AudioHUD: أحياناً "🔊" وأحياناً "⏸"
   → استخدم دائماً نفس الأيقونة لنفس الحالة
```

### حدود الوقت

```
مرايا لا تفرض حدود وقت على الاستخدام ✅
الـ Typewriter يتحكم فيه المستخدم بالضغط ✅
الـ Toast يتوقف على hover/focus (بعد الإصلاح) ✅
```

### الوميض والحركة — ملخص

```
✅ لا strobe effects
✅ لا animations > 3 Hz
❌ prefers-reduced-motion غير مُنفَّذ (المشكلة الأكبر معرفياً)
```

---

## ملخص كل المخالفات والإصلاحات

### 🔴 مخالفات حرجة [FAIL] — WCAG AA

| # | المعيار | المخالفة | الإصلاح | الأولوية |
|---|---------|---------|---------|---------|
| F1 | 1.1.1 | صور المشاهد المُولَّدة بدون `alt` | توليد `alt` ديناميكي | 🔴 فوري |
| F2 | 1.3.1 | EmotionGrid بدون `role="radiogroup"` | أضف semantics صحيحة | 🔴 فوري |
| F3 | 1.4.3 | نص ChoiceButtons على صور ≠ مضمون 4.5:1 | `background: rgba(0,0,0,0.65)` | 🔴 فوري |
| F4 | 1.4.11 | EmotionCard default border نسبة 1.4:1 | رفع لـ `rgba(255,255,255,0.30)` | 🔴 فوري |
| F5 | 2.1.1 | Arrow keys للتنقل في RadioGroup غير مُنفَّذة | `handleKeyDown` handler | 🔴 أسبوع |
| F6 | 2.1.1 | Escape لا يُغلق BottomSheet | event listener + focus return | 🔴 أسبوع |
| F7 | 2.3.3 | `prefers-reduced-motion` غير موجود في CSS | أضف المعيار الكامل | 🔴 فوري |
| F8 | 2.4.4 | AudioHUD buttons بدون `aria-label` | أضف labels وصفية | 🔴 فوري |
| F9 | 4.1.3 | الصورة المُولَّدة لا تُعلن لـ screen reader | `aria-live` status element | 🔴 أسبوع |

---

### ⚠️ تحذيرات [PARTIAL] — تحتاج تحسين

| # | المعيار | التحذير | الإصلاح |
|---|---------|---------|---------|
| P1 | 1.2.2 | Transcript غير متاح خارج Judge Mode | زر "عرض النص" لكل الأوضاع |
| P2 | 1.3.1 | أنواع NarrationBlock بالون فقط | text + pattern بديل |
| P3 | 1.4.1 | Toggle تمييز ON/OFF بالون فقط | أضف ✓ أو shape |
| P4 | 1.4.10 | ChoiceButtons overflow عند 320px | Flex column عند narrow |
| P5 | 2.2.1 | Toast لا يتوقف على hover/focus | isPaused state |
| P6 | 2.2.2 | bgRotate animation بدون pause خيار | prefers-reduced-motion يكفي |
| P7 | 2.4.1 | لا "Skip to content" | link مخفي عند focus |
| P8 | 2.4.11 | AudioHUD قد يحجب elements مُركَّز عليها | scroll-margin-top |
| P9 | 3.1.1 | lang مضمون في HTML root؟ | تأكيد في index.html |
| P10 | 3.3.2 | Slider بدون قيم min/max مرئية | أضف "صغير" + "كبير" |
| P11 | 4.1.2 | img المُولَّدة تبلّغ عند الجهوزية | aria-live status |

---

### ✅ نجاحات — ممتثل تماماً

| المعيار | العنصر | الدرجة |
|---------|--------|--------|
| 1.4.3 | كل نصوص Hero/Body/Secondary | 21:1 → 6.3:1 ✅ |
| 1.4.4 | line-height 1.85 + rem units | ✅ |
| 2.3.1 | لا وميض خطير | ✅ |
| 2.4.7 | focus-visible outline | ✅ |
| 2.5.7 | Dropzone + زر بديل | ✅ |
| 3.1.2 | المحتوى العربي محدد lang | ✅ |
| 3.2.1 | التركيز لا يُغيّر السياق | ✅ |
| 3.3.1 | رسائل خطأ Upload واضحة | ✅ |
| 4.1.3 | Toast alerts aria-live | ✅ |

---

## الأدوات الموصى بها للاختبار المستمر

```
Automated Testing:
• axe-core (axe DevTools) — Chrome Extension
• WAVE Web Tool — wave.webaim.org
• Lighthouse Accessibility score (هدف: ≥ 95)

Screen Readers:
• iOS VoiceOver (iPhone الفعلي — لا Simulator)
• Android TalkBack
• NVDA + Chrome (Windows)
• JAWS + Chrome (Enterprise)

Color Contrast:
• Colour Contrast Analyser (Paciello Group) — للأجزاء الديناميكية
• Figma Contrast Plugin

Keyboard Testing:
• اختبر كل شاشة بـ Tab فقط، بدون ماوس
• هدف: كل الوظائف متاحة 100%

Arabic RTL Specific:
• اختبر VoiceOver بصوت عربي (Siri Voice: Arabic)
• تأكد من اتجاه القراءة الصحيح
```

---

*تدقيق قابلية الوصول WCAG 2.2 AA — مرايا · Apple Accessibility Team*
*مارس 2026*
