# تنفيذ المواصفات 10→16

هذا الملف يربط كل وثيقة تصميم بكود التنفيذ الحالي وحالة الإغلاق.

| Spec | الهدف | ملفات التنفيذ | الحالة |
|---|---|---|---|
| 10-brand-identity-book.md | هوية العلامة والـ Brand Mark | client/src/components/BrandMark.jsx, client/src/App.css | مكتمل جزئيًا (الهوية الأساسية مطبقة) |
| 11-ux-design-spec.md | تدفق UX للشاشات الرئيسية | client/src/App.jsx, client/src/components/* | مكتمل للشاشات الأساسية |
| 12-figma-spec.md | قواعد التسليم/الأنماط | client/src/styles/tokens.css, client/src/App.css | مكتمل جزئيًا |
| 13-design-critique.md | إصلاحات نقد التصميم | client/src/App.css, client/src/components/NarrationText.jsx, client/src/components/SettingsSheet.jsx | مكتمل للبنود الحرجة |
| 14-design-trends-2026.md | اتجاهات التنفيذ ومنصة التوسع | docs/design-system/16-execution-roadmap-2026.md, .github/workflows/client-quality.yml | مكتمل تنفيذًا تقنيًا |
| 15-accessibility-audit.md | معالجة مخالفات WCAG | client/src/components/EmotionPicker.jsx, client/src/components/StoryCanvas.jsx, client/src/components/LoadingMirror.jsx, client/src/hooks/useReducedMotion.js | مكتمل (مع تدقيق axe) |
| 16-frontend-code.md | كود إنتاج + hooks + اختبارات | client/src/components/Toast.jsx, client/src/components/SceneImage.jsx, client/src/hooks/useFocusTrap.js, client/src/hooks/useStoryEngine.js | مكتمل لمعظم البنود الأساسية |

## أدوات التحقق

- اختبارات CI مستقرة: `npm run test:ci`
- فحص الوصول: `npm run a11y`
- E2E Smoke: `npm run e2e:smoke`
- Workflow CI: `.github/workflows/client-quality.yml`

## فجوات حالية غير حرجة

- إعادة هيكلة كاملة للمجلدات إلى نفس شكل وثيقة 16 (primitives/layout/emotion/story) لم تُنفذ حرفيًا.
- تغطية E2E حاليًا smoke flow واحد، وليست suite شاملة لكل سيناريوهات القصة.
