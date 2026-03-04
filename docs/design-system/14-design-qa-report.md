# Maraya Design QA Report

Reference:
- [12-figma-spec.md](./12-figma-spec.md)
- Current implementation under `client/src`

Date: 2026-03-04

## Outcome

- Overall implementation status: `Partially aligned`
- Visual language and brand direction: `Aligned`
- Structural Design Ops readiness: `Mostly aligned`
- Prototype-level interaction parity: `Partially aligned`

## Detailed Mapping

1. File structure and naming
- Spec target: 7-page Figma file structure + strict naming taxonomy.
- Code status: `Aligned (code side)`.
- Evidence:
  - BEM-like class naming in [App.css](/c:/Users/moham/Downloads/maraya-storyteller/client/src/App.css)
  - Componentized structure in [components](/c:/Users/moham/Downloads/maraya-storyteller/client/src/components)
- Gap:
  - No automated lint rule enforcing naming conventions.

2. Frame anatomy (StatusBar → SafeArea → HomeIndicator)
- Spec target: explicit mobile frame anatomy.
- Code status: `Partially aligned`.
- Evidence:
  - Overlay layering and fixed HUD implementation in [App.jsx](/c:/Users/moham/Downloads/maraya-storyteller/client/src/App.jsx)
  - Responsive spacing in [App.css](/c:/Users/moham/Downloads/maraya-storyteller/client/src/App.css)
- Gap:
  - Web implementation does not model iOS chrome primitives as dedicated components.

3. Grid system (4/8/12)
- Spec target: Mobile/Tablet/Desktop grid definitions.
- Code status: `Partially aligned`.
- Evidence:
  - Responsive breakpoints and grid-based sections in [App.css](/c:/Users/moham/Downloads/maraya-storyteller/client/src/App.css)
- Gap:
  - No explicit 4/8/12 design grid utility classes or tokenized grid primitives in code.

4. Constraints and Auto-layout parity
- Spec target: strict constraints matrix and auto-layout rules.
- Code status: `Partially aligned`.
- Evidence:
  - Flex/grid + min/max widths + adaptive containers.
- Gap:
  - No codified “constraints table” mirrored in implementation docs/tests.

5. Components + variants + states
- Spec target: full component tree with properties and CSS states.
- Code status: `Aligned (phase 1/2)`.
- Evidence:
  - `SplashScreen`, `OnboardingCarousel`, `EmotionPicker`, `LoadingMirror`, `SettingsSheet`, `SceneRenderer`.
  - State classes and interaction styling in [App.css](/c:/Users/moham/Downloads/maraya-storyteller/client/src/App.css)
- Gap:
  - Some advanced variants remain (for example ending variants, deep error variants).

6. Figma Variables parity (Primitive → Semantic → Component)
- Spec target: three collections + light overrides.
- Code status: `Mostly aligned`.
- Evidence:
  - Token layer in [tokens.css](/c:/Users/moham/Downloads/maraya-storyteller/client/src/styles/tokens.css)
  - Semantic usage via CSS vars in [App.css](/c:/Users/moham/Downloads/maraya-storyteller/client/src/App.css)
- Gap:
  - No runtime theme switch/light override wiring in app state yet.

7. Text styles
- Spec target: 9 canonical text styles.
- Code status: `Mostly aligned`.
- Evidence:
  - Typographic tokens and clamp-based hierarchy in token/CSS layers.
- Gap:
  - No explicit text style utility classes mapped 1:1 to all Figma text style names.

8. Prototype flow and smart animation intent
- Spec target: full flow including error branches.
- Code status: `Partially aligned`.
- Evidence:
  - Implemented flow: Splash → Onboarding → Landing → Loading → Story → Ending.
  - Settings bottom sheet detents + interactions.
- Gap:
  - Some error branches and gesture patterns from spec are not fully implemented.

9. A11y compliance mapping
- Spec target: role/label table + reading order + contrast checks.
- Code status: `Partially aligned`.
- Evidence:
  - `role="status"` in loading, radio semantics for emotion cards, switch semantics in settings.
  - RTL/LTR document direction synchronization.
- Gap:
  - Full audit table coverage and automated contrast regression checks are not integrated.

## Primary Risks Before Handoff

1. Missing explicit 4/8/12 grid implementation contract in code.
2. Incomplete parity for advanced error states and edge interaction flows.
3. Accessibility coverage is improved but not yet fully audit-complete vs spec table.

## Recommendation

1. Add a lightweight `layout/grid.css` mapping to Figma 4/8/12 rules.
2. Implement remaining error surfaces and ending variants from UX/Figma specs.
3. Add an accessibility verification checklist in CI (manual + snapshot assertions).
