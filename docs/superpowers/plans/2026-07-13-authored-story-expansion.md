# Authored Story Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace procedural Chapters 4-10 with authored campaign packs, add four contained limited-character stories, meaningful reconverging choices, a Memory Archive, eleven responsive backgrounds, and hidden-scroll chapter navigation while preserving all existing bosses.

**Architecture:** Keep `src/data/storyStages.ts` as a compatibility facade and move new content into focused modules under `src/data/story/`. Resolve stages and scenes from static authored packs plus a saved choice map. Reuse existing combat archetypes, add only a small typed story-modifier layer, and keep future boss generation deterministic by stage ID.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Motion, Node `assert` tests executed with `tsx`, static JPEG assets.

## Global Constraints

- Chapters 1-3 must behave as before.
- Chapters 4-10 each contain exactly five authored stages.
- Every current campaign Stage 5 boss and Character Story Act 3 boss keeps its current runtime enemy name and combat template.
- Choices affect only non-boss enemies, typed story modifiers, and dialogue; rewards and endings never branch.
- Limited heroes do not appear in campaign modules, campaign dialogue, campaign memories, or `src/data/world.ts`.
- Character Stories grant only Mora and Gems and no permanent power.
- Enemy colors remain visual only and never participate in reaction logic.
- All UI must work on desktop and mobile and preserve vertical scrolling.
- All visible scrollbars remain hidden while native scrolling stays enabled.
- The eleven new backgrounds must total no more than 2.75 MB so imported images remain below the existing 8 MB integrity ceiling.
- Existing cutscene-disable, Hard Mode, Ultimate, Special Ultimate, weather, controls, quests, and reward behavior must continue working.

---

## File Map

### New Story Foundation

- `src/data/story/types.ts`: shared authored-story, choice, modifier, scene, artwork, and memory interfaces.
- `src/data/story/progress.ts`: default Story Progress and old-save normalization.
- `src/data/story/balance.ts`: explicit campaign level/reward helpers preserving current values.
- `src/data/story/bossRegistry.ts`: current boss snapshots and deterministic fallback generator.
- `src/data/story/modifiers.ts`: typed non-boss branch modifiers.
- `src/data/story/index.ts`: authored pack registry and pure resolvers.

### New Campaign Packs

- `src/data/story/campaign/chapter4.ts`
- `src/data/story/campaign/chapter5.ts`
- `src/data/story/campaign/chapter6.ts`
- `src/data/story/campaign/chapter7.ts`
- `src/data/story/campaign/chapter8.ts`
- `src/data/story/campaign/chapter9.ts`
- `src/data/story/campaign/chapter10.ts`

Each file owns its five stages, one decision, before/after scenes, locations, and three memory entries.

### New Character Packs

- `src/data/story/characters/aurelia.ts`
- `src/data/story/characters/kaelen.ts`
- `src/data/story/characters/maelis.ts`
- `src/data/story/characters/veyra.ts`

Each file owns three acts, one Act 2 decision, personal scenes, and three memory entries.

### New Presentation

- `src/data/story/artwork.ts`: static artwork imports and focus metadata.
- `src/data/story/memories.ts`: combined memory catalog and lookup helpers.
- `src/components/StoryChoicePrompt.tsx`: responsive two-option prompt.
- `src/components/StoryMemoryArchive.tsx`: locked/unlocked archive grid.
- `assets/story/*.jpg`: eleven optimized environmental backgrounds.

### Modified Integration Files

- `src/types.ts`: add `storyChoices` to `StoryProgress`.
- `src/data/storyStages.ts`: compatibility exports and Chapters 1-3 fallback only.
- `src/components/StoryCutscene.tsx`: render artwork and optional choice prompt.
- `src/components/StoryMode.tsx`: scenes, choice persistence, archive tab, chapter scrolling.
- `src/components/StoryStage.tsx`: preview resolved branch modifier and location.
- `src/components/CombatArena.tsx`: resolve branch enemy composition and non-boss multipliers.
- `src/App.tsx`: normalized progress, exact battle choice snapshot, memory unlocks, post-battle scenes.
- `src/storyModeLimitedLore.test.ts`: scan campaign modules while allowing limited names only in character modules.
- `src/characterStoryRules.test.ts`: cover all four bespoke stories.
- `src/foundationIntegrity.test.ts`: retain total imported-image size guard.

---

### Task 1: Lock Boss Identity And Add Story Progress Migration

**Files:**
- Create: `src/data/story/types.ts`
- Create: `src/data/story/progress.ts`
- Create: `src/data/story/bossRegistry.ts`
- Create: `src/storyBossRules.test.ts`
- Create: `src/storyProgressMigration.test.ts`
- Modify: `src/types.ts:135-143`
- Modify: `src/App.tsx:157-165, 674-678, 1495-1503`
- Modify: `src/components/StoryMode.tsx:46-55`

**Interfaces:**
- Produces: `StoryChoiceSelections`, `StoryBackgroundId`, `StoryMemoryEntry`, `StoryScene`, `StoryChoiceDefinition`, `StoryBattleModifier`, `AuthoredStoryStage`.
- Produces: `createDefaultStoryProgress(): StoryProgress`.
- Produces: `normalizeStoryProgress(progress?: Partial<StoryProgress>): StoryProgress`.
- Produces: `generateFutureBoss(stageId: string): StoryEnemySpec`.

- [ ] **Step 1: Write the boss snapshot test**

Create `src/storyBossRules.test.ts` with exact pre-expansion snapshots:

```ts
import assert from 'node:assert/strict';
import { getStageSpec } from './data/storyStages';
import { generateFutureBoss } from './data/story/bossRegistry';

const currentBosses = {
  '4-5': ['Colossus of Cryo', 'ice_golem'],
  '5-5': ['Colossus of Electro', 'thunderbird'],
  '6-5': ['Colossus of Anemo', 'fire_dragon'],
  '7-5': ['Colossus of Geo', 'ice_golem'],
  '8-5': ['Colossus of Dendro', 'thunderbird'],
  '9-5': ['Colossus of Pyro', 'fire_dragon'],
  '10-5': ['Colossus of Hydro', 'ice_golem'],
} as const;

for (const [stageId, [name, bossType]] of Object.entries(currentBosses)) {
  const boss = getStageSpec(stageId).enemies.at(-1)!;
  assert.equal(boss.type, 'Boss');
  assert.equal(boss.name, name);
  assert.equal(boss.bossType, bossType);
}

const first = generateFutureBoss('11-5');
assert.deepEqual(generateFutureBoss('11-5'), first);
assert.notEqual(generateFutureBoss('12-5').name.length, 0);
console.log('story boss rules ok');
```

- [ ] **Step 2: Write the progress migration test**

```ts
import assert from 'node:assert/strict';
import { createDefaultStoryProgress, normalizeStoryProgress } from './data/story/progress';

assert.deepEqual(createDefaultStoryProgress().storyChoices, {});
const migrated = normalizeStoryProgress({
  currentChapter: 4,
  currentStage: '4-2',
  completedStages: ['4-1'],
} as never);
assert.deepEqual(migrated.storyChoices, {});
assert.deepEqual(migrated.completedStages, ['4-1']);
assert.equal(migrated.currentStage, '4-2');

const preserved = normalizeStoryProgress({
  ...createDefaultStoryProgress(),
  storyChoices: { 'chapter-4-route': 'rescue-surveyors' },
});
assert.equal(preserved.storyChoices['chapter-4-route'], 'rescue-surveyors');
console.log('story progress migration ok');
```

- [ ] **Step 3: Run both tests and verify the missing modules fail**

Run:

```powershell
npx tsx src/storyBossRules.test.ts
npx tsx src/storyProgressMigration.test.ts
```

Expected: both commands fail because `bossRegistry.ts` and `progress.ts` do not exist.

- [ ] **Step 4: Add the shared types and progress normalizer**

Move `StoryStageReward`, `StoryEnemySpec`, `StoryStageSpec`, and `StoryDialogueLine` into `src/data/story/types.ts`, then re-export them from `storyStages.ts` so current imports keep working. Add `storyChoices: Record<string, string>` to `StoryProgress`. In `src/data/story/progress.ts`, use explicit defaults:

```ts
import { StoryProgress } from '../../types';

export const createDefaultStoryProgress = (): StoryProgress => ({
  currentChapter: 1,
  currentStage: '1-1',
  completedStages: [],
  starRatings: {},
  unlockedLoreEntries: [],
  completedCharacterStoryActs: {},
  hardModeUnlockedChapters: [],
  hardModeCompletedStages: [],
  storyChoices: {},
});

export const normalizeStoryProgress = (progress?: Partial<StoryProgress>): StoryProgress => ({
  ...createDefaultStoryProgress(),
  ...(progress || {}),
  completedStages: [...(progress?.completedStages || [])],
  starRatings: { ...(progress?.starRatings || {}) },
  unlockedLoreEntries: [...(progress?.unlockedLoreEntries || [])],
  completedCharacterStoryActs: { ...(progress?.completedCharacterStoryActs || {}) },
  hardModeUnlockedChapters: [...(progress?.hardModeUnlockedChapters || [])],
  hardModeCompletedStages: [...(progress?.hardModeCompletedStages || [])],
  storyChoices: { ...(progress?.storyChoices || {}) },
});
```

Replace duplicated Story Progress defaults in `App.tsx` and `StoryMode.tsx` with this helper. Explicitly normalize the nested progress object after loading a save instead of relying only on shallow object spread.

- [ ] **Step 5: Implement deterministic future boss generation**

Use FNV-1a hashing over the stable stage ID, three current boss templates, and curated name arrays:

```ts
const TITLES = ['Ashen', 'Hollow', 'Stormforged', 'Gilded', 'Silent', 'Riftborn', 'Starved'] as const;
const SUBJECTS = ['Warden', 'Behemoth', 'Sovereign', 'Devourer', 'Sentinel', 'Colossus'] as const;
const TEMPLATES = ['fire_dragon', 'ice_golem', 'thunderbird'] as const;

const hashStageId = (value: string) => {
  let hash = 0x811c9dc5;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

export const generateFutureBoss = (stageId: string): StoryEnemySpec => {
  const hash = hashStageId(stageId);
  return {
    name: `${TITLES[hash % TITLES.length]} ${SUBJECTS[(hash >>> 4) % SUBJECTS.length]}`,
    type: 'Boss',
    element: 'Anemo',
    level: 120,
    bossType: TEMPLATES[(hash >>> 8) % TEMPLATES.length],
  };
};
```

- [ ] **Step 6: Run tests and type checking**

Run:

```powershell
npx tsx src/storyBossRules.test.ts
npx tsx src/storyProgressMigration.test.ts
npm run lint
```

Expected: both tests print `ok`; TypeScript exits with code 0.

- [ ] **Step 7: Commit**

```powershell
git add src/types.ts src/App.tsx src/components/StoryMode.tsx src/data/story src/storyBossRules.test.ts src/storyProgressMigration.test.ts
git commit -m "Add story progress and boss safeguards"
```

---

### Task 2: Add Authored Pack Schema, Modifiers, And Resolver

**Files:**
- Create: `src/data/story/balance.ts`
- Create: `src/data/story/modifiers.ts`
- Create: `src/data/story/index.ts`
- Create: `src/storyResolver.test.ts`
- Modify: `src/data/story/types.ts`
- Modify: `src/data/storyStages.ts`

**Interfaces:**
- Consumes: `StoryChoiceSelections` and `AuthoredStoryStage` from Task 1.
- Produces: `getStageSpec(stageId: string, choices?: StoryChoiceSelections): StoryStageSpec`.
- Produces: `getStoryScene(stageId: string, phase: 'before' | 'after', choices?: StoryChoiceSelections): StoryScene`.
- Produces: `getStoryChoice(stageId: string): StoryChoiceDefinition | undefined`.
- Produces: `getStoryModifier(stageId: string, choices?: StoryChoiceSelections): StoryBattleModifier | undefined`.
- Produces: `getMemoryUnlockIds(stageId: string): string[]`.

- [ ] **Step 1: Write the failing resolver test**

```ts
import assert from 'node:assert/strict';
import { getStageSpec, getStoryModifier } from './data/story';

assert.throws(() => getStageSpec('4-1'), /authored story stage/i);
assert.equal(getStoryModifier('1-1'), undefined);
console.log('story resolver foundation ok');
```

The temporary throw documents that Chapters 4-10 must not silently fall through to procedural generation while packs are being added.

- [ ] **Step 2: Run the test and verify it fails on the missing resolver**

Run: `npx tsx src/storyResolver.test.ts`

Expected: FAIL because `./data/story` does not export the resolver.

- [ ] **Step 3: Define exact pack interfaces**

```ts
export type StoryPhase = 'before' | 'after';
export type StoryChoiceSelections = Record<string, string>;
export type StoryBackgroundId =
  | 'chapter-4' | 'chapter-5' | 'chapter-6' | 'chapter-7' | 'chapter-8' | 'chapter-9' | 'chapter-10'
  | 'aurelia-memory' | 'kaelen-memory' | 'maelis-memory' | 'veyra-memory';

export interface StoryChoiceOption {
  id: string;
  label: string;
  consequence: string;
}

export interface StoryChoiceDefinition {
  id: string;
  prompt: string;
  options: readonly [StoryChoiceOption, StoryChoiceOption];
}

export interface StoryScene {
  slides: StoryDialogueLine[];
  backgroundId?: StoryBackgroundId;
}

export interface StoryMemoryEntry {
  id: string;
  title: string;
  sourceLabel: string;
  location: string;
  category: 'campaign' | 'character';
  text: string;
}

export interface StoryArtwork {
  src: string;
  desktopPosition: string;
  mobilePosition: string;
}

export interface StoryBattleModifier {
  id: string;
  label: string;
  description: string;
  enemyHpMultiplier: number;
  enemySpeedMultiplier: number;
}

export interface StoryEncounterVariant {
  optionId: string;
  enemies: StoryEnemySpec[];
  modifierId: string;
  afterSlides: StoryDialogueLine[];
}

export interface AuthoredStoryStage extends StoryStageSpec {
  location: string;
  backgroundId: StoryBackgroundId;
  beforeSlides: StoryDialogueLine[];
  afterSlides: StoryDialogueLine[];
  decision?: StoryChoiceDefinition;
  decisionId?: string;
  variants?: StoryEncounterVariant[];
  memoryUnlockIds?: string[];
}

export interface StoryChapterPack {
  chapter: number;
  stages: Record<string, AuthoredStoryStage>;
  memories: StoryMemoryEntry[];
}

export interface StoryCharacterPack {
  characterId: 'aurelia' | 'kaelen' | 'maelis' | 'veyra';
  stages: Record<string, AuthoredStoryStage>;
  memories: StoryMemoryEntry[];
}
```

- [ ] **Step 4: Add exact modifier catalog**

```ts
export const STORY_MODIFIERS: Record<string, StoryBattleModifier> = {
  'surveyors-guidance': { id: 'surveyors-guidance', label: 'Surveyors Guidance', description: 'Enemies move 10% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.9 },
  'whisper-sealed': { id: 'whisper-sealed', label: 'Whisper Seal', description: 'Enemies have 10% less HP.', enemyHpMultiplier: 0.9, enemySpeedMultiplier: 1 },
  'trusted-reflection': { id: 'trusted-reflection', label: 'Reflected Insight', description: 'Enemies have 8% less HP.', enemyHpMultiplier: 0.92, enemySpeedMultiplier: 1 },
  'broken-mirror': { id: 'broken-mirror', label: 'Shattered Tempo', description: 'Enemies move 8% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.92 },
  'magma-vented': { id: 'magma-vented', label: 'Pressure Released', description: 'Enemies have 12% less HP.', enemyHpMultiplier: 0.88, enemySpeedMultiplier: 1 },
  'glacier-thawed': { id: 'glacier-thawed', label: 'Clear Footing', description: 'Enemies move 12% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.88 },
  'civilians-evacuated': { id: 'civilians-evacuated', label: 'Local Guides', description: 'Enemies move 10% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.9 },
  'anchors-stabilized': { id: 'anchors-stabilized', label: 'Stable Skyroad', description: 'Enemies have 10% less HP.', enemyHpMultiplier: 0.9, enemySpeedMultiplier: 1 },
  'forge-disabled': { id: 'forge-disabled', label: 'Cooling Crucible', description: 'Enemies move 10% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.9 },
  'key-reforged': { id: 'key-reforged', label: 'Reforged Access', description: 'Enemies have 10% less HP.', enemyHpMultiplier: 0.9, enemySpeedMultiplier: 1 },
  'present-anchored': { id: 'present-anchored', label: 'Stable Present', description: 'Enemies move 10% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.9 },
  'future-record': { id: 'future-record', label: 'Future Tactics', description: 'Enemies have 10% less HP.', enemyHpMultiplier: 0.9, enemySpeedMultiplier: 1 },
  'divine-protocol': { id: 'divine-protocol', label: 'Ordered Protocol', description: 'Enemies move 8% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.92 },
  'mortal-stewardship': { id: 'mortal-stewardship', label: 'Shared Resolve', description: 'Enemies have 8% less HP.', enemyHpMultiplier: 0.92, enemySpeedMultiplier: 1 },
  'protected-workers': { id: 'protected-workers', label: 'Forge Support', description: 'Enemies move 10% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.9 },
  'obeyed-command': { id: 'obeyed-command', label: 'Court Intelligence', description: 'Enemies have 10% less HP.', enemyHpMultiplier: 0.9, enemySpeedMultiplier: 1 },
  'rescued-crew': { id: 'rescued-crew', label: 'Crew Support', description: 'Enemies move 10% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.9 },
  'held-harbor': { id: 'held-harbor', label: 'Fortified Harbor', description: 'Enemies have 10% less HP.', enemyHpMultiplier: 0.9, enemySpeedMultiplier: 1 },
  'preserved-memory': { id: 'preserved-memory', label: 'Remembered Paths', description: 'Enemies move 10% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.9 },
  'pruned-memory': { id: 'pruned-memory', label: 'Clean Roots', description: 'Enemies have 10% less HP.', enemyHpMultiplier: 0.9, enemySpeedMultiplier: 1 },
  'repaired-engine': { id: 'repaired-engine', label: 'Stable Forecast', description: 'Enemies move 10% slower.', enemyHpMultiplier: 1, enemySpeedMultiplier: 0.9 },
  'pursued-signal': { id: 'pursued-signal', label: 'Signal Readings', description: 'Enemies have 10% less HP.', enemyHpMultiplier: 0.9, enemySpeedMultiplier: 1 },
};
```

- [ ] **Step 5: Implement explicit reward helpers and compatibility exports**

Preserve current campaign reward values with `getCampaignReward(chapter, stage)` and use it only from explicit authored stage declarations. Keep Chapters 1-3 in `storyStages.ts`, export the new resolvers from that facade, and remove procedural resolution for 4-10 only after every pack exists.

- [ ] **Step 6: Run resolver test and type checking**

Run:

```powershell
npx tsx src/storyResolver.test.ts
npm run lint
```

Expected: the test reaches the intentional missing-pack error and TypeScript passes.

- [ ] **Step 7: Commit**

```powershell
git add src/data/story src/data/storyStages.ts src/storyResolver.test.ts
git commit -m "Add authored story pack resolver"
```

---

### Task 3: Author Campaign Chapters 4 And 5

**Files:**
- Create: `src/data/story/campaign/chapter4.ts`
- Create: `src/data/story/campaign/chapter5.ts`
- Create: `src/storyCampaign45.test.ts`
- Modify: `src/data/story/index.ts`

**Interfaces:**
- Produces: `CHAPTER_4_PACK` and `CHAPTER_5_PACK` registered by stage ID.
- Consumes: pack schema, balance helpers, and modifier IDs from Tasks 1-2.

- [ ] **Step 1: Write the failing content test**

Assert that stages `4-1` through `5-5` resolve explicitly, each has a location, at least two before slides and two after slides, Stage 2 contains the chapter decision, Stages 1/3/5 unlock one memory, and the boss snapshot remains exact.

Run: `npx tsx src/storyCampaign45.test.ts`

Expected: FAIL because both chapter packs are absent.

- [ ] **Step 2: Encode the exact Chapter 4 manifest**

| Stage | Name | Location | Enemies | Narrative purpose |
|---|---|---|---|---|
| 4-1 | Gloamvault Descent | The Last-Lamp Stair | Gloom Wisp, Ossuary Prowler | Eldric and Marina enter the memory-bearing tomb city. |
| 4-2 | Hall of Last Voices | Surveyor Gallery | Whisperbound Scout, Hollow Sentry | Present `chapter-4-route`: rescue the surveyors or secure the Whisper Seal. |
| 4-3 | Gallery of Broken Oaths | The Sealed Procession | Rescue branch: Sable Pursuer and Oathless Guard. Seal branch: Grief Echo and Crownless Retainer. | Reveal that Gloamvault stores grief rather than creating it. |
| 4-4 | Crownless Altar | Throne Without a King | Sable Oathguard (Elite), Hollow Retainer | Both routes recover the same crown inscription. |
| 4-5 | Void Overlord Boss | Heart of Gloamvault | Preserve current `Colossus of Cryo` ice-golem boss exactly. | Defeat the fixed guardian and open the Astral Reliquary path. |

Decision options:

```ts
{
  id: 'chapter-4-route',
  prompt: 'The seal is failing while the surveyors call from below. What comes first?',
  options: [
    { id: 'rescue-surveyors', label: 'Rescue the surveyors', consequence: 'Gain local guidance in the next battle.' },
    { id: 'secure-whisper-seal', label: 'Secure the Whisper Seal', consequence: 'Weaken the shades in the next battle.' },
  ],
}
```

Memory keys and titles: `chapter-4-last-lamp` / **The Last Lamp**, `chapter-4-seven-names` / **Seal of Seven Names**, `chapter-4-first-whisper` / **The First Whisper**.

- [ ] **Step 3: Encode the exact Chapter 5 manifest**

| Stage | Name | Location | Enemies | Narrative purpose |
|---|---|---|---|---|
| 5-1 | Starlight Threshold | Astral Reliquary Gate | Stardust Echo, Reliquary Watcher | The party enters a temple outside ordinary time. |
| 5-2 | Mirror Pilgrims | Procession of Reflections | Borrowed-Face Duelist, Clockless Attendant | Present `chapter-5-route`: trust the reflection or break its mirror. |
| 5-3 | Hall of Borrowed Faces | Thousandfold Gallery | Trust branch: Astral Examiner and Gentle Echo. Break branch: Mirror Shardling and Enraged Reflection. | Challenge whether victory belongs to identity or fate. |
| 5-4 | Clockless Dais | Reliquary Zenith | Chronoweaver (Elite), Stardust Adjudicator | Both routes expose the Eternity Knight's trial. |
| 5-5 | Eternity Knight Boss | Sanctuary Outside Time | Preserve current `Colossus of Electro` thunderbird boss exactly. | Complete the fixed trial and reveal Rimeforge Fault. |

Decision ID `chapter-5-route` uses `trust-reflection` and `break-mirror`. Memory keys: `chapter-5-star-map` / **Map Without North**, `chapter-5-borrowed-face` / **A Face That Remembered**, `chapter-5-eternal-vow` / **The Knight's Last Vow**.

- [ ] **Step 4: Write complete dialogue in each pack**

Every stage gets 2-4 before lines and 2-3 after lines. Campaign speakers are limited to Eldric Thorne, Marina, new non-playable locals, and enemies. The words Aurelia, Kaelen, Maelis, and Veyra must not appear in either campaign module.

- [ ] **Step 5: Run focused tests**

```powershell
npx tsx src/storyCampaign45.test.ts
npx tsx src/storyBossRules.test.ts
npx tsx src/storyModeLimitedLore.test.ts
npm run lint
```

Expected: all tests print `ok`; TypeScript exits 0.

- [ ] **Step 6: Commit**

```powershell
git add src/data/story/campaign/chapter4.ts src/data/story/campaign/chapter5.ts src/data/story/index.ts src/storyCampaign45.test.ts
git commit -m "Author campaign chapters four and five"
```

---

### Task 4: Author Campaign Chapters 6 Through 8

**Files:**
- Create: `src/data/story/campaign/chapter6.ts`
- Create: `src/data/story/campaign/chapter7.ts`
- Create: `src/data/story/campaign/chapter8.ts`
- Create: `src/storyCampaign68.test.ts`
- Modify: `src/data/story/index.ts`

**Interfaces:**
- Produces: `CHAPTER_6_PACK`, `CHAPTER_7_PACK`, `CHAPTER_8_PACK`.

- [ ] **Step 1: Write and run the failing pack-integrity test**

Test stage IDs 6-1 through 8-5, decision IDs, three memory unlocks per chapter, scene lengths, authored locations, and exact boss snapshots.

Run: `npx tsx src/storyCampaign68.test.ts`

Expected: FAIL because the packs do not exist.

- [ ] **Step 2: Encode Chapter 6**

Stages: **Rimeforge Threshold**, **Split Current Works**, **Vaporworks Crossing**, **Engine of Two Seasons**, **Frostfire Wyrm Boss**.

Locations: Rimeforge Gate, Broken Climate Works, White-Steam Causeway, Twin-Season Engine, Faultheart Caldera.

Enemy identities: Steam Wretch, Rime Crawler, Pressure Keeper, Meltwater Stalker, Tempered Sentinel (Elite), Fault Engineer (Elite). Decision `chapter-6-route`: `vent-magma` versus `thaw-glacier`. Preserve `Colossus of Anemo` with `fire_dragon` at 6-5.

Memories: `chapter-6-first-gauge` / **The First Gauge**, `chapter-6-sabotage-order` / **Order for Perfect Winter**, `chapter-6-changing-balance` / **Balance Must Move**.

- [ ] **Step 3: Encode Chapter 7**

Stages: **Fallen Sky Dock**, **Anchor District**, **Aethelwing Causeway**, **Crownwind Spire**, **Skyward Avian Boss**.

Locations: Lower Cloud Harbor, Anchor Ward, Aethelwing Skyroad, Crownwind Observatory, Eye Above the Spires.

Enemy identities: Gale Harrier, Skyroad Prowler, Anchor Breaker, Prism Talon, Windchain Custodian (Elite), Crownwind Warden (Elite). Decision `chapter-7-route`: `evacuate-settlement` versus `stabilize-anchors`. Preserve `Colossus of Geo` with `ice_golem` at 7-5.

Memories: `chapter-7-falling-bell` / **The Falling Bell**, `chapter-7-anchor-keeper` / **Anchor Keeper's Ledger**, `chapter-7-open-sky` / **What Holds the Sky**.

- [ ] **Step 4: Encode Chapter 8**

Stages: **Cinderlift Descent**, **Worldforge Control**, **Hammerfall Foundry**, **Crucible Keyway**, **Molten Overlord Boss**.

Locations: Mount Eldruin Cinderlift, Worldforge Control Ring, Hammerfall Foundry, Crucible Keyway, Planetary Anvil.

Enemy identities: Cinder Scavenger, Furnace Husk, Chainforged Guard, Crucible Artificer, Worldforge Warden (Elite), Keyway Adjudicator (Elite). Decision `chapter-8-route`: `disable-forge` versus `reforge-key`. Preserve `Colossus of Dendro` with `thunderbird` at 8-5.

Memories: `chapter-8-bound-orbits` / **When Orbits Were Chained**, `chapter-8-smiths-refusal` / **The Smith's Refusal**, `chapter-8-reclaimed-fire` / **Fire Without a Master**.

- [ ] **Step 5: Add complete dialogue and run tests**

Use 2-4 before and 2-3 after lines per stage. New NPCs remain local and non-limited. Run:

```powershell
npx tsx src/storyCampaign68.test.ts
npx tsx src/storyBossRules.test.ts
npx tsx src/storyModeLimitedLore.test.ts
npm run lint
```

- [ ] **Step 6: Commit**

```powershell
git add src/data/story/campaign src/data/story/index.ts src/storyCampaign68.test.ts
git commit -m "Author campaign chapters six through eight"
```

---

### Task 5: Author Campaign Chapters 9 And 10 And Remove Procedural Campaign Fallback

**Files:**
- Create: `src/data/story/campaign/chapter9.ts`
- Create: `src/data/story/campaign/chapter10.ts`
- Create: `src/storyCampaign910.test.ts`
- Modify: `src/data/story/index.ts`
- Modify: `src/data/storyStages.ts:244-325, 676-773`

**Interfaces:**
- Produces all 35 authored campaign stages and removes procedural content for 4-10.

- [ ] **Step 1: Write the failing final campaign test**

Verify stages 9-1 through 10-5, then loop all IDs 4-1 through 10-5 and assert `location`, authored scenes, explicit enemies, and no fallback description matching `Enter the challenges of`.

Run: `npx tsx src/storyCampaign910.test.ts`

Expected: FAIL while Chapters 9-10 remain procedural.

- [ ] **Step 2: Encode Chapter 9**

Stages: **Paradox Shore**, **Forked Horizon**, **City That Never Was**, **Last Stable Second**, **Chronos Monarch Boss**.

Locations: Paradox Verge, Forked Horizon, Unwritten Capital, Last Stable Second, Monarch's Clockface.

Enemy identities: Rift Mimic, Paradox Shade, Unwritten Citizen, Looping Pursuer, Glitch Sentinel (Elite), Timeline Bailiff (Elite). Decision `chapter-9-route`: `anchor-present` versus `recover-future-record`. Preserve `Colossus of Pyro` with `fire_dragon` at 9-5.

Memories: `chapter-9-other-sun` / **Under Another Sun**, `chapter-9-unwritten-city` / **The City That Refused**, `chapter-9-forward-time` / **Time Chooses Forward**.

- [ ] **Step 3: Encode Chapter 10**

Stages: **Prime Orbit Vestibule**, **Sevenfold Trial**, **Hall of Choosing**, **Catalyst Mirror**, **Eldric Core Prime Boss**.

Locations: Prime Orbit Vestibule, Sevenfold Matrix, Stewardship Hall, Catalyst Mirror, Prime Defense Core.

Enemy identities: Orbit Custodian, Protocol Shade, Divine Simulacrum, Consensus Warden, Sevenfold Examiner (Elite), Catalyst Replica (Elite). Decision `chapter-10-route`: `restore-divine-protocol` versus `shared-mortal-stewardship`. Preserve `Colossus of Hydro` with `ice_golem` at 10-5.

Memories: `chapter-10-first-command` / **The First Command**, `chapter-10-empty-throne` / **No Hand Owns the Orbit**, `chapter-10-reforged-aetheria` / **Aetheria Reforged**.

- [ ] **Step 4: Remove procedural campaign generation for 4-10**

Make `getStageSpec()` consult authored packs first, retain static Chapters 1-3, and use deterministic future generation only for chapter numbers above 10. Delete `stageNames`, procedural enemy generation, and `chapterLoreContext` entries for Chapters 4-10 after all authored tests pass.

- [ ] **Step 5: Run campaign and regression tests**

```powershell
npx tsx src/storyCampaign45.test.ts
npx tsx src/storyCampaign68.test.ts
npx tsx src/storyCampaign910.test.ts
npx tsx src/storyBossRules.test.ts
npx tsx src/storyModeLimitedLore.test.ts
npm run lint
```

Expected: every test prints `ok`; TypeScript exits 0.

- [ ] **Step 6: Commit**

```powershell
git add src/data/story src/data/storyStages.ts src/storyCampaign910.test.ts
git commit -m "Complete authored campaign through chapter ten"
```

---

### Task 6: Author Four Limited Character Stories

**Files:**
- Create: `src/data/story/characters/aurelia.ts`
- Create: `src/data/story/characters/kaelen.ts`
- Create: `src/data/story/characters/maelis.ts`
- Create: `src/data/story/characters/veyra.ts`
- Modify: `src/data/story/index.ts`
- Modify: `src/data/storyStages.ts`
- Modify: `src/characterStoryRules.test.ts`
- Modify: `src/storyModeLimitedLore.test.ts`

**Interfaces:**
- Produces bespoke stages and scenes for `char-aurelia-*`, `char-kaelen-*`, `char-maelis-*`, and `char-veyra-*`.

- [ ] **Step 1: Extend failing Character Story tests**

For each hero, assert Act 1 normal, Act 2 elite, Act 3 boss, exact current Act 3 boss type, non-fallback dialogue, one Act 2 decision, three memories, and rewards containing only positive Mora/Gems with `charXp: 0` and no special item.

Expected Act 3 templates:

```ts
const expectedBossTypes = {
  aurelia: 'fire_dragon',
  kaelen: 'ice_golem',
  maelis: 'fire_dragon',
  veyra: 'thunderbird',
} as const;
```

Run: `npx tsx src/characterStoryRules.test.ts`

Expected: FAIL because all four still use fallback scripts.

- [ ] **Step 2: Encode Aurelia and Kaelen**

Aurelia acts: **The Unlit Watch**, **Weight of the Oath**, **Dawn Without Applause**. Act 1 enemy: Ashbound Relay Drone. Act 2 decision `aurelia-act-2-route`: `protect-workers` versus `obey-command`; branch elites Blackglass Saboteur and Sun Court Enforcer. Preserve generated Act 3 boss name and fire-dragon template. Memories: **A Watch Without Witnesses**, **The Oath's Smallest Line**, **Warmth Before Glory**.

Kaelen acts: **A Blank Horizon**, **The Admiral's Burden**, **Sounding the Deep**. Act 1 enemy: Dockside Reef Scavenger. Act 2 decision `kaelen-act-2-route`: `rescue-crew` versus `hold-harbor`; branch elites Wakebreaker Marauder and Breakwater Corsair. Preserve generated Act 3 boss name and ice-golem template. Memories: **Chart Zero**, **Names Behind the Numbers**, **A Current Shared**.

- [ ] **Step 3: Encode Maelis and Veyra**

Maelis acts: **Sap and Scripture**, **The Page He Cannot Keep**, **Heartwood Farewell**. Act 1 enemy: Blighted Sapling. Act 2 decision `maelis-act-2-route`: `preserve-memory` versus `prune-memory`; branch elites Blackroot Archivist and Hollow Ring Custodian. Preserve generated Act 3 boss name and fire-dragon template. Memories: **The Tree That Spoke First**, **A Page in Black Sap**, **Room for New Leaves**.

Veyra acts: **The Seventh Mirror**, **One Shot Too Early**, **Eye of the Shattered Storm**. Act 1 enemy: Stormglass Calibration Drone. Act 2 decision `veyra-act-2-route`: `repair-engine` versus `pursue-signal`; branch elites Prism Sentinel and Signal Hunter. Preserve generated Act 3 boss name and thunderbird template. Memories: **Six Perfect Reflections**, **The Arrow Between Seconds**, **After Thunder**.

- [ ] **Step 4: Keep limited lore contained**

Update `storyModeLimitedLore.test.ts` to scan `src/data/story/campaign/*.ts`, the Chapters 1-3 facade content, and `world.ts`, while intentionally excluding `src/data/story/characters/*.ts`. No limited name may appear in campaign files.

- [ ] **Step 5: Run focused tests**

```powershell
npx tsx src/characterStoryRules.test.ts
npx tsx src/storyModeLimitedLore.test.ts
npx tsx src/storyBossRules.test.ts
npm run lint
```

- [ ] **Step 6: Commit**

```powershell
git add src/data/story/characters src/data/story/index.ts src/data/storyStages.ts src/characterStoryRules.test.ts src/storyModeLimitedLore.test.ts
git commit -m "Author limited character side stories"
```

---

### Task 7: Add Choice UI And Battle Branch Integration

**Files:**
- Create: `src/components/StoryChoicePrompt.tsx`
- Create: `src/storyChoiceRules.test.ts`
- Modify: `src/components/StoryCutscene.tsx`
- Modify: `src/components/StoryMode.tsx`
- Modify: `src/components/StoryStage.tsx`
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- `StoryCutscene` gains `scene: StoryScene`, `choice?: StoryChoiceDefinition`, and `onChoice?: (decisionId: string, optionId: string) => void`.
- Story battle config gains `choiceSelections: StoryChoiceSelections`.
- `CombatArena` gains `storyChoiceSelections?: StoryChoiceSelections`.

- [ ] **Step 1: Write the failing choice rules test**

Test pure resolution first:

```ts
import assert from 'node:assert/strict';
import { getStageSpec, getStoryModifier } from './data/story';

const rescue = { 'chapter-4-route': 'rescue-surveyors' };
const seal = { 'chapter-4-route': 'secure-whisper-seal' };
assert.notDeepEqual(getStageSpec('4-3', rescue).enemies, getStageSpec('4-3', seal).enemies);
assert.equal(getStoryModifier('4-3', rescue)?.id, 'surveyors-guidance');
assert.equal(getStoryModifier('4-3', seal)?.id, 'whisper-sealed');
assert.deepEqual(getStageSpec('4-5', rescue).enemies, getStageSpec('4-5', seal).enemies);
console.log('story choice rules ok');
```

Also source-check for two touch-friendly buttons, `storyChoices` persistence, and `storyChoiceSelections` reaching Combat Arena.

- [ ] **Step 2: Run the test and verify integration assertions fail**

Run: `npx tsx src/storyChoiceRules.test.ts`

Expected: pure data checks may pass, UI/source integration checks fail.

- [ ] **Step 3: Implement `StoryChoicePrompt`**

Render the prompt and exactly two buttons in a responsive grid. Each button includes the option label and consequence. Use `min-h-12`, `touch-manipulation`, clear focus styles, and no browser-native confirmation.

- [ ] **Step 4: Persist decisions and snapshot them into battles**

When a choice is selected:

```ts
const nextChoices = {
  ...storyProgress.storyChoices,
  [decision.id]: optionId,
};
onUpdateSaveState(prev => ({
  ...prev,
  storyProgress: {
    ...normalizeStoryProgress(prev.storyProgress),
    storyChoices: nextChoices,
  },
}));
```

Pass `nextChoices` into `onStartStoryBattle` so the battle cannot observe stale React state. Replaying the decision stage overwrites only that decision ID.

- [ ] **Step 5: Apply modifiers only to non-boss story spawns**

In Combat Arena, resolve the stage with the captured choice map. Multiply normal and elite spawn HP and speed by the resolved modifier. Do not apply either multiplier inside the boss branch.

```ts
const modifier = getStoryModifier(storyStageId, storyChoiceSelections);
const hpMultiplier = enemySpec.type === 'Boss' ? 1 : modifier?.enemyHpMultiplier ?? 1;
const speedMultiplier = enemySpec.type === 'Boss' ? 1 : modifier?.enemySpeedMultiplier ?? 1;
```

- [ ] **Step 6: Show selected modifier in Stage Details**

Pass `storyChoices` to `StoryStage`, display location and modifier label/description when a branch is selected, and keep boss previews free of branch modifiers.

- [ ] **Step 7: Run tests and build**

```powershell
npx tsx src/storyChoiceRules.test.ts
npx tsx src/storyBossRules.test.ts
npm run lint
npm run build
```

- [ ] **Step 8: Commit**

```powershell
git add src/components/StoryChoicePrompt.tsx src/components/StoryCutscene.tsx src/components/StoryMode.tsx src/components/StoryStage.tsx src/components/CombatArena.tsx src/App.tsx src/storyChoiceRules.test.ts
git commit -m "Add branching story choices"
```

---

### Task 8: Add Memory Archive And Unlock Flow

**Files:**
- Create: `src/data/story/memories.ts`
- Create: `src/components/StoryMemoryArchive.tsx`
- Create: `src/storyMemoryArchive.test.ts`
- Modify: `src/components/StoryMode.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/GDDViewer.tsx`

**Interfaces:**
- Produces: `STORY_MEMORIES: StoryMemoryEntry[]` with exactly 33 entries.
- Produces: `getMemoryUnlockIds(stageId: string): string[]`.
- `StoryMemoryArchive` consumes `entries` and `unlockedLoreEntries`.

- [ ] **Step 1: Write the failing archive test**

Assert 21 campaign memories plus 12 character memories, unique IDs, unlock sources, no power/reward language, and a Story Mode archive tab. Assert Stage 1/3/5 and each character act adds its declared memory key through `handleStoryBattleEnd`.

Run: `npx tsx src/storyMemoryArchive.test.ts`

Expected: FAIL because the catalog and archive do not exist.

- [ ] **Step 2: Build the 33-entry catalog**

Use the exact titles and keys from Tasks 3-6. Each entry includes:

```ts
{
  id: 'chapter-4-last-lamp',
  title: 'The Last Lamp',
  sourceLabel: 'Chapter 4 - Gloamvault',
  location: 'The Last-Lamp Stair',
  category: 'campaign',
  text: 'The final lamp of Gloamvault was kept burning not to guide the living inward, but to show the dead that someone still remembered the way home.',
}
```

Write similarly concise 1-3 sentence text for every approved title, grounded only in its chapter or personal side story.

- [ ] **Step 3: Add unlock handling**

On first clear, merge `getMemoryUnlockIds(stageId)` into `unlockedLoreEntries` with a `Set`. Replays must not duplicate keys. Character Story reward logic remains Mora/Gems only.

- [ ] **Step 4: Build `StoryMemoryArchive`**

Add a third Story Mode tab named `Memory Archive`. Render campaign and character filters, unlocked count, locked title silhouettes, and unlocked title/source/location/text. Use a responsive one/two-column grid without nested cards.

- [ ] **Step 5: Replace hardcoded GDD chronicle blocks**

Have `GDDViewer` read unlocked campaign entries from shared data rather than maintaining separate Chapter 1-3 hardcoded markup. Keep `STORY_MEMORIES` at exactly 33 new entries and define the existing Chapter 1-3 entries separately as `LEGACY_CAMPAIGN_CHRONICLES`; export `ALL_STORY_MEMORIES = [...LEGACY_CAMPAIGN_CHRONICLES, ...STORY_MEMORIES]` for the viewer.

- [ ] **Step 6: Run tests**

```powershell
npx tsx src/storyMemoryArchive.test.ts
npx tsx src/characterStoryRules.test.ts
npm run lint
```

- [ ] **Step 7: Commit**

```powershell
git add src/data/story/memories.ts src/components/StoryMemoryArchive.tsx src/components/StoryMode.tsx src/components/GDDViewer.tsx src/App.tsx src/storyMemoryArchive.test.ts
git commit -m "Add story memory archive"
```

---

### Task 9: Generate And Integrate Eleven Story Backgrounds

**Files:**
- Create: `assets/story/chapter-4-gloamvault.jpg`
- Create: `assets/story/chapter-5-astral-reliquary.jpg`
- Create: `assets/story/chapter-6-rimeforge-fault.jpg`
- Create: `assets/story/chapter-7-aethelwing-skyroad.jpg`
- Create: `assets/story/chapter-8-eldruin-worldforge.jpg`
- Create: `assets/story/chapter-9-paradox-verge.jpg`
- Create: `assets/story/chapter-10-prime-orbit-core.jpg`
- Create: `assets/story/aurelia-solaris-relay.jpg`
- Create: `assets/story/kaelen-stormbound-harbor.jpg`
- Create: `assets/story/maelis-living-archive.jpg`
- Create: `assets/story/veyra-stormglass-observatory.jpg`
- Create: `src/data/story/artwork.ts`
- Create: `src/storyArtwork.test.ts`
- Modify: `src/components/StoryCutscene.tsx`
- Modify: `src/foundationIntegrity.test.ts`

**Interfaces:**
- Produces: `getStoryArtwork(backgroundId: StoryBackgroundId): StoryArtwork`.
- `StoryArtwork` contains `src`, `desktopPosition`, and `mobilePosition`.

- [ ] **Step 1: Write the failing artwork integrity test**

Assert all eleven files exist, each is below 350 KB, combined size is below 2.75 MB, every background ID resolves, and `StoryCutscene` renders an `<img>` with responsive object positioning and fallback gradient.

Run: `npx tsx src/storyArtwork.test.ts`

Expected: FAIL because artwork is missing.

- [ ] **Step 2: Generate the seven campaign environments**

Use the image generation tool with a shared prefix: `cinematic anime action RPG environment concept art, 16:9 landscape, no characters in foreground, no text, no logo, clear environmental focal point, dark quiet lower third for dialogue UI, detailed but performance-friendly composition`.

Append these exact scene prompts:

1. Gloamvault: `vast buried tomb city, black stone stairs, one warm memorial lamp, walls filled with faint silver memory inscriptions, abyssal violet depth`.
2. Astral Reliquary: `temple outside time, starlight bridge, mirrored arches, suspended clock fragments, indigo and silver atmosphere`.
3. Rimeforge Fault: `glacier and magma river divided through one broken climate engine, white steam, industrial fantasy machinery`.
4. Aethelwing Skyroad: `collapsing bridges between floating islands, storm anchors, distant civilian sky settlement, bright cloud ocean`.
5. Eldruin Worldforge: `planetary volcanic forge, immense anvil, cooling channels, ancient orbit chains, molten gold and charcoal stone`.
6. Paradox Verge: `fractured landscape showing incompatible city timelines through floating glass-like rifts, restrained cyan and magenta light`.
7. Prime Orbit Core: `vast celestial reactor beneath a sun spindle, seven luminous orbital rings, monumental dark architecture, white-gold core`.

- [ ] **Step 3: Generate the four personal memory environments**

1. Aurelia: `Solaris heating relay at dawn, brass mirrors and warm furnace light, workers' tools, noble but intimate scale`.
2. Kaelen: `stormbound Nautila harbor, chart table beneath a covered command post, distant rescue vessel, teal sea and rain`.
3. Maelis: `living forest archive interior, books grown from bark, glowing leaf-vein script, one blackened root among emerald light`.
4. Veyra: `floating stormglass observatory, seven crystal mirrors aligning lightning, violet clouds, precision instruments`.

- [ ] **Step 4: Optimize files**

Resize each result to 1600x900 and export JPEG around quality 78-82. Verify with:

```powershell
$files = Get-ChildItem assets/story/*.jpg
$total = ($files | Measure-Object Length -Sum).Sum
$files | Select-Object Name,Length
if ($files.Count -ne 11 -or $total -gt 2883584 -or ($files | Where-Object Length -gt 358400)) { exit 1 }
```

- [ ] **Step 5: Integrate artwork with fallback behavior**

Use static imports in `artwork.ts`. In `StoryCutscene`, render only the active image, add a dark overlay for text contrast, use desktop/mobile focus metadata, and retain the current gradient if the scene has no artwork or image loading fails. Remove decorative nebula circles whenever real artwork is visible.

- [ ] **Step 6: Run artwork, integrity, and build checks**

```powershell
npx tsx src/storyArtwork.test.ts
npx tsx src/foundationIntegrity.test.ts
npm run lint
npm run build
```

- [ ] **Step 7: Commit**

```powershell
git add assets/story src/data/story/artwork.ts src/components/StoryCutscene.tsx src/storyArtwork.test.ts src/foundationIntegrity.test.ts
git commit -m "Add illustrated story environments"
```

---

### Task 10: Make Chapter Navigation Fully Scrollable With Hidden Scrollbar

**Files:**
- Create: `src/storyChapterNavigation.test.ts`
- Modify: `src/components/StoryMode.tsx:205-270`

**Interfaces:**
- Adds a chapter-strip ref and `scrollSelectedChapterIntoView(chapterId: number)` behavior.

- [ ] **Step 1: Write the failing navigation test**

Source-check for `overflow-x-auto`, `scrollbar-none`, fixed card width, `tabIndex={0}`, accessible region label, selected-card refs, `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`, and a wheel handler that translates primarily horizontal desktop wheel input without preventing vertical page scroll when no horizontal movement is possible.

Run: `npx tsx src/storyChapterNavigation.test.ts`

Expected: FAIL because the current strip uses visible-scrollbar classes and no selected-card scrolling.

- [ ] **Step 2: Implement the strip**

Use:

```tsx
<div
  ref={chapterStripRef}
  role="region"
  aria-label="Campaign chapters"
  tabIndex={0}
  className="flex gap-4 overflow-x-auto overscroll-x-contain pb-3 scrollbar-none snap-x snap-mandatory"
>
```

Render each chapter as a real `<button>` with `type="button"`, `aria-pressed`, `disabled={!unlocked}`, `w-[250px] sm:w-[260px] shrink-0 snap-center`, and a stored ref. When `selectedChapter` changes, call `scrollIntoView` for that card. Keep native touch momentum and global scrollbar hiding.

- [ ] **Step 3: Add conservative wheel support**

Only call `preventDefault()` and change `scrollLeft` when the strip can move in the requested direction and `Math.abs(deltaX) > Math.abs(deltaY)` or Shift is held. Ordinary vertical wheel input must continue scrolling the Story Mode page.

- [ ] **Step 4: Run navigation and scrollbar tests**

```powershell
npx tsx src/storyChapterNavigation.test.ts
npx tsx src/globalScrollbarHidden.test.ts
npx tsx src/App.mobileMainMenuScroll.test.ts
npm run lint
```

- [ ] **Step 5: Commit**

```powershell
git add src/components/StoryMode.tsx src/storyChapterNavigation.test.ts
git commit -m "Improve chapter strip navigation"
```

---

### Task 11: Full Regression, Browser QA, GitHub Publish, And Vercel Verification

**Files:**
- Modify only files required by failures found during verification.

**Interfaces:**
- Produces a verified production deployment containing all approved story work.

- [ ] **Step 1: Run every test file**

```powershell
$tests = Get-ChildItem -Path src -Recurse -Filter *.test.ts | Sort-Object FullName
foreach ($test in $tests) {
  Write-Host "Running $($test.FullName)"
  npx tsx $test.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: every test prints its success line and the script exits 0.

- [ ] **Step 2: Run compiler and production build**

```powershell
npm run lint
npm run build
```

Expected: TypeScript exits 0 and Vite completes a production build without chunk or asset errors.

- [ ] **Step 3: Start local production preview**

Run: `npm run preview -- --host 0.0.0.0 --port 4173`

Expected: Vite reports `http://localhost:4173` and remains running for browser QA.

- [ ] **Step 4: Verify desktop behavior**

Using the browser verification tool at 1440x900:

- Open Story Mode and horizontally navigate Chapters 1-10.
- Confirm no scrollbar is visible and vertical page scrolling still works.
- Open Chapters 4-10 and verify stage names, locations, and backgrounds.
- Trigger both options of one campaign choice and confirm Stage 5 is unchanged.
- Open the Memory Archive and verify locked/unlocked presentation.
- Confirm no console errors and no failed image requests.

- [ ] **Step 5: Verify mobile behavior**

At a representative landscape phone viewport and a portrait phone viewport:

- Swipe the chapter strip through Chapter 10.
- Confirm cards do not compress and the selected card comes into view.
- Complete a choice using touch-sized buttons.
- Confirm cutscene dialogue remains legible over all backgrounds.
- Confirm the archive, stage dialog, and main page remain vertically scrollable.
- Confirm no clipped controls or visible scrollbars.

- [ ] **Step 6: Verify boss and save behavior manually**

- Record the boss name/template for an existing Chapter 4-10 Stage 5 before and after changing its chapter choice.
- Reload and verify the choice persists.
- Replay the decision stage, select the other option, reload, and verify replacement.
- Verify an old save without `storyChoices` loads and can enter Story Mode.
- Verify Character Story rewards add only Mora and Gems.

- [ ] **Step 7: Review final diff and commit QA fixes**

```powershell
git status --short
git diff --check
git diff --stat
```

If verification required fixes, stage only those files and commit with `git commit -m "Fix story expansion QA issues"`. Confirm the worktree is clean.

- [ ] **Step 8: Push GitHub main**

```powershell
git push origin main
```

Expected: GitHub accepts all story-expansion commits.

- [ ] **Step 9: Verify Vercel production deployment**

Use Vercel team `team_OuJpdV0P1pX5CmtXv1wkZNIA` and project `prj_5xRxwjLWLB4WtRiWkZWFsIuKroSb` to wait for the deployment created from the pushed commit. Confirm status `READY`, production alias `https://elemental-battleground.vercel.app`, HTTP 200, and no new runtime errors.

- [ ] **Step 10: Report completion**

Report the final commit, GitHub branch, production URL, test count, build result, browser viewport checks, and any residual risks. Do not claim completion until GitHub and Vercel verification both succeed.
