# الأنماط — Patterns

> الأنماط هي وصفات تصميم مُجرّبة — حلول مكررة لمشاكل شائعة.

---

## 1. نمط السطح الزجاجي (Glass Surface)

> القاعدة البنائية الأساسية لكل سطح مرئي في مرايا.

### الوصفة

```css
.glass {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

### مستويات الشفافية

| المستوى | الخلفية | متى؟ |
|---------|---------|------|
| **Whisper** | `rgba(255,255,255,0.03)` | خلفية بعيدة، عناصر فرعية |
| **Default** | `rgba(255,255,255,0.06)` | بطاقات، ألواح |
| **Hover** | `rgba(255,255,255,0.10)` | تفاعل hover |
| **Active** | `rgba(255,255,255,0.15)` | عنصر نشط/محدد |
| **Strong** | `rgba(255,255,255,0.20)` | عناصر بارزة، CTA |

### القواعد
- ✅ استخدم دائمًا مع `backdrop-filter: blur()`
- ✅ أضف `-webkit-backdrop-filter` للتوافق
- ✅ حدود خفيفة للفصل البصري
- ❌ لا تستخدم على خلفية فاتحة — الزجاج مصمّم للظلام
- ❌ لا تتداخل أكثر من 3 طبقات زجاجية

---

## 2. نمط التدرج العاطفي (Emotion Gradient)

> كل تفاعل عاطفي يغلّف المكوّن بتدرج خافت.

### الوصفة

```css
.emotion-surface {
  --emotion-color: #ffd700; /* يتغير حسب المشاعر */

  background: linear-gradient(135deg,
    color-mix(in srgb, var(--emotion-color) 15%, transparent) 0%,
    color-mix(in srgb, var(--emotion-color) 3%, transparent) 100%
  );
  border-color: color-mix(in srgb, var(--emotion-color) 45%, transparent);
  box-shadow:
    0 12px 40px rgba(0,0,0,0.4),
    0 0 30px color-mix(in srgb, var(--emotion-color) 45%, transparent);
}
```

### متى تستخدم؟
- بطاقة مشاعر عند hover/pressed
- خلفية المشهد عند تحديد مشاعر
- حدود العناصر المرتبطة بمشاعر محددة

---

## 3. نمط النص السينمائي (Cinematic Text)

> النص يظهر كأنه مكتوب على شاشة سينما.

### الوصفة

```css
.cinematic-text {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 4vw, 2.4rem);
  font-weight: 500;
  line-height: 1.85;
  color: #fff;
  text-align: center;
  text-shadow:
    0 4px 15px rgba(0,0,0,0.8),
    0 0 40px rgba(0,0,0,0.6);
}
```

### تأثير الكتابة المتحركة (Typewriter)

```css
.typewriter-cursor {
  opacity: 1;
  animation: blink 0.8s step-end infinite;
  color: rgba(255,255,255,0.6);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

---

## 4. نمط الظهور (Entrance Animation)

> كل عنصر يدخل المسرح بحركة ناعمة.

### fadeInUp — الافتراضي

```css
.enter {
  animation: fadeInUp 0.6s var(--ease-spring);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### تأخير تسلسلي (Staggered Entry)

```css
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 80ms; }
.stagger > *:nth-child(3) { animation-delay: 160ms; }
.stagger > *:nth-child(4) { animation-delay: 240ms; }
.stagger > *:nth-child(5) { animation-delay: 320ms; }
.stagger > *:nth-child(6) { animation-delay: 400ms; }
```

### القواعد

- ✅ كل عنصر محتوى جديد يدخل بـ `fadeInUp`
- ✅ مجموعات العناصر تتسلسل بـ 80ms فرق
- ✅ احترم `prefers-reduced-motion`
- ❌ لا تستخدم أكثر من 1200ms مدة
- ❌ لا تستخدم animations مشتتة أثناء القراءة

---

## 5. نمط الطفو (Float Pattern)

> عناصر "حيّة" تتحرك ببطء.

```css
.float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### متى؟
- مؤشر التحميل (LoadingOrb)
- عناصر زخرفية في الخلفية

---

## 6. نمط التركيز (Focus Pattern)

> حلقة تركيز متسقة عبر كل المكوّنات.

```css
:focus-visible {
  outline: 2px solid rgba(255,255,255,0.50);
  outline-offset: 2px;
}

/* للعناصر الزجاجية */
.glass:focus-within {
  outline: 2px solid rgba(255,255,255,0.50);
  outline-offset: 4px;
  border-color: rgba(255,255,255,0.50);
}
```

### القواعد
- ✅ استخدم `focus-visible` وليس `focus` (لا تظهر للماوس)
- ✅ `outline-offset: 2px` كحد أدنى
- ✅ لون التركيز: `rgba(255,255,255,0.50)`
- ❌ لا تستخدم `outline: none` أبداً بدون بديل

---

## 7. نمط الحاوية المتمركزة (Centered Container)

```css
.center-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: var(--space-8);
  text-align: center;
}
```

---

## 8. نمط الشريط اللاصق (Sticky Bar)

```css
.sticky-bar {
  position: fixed;
  z-index: var(--z-bar);
  background: rgba(3,3,5,0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
}

/* أعلى */
.sticky-bar--top {
  top: 0;
  inset-inline: 0;
}

/* عائم وسط */
.sticky-bar--float {
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: var(--radius-full);
}
```

---

## 9. نمط التلاشي بين الأقسام (Section Transition)

```css
.section-transition {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s var(--ease-spring);
}

.section-transition--visible {
  opacity: 1;
  transform: translateY(0);
}
```

**التنفيذ**: استخدم `IntersectionObserver` لتفعيل `--visible`.

---

## 10. نمط صفحة الطبقات (Layered Page)

> مرايا مبنية كمسرح بطبقات:

```
z-index stack:
┌─────────────────────────────────────┐
│  200  Tooltip / Debug               │
│  150  Modal                         │
│  110  Audio HUD                     │
│  100  Navigation Bars               │
│   30  Narration Text                │
│   20  Transcript                    │
│   10  Content Overlay               │
│    0  Background / Scene            │
└─────────────────────────────────────┘
```

### قاعدة الفصل
- الخلفية (مشهد) ← لا تفاعلية
- المحتوى ← تفاعلي
- HUD ← دائمًا مرئي
- Modals ← يحجب كل شيء

---

## 11. نمط RTL-Safe Positioning

```css
/* ✅ يعمل في RTL و LTR */
.positioned {
  position: absolute;
  inset-inline-end: 1rem;  /* بدل right/left */
  top: 1rem;
}

/* ✅ Hover direction-aware */
.slide-item:hover {
  transform: translateX(calc(var(--dir, -1) * 6px));
}

/* تعيين الاتجاه */
[dir='rtl'] { --dir: -1; }
[dir='ltr'] { --dir: 1; }
```

---

## 12. نمط القناع التدرّجي (Gradient Mask)

> لإخفاء حواف المحتوى القابل للتمرير.

```css
.gradient-mask {
  mask-image: linear-gradient(
    to bottom,
    transparent,
    #000 10%,
    #000 90%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent,
    #000 10%,
    #000 90%,
    transparent
  );
}
```

**الاستخدام**: قائمة النصوص (Transcript)، قوائم قابلة للتمرير.

---

## 13. نمط الاستجابة (Responsive Pattern)

```css
/* Mobile-first */
.responsive-component {
  /* Base: mobile */
  flex-direction: column;
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .responsive-component {
    flex-direction: row;
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .responsive-component {
    padding: var(--space-8);
  }
}
```
