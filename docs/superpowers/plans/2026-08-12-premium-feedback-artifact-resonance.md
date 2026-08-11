# Premium Feedback and Artifact Resonance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pooled premium hit feedback and artifact set resonance presentation while preserving all gameplay math, persistence, controls, and mobile performance.

**Architecture:** Pure TypeScript utilities decide visual/haptic output from existing gameplay events. Focused canvas and React renderers consume those decisions, while `CombatArena` and `InventoryManager` only provide event data and lifecycle cleanup.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Canvas 2D, Motion, Web Vibration/Gamepad APIs, Node test runner through `tsx`.

## Global Constraints

- Do not change damage calculations, artifact bonuses, progression, inventory ownership, or save schemas.
- Preserve desktop and mobile controls and the existing mobile landscape launch flow.
- Boss deaths retain boss-specific presentation.
- Use only `M1_HIT`, `M1_CRITICAL`, `PARRY`, `ULTIMATE_IMPACT`, and `FINAL_HIT` haptic presets.
- Use pooled or allocation-free effects in combat and clean up all timers/effects on teardown.

---

### Task 1: Pure Combat Feedback Decisions

**Files:**
- Create: `src/utils/damageFeedback.test.ts`
- Create: `src/utils/damageFeedback.ts`

**Interfaces:**
- Produces: `getImpactShape`, `getDamageNumberMotion`, `getCriticalVisualIdentity`, `getEnemyDamageVisualState`, and their exported types.

- [ ] Write tests asserting every weapon/source mapping, left/right/upward/heavy/alternating motion, skin overrides, element critical identities, and exact 50%/25% HP thresholds.
- [ ] Run `npx tsx --test src/utils/damageFeedback.test.ts` and confirm failure because the module does not exist.
- [ ] Implement deterministic pure mappings with bounded displacement and no damage mutation.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Haptic Arbitration

**Files:**
- Create: `src/utils/haptics.test.ts`
- Create: `src/utils/haptics.ts`

**Interfaces:**
- Produces: singleton `HapticManager` with `setEnabled(boolean)`, `trigger(HapticPreset)`, and `stop()`.

- [ ] Write tests for disabled behavior, rapid M1 suppression, priority override, five preset-only typing, vibration fallback, and stop behavior.
- [ ] Run `npx tsx --test src/utils/haptics.test.ts` and confirm the missing-module failure.
- [ ] Implement injected clock/navigator support, bounded patterns, priority windows, and safe gamepad actuator handling.
- [ ] Re-run the focused test and confirm it passes.

### Task 3: Artifact Resonance Model

**Files:**
- Create: `src/utils/artifactSetVisuals.test.ts`
- Create: `src/utils/artifactSetVisuals.ts`

**Interfaces:**
- Produces: `getArtifactSetProgress`, `getPrimaryIncompleteSet`, `ARTIFACT_SET_VISUALS`, and visual tier/missing-slot types.

- [ ] Write tests for 0/1/2/3/4 pieces, replacement, removal, mixed sets, missing slots, and unresolved ties.
- [ ] Run `npx tsx --test src/utils/artifactSetVisuals.test.ts` and confirm the missing-module failure.
- [ ] Implement visual-only derivation from equipped artifacts while importing canonical set/slot types.
- [ ] Re-run the focused test and confirm it passes.

### Task 4: Pooled Combat Renderers

**Files:**
- Create: `src/components/combat/DamageFeedbackManager.ts`
- Create: `src/components/combat/EnemyDamageVisualState.ts`
- Create: `src/components/combat/CriticalHitStyle.tsx`
- Modify: `src/components/combat/CombatVisuals.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Task 1 utility types.
- Produces: fixed-size impact/final-hit pools, enemy HP overlays, and critical typography.

- [ ] Add source-contract tests proving pooled capacity, cleanup, deterministic damage text motion, restrained critical classes, and reduced-motion CSS.
- [ ] Confirm tests fail before implementation.
- [ ] Implement short-lived shape renderers, off-screen culling, final silhouette flashes, enemy damage marks, and element accents.
- [ ] Re-run focused tests and keep the DOM damage entry API backward compatible.

### Task 5: Combat and Settings Integration

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/utils/audio.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/MainMenuSettingsModal.tsx`
- Modify: `src/components/InGameSettingsModal.tsx`

**Interfaces:**
- Consumes: Tasks 1, 2, and 4.
- Emits visual feedback only after existing final damage is calculated.

- [ ] Add source-contract tests for hit, crit, parry, ultimate, final-hit, cleanup, haptic preference persistence, and boss exclusion.
- [ ] Confirm integration tests fail before implementation.
- [ ] Instantiate managers in refs, emit hit metadata after HP subtraction, draw pooled feedback in the existing canvas loop, and stop haptics on pause/death/unmount.
- [ ] Add unique short final-hit audio and pass the haptic toggle to every battle/settings instance.
- [ ] Re-run integration tests and the existing combat-impact tests.

### Task 6: Artifact UI and Combat Aura

**Files:**
- Create: `src/components/artifacts/ArtifactSetEmblem.tsx`
- Create: `src/components/artifacts/ArtifactSetProgress.tsx`
- Create: `src/components/combat/ArtifactResonanceAura.ts`
- Modify: `src/components/InventoryManager.tsx`
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/utils/audio.ts`

**Interfaces:**
- Consumes: Task 3 visual progress model.
- Produces: HUD emblems, active-player aura, Forge slot resonance, missing-slot pulse, and inline threshold confirmation.

- [ ] Add component/source tests for 2-piece/4-piece labels, missing slots, no forced tie recommendation, cleanup, and mobile quality fallback.
- [ ] Confirm tests fail before implementation.
- [ ] Render compact existing-style components, detect threshold crossings with a previous-tier ref, stop timers on unmount, and draw an allocation-free aura.
- [ ] Re-run focused tests and verify `characterBuildStats.ts` remains unchanged.

### Task 7: Full Verification and Publication

**Files:**
- Modify only implementation/test files if verification exposes a defect.

- [ ] Run all `src/**/*.test.ts` with `npx tsx --test`, then `npm run lint`, `npm run build`, and `git diff --check`.
- [ ] Run desktop and mobile-landscape browser smoke tests for combat, haptic toggle, Forge set activation/removal, party switching, and save reload.
- [ ] Inspect console/network output and verify no duplicate damage text, activation, timers, or audio.
- [ ] Review all modified React files against the React best-practices checklist.
- [ ] Stage only task files, commit intentionally, push `main`, and verify the matching Vercel deployment is READY.
