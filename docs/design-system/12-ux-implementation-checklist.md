# Maraya UX Implementation Checklist

Source spec: [11-ux-design-spec.md](./11-ux-design-spec.md)

## Screen Mapping

1. `Splash / Launch`
- Status: `implemented`
- Files:
  - `client/src/components/SplashScreen.jsx`
  - `client/src/hooks/useStoryLogic.js`
  - `client/src/App.jsx`
  - `client/src/App.css`
- Notes:
  - Timed transition implemented (`SPLASH -> ONBOARDING|LANDING`).
  - Returning user shortcut via `localStorage.maraya_onboarding_seen`.

2. `Onboarding (3 slides)`
- Status: `implemented (phase 1)`
- Files:
  - `client/src/components/OnboardingCarousel.jsx`
  - `client/src/hooks/useStoryLogic.js`
  - `client/src/App.jsx`
  - `client/src/App.css`
- Notes:
  - 3 slides, skip/continue/start, touch swipe gestures.
  - Dot indicators and primary/ghost action pattern.

3. `Emotion Picker`
- Status: `implemented (enhanced)`
- Files:
  - `client/src/components/EmotionPicker.jsx`
  - `client/src/App.css`
- Notes:
  - Added `radiogroup` semantics and `role=radio`.
  - Active state now reflects explicit selection.

4. `Space Upload`
- Status: `implemented`
- Files:
  - `client/src/components/SpaceUpload.jsx`
  - `client/src/App.css`

5. `Loading / Generating`
- Status: `implemented (phase 1)`
- Files:
  - `client/src/components/LoadingMirror.jsx`
  - `client/src/App.jsx`
  - `client/src/App.css`
- Notes:
  - Rotating fallback messages.
  - Timeout warning message.
  - `role="status"` + `aria-live="polite"`.

6. `Scene / Story View`
- Status: `implemented (existing + brand polish)`
- Files:
  - `client/src/components/SceneRenderer.jsx`
  - `client/src/components/NarrationText.jsx`
  - `client/src/components/ChoiceButtons.jsx`
  - `client/src/components/Transcript.jsx`
  - `client/src/App.css`

7. `Story Ending`
- Status: `implemented`
- Files:
  - `client/src/App.jsx`
  - `client/src/App.css`

8. `Settings Sheet`
- Status: `implemented (phase 1)`
- Files:
  - `client/src/components/SettingsSheet.jsx` (new)
  - `client/src/App.jsx`
  - `client/src/App.css`
- Notes:
  - Bottom-sheet overlay with detent handle.
  - Music/voice switches with ARIA `role="switch"`.
  - Narration speed slider with live value preview.

## Cross-Cutting

1. Accessibility baseline
- Status: `in progress`
- Implemented:
  - Focus-visible styles for interactive elements.
  - Status live region in loading.
  - Emotion radio semantics.
- Remaining:
  - Full keyboard nav order validation.
  - Reduced motion support.
  - Expanded ARIA hints/instructions for settings controls.

2. RTL/LTR parity
- Status: `implemented baseline`
- Files:
  - `client/src/hooks/useStoryLogic.js` (document dir/lang sync)
  - `client/src/App.css` (RTL selectors)

3. Brand/visual coherence
- Status: `implemented`
- Files:
  - `client/src/components/BrandMark.jsx`
  - `client/public/favicon.svg`
  - `client/src/App.css`
  - `client/src/components/EmotionPicker.jsx`
  - `client/src/components/LoadingMirror.jsx`
