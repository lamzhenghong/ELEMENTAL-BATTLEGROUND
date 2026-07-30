# Repository Cleanup Audit

Date: 2026-07-30

## Scope And Baseline

- Tracked files inspected: 286
- TypeScript/TSX modules: 191
- Production modules reachable from `index.html` through `src/main.tsx`: 107 of 107
- Test files: 84
- Tracked media: 38 images, 14 MP3 files, 1 MP4 file
- Three.js/model assets: none; the current game uses React and Canvas 2D
- Existing untracked QA material preserved: `GAME_QA_REVIEW.md`, `qa-evidence/`

Baseline verification before cleanup:

| Command | Result |
| --- | --- |
| `npx tsx --test --test-reporter=dot <all src/**/*.test.ts(x)>` | Passed, 93 tests |
| `npm run lint` | Passed |
| `npm run build` | Passed |

## Safe To Delete

### Files

| File | Purpose | Why unnecessary | Reference searches | Risk |
| --- | --- | --- | --- | --- |
| `assets/menu_animation_preview.html` | Standalone menu animation prototype | Not imported, routed, linked, or emitted by the production build | Exact full path and filename searches across tracked text; route, dynamic import, and Vite config audit | Low |
| `assets/radar_preview.html` | Standalone summon radar prototype | Superseded by `src/components/gacha/GachaRadarScanner.tsx`; no runtime consumer | Exact full path and filename searches; import graph and production build output | Low |
| `assets/summon_preview.html` | Standalone summon animation prototype | Superseded by `src/components/gacha/GachaCanvasAnimation.tsx`; no runtime consumer | Exact full path and filename searches; import graph and production build output | Low |
| `assets/game_logo.png` | Original large logo export | Superseded by `assets/game_logo_256.png`, which `src/App.tsx` imports; no string or dynamic reference remains | `git grep`/`rg` for filename, asset path, dynamic asset loaders, CSS URLs, and build output | Low |

### Direct Dependency Declarations

| Package | Why unnecessary | Evidence | Risk |
| --- | --- | --- | --- |
| `dotenv` | No server or config code imports it | Exact import/require search returned no hits | Low |
| `express` | No server entry point or API route exists | Exact import/require search returned no hits | Low |
| `@types/express` | Only supports the unused Express dependency | No Express TypeScript imports or server source | Low |
| `autoprefixer` | Tailwind is integrated through `@tailwindcss/vite`; there is no PostCSS config | No imports or config references | Low |
| direct `esbuild` declaration | Vite supplies the transitive runtime it needs | No project import; `npm explain esbuild` resolves through Vite | Low |
| duplicate production `vite` declaration | `vite` is already present in `devDependencies` | Package manifest contains both declarations | Low |

### Dead Declarations

| Declaration | File | Evidence | Risk |
| --- | --- | --- | --- |
| `StoryCutsceneSpec` | `src/data/storyStages.ts` | Exact exported-name search found no consumer | Low |
| `canUseSpecialUltimate` | `src/utils/specialUltimates.ts` | Exact exported-name search found no consumer | Low |
| `getMeteorImageColor` | `src/components/GachaSimulator.tsx` | Exact local-name search found only its declaration | Low |

No complete production TypeScript or TSX file qualifies for deletion.

## Needs Manual Review

| Item | Why it is uncertain | Recommendation |
| --- | --- | --- |
| `@google/genai` | No executable code imports it, but `README.md` and `metadata.json` still describe Gemini/AI Studio capability | Retain until AI Studio compatibility is intentionally retired |
| `metadata.json` | Not used by Vite or Vercel, but may be read by AI Studio tooling | Retain |
| `assets/main_menu_bg.jpg` | Only the disposable menu preview references it; it may still be useful as source/fallback artwork | Retain |
| `task.md` | Historical checklist, but `src/foundationIntegrity.test.ts` intentionally requires it | Retain |
| `favicon.ico`, `apple-touch-icon.png`, `masked-icon.svg` | Referenced by `vite.config.ts` but missing on disk; build currently tolerates this | Resolve in a separate PWA asset task rather than changing cleanup behavior |
| `/kit-test` and `CharacterKitTestPage.tsx` | Test-oriented name, but deliberately registered in `src/main.tsx` and `vercel.json` | Retain as a production test harness |
| Test-only exports such as `hasLocalGameSave` and `getCampaignBossForStage` | They are verified by tests and may represent stable domain APIs | Retain |
| `storyStages.ts` / `data/story/index.ts` cycle | Initialization is currently safe, but future eager evaluation could break it | Remove the cycle in a dedicated story-data refactor |
| `database.types.ts` | Generated-looking Supabase schema without a documented generation command | Retain and document generation later |
| Dormant props/state in `App`, `CombatArena`, `GDDViewer`, `InventoryManager`, and `StoryMode` | Names indicate compatibility or incomplete integrations | Retain until each feature contract is reviewed |

## Large Files To Split

| Lines | File | Mixed responsibilities | Safe separation direction |
| ---: | --- | --- | --- |
| 6,458 | `src/components/CombatArena.tsx` | Combat state machine, attacks, AI, spawning, canvas loop, input, HUD, modes | Extract keyboard registration first; later split render passes while retaining frame scheduling and collision order |
| 4,288 | `src/App.tsx` | Save/cloud ownership, navigation, settings, progression commands, screen composition | Extract settings and telemetry leaf UI; later move save commands into pure reducers |
| 1,961 | `src/components/InventoryManager.tsx` | Forge tabs, build calculations, equipment, artifacts, fusion, modals | Extract pure character build stat calculation and focused artifact dialogs/panels |
| 1,782 | `src/components/GDDViewer.tsx` | Lore, nations, characters, weapons, artifacts, enemies, systems, tutorial | Extract tab components, beginning with the self-contained enemy/boss archive |
| 1,370 | `src/components/GachaSimulator.tsx` | Banner catalog, pull logic, pity, presentation, results/history modals | Extract banner catalog/artwork helpers, then modal components |
| 1,247 | `src/index.css` | Global theme, animations, mobile, combat, story, banner CSS | Split by feature only after visual screenshot coverage exists |
| 1,111 | `src/data/characters.ts` | Complete playable-character catalog | Split by rarity/release group behind one stable aggregate export |
| 802 | `src/components/RogueDungeon.tsx` | Run storage, rooms, rewards, buffs, combat adapter, UI | Extract typed run storage and a pure run reducer |
| 794 | `src/components/combat/bossModelRenderer.ts` | Shared canvas primitives and every boss renderer | Split primitives, campaign/world/trial renderers, and a stable registry |
| 697 | `src/components/StoryMode.tsx` | Campaign, character stories, memories, cutscene flow | Extract mode-specific coordinators after the story-data cycle is removed |
| 687 | `src/data/storyStages.ts` | Legacy stage data, dialogue, resolver adapters | Separate legacy authored data from resolver compatibility |
| 684 | `src/utils/portraits.ts` | Buff calculations and six-level text catalogs | Split data catalogs from pure accumulation logic |
| 665 | `src/data/quests.ts` | Static quest catalog | Split quest groups behind one exported catalog |
| 626 | `src/cloud/useCloudAccount.ts` | Auth, profiles, autosave, conflicts, upload coordination | Extract auth/profile and save-sync hooks without changing storage keys |
| 610 | `src/components/gacha/GachaCanvasAnimation.tsx` | Complete summon canvas animation | Split canvas drawing helpers only if visual snapshots are added |
| 596 | `src/utils/campaignBossMechanics.ts` | Pure mechanics for all campaign bosses | Split per chapter behind a mechanic registry |
| 529 | `src/utils/audio.ts` | Audio facade and procedural SFX synthesis | Move procedural synthesis behind the existing facade |

## Circular Dependencies

One production cycle was confirmed:

`src/data/storyStages.ts` -> `src/data/story/index.ts` -> `src/data/storyStages.ts`

It is currently initialization-safe because the reverse lookup is invoked lazily. It remains in manual review because changing it inside this cleanup batch would touch authored story resolution behavior.

## Cleanup Decision

This cleanup will remove only the low-risk files, declarations, and direct dependency entries above. It will then extract banner configuration, character build calculations, enemy archive UI, combat keyboard registration, and the in-game settings/telemetry UI using stable interfaces. No BGM, gameplay values, save keys, IDs, controls, visual timing, progression, or routes will change.
