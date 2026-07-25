# Technical Consolidation Design

## Goal

Reduce maintenance risk and mobile media download size without changing game rules, controls, screen flow, BGM routing, save compatibility, or visual presentation.

## Scope

This release consolidates one safe boundary in each of the four largest runtime files:

- Move initial save creation, save migration, and play-time formatting out of `App.tsx`.
- Move artifact Auto-Equip selection policy out of `InventoryManager.tsx`.
- Move the two self-contained summon canvas experiences out of `GachaSimulator.tsx`.
- Move combat floating-text rendering, lightweight canvas effect classes, boss templates, and world constants out of `CombatArena.tsx`.

The release also reduces media payloads:

- Re-encode the 13 active MP3 BGM tracks as quality VBR MP3 files under the same filenames.
- Re-encode the active main-menu MP4 with H.264, no audio track, web fast-start metadata, and a mobile-safe maximum resolution.
- Remove two unreferenced source/duplicate MP4 files and their one-off generation script.

## Architecture

### Save State

`src/save/gameSave.ts` owns `INITIAL_SAVE_STATE`, `createInitialSaveState`, `normalizeLoadedSaveState`, and `formatPlayTime`. It depends on game data and existing normalization helpers but has no React dependency.

### Artifact Auto-Equip

`src/utils/artifactAutoEquip.ts` owns role-to-set selection and deterministic artifact scoring. It returns a slot-to-artifact recommendation and never mutates inventory or character state. `InventoryManager` remains responsible for applying recommendations and showing notifications.

### Summon Canvas

`src/components/gacha/GachaCanvasAnimation.tsx` and `src/components/gacha/GachaRadarScanner.tsx` own their canvas loops and local interfaces. `GachaSimulator` keeps banner state, summon economy, results, and orchestration.

### Combat Rendering

`src/components/combat/CombatVisuals.tsx` owns the DOM floating-damage component. `src/components/combat/canvasEffects.ts` owns particle, floating canvas text, crystal shard, world dimensions, mobile rendering detection, and boss templates. Combat state and gameplay logic remain in `CombatArena`.

## Behavior Preservation

- Existing save key and save shape remain unchanged.
- Removed damage-skin migration rules remain intact.
- Auto-Equip produces the same role set preference and scoring as before.
- Summon animation callbacks and canvas behavior remain unchanged.
- Combat effects use the same constants, classes, colors, and timing.
- BGM context names, filenames, loop behavior, fades, and volume handling remain unchanged.
- The main-menu video keeps autoplay, loop, muted, and inline playback behavior.

## Media Targets

- MP3: LAME VBR quality 6, joint stereo, source sample rate preserved where possible. The source files already averaged roughly 190 kbps, so quality 6 provides a meaningful mobile download reduction while keeping the tracks in broadly compatible MP3 format.
- MP4: H.264 CRF 26, `yuv420p`, no audio, `faststart`, maximum 1280x720 while preserving aspect ratio.
- Verify every output with FFprobe, ensure nonzero duration, and require a smaller byte size before replacing the original.

## Testing

- Add behavioral tests for save migration and clone isolation.
- Add behavioral tests for artifact Auto-Equip role mapping, deterministic tie-breaking, and occupied-artifact penalties.
- Add source-boundary tests ensuring the canvas components and combat rendering helpers remain extracted.
- Run all tracked TypeScript tests, `npm run lint`, `npm run build`, and `git diff --check`.
- Compare media totals before and after conversion.
- Smoke-test main menu, summons, forge, combat, and account/settings on desktop and mobile viewports.

## Non-Goals

- No combat balance changes.
- No new UI or gameplay features.
- No Three.js migration.
- No save schema or Supabase migration.
- No replacement music or artwork.
- No broad rewrite of the large components in one release.
