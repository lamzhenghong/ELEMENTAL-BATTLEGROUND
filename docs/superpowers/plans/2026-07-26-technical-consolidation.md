# Technical Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract stable responsibilities from the four largest runtime files and materially reduce active mobile media payloads without changing game behavior.

**Architecture:** Pure state and selection logic move into tested TypeScript modules. Self-contained canvas/rendering code moves into focused React or canvas modules. Existing media filenames and imports stay stable while files are re-encoded in place.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Canvas 2D, Motion, Node test runner, temporary FFmpeg/FFprobe runtime.

## Global Constraints

- Preserve combat behavior, controls, screen flow, save compatibility, BGM routing, and visual presentation.
- Do not add runtime dependencies for media processing.
- Keep MP3 and MP4 filenames stable.
- Desktop and mobile must both pass smoke verification.
- Publish the completed release to GitHub and Vercel production.

---

### Task 1: Save-State Module

**Files:**
- Create: `src/save/gameSave.ts`
- Create: `src/save/gameSave.test.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `INITIAL_SAVE_STATE`, `createInitialSaveState()`, `normalizeLoadedSaveState(parsed)`, `formatPlayTime(seconds)`.
- Consumes: existing game data and normalization helpers.

- [ ] Write failing behavioral tests for clone isolation, removed-skin migration, party restoration, equipment normalization, and play-time formatting.
- [ ] Run `node --import tsx --test src/save/gameSave.test.ts` and confirm missing-module failure.
- [ ] Move the existing implementation into `src/save/gameSave.ts` and import it from `App.tsx`.
- [ ] Re-run the focused test and existing save/cloud tests.

### Task 2: Artifact Auto-Equip Policy

**Files:**
- Create: `src/utils/artifactAutoEquip.ts`
- Create: `src/utils/artifactAutoEquip.test.ts`
- Modify: `src/components/InventoryManager.tsx`

**Interfaces:**
- Produces: `getRecommendedArtifactSet(role)` and `recommendArtifactsForCharacter(input)`.
- Returns: `Partial<Record<ArtifactSlot, Artifact>>`.

- [ ] Write failing tests for every role, same-set preference, rarity ordering, current-owner preference, occupied-item penalty, and deterministic ties.
- [ ] Run the focused test and confirm missing-module failure.
- [ ] Implement the pure policy with the existing scoring rules.
- [ ] Replace inline scoring in `InventoryManager` and re-run focused tests.

### Task 3: Summon Canvas Components

**Files:**
- Create: `src/components/gacha/GachaCanvasAnimation.tsx`
- Create: `src/components/gacha/GachaRadarScanner.tsx`
- Create: `src/components/gacha/gachaCanvasBoundary.test.ts`
- Modify: `src/components/GachaSimulator.tsx`

**Interfaces:**
- Produces: default `GachaCanvasAnimation` and `GachaRadarScanner` components with the same props currently defined inline.
- Consumes: existing pull-result character and weapon types.

- [ ] Write a failing source-boundary test requiring both extracted modules and imports from `GachaSimulator`.
- [ ] Run the focused test and confirm failure.
- [ ] Move each component without changing its implementation.
- [ ] Re-run gacha tests, lint, and build.

### Task 4: Combat Rendering Modules

**Files:**
- Create: `src/components/combat/CombatVisuals.tsx`
- Create: `src/components/combat/canvasEffects.ts`
- Create: `src/components/combat/combatRenderingBoundary.test.ts`
- Modify: `src/components/CombatArena.tsx`

**Interfaces:**
- Produces: `FloatingDamageTextDOM`, `CombatParticle`, `FloatingDamageText`, `CrystalShard`, `BOSS_TEMPLATES`, `WORLD_WIDTH`, and `WORLD_HEIGHT`.
- Consumes: elemental types and enemy visual definitions.

- [ ] Write a failing source-boundary test requiring extracted exports and `CombatArena` imports.
- [ ] Run the focused test and confirm failure.
- [ ] Move rendering-only declarations without changing implementation.
- [ ] Re-run combat tests, lint, and build.

### Task 5: Media Optimization

**Files:**
- Modify: `assets/bgm/*.mp3`
- Modify: `assets/main_menu_bg.mp4`
- Delete: `assets/kling_20260717_VIDEO_A_10_secon_5739_0.mp4`
- Delete: `assets/PixVerse_V6_Transition_540P_A_10second_seamles.mp4`
- Delete: `scratch/loop_video.py`
- Create: `src/mediaOptimization.test.ts`

**Interfaces:**
- Preserves all active runtime media paths.

- [ ] Write a failing test that rejects the two unreferenced videos and checks active media size ceilings.
- [ ] Install FFmpeg and FFprobe into a temporary directory outside the repository.
- [ ] Probe every source, re-encode to temporary output, and replace only when duration is valid and bytes decrease.
- [ ] Remove unreferenced videos and the one-off script.
- [ ] Run media tests and production build.

### Task 6: Integrated Verification And Release

**Files:**
- Review all files changed by Tasks 1-5.

- [ ] Run every tracked `*.test.ts` file.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
- [ ] Compare source media bytes and built asset bytes against baseline.
- [ ] Run desktop and mobile browser smoke tests for main menu, summons, forge, combat, and settings.
- [ ] Commit and push the feature branch.
- [ ] Fast-forward `main`, re-run release checks, and push production.
- [ ] Wait for the matching Vercel deployment to reach `READY`, fetch the public URL, and inspect build/runtime errors.
