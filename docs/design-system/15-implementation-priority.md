# Maraya Implementation Priority (P0/P1/P2)

Source references:
- [11-ux-design-spec.md](./11-ux-design-spec.md)
- [12-figma-spec.md](./12-figma-spec.md)
- [14-design-qa-report.md](./14-design-qa-report.md)

Date: 2026-03-04

## P0 (Ship-Critical)

1. Grid parity contract (4/8/12)
- Why: direct Design Ops handoff dependency.
- Scope:
  - Add explicit grid utilities/tokens for mobile/tablet/desktop.
  - Document exact container widths/margins in code comments or docs.

2. Critical error-state UX parity
- Why: flows are incomplete without recovery states.
- Scope:
  - Space upload: invalid type / oversized asset / network failure.
  - Loading: timeout with retry CTA and deterministic fallback behavior.

3. Accessibility completion pass
- Why: stated AA/VoiceOver commitments need complete coverage.
- Scope:
  - Full role-label mapping pass for all interactive components.
  - Keyboard traversal validation.
  - Reduced motion preference handling.

## P1 (High-Impact)

1. Settings Sheet Phase 2
- Scope:
  - Detent drag polish (velocity-aware snapping).
  - Persisted state confirmation UI.
  - Optional reset confirmation toast.

2. Scene interaction parity
- Scope:
  - Reader-mode long press for narration.
  - Gesture affordances where feasible on web (safe approximations).

3. Typography utility parity
- Scope:
  - Add explicit text-style utility classes mapped to Figma style names.
  - Ensure component-level consumption for consistency.

## P2 (Polish / Optimization)

1. Light-mode override pathway
- Scope:
  - Introduce optional light theme switch using existing variable structure.

2. Design token pipeline hardening
- Scope:
  - Generate CSS token outputs from `01-tokens.json` automatically.
  - Avoid manual drift between JSON tokens and CSS vars.

3. Design QA automation
- Scope:
  - Add visual-regression snapshots for key screens.
  - Add accessibility smoke checks in CI.

## Suggested Delivery Sequence

1. P0.1 + P0.2 (layout + error paths)
2. P0.3 (accessibility finalization)
3. P1.1 (settings polish)
4. P1.2 + P1.3 (interaction + typography)
5. P2 items as stabilization work
