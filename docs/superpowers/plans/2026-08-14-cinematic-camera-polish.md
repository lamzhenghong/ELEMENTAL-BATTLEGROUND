# Cinematic Camera Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add accessible, radius-aware cinematic camera cues to every combat mode.

**Architecture:** A standalone camera director calculates a shared frame and projection. Combat emits semantic cues; settings provide one persisted intensity value.

**Tech Stack:** React 19, TypeScript, Canvas 2D, Node test runner, Vite.

## Global Constraints

- Preserve existing damage, enemy, weather, Ultimate, HUD, input, and save behavior.
- Work on desktop and mobile without adding particles or post-processing.
- Keep Screen Shake independent from Motion Intensity.
- Use test-first implementation and verify production deployment.

---

### Task 1: Camera Director

**Files:**
- Create: `src/utils/cinematicCamera.ts`
- Create: `src/utils/cinematicCamera.test.ts`

- [ ] Write failing tests for neutral, dash, parry, heavy impact, boss framing, Ultimate recovery, clamping, and projection.
- [ ] Run the focused test and confirm missing API failures.
- [ ] Implement the camera director and projection helpers.
- [ ] Run the focused tests until green.

### Task 2: Combat Integration

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/components/RogueDungeon.tsx`
- Create: `src/cinematicCameraIntegration.test.ts`

- [ ] Write failing integration contracts for every cue and all combat modes.
- [ ] Wire the shared camera frame into rendering, pointer projection, damage text, and impact VFX.
- [ ] Emit cues from dash, successful parry, heavy impacts, boss spawn, and Ultimate completion.
- [ ] Reset camera state with the combat lifecycle.
- [ ] Run focused camera and combat tests.

### Task 3: Motion Intensity Setting

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/InGameSettingsModal.tsx`
- Modify: `src/components/MainMenuSettingsModal.tsx`
- Modify: `src/components/InGameSettingsModal.test.ts`
- Modify: `src/components/MainMenu.test.tsx`

- [ ] Write failing persistence and settings-surface contracts.
- [ ] Add the `0-100%` slider to both settings surfaces.
- [ ] Persist the value and pass it through Arena, Story, and Rogue combat.
- [ ] Run settings and integration tests.

### Task 4: Release Verification

- [ ] Run camera, combat, settings, and existing feedback tests.
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Verify desktop and `844x390` mobile combat in the browser.
- [ ] Commit only intended files, push `main`, deploy the exact commit to Vercel, and verify production.
