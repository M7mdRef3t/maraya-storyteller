# مرايا — وثيقة تصميم UI/UX
## UX Design Specification · Apple HIG Compliant · v1.0

**المصمم:** مصمم واجهات أول، Apple
**المنصة:** iOS (iPhone) + Responsive Web
**الاتجاه:** RTL أساساً، LTR (Judge Mode)
**النمط:** Dark-first, Cinematic, Glassmorphism

---

## الفهرس — 8 شاشات أساسية

| # | الشاشة | الغرض |
|---|--------|-------|
| 01 | Splash / Launch | دخول العلامة |
| 02 | Onboarding (3 slides) | تعريف المستخدم بمرايا |
| 03 | Emotion Picker | اختيار المشاعر — نقطة البداية |
| 04 | Space Upload | رفع صورة المكان |
| 05 | Loading / Generating | التحميل السينمائي |
| 06 | Scene / Story View | قلب التجربة — المشهد والسرد |
| 07 | Story Ending | الختام العاطفي |
| 08 | Settings Sheet | الإعدادات والتفضيلات |

---

## مبادئ UX العامة

### مبادئ Apple HIG المُطبَّقة

| المبدأ | التطبيق في مرايا |
|--------|----------------|
| **Aesthetic Integrity** | كل عنصر UI يخدم التجربة السردية — لا زخرفة فائضة |
| **Consistency** | Glass cards، buttons، typography — متسقة عبر كل الشاشات |
| **Direct Manipulation** | البطاقات تستجيب للـ touch مباشرة، بدون menus وسيطة |
| **Feedback** | كل فعل له رد فعل مرئي + haptic |
| **User Control** | المستخدم يتحكم في الإيقاع — القصة لا تتقدم بدون موافقته |
| **Forgiveness** | زر "رجوع" موجود في كل شاشة بدون عقوبة |

### التسلسل الهرمي البصري (Visual Hierarchy)

```
Layer 1: المحتوى الجوهري (السرد، المشهد)          → z-index: 30
Layer 2: أدوات التفاعل (أزرار الخيار)             → z-index: 20
Layer 3: HUD / Navigation                         → z-index: 110
Layer 4: Modals / Sheets                          → z-index: 150
────────────────────────────────
الخلفية (الصورة + gradient)                        → z-index: 0
```

### نظام التنقل

```
مرايا لا تستخدم Tab Bar — التنقل خطي وسينمائي:

[Splash] → [Onboarding] → [Emotion Picker]
                                ↓
                         [Space Upload] (اختياري)
                                ↓
                           [Loading]
                                ↓
                         [Scene View] ←→ (خيارات)
                                ↓
                         [Story Ending]
                                ↓
                    [Emotion Picker] (إعادة)
```

**الإيماءات (Gestures):**
- **Swipe Right:** رجوع إلى الشاشة السابقة (في دور التعريف فقط)
- **Tap:** تحديد، تأكيد، تقدّم
- **Long Press:** على النص السردي = وضع القراءة المُكبَّر
- **Swipe Up:** لرفع settings sheet
- **Pinch:** تكبير الصورة المُولَّدة

---

## شاشة 01 — Splash / Launch

![Splash & Onboarding](file:///C:/Users/moham/.gemini/antigravity/brain/4235d654-2ea3-43c2-aa64-e7a032f01e06/maraya_screen_splash_onboarding_1772650889143.png)

### Wireframe

```
┌─────────────────────────────┐
│         Status Bar          │
│                             │
│                             │
│                             │
│                             │
│          ◉                  │
│       (شعار)                │
│                             │
│        مرايا                │
│                             │
│                             │
│                             │
│                             │
│         Home Indicator      │
└─────────────────────────────┘
```

### المكوّنات
- `AppIcon` — الشعار المركزي، 120×120pt
- `Wordmark` — "مرايا"، Cairo ExtraBold، 42pt، أبيض
- خلفية: `#030305` خالصة بدون أي عناصر أخرى
- تأثير: توهج خفيف خلف الشعار `radial-glow 20% opacity`

### التفاعلات والحركة

```
التسلسل الزمني:
0ms    → الشعار يظهر: scale(0.8) opacity(0) → scale(1) opacity(1)
         animation: 800ms ease-spring

600ms  → الـ wordmark يظهر للأعلى: fadeInUp 500ms

1800ms → إما: انتقال تلقائي لـ Onboarding (أول مرة)
               أو: انتقال لـ Emotion Picker (مستخدم عائد)

الانتقال: crossfade 400ms — الشاشة التالية تظهر فوق
```

### حالات الشاشة

| الحالة | الوصف |
|--------|-------|
| **Default** | الشاشة الموصوفة أعلاه |
| **First Launch** | + Haptic خفيف لحظة ظهور الشعار (`.soft` impact) |
| **Returning User** | الانتقال أسرع (1200ms بدل 1800ms) |
| **Offline** | لا تغيير — الـ Splash لا يحتاج اتصال |

### ملاحظات المصمم

> الـ Splash يجب أن يشعر كـ "رفع الستارة في مسرح". لا حركات مبالغ فيها. الشعار يظهر بهدوء، كأنه كان دائماً هناك.

---

## شاشة 02 — Onboarding (3 شرائح)

### Wireframe — الشريحة 1 من 3

```
┌─────────────────────────────┐
│         Status Bar (Hidden) │
│                             │
│  ██████████████████████████ │ ← صورة سينمائية بالكامل
│  ██████████████████████████ │
│  ██████████████████████████ │
│  ████  [صورة غامرة]  ██████ │   مرايا تقرأ مشاعرك
│  ██████████████████████████ │   وتحوّلها إلى قصص حيّة
│  ██████████████████████████ │
│  ██████████████████████████ │
│  ██████████████████████████ │
│                             │
│       ● ○ ○                 │ ← مؤشرات الشرائح (RTL)
│                             │
│  [   متابعة →   ]  [تخطي]  │ ← أزرار (safe area)
│                             │
│      Home Indicator         │
└─────────────────────────────┘
```

### الشرائح الثلاث

| # | الصورة | العنوان | التفاصيل |
|---|--------|---------|---------|
| **1** | غرفة مضاءة بضوء القمر، مرآة | "مرايا تسمع ما لا تقوله" | "اختر مشاعرك، أو ارفع صورة مكانك، ودع مرايا تُكمل الباقي" |
| **2** | مشهد سينمائي — طريق + ضباب | "كل مشاعر تُصبح عالماً" | "قصة متفرّعة تتشكل من خياراتك — لا قصتان متشابهتان أبداً" |
| **3** | شخص يقرأ في الظلام | "الراوية تتكلم" | "فعّل صوت الراوية وعِش التجربة بكل حواسك" |

### المكوّنات

```jsx
<OnboardingSlide
  image={cinematicImage}       // full-bleed, 40% darken overlay
  title="مرايا تسمع ما لا تقوله"
  subtitle="اختر مشاعرك، أو ارفع صورة مكانك..."
/>

<PageIndicator
  total={3}
  current={0}
  direction="rtl"
  activeColor="#FFFFFF"
  inactiveColor="rgba(255,255,255,0.3)"
/>

<Button variant="primary" size="lg">متابعة</Button>
<Button variant="ghost" size="sm">تخطي</Button>
```

### التفاعلات

```
Swipe Left  → الشريحة التالية (ease-spring 400ms)
Swipe Right → الشريحة السابقة
Tap [متابعة] → التالية + Haptic (.light)
Tap [تخطي]  → مباشرة لـ Emotion Picker + Haptic (.light)
```

### الشريحة 3 — طلب الأذونات

```
بعد الشريحة الأخيرة:

  [شاشة طلب الأذون]
  
  ◎  مرايا تريد الوصول إلى الميكروفون
  
  "لتفعيل الراوية الصوتية وتجربة
   قراءة القصة معك"
  
  [السماح]        [الآن لا]
```

**الاستراتيجية:** نطلب الأذن فقط حين يكون السياق واضحاً (iOS HIG rule).

### الحالة الفارغة / الخطأ

| الحالة | السلوك |
|--------|--------|
| **صورة بطيئة التحميل** | Skeleton shimmer في مساحة الصورة |
| **رفض الميكروفون** | تكمل التجربة بدون صوت، رسالة هادئة |

---

## شاشة 03 — Emotion Picker (الشاشة الرئيسية)

![Emotion Picker](file:///C:/Users/moham/.gemini/antigravity/brain/4235d654-2ea3-43c2-aa64-e7a032f01e06/maraya_screen_emotion_picker_1772650904584.png)

### Wireframe

```
┌─────────────────────────────┐
│  Status Bar                 │
│                             │
│          مرايا              │ ← Title (Cairo Bold, 36pt)
│    كيف تشعر الآن؟           │ ← Subtitle (Cairo Regular, 16pt, 70% white)
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   😊     │ │   😢     │  │
│  │   فرح    │ │   حزن    │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │   😡     │ │   😰     │  │ ← Emotion Grid (2×3)
│  │   غضب    │ │   خوف    │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │   💕     │ │   🌱     │  │
│  │   حب     │ │   أمل    │  │
│  └──────────┘ └──────────┘  │
│                             │
│  [📸 أو ارفع صورة مكانك]   │ ← Upload CTA (dashed pill)
│                             │
│  نمط السرد: عامية مصرية ▼  │ ← Mode Selector
│                             │
│      Home Indicator         │
└─────────────────────────────┘
```

### المكوّنات

#### EmotionCard

```jsx
<EmotionCard
  emotion={{ id: 'joy', emoji: '😊', label: 'فرح', color: '#FFD700' }}
  isSelected={selected === 'joy'}
  onSelect={handleSelect}
/>

// CSS States:
.emotion-card                     → glass bg, 16px radius
.emotion-card:hover               → card-gradient, translateY(-4px), glow
.emotion-card[aria-pressed=true]  → same as hover + ring
.emotion-card:active              → scale(0.97)
.emotion-card:focus-visible       → outline 2px white, offset 3px
```

#### ModeSelector (Select)

```jsx
<Select
  label="نمط السرد"
  options={[
    { value: 'msr', label: '🇪🇬 عامية مصرية' },
    { value: 'fusha', label: '📜 فصحى' },
    { value: 'judge', label: '🏆 Judge Mode (English)' },
  ]}
  rtl
/>
```

### التفاعلات والإيماءات

```
Tap بطاقة → aria-pressed=true + haptic(.soft) + glow يضيء
             المحتوى يبدأ التوليد تلقائياً بعد 300ms

Tap Upload → ينتقل لشاشة Space Upload (fadeInUp)

Long Press بطاقة → Preview نص قصير "ستبدأ رحلة الفرح..."
                   Haptic (.medium) + Tooltip أعلى البطاقة
```

### حالة الخطأ

```
┌──────────────────────────────┐
│                              │
│  ⚠  انقطع الاتصال           │
│  نُعيد المحاولة تلقائياً     │
│                              │
└──────────────────────────────┘
← Toast يظهر من الأعلى، لا يمنع التفاعل
```

### حالة التحميل الديناميكي (أثناء اختيار المشاعر)

```
الفجوة الزمنية قبل انتقال [Loading]:
- البطاقة المحددة: pulse animation خفيف
- الباقي: opacity(0.4)
- بعد 300ms: انتقال ناعم لشاشة Loading
```

### قابلية الوصول (A11y)

```html
<section role="main" aria-label="اختيار المشاعر">
  <h1>مرايا</h1>
  <p>كيف تشعر الآن؟</p>
  
  <div role="radiogroup" aria-label="اختر مشاعرك">
    <button
      role="radio"
      aria-checked="false"
      aria-label="فرح — ابدأ قصتك من مشاعر الفرح"
      class="emotion-card"
    >
      <span aria-hidden="true">😊</span>
      <span>فرح</span>
    </button>
    <!-- ... -->
  </div>
</section>
```

**VoiceOver:** يقرأ "فرح، ابدأ قصتك من مشاعر الفرح، زر راديو"

**Dynamic Type:** بطاقات تتوسع عمودياً، لا تُقطع النصوص، font-size يتبع إعداد الجهاز

---

## شاشة 04 — Space Upload

### Wireframe

```
┌─────────────────────────────┐
│  × (إغلاق)      (العنوان)  │ ← Navigation Bar
│                             │
│      ارفع صورة مكانك        │ ← Title
│  مرايا ستقرأ مشاعر المكان   │ ← Subtitle
│  وتبني القصة من حوله        │
│                             │
│  ╔═══════════════════╗      │
│  ║                   ║      │
│  ║        📸         ║      │ ← Dropzone / Photo Picker
│  ║  اسحب صورتك هنا  ║      │   aspect-ratio: 16/10
│  ║  أو اضغط للتحديد ║      │
│  ║                   ║      │
│  ╚═══════════════════╝      │
│                             │
│  ─────── أو ───────         │
│  [📷 التقاط صورة]           │
│                             │
│  [  بدء القصة بدون صورة ]  │ ← Ghost button
│                             │
└─────────────────────────────┘
```

### حالة: بعد تحديد صورة

```
┌─────────────────────────────┐
│  × (إغلاق)                 │
│                             │
│  ╔═══════════════════╗      │
│  ║                   ║      │
│  ║  [صورة المستخدم] ║      │ ← Preview بـ opacity 0.8
│  ║                   ║      │
│  ╚═══════════════════╝      │
│                             │
│  مرايا تحلل المكان...       │ ← Progress indicator (pulse)
│  ████████░░░░░░░░░░░░       │ ← Shimmer progress bar
│                             │
│  [تغيير الصورة]             │ ← Ghost button
│                             │
│  [ابدأ القصة ←]             │ ← CTA، يظهر بعد 2 ثانية
│                             │
└─────────────────────────────┘
```

### التفاعلات

```
Tap Dropzone  → UIImagePickerController (Photos + Camera)
Drag & Drop   → قبول Image files (iOS 16+ support)
Tap Camera    → Camera راشرة، crop حر
Tap [بدون]   → تخطي + haptic(.light) + يعود لـ Emotion Picker
```

### حالات الخطأ

| الحالة | الرسالة | الإجراء |
|--------|---------|---------|
| ملف غير مدعوم | "يجب أن تكون صورة (JPG، PNG، HEIC)" | يُعيد فتح الـ picker |
| حجم كبير >10MB | "الصورة كبيرة جداً، جرّب صورة أصغر" | Crop suggestion |
| رفض الأذن | "نحتاج الوصول للصور لهذه الميزة" | Link لـ Settings |

---

## شاشة 05 — Loading / Generating

![Scene & Loading](file:///C:/Users/moham/.gemini/antigravity/brain/4235d654-2ea3-43c2-aa64-e7a032f01e06/maraya_screen_scene_story_1772650948599.png)

### Wireframe

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│                             │
│          ◉                  │ ← Loading Orb (80px)
│       (كرة ضوء)             │   animation: float + orbPulse
│                             │
│    مرايا تتأمل...           │ ← Loading Text (Cairo 20pt, 60% white)
│                             │   animation: pulse 2s infinite
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

### الرسائل الدورانية (Loading Messages)

كل 3 ثوانٍ تتغير الرسالة بـ crossfade 500ms:

```javascript
const messages = [
  "مرايا تتأمل...",
  "القصة تتشكّل...",
  "الكلمات تجد طريقها...",
  "المشهد يتكوّن...",
  "الراوية تستعد...",
];
```

### حالة: انتهاء التوليد

```
الكرة → تنكمش scale(0.1) + opacity(0) → 400ms
الشاشة → crossfade لـ Scene View → 600ms
Haptic → .success notification
```

### حالة الخطأ — timeout بعد 30 ثانية

```
┌─────────────────────────────┐
│                             │
│           ◌                 │ ← الكرة تتلاشى
│                             │
│  توقف الخيط لحظة           │ ← رسالة مرايا (لا "خطأ" مباشرة)
│  نُعيد نسجه...              │
│                             │
│  [حاول مجدداً]              │
│  [اختر مشاعراً أخرى]        │
│                             │
└─────────────────────────────┘
```

**استراتيجية قابلية الوصول:**

```html
<div role="status" aria-live="polite" aria-label="جاري توليد قصتك">
  <div class="loading-orb" aria-hidden="true"></div>
  <p aria-live="polite">مرايا تتأمل...</p>
</div>
```

---

## شاشة 06 — Scene / Story View

### الشاشة الأهم — قلب التجربة

### Wireframe

```
┌─────────────────────────────┐
│                             │ ← Status Bar (مخفية أو Ultra-light)
│  [🔊 صوت]  [😊→😢]         │ ← HUD أعلى يمين (RTL: يسار)
│     ↑ Live Redirect Bar     │
│                             │
│  ██████████████████████████ │
│  ████  [صورة مولّدة]  ████  │ ← Background Image (opacity 40%)
│  ██████████████████████████ │
│  ██████████████████████████ │
│                             │ ← معظم الشاشة فارغة — السينما تتنفس
│                             │
│  ╔══════════════════════╗   │
│  ║ 📖 سرد              ║   │ ← NarrationBlock (glass)
│  ║ وفي تلك الليلة...   ║   │   type: narration
│  ╚══════════════════════╝   │
│                             │
│  [←  افتح الباب]            │ ← Choice Button 1
│  [←  انتظر ما سيأتي]        │ ← Choice Button 2
│                             │
│      ●○○○○  المشهد ٢/٥       │ ← Progress pill
└─────────────────────────────┘
```

### أنواع كتل السرد الثلاثة

```
┌────────────────────────────────────┐
│ 📖 سرد                            │  → الحد الأبيض
│ وفي تلك اللحظة، كان القمر...      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 👁 بصري                           │  → الحد الذهبي
│ ضوء القمر ينعكس على..             │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🔮 تأمل                           │  → الحد السماوي
│ ∿ هل سبق أن شعرت بهذا؟...        │  → italic, أخفت
└────────────────────────────────────┘
```

### التفاعلات الدقيقة (Micro-interactions)

```
1. الكتابة الحية (Typewriter Effect):
   - كل حرف يظهر بترتيب: 30ms/character
   - المؤشر يومض بـ blink animation
   - عند الانتهاء: أزرار الخيار تطلع من الأسفل (slide-up 600ms)

2. أزرار الخيار:
   - تظهر فقط بعد اكتمال السرد
   - opacity: 0 → 1، translateY: 20px → 0
   - Hover: translateX(-6px) [RTL] + scale(1.02)
   - Active: scale(0.97) + haptic(.light)
   - بعد الضغط: كلاهما يتلاشى → Loading مختصر

3. Live Redirect Bar:
   - أيقونات المشاعر: grayscale(100%) opacity(0.5) افتراضياً
   - Hover: grayscale(0%) opacity(1) + scale(1.3) + rotate(8deg)
   - يختبئ بعد 5 ثوانٍ من التفاعل

4. Transcript (جانب الشاشة):
   - يظهر فقط في Judge Mode
   - mask-image gradient للتلاشي
   - scrollbar مخفي: scrollbar-width: none
```

### قابلية الوصول الكاملة

```html
<main role="main" aria-label="المشهد الحالي">

  <!-- الصورة الخلفية: وصف للشاشة -->
  <img
    class="scene-bg"
    src={sceneImage}
    alt="مشهد سينمائي: طريق صحراوي في ضوء القمر"
    aria-hidden="false"
  />

  <!-- نص السرد: يُعلن فور اكتمال الكتابة -->
  <article
    role="article"
    aria-label="سرد القصة"
    aria-live="polite"
    aria-atomic="true"
  >
    <span class="visually-hidden">نص السرد:</span>
    <p class="narration-text__content">
      وفي تلك الليلة...
    </p>
  </article>

  <!-- التقدم: يُعلن عند التغيير -->
  <div role="status" aria-live="polite">
    المشهد الثاني من خمسة
  </div>

  <!-- الخيارات: labeled واضح -->
  <nav role="navigation" aria-label="خيارات القصة">
    <button aria-label="الخيار الأول: افتح الباب الغامض">
      افتح الباب الغامض
    </button>
    <button aria-label="الخيار الثاني: انتظر ما سيأتي">
      انتظر ما سيأتي
    </button>
  </nav>

</main>
```

### حالة: آخر مشهد

```
أزرار الخيار تختفي
تظهر رسالة "المشهد الأخير" بعد السرد
بعد 3 ثوانٍ: انتقال تلقائي لـ Story Ending
```

---

## شاشة 07 — Story Ending (الختام)

![Ending & Settings](file:///C:/Users/moham/.gemini/antigravity/brain/4235d654-2ea3-43c2-aa64-e7a032f01e06/maraya_screen_ending_settings_1772650969779.png)

### Wireframe

```
┌─────────────────────────────┐
│                             │
│           ✦                 │ ← رمز زخرفي صغير
│                             │
│   انتهت الرحلة...          │
│   لكن المرآة لا تنسى.      │ ← Quote (Cairo Light, 22pt)
│   كل مشاعر تركتها هنا      │   line-height: 1.8
│   تحوّلت إلى حكاية.        │   max-width: 300pt, centered
│                             │
│   ─────────────────         │ ← Divider مع glow
│                             │
│                             │
│  [  ✨ قصة جديدة  ]         │ ← Primary Button (glass)
│                             │
│  [  مشاركة القصة  ]         │ ← Secondary (ghost)
│                             │
│  [  حفظ للمراجعة  ]         │ ← Tertiary (text-only)
│                             │
│      Home Indicator         │
└─────────────────────────────┘
```

### الحركة الدخولية

```
0ms    → خلفية bokeh/starfield تظهر (fadeIn 1200ms)
400ms  → الرمز الزخرفي ✦ يبزغ (scale 0.3→1, 800ms spring)
800ms  → النص يظهر سطراً سطراً (stagger 80ms/line, fadeInUp)
1600ms → الـ Divider يمتد من المركز (scaleX 0→1, 600ms)
2000ms → الأزرار تظهر (stagger 100ms, fadeInUp)
```

### التصرفات

| الزر | الإجراء |
|------|---------|
| **قصة جديدة** | يُعيد إلى Emotion Picker مع تنظيف الـ state، haptic(.medium) |
| **مشاركة القصة** | iOS Share Sheet + copy link + save as image |
| **حفظ للمراجعة** | يحفظ ملخص القصة محلياً (UserDefaults/Core Data) |

### حالة: نهاية قاتمة (مشاعر غضب/خوف)

```
نفس التخطيط لكن:
- خلفية bokeh يميل للأحمر/البنفسجي
- الاقتباس أكثر شاعرية ومؤلماً:
  "الغضب كان مرشدك. الخوف كان معلمك."
```

---

## شاشة 08 — Settings Sheet (إعدادات)

### نوع الشاشة: Modal Bottom Sheet (Apple HIG)

```
المشغّل: Swipe Up من أي شاشة، أو زر ⚙ في الـ HUD
```

### Wireframe

```
┌─────────────────────────────┐
│                             │
│                             │
│         ════                │ ← Drag Handle (44pt tap target)
│                             │
│  الإعدادات                  │ ← Sheet Title
│                             │
│  لغة السرد                  │
│  [عامية مصرية][فصحى][English]│ ← Segmented Control
│  ───────────────────────    │
│  صوت الراوية           ●    │ ← Toggle (emerald when ON)
│  ───────────────────────    │
│  نمط الواجهة               │
│  [داكن] [تلقائي] [فاتح]    │ ← Segmented Control
│  ───────────────────────    │
│  حجم النص                   │
│  ◁───────●─────────▷       │ ← Slider مع مُعاينة فورية
│  ───────────────────────    │
│  خصوصية البيانات          › │ ← Disclosure Row
│  ───────────────────────    │
│  حول مرايا                › │
│                             │
└─────────────────────────────┘
```

### المكوّنات

```jsx
<BottomSheet
  detents={['.medium', '.large']}
  grabberVisible
  onDismiss={close}
>
  <SegmentedControl
    label="لغة السرد"
    options={['عامية مصرية', 'فصحى', 'English']}
    rtl
  />
  
  <Toggle
    label="صوت الراوية"
    checked={voiceOn}
    onChange={setVoiceOn}
    activeColor="var(--accent-emerald)"
  />
  
  <SegmentedControl
    label="نمط الواجهة"
    options={['داكن', 'تلقائي', 'فاتح']}
    rtl
  />
  
  <Slider
    label="حجم النص"
    min={0}
    max={100}
    preview={<TextPreview size={fontSize} />} {/* Live preview */}
  />
  
  <DisclosureRow label="خصوصية البيانات" onPress={openPrivacy} />
  <DisclosureRow label="حول مرايا" onPress={openAbout} />
</BottomSheet>
```

### التفاعلات

```
Drag Handle:
  → Swipe Down = إغلاق (500ms spring)
  → Swipe Up = يمتد لـ .large detent

Toggle الصوت:
  → ON: haptic(.medium) + toast "صوت الراوية مُفعَّل" 1.5s
  → OFF: haptic(.light)

Slider حجم النص:
  → الحركة: live preview فوري على عينة نص في الـ sheet نفسها
  → haptic(.selection) كل unit

Language Change:
  → يُعيد رسم النصوص فوراً
  → يُغيّر dir="rtl/ltr" على root element
```

### قابلية الوصول

```html
<div role="dialog" aria-modal="true" aria-label="الإعدادات">
  
  <div role="group" aria-labelledby="lang-label">
    <span id="lang-label">لغة السرد</span>
    <div role="radiogroup">
      <button role="radio" aria-checked="true">عامية مصرية</button>
      ...
    </div>
  </div>
  
  <button
    role="switch"
    aria-checked={voiceOn}
    aria-label="صوت الراوية"
  />
  
  <input
    type="range"
    min="0" max="100"
    aria-label="حجم النص"
    aria-valuetext={`${fontSize}% من الحجم الافتراضي`}
  />
  
</div>
```

---

## ملخص المكوّنات والأنماط المستخدمة

### جدول المكوّنات

| المكوّن | الشاشات | الحالات |
|---------|---------|---------|
| `EmotionCard` | 03 | default, hover, selected, disabled |
| `NarrationBlock` | 06 | narration, visual, reflection |
| `ChoiceButton` | 06 | default, hover, active, loading |
| `LoadingOrb` | 05 | pulsing, error, success-out |
| `GlassCard` | 02,03,04 | default, hover, focus |
| `Button` | 02,03,07 | primary, secondary, ghost |
| `Toggle` | 08 | off, on, disabled |
| `SegmentedControl` | 08 | 2-3 segments, rtl/ltr |
| `Slider` | 08 | default, active, with-preview |
| `BottomSheet` | 08 | medium, large, dismissing |
| `Toast` | 03,06 | info, success, error, warning |
| `PageIndicator` | 02 | rtl aware |
| `ProgressPill` | 06 | n/total |

### أنماط التنقل

| النمط | الوصف | Apple HIG Component |
|-------|-------|---------------------|
| Full-screen fade | بين الشاشات الكبرى | Custom Transition |
| Slide-up | Settings Sheet | `UISheetPresentationController` |
| Bottom-up entrance | أزرار الخيار | Custom Animation |
| Cross-dissolve | بين مشهد ومشهد | `UIViewControllerTransitioningDelegate` |

---

## قواعد A11y الإلزامية

### WCAG 2.1 Compliance

| المعيار | التطبيق |
|---------|---------|
| **1.4.3 Contrast** | نسبة ≥ 4.5:1 لكل نص body، ≥ 3:1 للكبير |
| **1.4.4 Resize Text** | Dynamic Type — كل النصوص تتكيف |
| **1.4.11 Non-text Contrast** | حدود الأزرار ≥ 3:1 مقابل الخلفية |
| **2.1.1 Keyboard** | كل عنصر تفاعلي وصوله بلوحة المفاتيح |
| **2.4.3 Focus Order** | RTL: right → left، top → bottom |
| **2.4.7 Focus Visible** | `focus-visible` outline دائمًا |
| **3.2.1 On Focus** | التركيز لا يُغيّر السياق تلقائياً |
| **4.1.2 Name, Role, Value** | كل مكوّن له ARIA كامل |

### VoiceOver (iOS)

- **اتجاه القراءة:** RTL — VoiceOver يتبع `dir="rtl"` تلقائياً
- **الصور:** كل صورة مُولَّدة لها `alt` وصفي أو `aria-hidden` إذا كانت زخرفية
- **الانتقالات:** `aria-live="polite"` على منطقة السرد
- **Toast:** `aria-live="assertive"` لرسائل الخطأ، `polite` للمعلوماتية

### Dynamic Type (iOS)

```swift
// كل نص يستخدم text styles:
.title1           → عنوان الشاشة
.headline         → عناوين فرعية
.body             → نص السرد
.caption1         → تسميات البلوكات
.footnote         → ملاحظات ثانوية

// الحد الأقصى: xxxLarge + Accessibility sizes
// الحد الأدنى: يبقى مقروءاً حتى xSmall
```

---

## السلوك المتجاوب — Web Version

### نقاط القطع

```
Mobile  (<768px):  تخطيط عمودي، شبكة 2 أعمدة للـ EmotionCards
Tablet  (768-1023px): شبكة 3 أعمدة، panels جانبية
Desktop (1024px+):  تخطيط سينمائي مركزي، max-width: 900px للمحتوى
```

### تكيّف شاشة القصة (Desktop)

```
┌────────────────────────────────────────────┐
│                 Top Bar                     │
├────────────────────────────────────────────┤
│         │                    │             │
│Transcript│    [صورة كاملة]   │  Controls   │
│ جانبي   │    [سرد مركزي]    │  جانبي      │
│ 280px   │    [خيارات]       │  200px      │
│         │                    │             │
└────────────────────────────────────────────┘
```

---

## ملاحظات المصمم الختامية

> **مرايا تصمّم الصمت بنفس العناية التي تصمّم بها المحتوى.**
>
> أكثر القرارات التصميمية أهمية في هذه الوثيقة ليست ما هو موجود — بل ما تجرّأنا على حذفه:
>
> - لا Tab Bar (القصة خطية، التنقل العشوائي يُدمّر السحر)
> - لا Notifications/Badges (مرايا لا تُلِح، تنتظر)
> - لا Progress Bars صريحة (تكسر الإيهام)
> - لا كلمة "AI" أو "مُولَّد" في الـ UI (السحر لا يشرح نفسه)
>
> **المعيار الأعلى:** إذا شعر المستخدم أنه يُفكّر في الـ UI بدلاً من القصة، فقد فشل التصميم.
