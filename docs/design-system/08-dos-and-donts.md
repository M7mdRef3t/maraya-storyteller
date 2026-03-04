# ما يجب وما لا يجب — Do's & Don'ts

> قواعد ذهبية لضمان تماسك التجربة البصرية.

---

## 🎨 الألوان

### ✅ افعل

- **استخدم design tokens** — لا تكتب ألوانًا مباشرة
  ```css
  /* ✅ */
  color: var(--text-secondary);
  
  /* ❌ */
  color: rgba(255, 255, 255, 0.7);
  ```

- **استخدم ألوان المشاعر عبر CSS variables** — ليسهل تغييرها ديناميكيًا
- **تأكد من تباين WCAG AA** على الأقل لكل نص مقروء
- **استخدم `color-mix()`** للشفافيات الديناميكية بدلاً من ألوان ثابتة

### ❌ لا تفعل

- **لا تستخدم ألوان نقية صارخة** — `#ff0000` ممنوع. استخدم `var(--accent-rose)` بدلاً
- **لا تستخدم خلفيات بيضاء صلبة** — حتى في الوضع الفاتح، استخدم رمادي خفيف
- **لا تكرر ألوانًا بدون توثيقها** في نظام الـ tokens
- **لا تستخدم أكثر من 3 ألوان مميزة** في نفس الشاشة

---

## 📝 الطباعة

### ✅ افعل

- **استخدم `clamp()`** لكل حجم نص
  ```css
  /* ✅ يتكيّف بسلاسة */
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  
  /* ❌ قفزات فجائية */
  font-size: 16px;
  @media (min-width: 768px) { font-size: 24px; }
  ```

- **استخدم `rem`** كوحدة أساسية — تحترم تكبير المتصفح
- **ارتفاع سطر ≥ 1.5** لكل نص عربي متعدد الأسطر
- **استخدم Cairo** للعناوين والنص العربي، **Outfit** للـ UI

### ❌ لا تفعل

- **لا تستخدم أكثر من 3 أوزان** في نفس المكوّن
- **لا تقل عن 12px** لأي نص مقروء
- **لا تستخدم `text-transform: uppercase`** على نص عربي
- **لا تستخدم `letter-spacing` كبير** على العربية — يفصل الحروف المتصلة
  ```css
  /* ✅ للإنجليزية */
  .overline { letter-spacing: 0.08em; text-transform: uppercase; }
  
  /* ❌ ضار بالعربية */
  .arabic-text { letter-spacing: 0.08em; } 
  ```

---

## 🪟 الزجاج (Glassmorphism)

### ✅ افعل

- **أضف دائمًا `-webkit-backdrop-filter`** مع `backdrop-filter`
- **استخدم حدود خفيفة** مع الزجاج — بدونها يفقد العمق
- **طبّق blur بين 8px و 25px** — أقل من 8px لا يُرى، أكثر من 25px يبطئ الأداء

### ❌ لا تفعل

- **لا تتداخل أكثر من 3 طبقات زجاجية** — الأداء ينخفض بشكل ملحوظ
- **لا تستخدم الزجاج على خلفيات بيضاء موحّدة** — يختفي التأثير
- **لا تنسَ الـ fallback** — على متصفحات بدون دعم blur:
  ```css
  .glass {
    background: rgba(255,255,255,0.06);  /* fallback */
    backdrop-filter: blur(20px);
  }
  ```

---

## 🎬 الحركة (Motion)

### ✅ افعل

- **احترم `prefers-reduced-motion`** دائمًا
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- **استخدم `var(--ease-spring)`** للحركات الرئيسية — تشعر بالحيوية
- **أدخل العناصر بـ fadeInUp** — الاتجاه الطبيعي للقراءة من أسفل لأعلى
- **أضف تأخير تسلسلي (stagger)** لمجموعات العناصر بـ 60-100ms فرق

### ❌ لا تفعل

- **لا تتجاوز 1200ms** لأي animation — يشعر بالبطء
- **لا تستخدم `ease-in`** لعناصر تدخل — تبدو بطيئة في البداية
- **لا تحرّك أكثر من 3 عناصر** في نفس الوقت — مشتت
- **لا تستخدم animations مستمرة** على عناصر محتوى — فقط على زخرفية

---

## ♿ قابلية الوصول

### ✅ افعل

- **أضف `aria-label`** لكل زر أيقونة
- **استخدم `role` و `aria-*`** المناسبة لكل مكوّن
- **حجم لمس ≥ 44×44px** لكل عنصر تفاعلي
- **استخدم `focus-visible`** وليس `focus` — لا تظهر حلقة التركيز للماوس
- **أضف `aria-live`** للمحتوى الديناميكي (Toast, SceneProgress)
- **قدّم بدائل نصية** لكل emoji تفاعلي

### ❌ لا تفعل

- **لا تستخدم `outline: none`** بدون بديل واضح
- **لا تعتمد على اللون وحده** لنقل المعلومات
- **لا تستخدم `display: none`** لإخفاء عناصر يحتاجها قارئ الشاشة — استخدم `.visually-hidden`
- **لا تنسَ `alt` على الصور** — حتى لو كانت `alt=""` للزخرفية

---

## 📐 التخطيط والتباعد

### ✅ افعل

- **استخدم CSS Logical Properties** لدعم RTL/LTR
  ```css
  /* ✅ */
  margin-inline-start: 1rem;
  padding-inline: var(--space-4);
  inset-inline-end: 1rem;
  
  /* ❌ */
  margin-left: 1rem;
  padding-left: 16px;
  right: 1rem;
  ```
- **استخدم tokens التباعد** — لا تخترع أرقام
- **ابدأ mobile-first** ثم وسّع

### ❌ لا تفعل

- **لا تستخدم `px` ثابتة** للتباعد خارج نظام الـ tokens
- **لا تكسر شبكة الـ 8px** — كل تباعد يجب أن يكون مضاعف 4px
- **لا تسخدم `float`** — استخدم Flexbox أو Grid
- **لا تستخدم `!important`** إلا في حالات الضرورة (accessibility overrides)

---

## 🧱 المكوّنات

### ✅ افعل

- **أسماء BEM-style** لكل class:
  ```css
  /* ✅ Block__Element--Modifier */
  .emotion-card__icon
  .emotion-card--active
  .narration-block--visual
  
  /* ❌ أسماء عشوائية */
  .card-icon-wrapper
  .active-emotion
  .visual-narr
  ```
- **فصل الحالات** بـ modifier classes وليس classes جديدة
- **اجعل كل مكوّن مكتفٍ ذاتيًا** — لا يعتمد على CSS خارجي

### ❌ لا تفعل

- **لا تكتب CSS inline** — استخدم CSS variables لـ dynamic values
  ```jsx
  // ✅ dynamic via CSS var
  <div style={{ '--card-color': '#ffd700' }}>
  
  // ❌ inline styles للتصميم
  <div style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
  ```
- **لا تنسّخ CSS بين مكوّنات** — أنشئ utility أو نمط مشترك
- **لا تشفّر النصوص** في CSS — النصوص تأتي من JS/Props

---

## 🌍 التدويل (i18n)

### ✅ افعل

- **اختبر في وضع RTL و LTR** — كل مكوّن
- **استخدم `dir='rtl'` على `<html>`** وليس على كل عنصر
- **اعكس الأيقونات الاتجاهية** (أسهم، chevrons) في RTL

### ❌ لا تفعل

- **لا تستخدم `text-align: left`** — استخدم `text-align: start`
- **لا تفترض اتجاه القراءة** — استخدم logical properties
- **لا تترجم أسماء CSS classes** — ابقها بالإنجليزية
