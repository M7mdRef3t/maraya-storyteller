# مرايا — مواصفات Figma الكاملة
## Figma Design Ops Specification · v1.0

**أخصائي Design Ops**
**المنصة:** Figma (Design + Dev Mode + Variables)
**الملف:** `Maraya DS · مرايا`

---

## الفهرس

1. [هيكل الملف والصفحات](#1-هيكل-الملف)
2. [هيكل الإطارات (Frames)](#2-هيكل-الإطارات)
3. [الشبكات (Grids)](#3-الشبكات)
4. [القيود (Constraints)](#4-القيود)
5. [قواعد الاستجابة (Responsive Rules)](#5-الاستجابة)
6. [إعدادات Auto-Layout](#6-auto-layout)
7. [بنية المكوّنات والمتغيرات](#7-المكوّنات)
8. [Design Tokens (Figma Variables)](#8-design-tokens)
9. [تدفقات البروتوتايب](#9-البروتوتايب)
10. [تسليم المطوّر](#10-تسليم-المطور)
11. [ملاحظات قابلية الوصول](#11-قابلية-الوصول)

---

## 1. هيكل الملف

### تنظيم الصفحات في Figma

```
📁 Maraya DS · مرايا
├── 📄 🎨 Cover               ← صفحة الغلاف (thumbnail للـ Community)
├── 📄 🪙 Tokens              ← Variables + Color Styles + Text Styles
├── 📄 🧱 Components          ← Component Library (مصدر الحقيقة)
├── 📄 📱 Screens · Mobile    ← 8 شاشات iPhone 15 Pro
├── 📄 🖥  Screens · Desktop   ← 8 شاشات Desktop (1440px)
├── 📄 🔄 Prototype Flow      ← تدفق البروتوتايب مع الاتصالات
└── 📄 📋 Handoff Notes       ← ملاحظات تسليم المطوّر
```

### قواعد التسمية (Naming Convention)

```
الصفحات:     Emoji + Space + Name
الـ Frames:  [Number] · Screen Name  →  03 · Emotion Picker
المجموعات:   Category/Sub  (BEM-style)  →  Button/Primary, Card/Emotion
المكوّنات:   PascalCase  →  EmotionCard, NarrationBlock
الـ Layers:  lowercase-kebab  →  bg-gradient, title-text, choice-btn-1
```

---

## 2. هيكل الإطارات (Frames)

### الأُطر الرئيسية — Mobile

| الاسم | الأبعاد | النوع |
|-------|---------|-------|
| `iPhone 15 Pro` | 393 × 852 pt | Device Frame |
| `iPhone SE` | 375 × 667 pt | Device Frame (Minimum) |
| `iPhone 15 Pro Max` | 430 × 932 pt | Device Frame (Maximum) |

### هيكل الشاشة الداخلي (Anatomy of a Screen Frame)

```
[ iPhone 15 Pro Frame — 393 × 852 ]
│
├── [ StatusBar ] — 54 × 393, Fixed Top
│     ├── time-text
│     ├── dynamic-island
│     └── icons-group (battery, wifi, signal)
│
├── [ SafeArea-Content ] — Auto Height
│     └── [المحتوى الفعلي للشاشة]
│
└── [ HomeIndicator ] — 34 × 139, Fixed Bottom
```

### بنية إطار شاشة Emotion Picker (مثال كامل)

```
Frame: 03 · Emotion Picker (393 × 852)
│
├── bg-layer (Rectangle, Fill: #030305, Constraints: Scale)
│   └── bg-gradient (Rectangle, Fill: Radial, 30% opacity)
│
├── [Auto-Layout: Vertical] content-wrapper
│   Padding: 0 24 0 24  |  Gap: 0  |  Fill: Hug
│   │
│   ├── spacer-top (Rectangle, H: 70, Fill: transparent)
│   ├── header-group [AL: Vertical, Gap: 8, Center]
│   │   ├── title "مرايا" (Text Style: Hero, Color: White)
│   │   └── subtitle (Text Style: Body, Color: White/70)
│   │
│   ├── spacer-1 (H: 40)
│   │
│   ├── emotion-grid [AL: Vertical, Gap: 12]  ← يحتوي على rows
│   │   ├── grid-row-1 [AL: Horizontal, Gap: 12]
│   │   │   ├── EmotionCard (Joy)
│   │   │   └── EmotionCard (Sadness)
│   │   ├── grid-row-2 [AL: Horizontal, Gap: 12]
│   │   │   ├── EmotionCard (Anger)
│   │   │   └── EmotionCard (Fear)
│   │   └── grid-row-3 [AL: Horizontal, Gap: 12]
│   │       ├── EmotionCard (Love)
│   │       └── EmotionCard (Hope)
│   │
│   ├── spacer-2 (H: 24)
│   ├── upload-btn (Component: Button/Ghost/Upload)
│   ├── spacer-3 (H: 16)
│   └── mode-selector (Component: Select/Default)
│
└── [pin: Bottom] safe-area-bottom H:34
```

---

## 3. الشبكات (Grids)

### إعدادات Grid لكل Device Size

#### Mobile (393px)

```
في Figma: Frame Properties → Grid

Grid 1 — Columns:
  Type: Stretch
  Count: 4
  Margin: 24
  Gutter: 16
  Color: rgba(255,0,0,0.05)  [مرئي فقط في Edit]

Grid 2 — Rows (اختياري):
  Type: Top
  Count: 1
  Size: 8
  Gutter: 0
  Color: rgba(0,255,0,0.04)
```

#### Tablet (768px)

```
Grid 1 — Columns:
  Type: Stretch
  Count: 8
  Margin: 32
  Gutter: 24
```

#### Desktop (1440px)

```
Grid 1 — Columns:
  Type: Center
  Count: 12
  Width: 72
  Gutter: 24
  Offset: Auto (يُمركز تلقائياً)
```

### حفظ Grid Styles

```
Figma Styles → + إضافة Grid Style:

"Grid/Mobile/4-Col"     → الإعدادات أعلاه للموبايل
"Grid/Tablet/8-Col"     → للتابلت
"Grid/Desktop/12-Col"   → للديسكتوب
"Grid/8px-Base"         → Rows بـ 8px للمساعدة في التباعد
```

---

## 4. القيود (Constraints)

### جدول القيود الموحّدة

| العنصر | Horizontal | Vertical | السبب |
|--------|-----------|---------|-------|
| خلفية الشاشة (bg) | Scale | Scale | تملأ كل الأجهزة |
| Status Bar | Left & Right | Top | مثبّت الأعلى |
| Home Indicator | Center | Bottom | مثبّت الأسفل |
| العنوان الرئيسي | Center | Top | ثابت من الأعلى |
| Loading Orb | Center | Center | دائماً في الوسط |
| Audio HUD | Right (RTL: Left) | Top | مثبّت في الزاوية |
| Toast Notification | Center | Top | يظهر من الأعلى |
| Choice Buttons | Left & Right | Bottom | يُدفَع للأسفل |
| Bottom Sheet | Left & Right | Bottom | يلتصق بالقاع |
| Transcript Panel | Left (RTL) / Right (LTR) | Top | ثابت الجانب |

### تطبيق القيود في Figma

```
طريقة التطبيق:
1. حدد العنصر
2. Panel الأيمن → Design → Constraints
3. اختر القيد الأفقي (H) والعمودي (V)

مثال — Audio HUD (RTL):
  H: Right   [لأنه في اليسار في RTL لكن Figma يعامله Right of Parent]
  V: Top
  +X: 16pt   +Y: 16pt
```

---

## 5. قواعد الاستجابة (Responsive Rules)

### استراتيجية الاستجابة

مرايا تتبع نهج **"Cinematic First"** — ليس Mobile-First التقليدي:
- **Mobile:** تجربة غامرة كاملة، كل الشاشة للمحتوى
- **Desktop:** تخطيط ثلاثي (Transcript | Scene | Controls)

### قواعد المحتوى حسب الكسر

```
┌──────────────┬──────────────────────────────────────────┐
│ Breakpoint   │ القاعدة                                   │
├──────────────┼──────────────────────────────────────────┤
│ <480px (xs)  │ EmotionGrid: 2 أعمدة فقط                │
│ <480px (xs)  │ NarrationText: font-size يصغر بـ 2pt     │
│ 480–767 (sm) │ EmotionGrid: 2 أعمدة                    │
│ 768–1023 (md)│ EmotionGrid: 3 أعمدة + padding أوسع     │
│ 1024+ (lg)   │ SceneView: تخطيط جانبي ثلاثي            │
│ 1024+ (lg)   │ ChoiceButtons: في panel جانبي            │
│ 1440 (xl)    │ Content max-width: 900px + مركزي         │
└──────────────┴──────────────────────────────────────────┘
```

### في Figma — Min/Max Width

```
للمكوّنات القابلة للتمطيط:

EmotionCard:
  Min Width: 140pt
  Max Width: 220pt
  Constraints: Fill Container (في الـ Auto-Layout row)

NarrationBlock:
  Min Width: 300pt
  Max Width: 700pt
  Constraints: Fill Container على الـ frame الأم

Button (Choice):
  Min Width: 280pt
  Max Width: 480pt
  Constraints: Fill Container
```

---

## 6. إعدادات Auto-Layout

### جدول شامل بإعدادات Auto-Layout لكل مكوّن

#### EmotionCard

```
Auto-Layout:
  Direction:    Vertical ↓
  Padding:      24px top, 16px horizontal, 20px bottom
  Item Spacing: 8px
  Alignment:    Center, Center

Sizing:
  Width:  Fill (في ضمن row)  |  Min: 140  Max: 220
  Height: Hug Contents

Children Order:
  1. icon-emoji   (Text, H: Hug, W: Hug)
  2. label-text   (Text, H: Hug, W: Fill)
```

#### Button / Primary

```
Auto-Layout:
  Direction:    Horizontal →
  Padding:      12px top/bottom, 24px horizontal
  Item Spacing: 8px
  Alignment:    Center, Center

Sizing:
  Width:  Hug Contents  (أو Fill عند استخدامه في Container)
  Height: Fixed = 44pt  (Apple HIG minimum touch target)

Children Order:
  1. btn-icon    (Instance, optional, W: 20, H: 20)
  2. btn-label   (Text)
  3. btn-trailing (Instance, optional)
```

#### NarrationBlock

```
Auto-Layout:
  Direction:    Vertical ↓
  Padding:      12px top/bottom, 16px horizontal
  Item Spacing: 6px
  Alignment:    Start (RTL), Top

Sizing:
  Width:  Fill Container
  Height: Hug Contents

Children:
  1. block-label  (Hug × Hug)
  2. block-content (Fill × Hug)
  3. block-cursor  (Hug × Hug, optional)
```

#### LoadingOrb

```
لا Auto-Layout — تموضع مطلق (Absolute Position):
  Width: 80pt, Height: 80pt
  Centered في الـ Frame
  يحتوي على:
    inner-sphere (80×80, Fill, Radial Gradient)
    reflection   (80×30, Filter: Blur 4px, Absolute Bottom -40)
```

#### BottomSheet (Settings)

```
Auto-Layout: Vertical ↓
  Padding:      24px horizontal, 16px top, 34px bottom (safe area)
  Item Spacing: 0 (separators بين العناصر)
  Alignment:    Start, Start

Sizing:
  Width:  Fill (يملأ الـ viewport)
  Height: Hug (يتمدد مع المحتوى)

Corner Radius: 20px top-left, 20px top-right, 0 bottom

Children:
  1. sheet-handle     [AL: H, Center, H:5 W:36]
  2. sheet-title      [Text]
  3. settings-list    [AL: V, Gap:0]
     ├── SettingsRow × n
     └── [Divider/Default بين كل row]
```

#### SettingsRow

```
Auto-Layout: Horizontal →
  Padding:      16px horizontal, 14px top/bottom
  Item Spacing: Auto (Space Between)
  Alignment:    Center (V), Left (H)

Width: Fill Container
Height: Hug (min: 44pt — HIG)

Children:
  1. row-label     [Text, Fill]
  2. row-control   [Instance: Toggle | Select | Slider | Icon]
```

#### GlassCard (Base)

```
Auto-Layout: Vertical ↓
  Padding:      24px
  Item Spacing: 0
  Alignment:    Start, Top

Fill:     rgba(255,255,255,0.06)
Stroke:   rgba(255,255,255,0.10), 1px, Inside
Radius:   16px
Effect:   Background Blur 20px
```

#### PageIndicator

```
Auto-Layout: Horizontal →  (RTL-flipped للعربية)
  Padding:      0
  Item Spacing: 8px
  Alignment:    Center, Center

Children:
  For each dot:
    Width: 8px (inactive) | 24px (active — pill shape)
    Height: 8px
    Radius: 4px (full for inactive), 4px for active
    Fill: White 30% (inactive) | White 100% (active)
    Transition in Prototype: Smart Animate 300ms
```

---

## 7. بنية المكوّنات والمتغيرات

### هرمية المكوّنات

```
📦 Components Page
│
├── 🎯 Foundation
│   ├── Color Tokens (local styles)
│   ├── TypeStyles
│   └── Effects (Blur, Shadow)
│
├── 🧩 Primitives
│   ├── Icon (Wrapper)
│   ├── Divider
│   └── Spacer
│
├── 🔘 Inputs
│   ├── Button
│   ├── Toggle
│   ├── Select
│   ├── Slider
│   ├── Checkbox
│   └── Radio
│
├── 🃏 Cards
│   ├── GlassCard
│   ├── EmotionCard
│   └── NarrationBlock
│
├── 🗺  Navigation
│   ├── TopBar
│   ├── LiveRedirectBar
│   └── PageIndicator
│
├── 🪟 Overlays
│   ├── BottomSheet
│   ├── Toast
│   └── Modal
│
└── 🎬 Screen-Specific
    ├── LoadingOrb
    ├── SceneProgress
    ├── ChoiceButton
    ├── AudioHUD
    └── ChatBubble
```

---

### تفصيل كامل للمكوّنات الرئيسية

#### Component: EmotionCard

```
Base Component: EmotionCard
Location: Components/Cards/EmotionCard

━━━━ Properties Panel ━━━━
Property: Emotion
  Type: Variant
  Options:
    • Joy      → emoji: 😊, color: Joy/500
    • Sadness  → emoji: 😢, color: Sadness/500
    • Anger    → emoji: 😡, color: Anger/500
    • Fear     → emoji: 😰, color: Fear/500
    • Love     → emoji: 💕, color: Love/500
    • Hope     → emoji: 🌱, color: Hope/500

Property: State
  Type: Variant
  Options: Default | Hover | Selected | Disabled

Property: Show Label
  Type: Boolean
  Default: True

━━━━ Variant Grid ━━━━
Columns: Emotion (6)  ×  Rows: State (4)  =  24 variants

━━━━ Variant Styling ━━━━
Default:
  Fill: Glass/Default (rgba 255 255 255 6%)
  Stroke: Glass/Border (rgba 255 255 255 10%)
  Effect: none

Hover:
  Fill: Emotion Color @ 15% opacity
  Stroke: Emotion Color @ 45% opacity
  Effect: Drop Shadow (Emotion Color @ 45%, blur 30)
  Transform: Y -4, Scale 1.03 → in Prototype Smart Animate

Selected:
  = Hover styling + ring outline

Disabled:
  Fill: Glass/Default
  Opacity: 45%
  Interaction: none
```

#### Component: Button

```
Base Component: Button
Location: Components/Inputs/Button

━━━━ Properties ━━━━
Variant: Type
  • Primary   → Glass bg + strong border
  • Secondary → Transparent + border
  • Ghost     → Transparent, no border
  • Danger    → Rose tint

Variant: Size
  • SM → H:32, Padding: 4 12, Text: Caption
  • MD → H:40, Padding: 8 20, Text: Callout
  • LG → H:48, Padding: 12 28, Text: Body
  • XL → H:56, Padding: 16 36, Text: Title3

Variant: State
  • Default | Hover | Active | Loading | Disabled

Boolean: Has Icon Start
Boolean: Has Icon End
Text Property: Label

━━━━ Auto-Layout ━━━━
Direction: Horizontal
Spacing: 8
Alignment: Center Center
Padding: [size-dependent]

━━━━ States CSS ━━━━
Default  → background + border as defined
Hover    → background lighten + translateY(-2px)
Active   → scale(0.97) + haptic
Loading  → icon replaced with Spinner, label hidden (visually)
Disabled → opacity 0.45, pointer-events none

━━━━ Loading Sub-Component ━━━━
Spinner: 16×16, animated in Prototype (rotation)
Label: visible but aria-hidden in loading state
```

#### Component: Toggle

```
Base Component: Toggle
Location: Components/Inputs/Toggle

━━━━ Properties ━━━━
Variant: State
  • Off/Default | Off/Hover | Off/Disabled
  • On/Default  | On/Hover  | On/Disabled

Boolean: Show Label (Left)
Text Property: Label

━━━━ Anatomy ━━━━
[Auto-Layout: H, Gap: 12, Center]
  1. label-text (optional, Fill Width)
  2. toggle-track (44×24, Radius: full)
     └── toggle-thumb (20×20, Radius: full)

━━━━ Track Fill ━━━━
Off: rgba(255,255,255,0.15), Stroke: rgba(255,255,255,0.20)
On:  rgba(40,120,90,0.40),  Stroke: var(Emerald/500)@70%

━━━━ Thumb Position ━━━━
Off: X offset = 2 (start)
On:  X offset = 22 (end)
→ Smart Animate در Prototype: 300ms Spring
```

#### Component: NarrationBlock

```
Base Component: NarrationBlock
Location: Components/Cards/NarrationBlock

━━━━ Properties ━━━━
Variant: Type
  • Narration  → White border
  • Visual     → Gold border + label color
  • Reflection → Cyan border + italic

Boolean: Show Label
Boolean: Show Cursor (Typewriter active)
Text Property: Content (Arabic body text)
Instance Swap: Label Icon (📖 / 👁 / 🔮)

━━━━ Width Behavior ━━━━
Width: Fill Container
Content text: Fills width, wraps, Hug Height
→ يتمدد عمودياً مع النص تلقائياً
```

#### Component: Toast

```
Base Component: Toast
Location: Components/Overlays/Toast

━━━━ Properties ━━━━
Variant: Type
  • Info    → Cyan border, ℹ️ icon
  • Success → Emerald border, ✅ icon
  • Warning → Coral border, ⚠️ icon
  • Error   → Rose border, ❌ icon

Text Property: Message
Boolean: Show Close Button

━━━━ Positioning ━━━━
In Prototype: Absolute position, centered, top 16pt
Entry: Y -80 → Y 0, duration 400ms Spring
Exit: Y 0 → Y -80, duration 300ms Ease In
Auto-dismiss: 5000ms delay → trigger Exit
```

---

## 8. Design Tokens (Figma Variables)

### إعداد Variable Collections في Figma

```
Figma Menu → Assets → Variables → Create Collection

Collection 1: "Primitive Tokens"
Collection 2: "Semantic Tokens"
Collection 3: "Component Tokens"
```

### Collection 1: Primitive Tokens

```yaml
# Colors
Color/Black/Void:       #030305
Color/Black/Obsidian:   #111118
Color/Black/Charcoal:   #1a1a24
Color/Black/Slate:      #2a2a3a
Color/White/Pure:       #FFFFFF
Color/White/Pearl:      #e0e0f0
Color/Accent/Gold:      #FFD700
Color/Accent/Cyan:      #78C8FF
Color/Accent/Emerald:   #5EFFB3
Color/Accent/Rose:      #FF6B8A
Color/Accent/Violet:    #A78BFA
Color/Accent/Coral:     #FF7E67
Color/Emotion/Joy:      #FFD700
Color/Emotion/Sadness:  #4A9EFF
Color/Emotion/Anger:    #FF4444
Color/Emotion/Fear:     #8B5CF6
Color/Emotion/Love:     #FF6B8A
Color/Emotion/Hope:     #5EFFB3

# Spacing
Space/1:   4
Space/2:   8
Space/3:   12
Space/4:   16
Space/5:   20
Space/6:   24
Space/8:   32
Space/10:  40
Space/12:  48
Space/16:  64
Space/20:  80

# Radius
Radius/XS:   4
Radius/SM:   8
Radius/MD:   12
Radius/LG:   16
Radius/XL:   20
Radius/Full: 999

# Opacity
Opacity/Disabled: 0.45
Opacity/Muted:    0.50
Opacity/Subtle:   0.70
Opacity/Strong:   0.90
```

### Collection 2: Semantic Tokens → Maps to Primitives

```yaml
# يُشير إلى Primitive tokens، يدعم theme switching

Background/Primary:       → Color/Black/Void
Background/Secondary:     → Color/Black/Obsidian
Background/Tertiary:      → Color/Black/Charcoal
Background/Elevated:      → Color/Black/Slate

Surface/Glass:            → Color/White/Pure @ 6% opacity
Surface/GlassHover:       → Color/White/Pure @ 10% opacity
Surface/GlassActive:      → Color/White/Pure @ 15% opacity

Text/Primary:             → Color/White/Pure
Text/Secondary:           → Color/White/Pure @ 70% opacity
Text/Tertiary:            → Color/White/Pure @ 50% opacity
Text/Disabled:            → Color/White/Pure @ 30% opacity

Border/Default:           → Color/White/Pure @ 10% opacity
Border/Strong:            → Color/White/Pure @ 25% opacity
Border/Focus:             → Color/White/Pure @ 50% opacity

Accent/Primary:           → Color/Accent/Gold
Accent/Info:              → Color/Accent/Cyan
Accent/Success:           → Color/Accent/Emerald
Accent/Error:             → Color/Accent/Rose
Accent/Creative:          → Color/Accent/Violet
Accent/Warning:           → Color/Accent/Coral
```

### Collection 3: Component Tokens

```yaml
# Button
Button/BG/Primary:        → Surface/Glass
Button/BG/PrimaryHover:   → Surface/GlassHover
Button/Border:            → Border/Default
Button/BorderHover:       → Border/Strong
Button/Text:              → Text/Primary
Button/TextDisabled:      → Text/Disabled

# EmotionCard
EmotionCard/BG:           → Surface/Glass
EmotionCard/Border:       → Border/Default
EmotionCard/Radius:       → Radius/LG
EmotionCard/PaddingV:     → Space/6
EmotionCard/PaddingH:     → Space/4

# NarrationBlock
NarrationBlock/BG:        → rgba(0,0,0,0.32)
NarrationBlock/Radius:    → Radius/MD
NarrationBlock/PaddingV:  → Space/3
NarrationBlock/PaddingH:  → Space/4

# Toggle
Toggle/Track/Off:         → Surface/Glass
Toggle/Track/On:          → rgba(40,120,90,0.40)
Toggle/Border/On:         → Accent/Success @ 70%
Toggle/Thumb:             → Text/Primary
```

### إضافة Mode للـ Variables (Light Mode Override)

```
في collection "Semantic Tokens":
Add Mode: "Light"

Light mode overrides:
Background/Primary:    #F5F5F7
Background/Secondary:  #FFFFFF
Text/Primary:          #1D1D1F
Text/Secondary:        rgba(0,0,0,0.60)
Surface/Glass:         rgba(0,0,0,0.04)
Border/Default:        rgba(0,0,0,0.08)
```

### Text Styles في Figma

```
إنشاء Text Styles من قائمة Styles:

Style: Maraya/Hero
  Font: Cairo ExtraBold (800)
  Size: 56px
  Line Height: 110%
  Letter Spacing: 2%

Style: Maraya/Display
  Font: Cairo Bold (700)
  Size: 40px
  Line Height: 120%

Style: Maraya/Title1
  Font: Cairo Bold (700)
  Size: 30px
  Line Height: 130%

Style: Maraya/Title2
  Font: Cairo SemiBold (600)
  Size: 22px
  Line Height: 135%

Style: Maraya/Title3
  Font: Cairo SemiBold (600)
  Size: 18px
  Line Height: 140%

Style: Maraya/Body
  Font: Outfit Regular (400)
  Size: 16px
  Line Height: 165%

Style: Maraya/Callout
  Font: Outfit Medium (500)
  Size: 14px
  Line Height: 150%

Style: Maraya/Caption
  Font: Outfit Medium (500)
  Size: 12px
  Line Height: 140%
  Letter Spacing: 2%

Style: Maraya/Overline
  Font: Outfit Bold (700)
  Size: 11px
  Line Height: 130%
  Letter Spacing: 8%
  Case: UPPER CASE
```

---

## 9. تدفقات البروتوتايب (Prototype Flows)

### Flow 1: رحلة المستخدم الكاملة

```
[Prototype Tab في Figma → Flows → + New Flow: "Main Journey"]

Connections:

01·Splash ──[After Delay: 1800ms, Dissolve 400ms]──► 02·Onboarding-1

02·Onboarding-1
  ── [Tap: btn-next, Push Left 400ms Spring]──► 02·Onboarding-2
  ── [Tap: btn-skip, Dissolve 300ms]──────────► 03·EmotionPicker

02·Onboarding-2
  ── [Tap: btn-next, Push Left]────────────────► 02·Onboarding-3
  ── [Swipe Right, Push Right]─────────────────► 02·Onboarding-1

02·Onboarding-3
  ── [Tap: btn-start, Custom: Fade+Scale]──────► 03·EmotionPicker

03·EmotionPicker
  ── [Tap: EmotionCard/Joy, Smart Animate 300ms]──► 05·Loading
  ── [Tap: btn-upload, Slide Up 400ms]─────────────► 04·SpaceUpload

04·SpaceUpload
  ── [Tap: btn-start, Custom]──────────────────► 05·Loading
  ── [Tap: btn-back, Slide Down]───────────────► 03·EmotionPicker

05·Loading
  ── [After Delay: 3000ms, Custom]─────────────► 06·SceneView

06·SceneView
  ── [Tap: ChoiceBtn1, Smart Animate]──────────► 05·Loading (brief)
  ── [Tap: ChoiceBtn2, Smart Animate]──────────► 05·Loading (brief)
  ── [Final Scene, After Delay: 2000ms]────────► 07·Ending
  ── [Swipe Up, Slide Up]──────────────────────► 08·Settings

07·Ending
  ── [Tap: btn-new-story, Dissolve]────────────► 03·EmotionPicker
  ── [Tap: btn-share, Overlay]─────────────────► ShareSheet (iOS native)

08·Settings
  ── [Tap: Close / Swipe Down, Slide Down]─────► Previous Screen (Back)
```

### Flow 2: Error States Flow

```
[New Flow: "Error Handling"]

03·EmotionPicker (offline)
  ── [Auto: On Load, Overlay 300ms]────────────► Toast/Error

05·Loading (timeout)
  ── [After Delay: 30000ms, Dissolve]──────────► 05·Loading-Error-State

06·SceneView (connection lost)
  ── [Auto: WebSocket disconnect, Overlay]──────► Toast/Warning
```

### إعدادات Smart Animate

```
كل الانتقالات الدقيقة (micro-interactions) تستخدم Smart Animate:

EmotionCard Hover:
  Duration: 400ms
  Easing: Spring (stiffness:300, damping:25, mass:1)

Button States:
  Duration: 200ms
  Easing: Ease Out

Toggle ON/OFF:
  Duration: 300ms
  Easing: Spring (400, 30, 1)

BottomSheet Entry:
  Duration: 500ms
  Easing: Spring (300, 28, 1)

Scene Transition:
  Duration: 600ms
  Easing: Ease In Out
```

---

## 10. تسليم المطوّر (Developer Handoff)

### إعدادات Figma Dev Mode

```
Figma → كليك يمين على Frame → Open in Dev Mode

الإعدادات:
  Units: px (Web) / pt (iOS)
  Platform: iOS + Web
  Code Language: CSS (Web) / Swift (iOS)
```

### قواعد التصدير (Export Settings)

```
الأيقونات والشعارات:
  Format: SVG
  Scale: 1x
  Suffix: (none)

الصور والخلفيات:
  Format: WebP (primary) + PNG (fallback)
  Scale: 1x, 2x, 3x
  Suffix: @1x, @2x, @3x

App Icon (iOS):
  PNG, Scales: 1x/2x/3x
  Sizes: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024

الأصول الرقمية (في جدول Figma):
  Naming: kebab-case  → emotion-card-joy@2x.png
```

### مخرجات CSS من Dev Mode (أمثلة)

```css
/* EmotionCard — Figma يُولّد هذا تلقائياً في Dev Mode */

.emotion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px 20px;
  
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Button/Primary/MD */
.button-primary-md {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 20px;
  height: 40px;
  
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 999px;
  
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 150%;
  color: #FFFFFF;
}

/* NarrationBlock/Visual */
.narration-block--visual {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 215, 0, 0.45);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

/* SettingsRow */
.settings-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  min-height: 44px;
  width: 100%;
  
  font-family: 'Cairo', sans-serif;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.70);
}
```

### Swift (iOS) Code من Dev Mode

```swift
// EmotionCard View — مثال
struct EmotionCardView: View {
    let emotion: Emotion
    @State var isSelected: Bool = false
    
    var body: some View {
        Button(action: { isSelected.toggle() }) {
            VStack(spacing: 8) {
                Text(emotion.emoji)
                    .font(.system(size: 28))
                Text(emotion.label)
                    .font(.custom("Cairo-Bold", size: 18))
                    .foregroundColor(.white)
            }
            .padding(.vertical, 24)
            .padding(.horizontal, 16)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(isSelected ?
                        emotion.color.opacity(0.15) :
                        Color.white.opacity(0.06))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(isSelected ?
                                emotion.color.opacity(0.45) :
                                Color.white.opacity(0.10),
                                lineWidth: 1)
                    )
            )
            .scaleEffect(isSelected ? 1.03 : 1.0)
            .animation(.spring(response: 0.4, dampingFraction: 0.7), value: isSelected)
        }
        .buttonStyle(PlainButtonStyle())
        .accessibilityLabel("\(emotion.label), ابدأ قصتك من مشاعر \(emotion.label)")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}
```

### معايير التسمية للـ Layers (للمطوّر)

```
قاعدة: [Component][/Variant][/State] → وصف المطوّر

EmotionCard/Joy/Selected     →  .emotion-card.emotion-card--joy[aria-pressed="true"]
Button/Primary/MD/Hover      →  .btn.btn--primary.btn--md:hover
NarrationBlock/Visual        →  .narration-block.narration-block--visual
Toggle/On/Default            →  .toggle[aria-checked="true"]
BottomSheet/Settings         →  .bottom-sheet.bottom-sheet--settings

في Figma: Layer Name = اسم يُساعد المطوّر في التعرف السريع
✅ "emotion-card-joy-selected"
❌ "Rectangle 47"
❌ "Group 12 Copy 3"
```

---

## 11. ملاحظات قابلية الوصول في Figma

### إعداد قابلية الوصول في Figma

```
لكل مكوّن تفاعلي:
  Design Panel → Accessibility

إعدادات إلزامية:
  ✅ Mark as Focusable
  ✅ Accessible Label (بالعربية)
  ✅ Role
  ✅ Reading Order (RTL)
```

### جدول إعدادات A11y لكل مكوّن

| المكوّن | Role | Label (AR) | Properties |
|---------|------|-----------|------------|
| EmotionCard | `radio` | "فرح — ابدأ قصتك" | `aria-checked`, في `radiogroup` |
| Button/Primary | `button` | نص الزر | - |
| Toggle | `switch` | "صوت الراوية" | `aria-checked` |
| NarrationBlock | `article` | "سرد القصة" | `aria-live="polite"` |
| LoadingOrb | `status` | "جاري توليد قصتك" | `aria-live="polite"` |
| Toast | `alert` | نص الرسالة | `aria-live="assertive"` |
| BottomSheet | `dialog` | "الإعدادات" | `aria-modal="true"` |
| ChoiceButton | `button` | "الخيار: " + النص | - |
| SceneProgress | `status` | "المشهد X من Y" | `aria-live="polite"` |
| Slider | `slider` | "حجم النص" | `aria-valuemin/max/now/text` |

### Reading Order (RTL) في Figma

```
حدد Frame → Design → Accessibility → Reading Order

الترتيب الصحيح لـ EmotionPicker (RTL):
1. عنوان الصفحة "مرايا"
2. العنوان الفرعي
3. بطاقة فرح (top-right في RTL)
4. بطاقة حزن (next in reading order)
5. ... (باقي البطاقات right→left, top→bottom)
6. زر الرفع
7. منتقي النمط

ملاحظة: Figma يدعم RTL reading order من الإصدار 117+
```

### تباين الألوان — Contrast Checker في Figma

```
Plugin (مُوصى به): Contrast — Figma Plugin

فحوصات إلزامية قبل التسليم:
□ نص Hero أبيض على #030305        → يجب ≥ 4.5:1
□ نص Secondary (70%) على #030305  → يجب ≥ 4.5:1
□ نص Caption (50%) على Glass BG   → يجب ≥ 3:1 (large text)
□ حدود الأزرار على الخلفية        → يجب ≥ 3:1
□ ألوان المشاعر كـ borders        → يجب ≥ 3:1

نتائج متوقعة:
✅ White #FFF on #030305:      21:1 (AAA)
✅ White 70% on #030305:       14.7:1 (AAA)
✅ Gold #FFD700 on #030305:    12.5:1 (AAA)
✅ Emerald #5EFFB3 on #030305: 14.2:1 (AAA)
⚠️  White 30% on #030305:      6.3:1 (AA Large only)
```

---

## Figma File Checklist — قبل التسليم

### ✅ Design Ops Checklist

```
الملف:
□ كل الصفحات منظمة بالترتيب الموثق
□ لا layers اسمها "Rectangle" أو "Group" بدون وصف
□ كل الـ Text Styles مُعرَّفة ومُطبَّقة
□ كل الألوان تستخدم Variables أو Color Styles (لا hardcoded)
□ كل الـ Effects (Blur, Shadow) مُعرَّفة كـ Styles

المكوّنات:
□ كل component في صفحة "Components" (مصدر الحقيقة)
□ كل variant مُسمّى بوضوح (Type=Primary, State=Hover)
□ Instance swap جاهز حيث مطلوب
□ Auto-Layout مُطبَّق على كل container

البروتوتايب:
□ Flow رئيسي مكتمل (Splash → Ending)
□ Error flows مُربوطة
□ Overlay interactions (Toast, Sheet) مُعدّة

التسليم:
□ Dev Mode مُفعَّل
□ Export settings جاهزة على كل asset
□ Annotations مضافة على كل شاشة
□ قابلية الوصول مُعرَّفة في كل مكوّن تفاعلي
□ Reading order صحيح (RTL)
□ Contrast check مجتاز
```
