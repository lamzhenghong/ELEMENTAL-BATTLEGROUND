# Repository Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Remove only verified repository debris and reduce oversized runtime coordinators without changing game behavior or content.

**Architecture:** Preserve every current public component and gameplay contract. Extract pure catalogs/calculations and leaf UI behind typed imports, while leaving combat scheduling, save ownership, progression, BGM routing, and IDs in their current owners.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Canvas 2D, Tailwind CSS 4, Motion, PWA, Supabase.

## Global Constraints

- Do not change damage, cooldowns, probabilities, rewards, progression, IDs, routes, controls, camera, visual timing, audio, BGM, save keys, or PWA behavior.
- Preserve the untracked `GAME_QA_REVIEW.md` and `qa-evidence/`.
- Do not remove `@google/genai`, `metadata.json`, `task.md`, `assets/main_menu_bg.jpg`, `/kit-test`, or test-only domain exports in this batch.
- Run focused tests after each extraction and the full 93-test suite, lint, build, diff check, and browser smoke checks before release.
- Commit and push the verified result to `main` so Vercel auto-deploys.

---

### Task 1: Record The Evidence-Gated Audit

**Files:**
- Create: `REPOSITORY_CLEANUP_AUDIT.md`
- Create: `docs/superpowers/plans/2026-07-30-repository-cleanup.md`

**Interfaces:**
- Produces: the deletion allow-list, manual-review list, large-file map, and verification baseline.
- Consumes: Git reachability searches, asset/package audits, line counts, and baseline test/build output.

- [x] Record all verified safe deletions with their exact reference searches.
- [x] Record uncertain assets, APIs, config, and cycles under manual review.
- [x] Record every source file over 500 lines with a responsibility-based split recommendation.
- [x] Confirm the report explicitly preserves gameplay content and existing untracked QA files.

### Task 2: Remove Verified Debris And Dependency Declarations

**Files:**
- Delete: `assets/menu_animation_preview.html`
- Delete: `assets/radar_preview.html`
- Delete: `assets/summon_preview.html`
- Delete: `assets/game_logo.png`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/repositoryCleanup.test.ts`

**Interfaces:**
- Produces: a smaller tracked repository and dependency graph.
- Consumes: the Task 1 allow-list.

- [x] Add a test that asserts the four obsolete files are absent and that `dotenv`, `express`, `@types/express`, `autoprefixer`, and direct `esbuild` are not declared.
- [x] Remove the four allow-listed files only.
- [x] Remove the five unused direct packages, the direct `esbuild` declaration, and duplicate production `vite` declaration while retaining dev `vite`.
- [x] Run `npx tsx --test src/repositoryCleanup.test.ts`, `npm run lint`, and `npm run build`.

### Task 3: Remove Verified Dead Declarations

**Files:**
- Modify: `src/data/storyStages.ts`
- Modify: `src/utils/specialUltimates.ts`
- Modify: `src/components/GachaSimulator.tsx`
- Modify: `src/repositoryCleanup.test.ts`

**Interfaces:**
- Removes only: `StoryCutsceneSpec`, `canUseSpecialUltimate`, and `getMeteorImageColor`.

- [x] Extend the cleanup test to reject the three dead declaration names.
- [x] Remove each declaration without changing surrounding exports or call sites.
- [x] Run the cleanup, story, Special Ultimate, and gacha tests.

### Task 4: Extract The Gacha Banner Catalog

**Files:**
- Create: `src/components/gacha/bannerCatalog.ts`
- Create: `src/components/gacha/bannerCatalog.test.ts`
- Modify: `src/components/GachaSimulator.tsx`

**Interfaces:**
- Produces: `BannerDetails`, `getBannerImage`, `getBannerArtworkLayout`, `getBannerGradient`, and `BASE_BANNERS`.
- Consumes: the six existing banner artwork imports.

- [x] Add behavior tests for banner order, IDs, featured IDs, artwork selection, mobile/desktop layout, and gradient selection.
- [x] Move the unchanged banner data and helpers into `bannerCatalog.ts`.
- [x] Replace local declarations with imports in `GachaSimulator.tsx`.
- [x] Run all gacha and limited-banner tests.

### Task 5: Extract Character Build Calculations

**Files:**
- Create: `src/utils/characterBuildStats.ts`
- Create: `src/utils/characterBuildStats.test.ts`
- Modify: `src/components/InventoryManager.tsx`

**Interfaces:**
- Produces: `getUpgradedWeaponStats(weapon)` and `calculateCharacterBuildStats(input)`.
- `calculateCharacterBuildStats` consumes a character, level, optional weapon, equipped artifacts, and portrait level.
- Returns final HP, DEF, ATK, Crit Rate, Crit Damage, cooldown reduction, artifact set counts, and upgraded weapon stats.

- [x] Add fixtures covering no equipment, weapon secondary stats, portrait buffs, every artifact set bonus, and artifact main stats.
- [x] Move the current formulas verbatim into the pure module.
- [x] Replace the inline calculations with one call in `InventoryManager.tsx`.
- [x] Run build-stat, artifact, Forge layout, lint, and build checks.

### Task 6: Extract The Enemy And Boss Archive Tab

**Files:**
- Create: `src/components/wiki/EnemyArchiveTab.tsx`
- Modify: `src/components/GDDViewer.tsx`
- Modify: `src/components/BossIndexUi.test.ts`
- Modify: `src/enemyArchetypeIntegration.test.ts`

**Interfaces:**
- Produces: default `EnemyArchiveTab`.
- Owns the local `'enemies' | 'bosses'` view state.
- Consumes the existing archetype definitions, boss identity groups, model previews, audio click, and icon helper.

- [x] Update source-boundary tests to inspect the extracted component while still verifying `GDDViewer` renders it.
- [x] Move the enemy/boss archive JSX and local view state unchanged.
- [x] Remove archive-only imports/state from `GDDViewer.tsx`.
- [x] Run enemy archetype, boss index, boss model, and wiki integration tests.

### Task 7: Extract Combat Keyboard Registration

**Files:**
- Create: `src/components/combat/useCombatKeyboardInput.ts`
- Create: `src/components/combat/useCombatKeyboardInput.test.ts`
- Modify: `src/components/CombatArena.tsx`

**Interfaces:**
- Produces: `getCombatKeyCommand(key)` and `useCombatKeyboardInput(options)`.
- Commands: pause, basic attack, normal Ultimate, Special Ultimate, skill, dodge, parry, and party slots 0-3.
- Consumes injected callbacks plus battle-state and keyboard-state refs.

- [x] Add pure mapping tests for `Escape`, `P`, `J`, `F`, `Q`, `Z`, `E`, Space, `C`, `1`-`4`, and unknown keys.
- [x] Move only keyboard listener registration and cleanup into the hook.
- [x] Keep all combat actions, mutable state, and timing in `CombatArena.tsx`.
- [x] Run combat gameplay, Special Ultimate, mobile-control, and rendering-boundary tests.

### Task 8: Extract In-Game Settings And Telemetry UI

**Files:**
- Create: `src/components/InGameSettingsModal.tsx`
- Create: `src/components/PlayerStatsModal.tsx`
- Modify: `src/App.tsx`
- Create: `src/components/InGameSettingsModal.test.ts`

**Interfaces:**
- `InGameSettingsModal` consumes the existing theme, audio, performance, language, cloud-account, and session values plus callbacks.
- `PlayerStatsModal` consumes a prepared stat list and the active UI theme.
- Neither component owns save state, cloud state, navigation, or audio-engine policy.

- [x] Add source-boundary tests requiring both components and their imports from `App.tsx`.
- [x] Move modal JSX unchanged and pass typed values/callbacks from `App.tsx`.
- [x] Keep all persistence calls and state transitions in `App.tsx`.
- [x] Run menu, cloud-account, UI-theme, mobile-scroll, lint, and build checks.

### Task 9: Integrated Verification And Release

**Files:**
- Review every changed file.

**Interfaces:**
- Produces: a behavior-preserving cleanup release on GitHub and Vercel.

- [x] Run every tracked `src/**/*.test.ts(x)` file with the compact Node reporter.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Run `git diff --check`.
- [x] Review `git diff --stat`, deleted paths, package changes, and final large-file line counts.
- [x] Start the production preview and smoke-check desktop and mobile main menu, Home, Forge, Summons, Wiki enemy/boss archive, settings, and Combat Arena.
- [x] Commit all intended tracked changes without adding `GAME_QA_REVIEW.md` or `qa-evidence/`.
- [x] Push `main`, wait for the matching Vercel deployment, and verify the public page loads without runtime console errors.
