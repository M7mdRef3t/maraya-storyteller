# Maraya 6-Month Execution Roadmap (2026)

Source inputs:
- [14-design-trends-2026.md](./14-design-trends-2026.md)
- [11-ux-design-spec.md](./11-ux-design-spec.md)
- [12-figma-spec.md](./12-figma-spec.md)
- [13-design-critique.md](./13-design-critique.md)

Planning window: March 2026 -> August 2026  
Owner: Product + Design Ops + Frontend + AI Experience

## Strategic Goal

Own the white-space intersection in MENA:
- High emotional storytelling
- Arabic-native experience
- Cinematic interaction quality

## Epics

1. Critical UX Reliability
- Scope:
  - Fix critical critique issues (touch targets, leave-warning, contrast, narrative accumulation).
  - Stabilize loading/error behaviors.
- Success KPI:
  - Critical heuristic issues reduced to zero.
  - Crash-free and flow-completion baseline improved release-over-release.

2. Emotional Materiality
- Scope:
  - Emotion-reactive surfaces (glass/tone/shadow behavior by mood).
  - Material behavior presets for each mood cluster.
- Success KPI:
  - Increased perceived emotional resonance in qualitative testing.
  - Higher scene continuation rate after first choice.

3. Kinetic Arabic Typography
- Scope:
  - Arabic-first kinetic text moments (hero + narrative highlights).
  - Motion fallbacks for reduced-motion users.
- Success KPI:
  - Distinctive brand recall in user interviews.
  - Improved retention in first-session storytelling.

4. Ambient Intelligence Layer
- Scope:
  - "Whisper" prompts, adaptive defaults, silent assistance patterns.
  - Context-sensitive micro-guidance without visual noise.
- Success KPI:
  - Reduced interaction friction (fewer abandon points).
  - Improved time-to-first-meaningful-story.

5. Platform Expansion
- Scope:
  - Web: View Transitions + Scroll-driven animations.
  - iOS prep: Live Activities integration contract and state model.
  - Vision Pro exploration spike for spatial storytelling.
- Success KPI:
  - Platform-specific wow moments delivered without regression.
  - Prototype validation outcomes documented.

6. Open Design System Governance
- Scope:
  - Harden token pipeline (JSON -> CSS sync).
  - Publish component usage contracts and QA checklist.
- Success KPI:
  - Reduced design-development drift.
  - Faster design handoff cycle time.

## Timeline

## Phase 1 (Mar -> Apr 2026): Critical Fixes + Stability

Deliverables:
- Resolve all `P0` critique and UX gap items.
- Settings sheet phase 2 polish.
- Loading and upload error-state parity.

Definition of Done:
- All critical critique items marked closed.
- Accessibility pass for key flows (Splash, Onboarding, Landing, Story, Settings).
- Visual QA sign-off against Figma specs.

## Phase 2 (Apr -> May 2026): Emotional Materiality

Deliverables:
- Mood-reactive glass/material system integrated into runtime themes.
- Surface variants by emotional arc and scene context.

Definition of Done:
- Mood-to-material mapping documented and implemented.
- No readability regression under all mood presets.

## Phase 3 (May -> Jun 2026): Kinetic Arabic Typography

Deliverables:
- Arabic kinetic type moments in onboarding/scene transitions.
- Typography environment presets tied to narrative intensity.

Definition of Done:
- Motion quality approved by design review.
- Reduced-motion equivalent behavior implemented.

## Phase 4 (Jun -> Jul 2026): Ambient Intelligence

Deliverables:
- Subtle proactive guidance and adaptive defaults.
- Context-aware UX hints replacing explicit instruction-heavy prompts.

Definition of Done:
- Ambient prompts measurable and non-intrusive.
- User testing confirms lower cognitive friction.

## Phase 5 (Jul -> Aug 2026): Platform Expansion + Open Source Prep

Deliverables:
- Web transition enhancements shipped.
- iOS integration blueprint (Live Activities/API contract).
- Vision Pro storytelling concept prototype.
- Public-ready design system packaging.

Definition of Done:
- Multi-platform capability report published.
- Open-source readiness checklist completed.

## Milestones

1. M1: `UX Stability Complete` (end of April 2026)
2. M2: `Emotional Material System` (mid-May 2026)
3. M3: `Kinetic Arabic Signature` (mid-June 2026)
4. M4: `Ambient Intelligence Beta` (mid-July 2026)
5. M5: `Platform Expansion Pack` (end of August 2026)

## KPI Dashboard (suggested)

1. Story completion rate
2. Time-to-first-scene
3. Drop-off in onboarding
4. Settings usage and persistence rate
5. Error recovery success rate
6. Perceived emotional quality score (qualitative panel)
7. Arabic readability + motion comfort score

## Risk Register

1. Performance overhead from advanced visual materials
- Mitigation: cap effect layers, profile low-end devices, provide graceful fallback.

2. Readability risk under cinematic overlays
- Mitigation: enforce contrast contracts and narrative-safe overlays.

3. Over-automation harming user control
- Mitigation: always provide clear overrides and reset pathways.

4. Multi-platform divergence
- Mitigation: single source of truth in tokens + component behavior specs.

## Operating Cadence

1. Weekly:
- UX triage and implementation sync
- Design QA checkpoint

2. Bi-weekly:
- Milestone review + KPI snapshot
- Scope adjustment by evidence

3. Monthly:
- Strategic review against trend map and market movement
