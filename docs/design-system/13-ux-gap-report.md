# Maraya UX Gap Report

Compared reference: [11-ux-design-spec.md](./11-ux-design-spec.md)
Date: 2026-03-04

## Summary

- Implemented in this pass:
  - Splash state with timed transitions.
  - 3-slide onboarding with swipe + skip/continue/start.
  - Emotion picker accessibility/state upgrades.
  - Loading screen rotating messages + timeout + live region.
  - Settings Sheet phase 1 (bottom sheet + toggles + narration speed slider).
- Existing previously implemented:
  - Space upload flow.
  - Story scene flow, ending, transcript, redirect controls.
- Remaining major gap:
  - Advanced settings behavior (detent snapping states, richer ARIA guidance, persistence model).

## Gap Table

1. Splash motion timing
- Spec: logo motion choreography with controlled sequence.
- Current: fade-in + timed transition.
- Gap: custom keyframe stages and haptic triggers not implemented.

2. Onboarding permissions flow
- Spec: explicit permission prompt strategy on slide 3 context.
- Current: onboarding slides only.
- Gap: permission prompt orchestration is not implemented in onboarding flow.

3. Emotion Picker micro-interactions
- Spec: long-press preview tooltip + richer haptic states.
- Current: tap/hover/selected states + radio semantics.
- Gap: long-press preview and haptic intensity ladder missing.

4. Space Upload error states
- Spec: explicit 3 error states.
- Current: base upload and preview flow.
- Gap: no dedicated visual error panels for type/size/network cases.

5. Loading timeout behavior
- Spec: timeout error handling path.
- Current: timeout warning text appears.
- Gap: no retry CTA/branching action in loading panel yet.

6. Scene advanced gestures
- Spec: pinch zoom, long-press reading mode.
- Current: typewriter + choices + redirect buttons.
- Gap: gesture-driven zoom/reader modes not implemented.

7. Story Ending variants
- Spec: dark-ending variant + richer stagger choreography.
- Current: standard ending card.
- Gap: variant system and stagger presets not formalized.

8. Settings Sheet
- Spec: detents, toggle, slider live preview, full ARIA.
- Current: bottom sheet exists with toggles and live slider preview.
- Gap: detent snapping states and deeper accessibility guidance are not complete.

## Recommended Next Iteration

1. Add detent snap states (peek/medium/full) with drag gestures.
2. Implement loading retry action and explicit timeout branch.
3. Add long-press narration reader mode.
4. Add upload error-state surfaces with actionable recovery paths.
5. Add reduced-motion mode and media-query fallbacks.
