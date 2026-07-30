# Repository Cleanup Final Report

Date: 2026-07-30

## Outcome

The cleanup removed only the files, declarations, and direct dependencies that the audit verified as unused. Oversized runtime coordinators were separated through typed leaf components, pure helpers, and one input hook. Existing gameplay values, routes, IDs, save keys, BGM files, audio routing, animation timing, controls, camera behavior, progression, and deployment configuration were not changed.

The pre-existing untracked `GAME_QA_REVIEW.md` and `qa-evidence/` remain untouched and are excluded from this cleanup release.

## Files And Assets Deleted

| Path | Classification | Verification |
| --- | --- | --- |
| `assets/menu_animation_preview.html` | Standalone prototype | No imports, links, routes, config entries, or build output references |
| `assets/radar_preview.html` | Superseded prototype | Replaced by the tracked summon radar component; no runtime references |
| `assets/summon_preview.html` | Superseded prototype | Replaced by the tracked summon canvas component; no runtime references |
| `assets/game_logo.png` | Superseded source export | Runtime imports `assets/game_logo_256.png`; no string or dynamic references |

No production TypeScript or TSX file was deleted because all 107 production modules were reachable from the application entry point.

## Dependencies Removed

- `dotenv`
- `express`
- `@types/express`
- `autoprefixer`
- direct `esbuild` declaration
- duplicate production `vite` declaration

Vite remains in `devDependencies`, and the transitive `esbuild` versions required by Vite and `tsx` remain installed through those packages.

`@google/genai` was retained because the repository metadata and README still describe AI Studio compatibility.

## Dead Declarations Removed

- `StoryCutsceneSpec` from `src/data/storyStages.ts`
- `canUseSpecialUltimate` from `src/utils/specialUltimates.ts`
- `getMeteorImageColor` from `src/components/GachaSimulator.tsx`

Exact-name repository searches found no consumers for these declarations.

## New Files Created

### Runtime Modules

- `src/components/gacha/bannerCatalog.ts`
- `src/utils/characterBuildStats.ts`
- `src/components/wiki/EnemyArchiveTab.tsx`
- `src/components/combat/useCombatKeyboardInput.ts`
- `src/components/InGameSettingsModal.tsx`
- `src/components/PlayerStatsModal.tsx`

### Regression Tests

- `src/components/gacha/bannerCatalog.test.ts`
- `src/utils/characterBuildStats.test.ts`
- `src/components/combat/useCombatKeyboardInput.test.ts`
- `src/components/InGameSettingsModal.test.ts`
- `src/repositoryCleanup.test.ts`

### Documentation

- `REPOSITORY_CLEANUP_AUDIT.md`
- `REPOSITORY_CLEANUP_REPORT.md`
- `docs/superpowers/plans/2026-07-30-repository-cleanup.md`

## Files Moved Or Renamed

None. Stable import paths, public component names, runtime IDs, and routes were preserved.

## Large Files Separated

| Original lines | Final lines | Coordinator | Extracted responsibility |
| ---: | ---: | --- | --- |
| 6,458 | 6,426 | `src/components/CombatArena.tsx` | Keyboard command mapping, listener registration, key-up cleanup |
| 4,288 | 3,912 | `src/App.tsx` | In-game settings presentation and player telemetry presentation |
| 1,961 | 1,821 | `src/components/InventoryManager.tsx` | Pure character, weapon, portrait, artifact, and set-bonus calculations |
| 1,782 | 1,570 | `src/components/GDDViewer.tsx` | Enemy and boss archive tab with local view state |
| 1,370 | 1,249 | `src/components/GachaSimulator.tsx` | Banner catalog, artwork mapping, layout, and gradients |

The remaining large files listed in `REPOSITORY_CLEANUP_AUDIT.md` were not split because doing so without broader visual/gameplay coverage would add more risk than this cleanup should carry.

## Verification Results

| Command or check | Result |
| --- | --- |
| Baseline full test suite before edits | Passed |
| Focused cleanup/dependency tests | Passed |
| Focused gacha catalog and banner tests | Passed |
| Focused Forge/build-stat/artifact tests | Passed |
| Focused enemy/boss archive tests | Passed |
| Focused combat input and Special Ultimate tests | Passed |
| Focused settings/theme/cloud/menu tests | Passed |
| Final `src/**/*.test.ts(x)` suite | Passed, 89 test files |
| `npm run lint` (`tsc --noEmit`) | Passed |
| `npm run build` | Passed |
| `git diff --check` | Passed |
| Vite production preview | Started and loaded successfully |
| Browser console warnings/errors | None during smoke checks |
| Broken rendered images | None found |
| Vite error overlay | Not present |
| Compact viewport overflow at 844 x 390 | None |

The production build emitted the existing menu video and all 14 MP3 assets, including Main Menu, Home, Story, Story Battle, Combat Arena, Artifact Grind, Rogue exploration/battle, Boss, Summons, Forge, Wiki, and Special Ultimate music.

## Features Manually Checked

- Desktop main menu and Start Game transition
- Home Hub navigation
- Extracted in-game Settings modal
- Player telemetry modal
- UI theme availability and level-lock messaging
- Cloud account guest controls and manual-sync surface
- Forge and Ascension, including `Crit Rate +2%` formatting
- Celestial Summons and the featured banner
- God Lore Wiki enemy archive
- Enemy-to-boss archive switch and animated model previews
- Combat Arena pre-battle flow
- Live Combat Arena rendering
- Keyboard attack and Skill inputs
- Pause overlay
- Mobile fullscreen gate
- Compact 844 x 390 Home and Settings layout
- Horizontal overflow and broken-image checks

## Files Still Needing Manual Review

- `@google/genai` and `metadata.json` for future AI Studio compatibility decisions
- `assets/main_menu_bg.jpg` as retained source/fallback artwork
- `task.md`, which is intentionally required by a foundation test
- Missing PWA source icons named in `vite.config.ts`
- `/kit-test` and `CharacterKitTestPage.tsx`, which are deliberately routed
- `src/data/storyStages.ts` to `src/data/story/index.ts` circular dependency
- Generated-looking `src/cloud/database.types.ts` without a documented generation command
- Dormant compatibility props and state identified in the audit

## Possible Duplicate Systems Retained

- Main-menu Settings and in-game Settings share some controls but serve distinct navigation states.
- Campaign, world, and character-trial bosses reuse mechanic families through existing registries.
- `SquadronQuestLedger` appears on multiple screens through one shared implementation.
- Some story resolver compatibility code overlaps authored stage data because removing it would affect old saves and story lookups.

These were retained because they are active behavior or stable compatibility surfaces, not verified dead duplicates.

## Remaining Risks And Limits

- Real Supabase authentication, password reset email delivery, and cross-device synchronization were not exercised because that would use external account state.
- Audible music quality and physical-device autoplay behavior cannot be fully judged through browser automation; asset emission, routing tests, fullscreen-gate interaction, and console health passed.
- PWA installation itself depends on a browser install prompt and was not completed, but the manifest, service worker generation, and mobile fullscreen gate built successfully.
- Long multi-wave runs, every boss phase, every weather state, and every story completion path were covered by source tests rather than replayed end to end in the smoke session.
- `npm` reports four known dependency advisories (one moderate and three high). No broad `npm audit fix` was applied because it could introduce unrelated dependency upgrades.

## Stability Decision

The cleanup is suitable for release. It removes verified debris, lowers maintenance risk in the five largest active coordinators, preserves all tracked game content, and passes automated plus browser verification.
