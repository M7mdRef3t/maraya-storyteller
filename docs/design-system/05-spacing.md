# نظام التباعد 8px — Spacing System

> التباعد في مرايا يتنفّس — ليس ضيقًا ولا فضفاضًا.
> مبني على قاعدة 8px لتوافق بكسل-مثالي عبر كل الشاشات.

---

## 1. مقياس التباعد

| الرمز | القيمة | الاسم | الاستخدام الأساسي |
|-------|--------|-------|-------------------|
| `--space-0` | `0px` | None | لا شيء |
| `--space-1` | `4px` | Micro | تباعد داخلي ضئيل، gaps بين أيقونات |
| `--space-2` | `8px` | Tiny | تباعد بين عناصر مترابطة |
| `--space-3` | `12px` | Small | padding داخلي للعناصر الصغيرة |
| `--space-4` | `16px` | Base | الوحدة الأساسية — padding/margin الافتراضي |
| `--space-5` | `20px` | Medium | تباعد بين أقسام مترابطة |
| `--space-6` | `24px` | Large | gutter الشبكة، فصل بين مجموعات |
| `--space-8` | `32px` | XLarge | فصل بين أقسام |
| `--space-10` | `40px` | 2XLarge | مسافة كبيرة بين كتل |
| `--space-12` | `48px` | 3XLarge | فصل بين أقسام رئيسية |
| `--space-16` | `64px` | 4XLarge | هوامش جانبية (desktop) |
| `--space-20` | `80px` | 5XLarge | هوامش واسعة |
| `--space-24` | `96px` | 6XLarge | فصل بين أقسام كبرى |
| `--space-32` | `128px` | Max | مسافة سينمائية قصوى |

---

## 2. CSS Implementation

### المتغيرات

```css
:root {
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
}
```

### Utility Classes

```css
/* Padding */
.p-0  { padding: var(--space-0); }
.p-1  { padding: var(--space-1); }
.p-2  { padding: var(--space-2); }
.p-3  { padding: var(--space-3); }
.p-4  { padding: var(--space-4); }
.p-6  { padding: var(--space-6); }
.p-8  { padding: var(--space-8); }

.px-4 { padding-inline: var(--space-4); }
.py-4 { padding-block: var(--space-4); }

/* Margin */
.m-0  { margin: var(--space-0); }
.m-4  { margin: var(--space-4); }
.mx-auto { margin-inline: auto; }

.mt-2 { margin-block-start: var(--space-2); }
.mb-4 { margin-block-end: var(--space-4); }

/* Gap */
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }
```

---

## 3. قواعد التباعد

### التباعد الداخلي (Padding)

| المكوّن | الأفقي | العمودي |
|---------|--------|---------|
| زر صغير | 12px (`--space-3`) | 6px |
| زر عادي | 24px (`--space-6`) | 12px (`--space-3`) |
| زر كبير | 32px (`--space-8`) | 16px (`--space-4`) |
| بطاقة | 16px (`--space-4`) | 24px (`--space-6`) |
| شريط أدوات | 16px (`--space-4`) | 10px |
| صفحة | هامش الشبكة | 32px (`--space-8`) |

### الفجوات (Gaps)

| السياق | الفجوة |
|--------|--------|
| بين أيقونات في صف | `--space-2` (8px) |
| بين عناصر نموذج | `--space-3` (12px) |
| بين بطاقات في شبكة | `--space-4` (16px) |
| بين أقسام مترابطة | `--space-6` (24px) |
| بين أقسام مستقلة | `--space-8` (32px) |
| بين كتل رئيسية | `--space-12` (48px) |
| فصل سينمائي | `--space-16` (64px) |

---

## 4. أنماط التباعد في مرايا

### نمط "التنفّس" (Breathing)

```
    ┌─────────────────────────────────┐
    │         --space-12 (48px)       │ ← فراغ سينمائي علوي
    │                                 │
    │        ╔══════════════╗         │
    │        ║   المحتوى    ║         │
    │        ╚══════════════╝         │
    │                                 │
    │         --space-8 (32px)        │ ← فراغ بين العناصر
    │                                 │
    │        ╔══════════════╗         │
    │        ║   الأزرار    ║         │
    │        ╚══════════════╝         │
    │                                 │
    │         --space-16 (64px)       │ ← فراغ سينمائي سفلي
    └─────────────────────────────────┘
```

### نمط "البطاقة" (Card)

```
    ╔═══════════════════════════╗
    ║  --space-6 (padding)      ║
    ║  ┌─────────────────────┐  ║
    ║  │ Icon  --space-2  Lbl│  ║  ← gap أفقي
    ║  └─────────────────────┘  ║
    ║  --space-3 (gap عمودي)    ║
    ║  ┌─────────────────────┐  ║
    ║  │     Description     │  ║
    ║  └─────────────────────┘  ║
    ╚═══════════════════════════╝
```

### نمط "المكدّس" (Stack)

عناصر مرتبة عموديًا بتباعد ثابت:

```css
.stack {
  display: flex;
  flex-direction: column;
}

.stack--sm  > * + * { margin-block-start: var(--space-2); }
.stack--md  > * + * { margin-block-start: var(--space-4); }
.stack--lg  > * + * { margin-block-start: var(--space-6); }
.stack--xl  > * + * { margin-block-start: var(--space-8); }
```

---

## 5. لماذا 8px؟

| الميزة | الشرح |
|--------|-------|
| **توافق الشاشات** | 8 يقسم بنظافة على أكثر دقات الشاشات |
| **سلّم واضح** | 4→8→12→16→24→32→48→64→96 — كل قفزة منطقية |
| **نصف-خطوة** | 4px متاحة للتعديلات الدقيقة |
| **محاذاة بصرية** | عناصر تنتظم على شبكة غير مرئية |
| **معيار صناعي** | Apple، Google، IBM كلهم يستخدمون 8px base |
