# Combat Records, Aether Transitions, Reward Reveals, and Forge Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct mode-specific combat records and labels, add a single dark Aether Constellation navigation transition, animate positive rewards into their UI destinations, and add a responsive Forge item-focus presentation.

**Architecture:** Four focused systems own presentation rules: a pure combat session formatter, a root-level transition controller, a root-level reward reveal queue, and a Forge-only focus stage. Existing App save mutations and combat callbacks remain authoritative; new UI layers consume explicit success events and never modify balance or inventory by themselves.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Motion 12, Tailwind CSS 4, Lucide React, Node assert tests executed with `tsx`.

## Global Constraints

- Preserve all combat damage, enemy, wave, reward-value, pity, inventory-capacity, and drop-rate behavior.
- Preserve all existing BGM files and routing; screen swaps may change audio context only while the transition overlay is opaque.
- Preserve mobile fullscreen and landscape admission behavior.
- Do not add Three.js or another rendering dependency.
- Do not reuse third-party game loading assets, symbols, layout, or exact animation timing.
- Use `#050815` as the transition base and 850 ms as the normal navigation duration.
- Keep the title transition ceremonial duration at 1550 ms and run it through the same controller exactly once.
- Keep all animation node counts bounded and support reduced motion and low graphics.
- Preserve backward compatibility for local and Supabase cloud saves.
- Do not stage or modify `GAME_QA_REVIEW.md` or `qa-evidence/`.

## File Map

### New Files

- `src/utils/combatSessionPresentation.ts`: combat mode types, labels, duration formatting, and record comparisons.
- `src/utils/combatSessionPresentation.test.ts`: pure mode and record tests.
- `src/combatSessionPresentationIntegration.test.ts`: source-level contracts for CombatArena, StoryRewards, RogueDungeon, and App.
- `src/utils/aetherTransition.ts`: screen types, palettes, timing, and transition reducer.
- `src/utils/aetherTransition.test.ts`: pure transition-state tests.
- `src/components/AetherCoreTransition.tsx`: one persistent dark transition overlay.
- `src/components/AetherCoreTransition.test.ts`: component source and accessibility contracts.
- `src/utils/rewardReveal.ts`: reward event normalization, grouping, anchors, and queue limits.
- `src/utils/rewardReveal.test.ts`: grouping, duplicate, fallback, and limit tests.
- `src/components/RewardRevealLayer.tsx`: global Motion-based reward travel renderer.
- `src/rewardRevealIntegration.test.ts`: anchors and successful reward emitter contracts.
- `src/utils/forgePresentation.ts`: Forge item visuals and operation-event types.
- `src/utils/forgePresentation.test.ts`: silhouette and animation-profile tests.
- `src/components/ForgeFocusStage.tsx`: selected weapon/artifact focus chamber.
- `src/components/ForgeFocusStage.test.ts`: responsive, reduced-motion, and operation-state contracts.

### Modified Files

- `src/types.ts`: additive Story and stats record fields.
- `src/data/story/progress.ts`: migration and normalization for fastest clear times.
- `src/storyProgressMigration.test.ts`: old-save and malformed-time coverage.
- `src/components/CombatArena.tsx`: mode-aware session context, labels, and record callbacks.
- `src/components/StoryRewards.tsx`: clear time, best time, and new-record rows.
- `src/components/RogueDungeon.tsx`: persisted run timing and completion callback.
- `src/App.tsx`: record persistence, transition navigation, reward queue, anchors, and Forge success callbacks.
- `src/components/GemsShop.tsx`: emit an artifact reveal only after a successful artifact purchase.
- `src/components/SquadronQuestLedger.tsx`: stable reward-source anchors.
- `src/components/LoginRewardModal.tsx`: stable reward-source anchors.
- `src/components/GachaSimulator.tsx`: stable summon reward source and existing callback use.
- `src/components/InventoryManager.tsx`: focus stage placement and success-event animation.
- `src/index.css`: Aether transition, reward pulse, and Forge focus styles plus reduced-motion/mobile rules.
- `src/components/MainMenu.previewParity.test.ts`: one persistent transition host and title timing contract.
- `src/forgeInformationHierarchy.test.ts`: preserve concise Forge hierarchy with the new focus stage.

---

### Task 1: Add Combat Session Types, Formatting, and Save Migration

**Files:**
- Create: `src/utils/combatSessionPresentation.ts`
- Create: `src/utils/combatSessionPresentation.test.ts`
- Modify: `src/types.ts:138-201`
- Modify: `src/data/story/progress.ts:30-74`
- Modify: `src/storyProgressMigration.test.ts`

**Interfaces:**
- Produces: `CombatSessionContext`, `CombatSessionPresentation`, `getCombatSessionPresentation(context)`, `formatCombatDuration(seconds)`, `getImprovedClearTime(previous, candidate)`.
- Produces save fields: `StoryProgress.fastestClearTimes`, `SaveState.stats.highScoreArtifactWave`, and `SaveState.stats.fastestRogueClearSecs`.

- [ ] **Step 1: Write failing pure tests for all session modes**

```ts
import assert from 'node:assert/strict';
import {
  formatCombatDuration,
  getCombatSessionPresentation,
  getImprovedClearTime,
} from './combatSessionPresentation';

assert.equal(formatCombatDuration(0), '00:00');
assert.equal(formatCombatDuration(65), '01:05');
assert.equal(getImprovedClearTime(undefined, 42), 42);
assert.equal(getImprovedClearTime(42, 42), undefined);
assert.equal(getImprovedClearTime(42, 41), 41);

assert.deepEqual(
  getCombatSessionPresentation({ mode: 'story-campaign', stageId: '4-3', bestClearSecs: 73 }),
  {
    eyebrow: 'STORY CAMPAIGN',
    progressLabel: 'CHAPTER 4 - STAGE 3',
    deploymentLabel: 'STORY CAMPAIGN - CHAPTER 4 - STAGE 3',
    pauseLabel: 'CHAPTER 4 - STAGE 3',
    resultLabel: 'STAGE 4-3',
    recordLabel: 'FASTEST CLEAR',
    recordValue: '01:13',
  },
);

const character = getCombatSessionPresentation({
  mode: 'character-story',
  stageId: 'char-aurelia-2',
  characterName: 'Aurelia',
  act: 2,
  bestClearSecs: 54,
});
assert.match(character.deploymentLabel, /AURELIA - ACT 2/);
assert.doesNotMatch(character.deploymentLabel, /WAVE/);

assert.equal(
  getCombatSessionPresentation({ mode: 'endless-arena', wave: 8, bestWave: 12 }).recordValue,
  'WAVE 12',
);
assert.equal(
  getCombatSessionPresentation({ mode: 'artifact-grind', wave: 8, bestWave: 19 }).recordValue,
  'WAVE 19',
);
assert.match(
  getCombatSessionPresentation({
    mode: 'rogue-ruins',
    room: 6,
    roomCount: 10,
    roomType: 'elite',
    deepestRoom: 8,
  }).progressLabel,
  /ROOM 6\/10 - ELITE/,
);
```

- [ ] **Step 2: Run the pure test and verify it fails**

Run: `npx tsx src/utils/combatSessionPresentation.test.ts`

Expected: FAIL because `combatSessionPresentation.ts` does not exist.

- [ ] **Step 3: Add the discriminated union and pure helpers**

```ts
export type CombatSessionContext =
  | { mode: 'endless-arena'; wave: number; bestWave: number }
  | { mode: 'artifact-grind'; wave: number; bestWave: number }
  | { mode: 'story-campaign'; stageId: string; bestClearSecs?: number }
  | {
      mode: 'character-story';
      stageId: string;
      characterName: string;
      act: number;
      bestClearSecs?: number;
    }
  | {
      mode: 'rogue-ruins';
      room: number;
      roomCount: number;
      roomType: 'battle' | 'elite' | 'boss';
      deepestRoom: number;
      fastestClearSecs?: number;
    };

export interface CombatSessionPresentation {
  eyebrow: string;
  progressLabel: string;
  deploymentLabel: string;
  pauseLabel: string;
  resultLabel: string;
  recordLabel: string;
  recordValue: string;
}
```

Implement integer clamping, campaign stage parsing, empty-record display as `NO RECORD`, and equal-time behavior as not improved.

- [ ] **Step 4: Add failing save-migration assertions**

```ts
assert.deepEqual(createDefaultStoryProgress().fastestClearTimes, {});

const timed = normalizeStoryProgress({
  fastestClearTimes: {
    '4-3': 73,
    'char-aurelia-2': 54,
    broken: -4,
    infinite: Number.POSITIVE_INFINITY,
  },
} as never);
assert.deepEqual(timed.fastestClearTimes, { '4-3': 73, 'char-aurelia-2': 54 });
```

- [ ] **Step 5: Add additive save fields and normalization**

```ts
export interface StoryProgress {
  // existing fields
  fastestClearTimes: Record<string, number>;
}

// SaveState.stats
highScoreArtifactWave?: number;
fastestRogueClearSecs?: number;
```

Normalize only finite positive whole seconds. Preserve all existing story progression and choices.

- [ ] **Step 6: Run focused tests**

Run: `npx tsx src/utils/combatSessionPresentation.test.ts`

Run: `npx tsx src/storyProgressMigration.test.ts`

Expected: both PASS.

- [ ] **Step 7: Commit the session model and migration**

```powershell
git add src/types.ts src/data/story/progress.ts src/storyProgressMigration.test.ts src/utils/combatSessionPresentation.ts src/utils/combatSessionPresentation.test.ts
git commit -m "feat: add mode-aware combat records"
```

---

### Task 2: Integrate Mode-Aware Labels and Story Result Times

**Files:**
- Create: `src/combatSessionPresentationIntegration.test.ts`
- Modify: `src/components/CombatArena.tsx:170-260, 5589-5658, 5786-5810, 6008, 6109, 6235-6260`
- Modify: `src/components/StoryRewards.tsx`
- Modify: `src/App.tsx:271-278, 1353-1518, 2881-2938, 3920-3970`

**Interfaces:**
- Consumes: `getCombatSessionPresentation`, `getImprovedClearTime`, and new save fields from Task 1.
- Changes `CombatArenaProps.onUpdateHighScore` to `onUpdateWaveRecord(mode, wave, points)`.
- Adds `highScoreArtifactWave`, `storyIsCharacterStory`, `storyCharacterName`, `storyAct`, and `storyBestClearSecs` props.
- Adds `bestTimeSecs?: number` and `isNewRecord: boolean` to `StoryRewardsProps`.

- [ ] **Step 1: Write failing integration contracts**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const arena = readFileSync(new URL('./components/CombatArena.tsx', import.meta.url), 'utf8');
const rewards = readFileSync(new URL('./components/StoryRewards.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

assert.match(arena, /getCombatSessionPresentation/);
assert.match(arena, /onUpdateWaveRecord\?\('artifact-grind'/);
assert.match(arena, /onUpdateWaveRecord\?\('endless-arena'/);
assert.doesNotMatch(arena, /High Score: Wave \{highScoreWave\}/);
assert.match(rewards, /CLEAR TIME/);
assert.match(rewards, /BEST TIME/);
assert.match(rewards, /NEW RECORD/);
assert.match(app, /fastestClearTimes/);
assert.match(app, /highScoreArtifactWave/);
```

- [ ] **Step 2: Run integration test and verify it fails**

Run: `npx tsx src/combatSessionPresentationIntegration.test.ts`

Expected: FAIL on missing formatter integration and new props.

- [ ] **Step 3: Build the current session context once per render**

In `CombatArena`, derive one `CombatSessionContext` with this precedence:

```ts
const sessionContext: CombatSessionContext = storyMode
  ? storyIsCharacterStory
    ? {
        mode: 'character-story',
        stageId: storyStageId,
        characterName: storyCharacterName || 'Character',
        act: storyAct || 1,
        bestClearSecs: storyBestClearSecs,
      }
    : { mode: 'story-campaign', stageId: storyStageId, bestClearSecs: storyBestClearSecs }
  : dungeonMode
    ? {
        mode: 'rogue-ruins',
        room: dungeonRoomIdx + 1,
        roomCount: 10,
        roomType: dungeonRoomType || 'battle',
        deepestRoom: rogueDeepestRoom,
        fastestClearSecs: rogueFastestClearSecs,
      }
    : isArtifactGrindMode
      ? { mode: 'artifact-grind', wave: currentWave, bestWave: highScoreArtifactWave }
      : { mode: 'endless-arena', wave: currentWave, bestWave: highScoreWave };
```

Render all top, deployment, pause, and defeat labels from `sessionPresentation`. Keep score visible only where it is meaningful; do not append `Wave` to Story or Rogue labels.

- [ ] **Step 4: Separate wave-record callbacks**

Replace the current call with:

```ts
onUpdateWaveRecord?.(
  isArtifactGrindMode ? 'artifact-grind' : 'endless-arena',
  currentWave,
  gameScore + 200,
);
```

In App, update `highScoreWave` only for `endless-arena`, `highScoreArtifactWave` only for `artifact-grind`, and `highScorePoints` only for Endless Arena.

- [ ] **Step 5: Add Story timing rows**

Pass the previous best into `StoryRewards`. Calculate:

```ts
const improvedTime = getImprovedClearTime(storyBestClearSecs, storyElapsedSecs);
const displayedBestTime = improvedTime ?? storyBestClearSecs ?? storyElapsedSecs;
```

Render `CLEAR TIME`, `BEST TIME`, and `NEW RECORD` separately from the three-star criteria. Equal times must not display `NEW RECORD`.

- [ ] **Step 6: Persist Story fastest times once**

Inside `handleStoryBattleEnd`, merge the valid victory duration:

```ts
const improvedTime = getImprovedClearTime(progress.fastestClearTimes[stageId], stats.duration);
const nextFastestClearTimes = improvedTime === undefined
  ? progress.fastestClearTimes
  : { ...progress.fastestClearTimes, [stageId]: improvedTime };
```

Include `fastestClearTimes: nextFastestClearTimes` in the existing `storyProgress` update without changing rewards.

- [ ] **Step 7: Pass explicit Story metadata from App**

```tsx
<CombatArena
  storyIsCharacterStory={storyBattleConfig.isCharStory}
  storyCharacterName={PLAYABLE_CHARACTERS.find(c => c.id === storyBattleConfig.charId)?.name}
  storyAct={storyBattleConfig.act}
  storyBestClearSecs={saveState.storyProgress?.fastestClearTimes?.[storyBattleConfig.stageId]}
/>
```

- [ ] **Step 8: Run focused tests and type-check**

Run: `npx tsx src/combatSessionPresentationIntegration.test.ts`

Run: `npx tsx src/storyProgressMigration.test.ts`

Run: `npm run lint`

Expected: all PASS.

- [ ] **Step 9: Commit combat presentation integration**

```powershell
git add src/App.tsx src/components/CombatArena.tsx src/components/StoryRewards.tsx src/combatSessionPresentationIntegration.test.ts
git commit -m "feat: show mode-aware combat progress"
```

---

### Task 3: Add Rogue Run Timing and Finish Record Separation

**Files:**
- Modify: `src/components/RogueDungeon.tsx:14-90, 115-150, 170-215, 270-330, 350-410`
- Modify: `src/App.tsx:1280-1320, 2938-2970, 3880-3900`
- Modify: `src/combatSessionPresentationIntegration.test.ts`

**Interfaces:**
- Adds `deepestRoom`, `fastestClearSecs`, and `onCompleteRun(durationSecs)` to `RogueDungeonProps`.
- Persists `runStartedAt` in the existing `aetheria_ruins_save_v1` payload.
- Passes Rogue record props through to `CombatArena`.

- [ ] **Step 1: Extend the failing integration test**

```ts
const rogue = readFileSync(new URL('./components/RogueDungeon.tsx', import.meta.url), 'utf8');
assert.match(rogue, /runStartedAt/);
assert.match(rogue, /onCompleteRun/);
assert.match(rogue, /fastestClearSecs/);
assert.match(rogue, /deepestRoom/);
assert.match(rogue, /CLEAR TIME/);
assert.match(app, /fastestRogueClearSecs/);
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx tsx src/combatSessionPresentationIntegration.test.ts`

Expected: FAIL on missing Rogue timing fields.

- [ ] **Step 3: Persist the run start timestamp**

Initialize `runStartedAt` from the existing Rogue save. On a new run set it to `Date.now()`. Include it in the existing auto-save payload and dependencies. Reset it to zero only when the run is abandoned or a new run begins.

- [ ] **Step 4: Complete the Rogue record at the boss boundary**

```ts
const durationSecs = Math.max(1, Math.floor((Date.now() - runStartedAt) / 1000));
setCompletedRunDurationSecs(durationSecs);
onCompleteRun(durationSecs);
```

Call this exactly once when Room 10 boss victory sets `runFinished` to `victory`. Do not call it for defeat, rest rooms, or room-clear overlays.

- [ ] **Step 5: Display Rogue clear and record time**

The final victory panel shows `CLEAR TIME`, `BEST TIME`, and `NEW RECORD` using `getImprovedClearTime`. Before any completion, the combat record badge remains `DEEPEST ROOM`; after a completion it becomes `FASTEST RUN`.

- [ ] **Step 6: Persist App Rogue best time**

```ts
const handleCompleteRogueRun = (durationSecs: number) => {
  triggerSaveUpdate(prev => {
    const improved = getImprovedClearTime(prev.stats.fastestRogueClearSecs, durationSecs);
    return improved === undefined
      ? prev
      : { ...prev, stats: { ...prev.stats, fastestRogueClearSecs: improved } };
  });
};
```

Pass current deepest room, fastest time, and completion callback to `RogueDungeon`.

- [ ] **Step 7: Run focused tests and type-check**

Run: `npx tsx src/combatSessionPresentationIntegration.test.ts`

Run: `npm run lint`

Expected: both PASS.

- [ ] **Step 8: Commit Rogue timing**

```powershell
git add src/App.tsx src/components/RogueDungeon.tsx src/combatSessionPresentationIntegration.test.ts
git commit -m "feat: track rogue ruins clear times"
```

---

### Task 4: Build the Aether Transition State Machine and Overlay

**Files:**
- Create: `src/utils/aetherTransition.ts`
- Create: `src/utils/aetherTransition.test.ts`
- Create: `src/components/AetherCoreTransition.tsx`
- Create: `src/components/AetherCoreTransition.test.ts`

**Interfaces:**
- Produces `AppScreen`, `TransitionTone`, `TransitionPhase`, `AetherTransitionState`, `getTransitionTone(screen)`, `getTransitionTimings(kind, reducedMotion)`, and `reduceAetherTransition(state, event)`.
- Produces `<AetherCoreTransition state lowGraphics reducedMotion />`.

- [ ] **Step 1: Write failing reducer and palette tests**

```ts
import assert from 'node:assert/strict';
import {
  createIdleTransition,
  getTransitionTimings,
  getTransitionTone,
  reduceAetherTransition,
} from './aetherTransition';

assert.deepEqual(getTransitionTone('story'), { id: 'story', color: '#10b981', label: 'Story' });
assert.equal(getTransitionTone('inventory').color, '#f97316');
assert.deepEqual(getTransitionTimings('standard', false), { coverMs: 220, swapMs: 450, totalMs: 850 });
assert.deepEqual(getTransitionTimings('standard', true), { coverMs: 100, swapMs: 140, totalMs: 280 });
assert.equal(getTransitionTimings('title', false).totalMs, 1550);

const requested = reduceAetherTransition(createIdleTransition('home'), {
  type: 'request',
  requestId: 1,
  destination: 'story',
  kind: 'standard',
});
assert.equal(requested.phase, 'covering');
assert.equal(reduceAetherTransition(requested, { type: 'request', requestId: 1, destination: 'story', kind: 'standard' }), requested);
assert.equal(reduceAetherTransition(requested, { type: 'covered', requestId: 1 }).phase, 'covered');
assert.equal(reduceAetherTransition(requested, { type: 'reveal', requestId: 1 }).phase, 'revealing');
assert.equal(reduceAetherTransition(requested, { type: 'complete', requestId: 1 }).phase, 'idle');
```

- [ ] **Step 2: Run the reducer test and verify it fails**

Run: `npx tsx src/utils/aetherTransition.test.ts`

Expected: FAIL because the utility does not exist.

- [ ] **Step 3: Implement the pure state machine**

Use a monotonically increasing `requestId`. Events with an older or duplicate ID return the current state unchanged. Define all screen palettes from the spec and use cool silver-blue for `menu` and settings-neutral cases.

- [ ] **Step 4: Write failing overlay source contracts**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./AetherCoreTransition.tsx', import.meta.url), 'utf8');
assert.match(source, /aria-live="polite"/);
assert.match(source, /aether-transition__core/);
assert.match(source, /aether-transition__sigil/);
assert.match(source, /Array\.from\(\{ length: lowGraphics \? 3 : 7 \}/);
assert.match(source, /prefersReducedMotion|reducedMotion/);
```

- [ ] **Step 5: Implement the persistent overlay component**

Render one fixed pointer-blocking root only when phase is not idle. Use one central four-petal Core, two constellation arcs, and three or seven original geometric sigils. Animate only opacity and transform on mobile/low graphics. Visible text is limited to the destination label; screen-reader status is `Entering ${tone.label}`.

- [ ] **Step 6: Run focused tests**

Run: `npx tsx src/utils/aetherTransition.test.ts`

Run: `npx tsx src/components/AetherCoreTransition.test.ts`

Expected: both PASS.

- [ ] **Step 7: Commit transition primitives**

```powershell
git add src/utils/aetherTransition.ts src/utils/aetherTransition.test.ts src/components/AetherCoreTransition.tsx src/components/AetherCoreTransition.test.ts
git commit -m "feat: add dark aether transition system"
```

---

### Task 5: Route App Navigation Through One Transition Host

**Files:**
- Modify: `src/App.tsx:216-220, 428-465, 1877-1990, 2044-2064, 2175-2210, 2584-2808, 2832-2838, 2919-3007, 3930-3948`
- Modify: `src/index.css:577-690, 1047-1060`
- Modify: `src/components/MainMenu.previewParity.test.ts`
- Modify: `src/App.menuExperience.test.ts`

**Interfaces:**
- Consumes the transition reducer and component from Task 4.
- Produces `navigateWithTransition(destination, options?)` and `runWithTransition(destination, coveredAction, options?)` inside App.

- [ ] **Step 1: Update the failing App transition contracts**

```ts
assert.match(appSource, /navigateWithTransition/);
assert.match(appSource, /<AetherCoreTransition/);
assert.equal(appSource.match(/<AetherCoreTransition/g)?.length, 1);
assert.doesNotMatch(appSource, /const \[menuTransition,/);
assert.doesNotMatch(appSource, /setActiveScreen\('story'\); AetheriaAudioEngine\.playClick/);
assert.match(cssSource, /--aether-transition-color/);
assert.match(cssSource, /#050815/);
assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)/);
```

- [ ] **Step 2: Run the existing and updated transition tests to verify failure**

Run: `npx tsx src/components/MainMenu.previewParity.test.ts`

Run: `npx tsx src/App.menuExperience.test.ts`

Expected: FAIL because App still owns the old menu-only transition.

- [ ] **Step 3: Implement timer-safe navigation**

Use reducer state plus one timer-ref array. `navigateWithTransition` starts the request, commits `activeScreen` at `swapMs`, and completes at `totalMs`. `runWithTransition` performs an arbitrary covered action for Story battle entry/exit while keeping the current `activeScreen`. Clear timers before a new accepted request and on unmount.

- [ ] **Step 4: Replace direct screen navigation**

Replace user-facing `setActiveScreen` calls in sidebar, Home shortcuts, back buttons, Wiki links, dungeon/wish entry, and title enter/return. Keep internal state restoration and screen initialization immediately before requesting the transition. Internal Forge, Story, Wiki, and Summon tab changes do not transition.

- [ ] **Step 5: Coordinate BGM and remove flash paths**

Keep `AetheriaAudioEngine.changeBgmForScreen(activeScreen)` driven by `activeScreen`, but only mutate `activeScreen` at the covered phase. Story battle BGM calls occur inside `runWithTransition`'s covered action. Remove old menu transition state, duplicate overlay wrappers, and old CSS keyframes that are no longer referenced.

- [ ] **Step 6: Add dark transition CSS**

Implement fixed background `#050815`, destination CSS variable, Core petal transforms, elliptical sigil positions, fixed node counts, and a no-blur mobile/low-graphics path. Ensure the idle host cannot intercept pointer input.

- [ ] **Step 7: Run transition tests and type-check**

Run: `npx tsx src/utils/aetherTransition.test.ts`

Run: `npx tsx src/components/AetherCoreTransition.test.ts`

Run: `npx tsx src/components/MainMenu.previewParity.test.ts`

Run: `npx tsx src/App.menuExperience.test.ts`

Run: `npm run lint`

Expected: all PASS.

- [ ] **Step 8: Commit App transition integration**

```powershell
git add src/App.tsx src/index.css src/components/MainMenu.previewParity.test.ts src/App.menuExperience.test.ts
git commit -m "feat: transition between game sections"
```

---

### Task 6: Build the Reward Reveal Queue and Global Layer

**Files:**
- Create: `src/utils/rewardReveal.ts`
- Create: `src/utils/rewardReveal.test.ts`
- Create: `src/components/RewardRevealLayer.tsx`
- Create: `src/rewardRevealIntegration.test.ts`

**Interfaces:**
- Produces `RewardKind`, `RewardRevealEvent`, `RewardRevealTarget`, `normalizeRewardEvents(events)`, `appendRewardEvents(queue, events)`, and `<RewardRevealLayer events onComplete lowGraphics />`.
- Queue limit: 12 groups. Per transaction visual limit: 4 groups. Duplicate event IDs are ignored.

- [ ] **Step 1: Write failing reward model tests**

```ts
import assert from 'node:assert/strict';
import { appendRewardEvents, normalizeRewardEvents } from './rewardReveal';

const grouped = normalizeRewardEvents([
  { id: 'a', kind: 'gems', quantity: 10 },
  { id: 'b', kind: 'gems', quantity: 20 },
  { id: 'c', kind: 'mora', quantity: 1000 },
]);
assert.deepEqual(grouped.map(event => [event.kind, event.quantity]), [['gems', 30], ['mora', 1000]]);

const queue = appendRewardEvents([], grouped);
assert.equal(appendRewardEvents(queue, [grouped[0]]).length, queue.length);
assert.ok(appendRewardEvents([], Array.from({ length: 20 }, (_, index) => ({
  id: `reward-${index}`,
  kind: 'artifact' as const,
  quantity: 1,
}))).length <= 12);
```

- [ ] **Step 2: Run the model test and verify it fails**

Run: `npx tsx src/utils/rewardReveal.test.ts`

Expected: FAIL because the reward utility does not exist.

- [ ] **Step 3: Implement event normalization and target mapping**

Map `mora` to `[data-reward-target="mora"]`, `gems` to `[data-reward-target="gems"]`, and weapon/artifact to `[data-reward-target="forge"]`. Expose `[data-reward-target="inventory-fallback"]` as the fallback selector. Drop zero, negative, non-finite, and duplicate entries.

- [ ] **Step 4: Write failing layer contracts**

```ts
const layer = readFileSync(new URL('./components/RewardRevealLayer.tsx', import.meta.url), 'utf8');
assert.match(layer, /createPortal/);
assert.match(layer, /pointer-events-none/);
assert.match(layer, /data-reward-reveal/);
assert.match(layer, /onAnimationComplete/);
assert.match(layer, /lowGraphics/);
```

- [ ] **Step 5: Implement the global Motion layer**

Measure source and destination rectangles once per event. Default the source to viewport center when no `[data-reward-source]` anchor exists. Animate a three-point curved transform path, then pulse the destination by toggling `data-reward-pulse="true"` for 260 ms. Reduced motion crossfades at the target without travel.

- [ ] **Step 6: Run focused tests**

Run: `npx tsx src/utils/rewardReveal.test.ts`

Run: `npx tsx src/rewardRevealIntegration.test.ts`

Expected: both PASS after adding initial layer contracts.

- [ ] **Step 7: Commit reward primitives**

```powershell
git add src/utils/rewardReveal.ts src/utils/rewardReveal.test.ts src/components/RewardRevealLayer.tsx src/rewardRevealIntegration.test.ts
git commit -m "feat: add global reward reveal layer"
```

---

### Task 7: Add Reward Anchors and Successful Reward Emitters

**Files:**
- Modify: `src/App.tsx:780-910, 1027-1032, 1201-1213, 1359-1518, 1520-1865, 2515-2555, 2584-2810, 2881-3065`
- Modify: `src/components/GemsShop.tsx:244-315`
- Modify: `src/components/SquadronQuestLedger.tsx`
- Modify: `src/components/LoginRewardModal.tsx`
- Modify: `src/components/GachaSimulator.tsx`
- Modify: `src/rewardRevealIntegration.test.ts`
- Modify: `src/index.css`

**Interfaces:**
- Consumes `RewardRevealEvent` and `RewardRevealLayer` from Task 6.
- Adds `enqueueRewardReveal(events, sourceAnchor?)` in App.
- Adds optional `onRewardReveal(events, sourceAnchor?)` to GemsShop for purchased artifacts.

- [ ] **Step 1: Expand the failing integration contracts**

```ts
assert.match(app, /data-reward-target="mora"/);
assert.match(app, /data-reward-target="gems"/);
assert.match(app, /data-reward-target="forge"/);
assert.match(app, /<RewardRevealLayer/);
assert.match(app, /enqueueRewardReveal/);
assert.match(questSource, /data-reward-source=/);
assert.match(loginSource, /data-reward-source=/);
assert.match(shopSource, /onRewardReveal/);
```

- [ ] **Step 2: Run the integration test and verify it fails**

Run: `npx tsx src/rewardRevealIntegration.test.ts`

Expected: FAIL on missing anchors and App queue.

- [ ] **Step 3: Mount one queue and destination anchors**

Add App state for at most 12 grouped events, one completion callback, and one root `<RewardRevealLayer>`. Add stable target attributes to the existing Mora/Gems counters and Forge sidebar button. Add an always-mounted zero-size inventory fallback beacon near the top-right safe area.

- [ ] **Step 4: Emit known positive currency rewards outside state updaters**

Call `enqueueRewardReveal` only after validation in:

- `handleModifyCurrencies` for positive explicit Gems/Mora arguments.
- Story completion using the same first-clear checks as the save mutation.
- Single and claim-all quest completion using known totals.
- Login reward days 3-6 using known currency amounts.
- Rogue final rewards through the existing `onEarnRewards` callback.

Do not emit for spending, save hydration, invalid claims, or negative diffs. Do not enqueue from inside `triggerSaveUpdate` updater functions.

- [ ] **Step 5: Emit weapon and artifact rewards**

- `handleAddWeapon` emits one weapon event after appending the weapon.
- `handleAwardArtifact` and `handleAwardArtifacts` emit grouped artifact events.
- Login Day 2 emits one weapon event.
- Quest weapon rewards emit one weapon event.
- Gems Shop emits one artifact event only after its purchase validation passes.
- Summon weapons continue through `handleAddWeapon`, preventing a duplicate Gacha-specific event.

- [ ] **Step 6: Add source anchors**

Quest claim buttons use `data-reward-source="quest-${quest.id}"`, login cards use `login-${day}`, Story result uses `story-${stageId}`, and summon results use `summon-results`. When a source disappears before animation, the layer uses viewport center.

- [ ] **Step 7: Add destination pulse CSS**

Use one 260 ms transform/box-shadow pulse selected by `[data-reward-pulse="true"]`. Respect reduced motion by changing only outline opacity.

- [ ] **Step 8: Run focused tests and type-check**

Run: `npx tsx src/utils/rewardReveal.test.ts`

Run: `npx tsx src/rewardRevealIntegration.test.ts`

Run: `npm run lint`

Expected: all PASS.

- [ ] **Step 9: Commit reward integration**

```powershell
git add src/App.tsx src/index.css src/components/GemsShop.tsx src/components/SquadronQuestLedger.tsx src/components/LoginRewardModal.tsx src/components/GachaSimulator.tsx src/rewardRevealIntegration.test.ts
git commit -m "feat: animate collected rewards"
```

---

### Task 8: Build Forge Visual Models and Focus Stage

**Files:**
- Create: `src/utils/forgePresentation.ts`
- Create: `src/utils/forgePresentation.test.ts`
- Create: `src/components/ForgeFocusStage.tsx`
- Create: `src/components/ForgeFocusStage.test.ts`

**Interfaces:**
- Produces `ForgeVisualItem`, `ForgeOperationEvent`, `ForgeOperationResult`, `getWeaponSilhouette(type)`, `getArtifactSilhouette(slot)`, and `<ForgeFocusStage item operation lowGraphics />`.

- [ ] **Step 1: Write failing presentation-model tests**

```ts
import assert from 'node:assert/strict';
import { getArtifactSilhouette, getWeaponSilhouette, getForgeAnimationProfile } from './forgePresentation';

assert.equal(getWeaponSilhouette('Sword').id, 'sword');
assert.equal(getWeaponSilhouette('Catalyst').id, 'catalyst');
assert.equal(getArtifactSilhouette('Helmet').id, 'helmet');
assert.equal(getArtifactSilhouette('Shoe').id, 'boots');
assert.equal(getForgeAnimationProfile('upgrade').orbitingNodes, 6);
assert.equal(getForgeAnimationProfile('fusion').sourceNodes, 3);
assert.equal(getForgeAnimationProfile('failure').orbitingNodes, 0);
```

- [ ] **Step 2: Run the model test and verify it fails**

Run: `npx tsx src/utils/forgePresentation.test.ts`

Expected: FAIL because the utility does not exist.

- [ ] **Step 3: Implement typed silhouettes and operation profiles**

Use Lucide-compatible geometry descriptions or CSS shape identifiers for Sword, Claymore, Bow, Catalyst, Polearm, Helmet, Hands, Leg, and Shoe. Rarity 3 uses blue, rarity 4 purple, and rarity 5 gold. Cap upgrade materials at six visual nodes and fusion sources at three.

- [ ] **Step 4: Write failing component contracts**

```ts
const source = readFileSync(new URL('./ForgeFocusStage.tsx', import.meta.url), 'utf8');
assert.match(source, /data-forge-focus-stage/);
assert.match(source, /data-forge-operation/);
assert.match(source, /lowGraphics/);
assert.match(source, /reducedMotion/);
assert.match(source, /orbitingNodes/);
```

- [ ] **Step 5: Implement the focus stage**

Render an unframed pedestal region, item silhouette, rarity ring, concise name/level/primary-stat copy, and fixed-count material nodes. `upgrade` orbits then converges; `fusion` shows exactly three source silhouettes converging into one result. `failure` renders no operation animation. Reduced motion uses one glow and text emphasis.

- [ ] **Step 6: Run focused tests**

Run: `npx tsx src/utils/forgePresentation.test.ts`

Run: `npx tsx src/components/ForgeFocusStage.test.ts`

Expected: both PASS.

- [ ] **Step 7: Commit Forge primitives**

```powershell
git add src/utils/forgePresentation.ts src/utils/forgePresentation.test.ts src/components/ForgeFocusStage.tsx src/components/ForgeFocusStage.test.ts
git commit -m "feat: add forge item focus stage"
```

---

### Task 9: Integrate Forge Success Events and Responsive Presentation

**Files:**
- Modify: `src/components/InventoryManager.tsx:47-160, 1038-1300, 1450-1540`
- Modify: `src/App.tsx:1034-1088, 1215-1285, 3012-3045`
- Modify: `src/index.css`
- Modify: `src/forgeInformationHierarchy.test.ts`

**Interfaces:**
- Consumes `ForgeOperationResult` and `ForgeFocusStage` from Task 8.
- Changes `onUpgradeWeapon` and `onFuseArtifacts` to return `ForgeOperationResult` synchronously.
- Keeps all mutation parameters and existing validation rules unchanged.

- [ ] **Step 1: Add failing Forge integration contracts**

```ts
assert.match(source, /<ForgeFocusStage/);
assert.match(source, /ForgeOperationResult/);
assert.match(source, /result\.success/);
assert.match(source, /setForgeOperation/);
assert.match(source, /data-forge-layout/);
```

- [ ] **Step 2: Run existing Forge tests and verify the new contract fails**

Run: `npx tsx src/forgeInformationHierarchy.test.ts`

Run: `npx tsx src/components/ForgeFocusStage.test.ts`

Expected: the existing hierarchy test passes and the added integration assertions fail.

- [ ] **Step 3: Return explicit weapon-upgrade results from App**

Validate the current weapon, Mora, and level against the current `saveState` before scheduling the existing mutation:

```ts
type ForgeOperationResult =
  | { success: true; event: ForgeOperationEvent }
  | { success: false };
```

Return `{ success: false }` after existing alerts. Return an upgrade event containing weapon ID, old level, and new level only after `triggerSaveUpdate` is scheduled.

- [ ] **Step 4: Return explicit fusion results from App**

Move validation that currently lives only inside the updater into a pure preflight using current `saveState`, while retaining defensive checks inside the updater. Return a fusion event only when the exact three artifacts, costs, lock/equip state, and result identity pass.

- [ ] **Step 5: Trigger presentation only on success**

In InventoryManager:

```ts
const result = onUpgradeWeapon?.(activeEquippedWeapon.id);
if (result?.success) setForgeOperation(result.event);
```

Use the same pattern for fusion. Keep the selected fused artifact ID update only on success. Clear the event after its declared duration or when the selected item/tab changes.

- [ ] **Step 6: Place the focus stage without nesting cards**

- Weapon tab: render the equipped/selected weapon focus above upgrade controls.
- Artifact tab: render the active artifact focus above stats and Lock/Delete/Fusion controls.
- At 1280 CSS pixels or wider, use a two-column focus/action layout.
- Below 1280 pixels and on mobile landscape, stack focus above controls with an aspect ratio no taller than 5/2.

- [ ] **Step 7: Add responsive and reduced-motion CSS**

Use transforms only for orbit and convergence. Low graphics removes decorative sparks. Ensure buttons remain visible at 800 x 360 and no new scrollbar is shown.

- [ ] **Step 8: Run Forge tests and type-check**

Run: `npx tsx src/utils/forgePresentation.test.ts`

Run: `npx tsx src/components/ForgeFocusStage.test.ts`

Run: `npx tsx src/forgeInformationHierarchy.test.ts`

Run: `npm run lint`

Expected: all PASS.

- [ ] **Step 9: Commit Forge integration**

```powershell
git add src/App.tsx src/index.css src/components/InventoryManager.tsx src/forgeInformationHierarchy.test.ts
git commit -m "feat: animate forge upgrades and fusion"
```

---

### Task 10: Full Regression, Responsive QA, and Release

**Files:**
- Modify only if a verified regression requires a focused fix.
- Do not touch `GAME_QA_REVIEW.md` or `qa-evidence/`.

**Interfaces:**
- Consumes all completed systems.
- Produces a verified GitHub commit and matching READY Vercel production deployment.

- [ ] **Step 1: Run every new focused test**

```powershell
npx tsx src/utils/combatSessionPresentation.test.ts
npx tsx src/combatSessionPresentationIntegration.test.ts
npx tsx src/storyProgressMigration.test.ts
npx tsx src/utils/aetherTransition.test.ts
npx tsx src/components/AetherCoreTransition.test.ts
npx tsx src/components/MainMenu.previewParity.test.ts
npx tsx src/App.menuExperience.test.ts
npx tsx src/utils/rewardReveal.test.ts
npx tsx src/rewardRevealIntegration.test.ts
npx tsx src/utils/forgePresentation.test.ts
npx tsx src/components/ForgeFocusStage.test.ts
npx tsx src/forgeInformationHierarchy.test.ts
```

Expected: all PASS.

- [ ] **Step 2: Run the full source test suite**

Run:

```powershell
$tests = Get-ChildItem src -Recurse -File | Where-Object { $_.Name -match '\.test\.tsx?$' }
foreach ($test in $tests) {
  npx tsx $test.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: every test exits 0. Fix only regressions caused by this implementation.

- [ ] **Step 3: Run static and production builds**

Run: `npm run lint`

Run: `npm run build`

Expected: both exit 0 without TypeScript or Vite errors.

- [ ] **Step 4: Start a hidden preview server**

Run: `npm run preview -- --host 127.0.0.1 --port 4176`

Expected: `http://127.0.0.1:4176/` responds successfully.

- [ ] **Step 5: Verify desktop navigation and presentation**

At 1920 x 1080, 1366 x 768, and 1024 x 768:

- Navigate Home, Story, Arena, Rogue, Summons, Forge, Party, Quests, Shop, and Wiki.
- Confirm one dark transition, destination color, no white/black flash, no duplicate title return, and no BGM overlap.
- Confirm Endless and Artifact records remain separate.
- Confirm Story uses chapter/stage and Character Story uses character/Act.
- Confirm Story victory displays clear/best/new-record rows.
- Confirm reward chips travel to visible anchors.
- Confirm weapon/artifact focus and successful operations animate once.

- [ ] **Step 6: Verify mobile landscape behavior**

At 844 x 390, 873 x 393, 915 x 412, and 800 x 360:

- Confirm the existing mobile fullscreen/landscape gate still works.
- Confirm transition transforms fit safe areas and do not intercept input after completion.
- Confirm reward travel does not cover combat controls or result confirmation buttons.
- Confirm Forge actions remain visible and scrollable with hidden scrollbars.
- Confirm reduced motion and low graphics remove orbiting decoration without hiding content.

- [ ] **Step 7: Inspect runtime errors and animation cleanup**

Check console errors, failed network requests, stale transition timers, duplicate reward events, and repeated navigation. Enter and leave Forge and combat repeatedly to confirm overlays and animations unmount cleanly.

- [ ] **Step 8: Commit any focused QA fixes**

```powershell
$fixedFiles = git diff --name-only -- src
if ($fixedFiles) { git add -- $fixedFiles }
git commit -m "fix: polish combat presentation release"
```

Skip this commit if no QA fixes are needed.

- [ ] **Step 9: Push GitHub main**

Run: `git push origin main`

Expected: remote `main` advances to the verified local SHA.

- [ ] **Step 10: Verify Vercel production**

Confirm the canonical production deployment is `READY`, serves the game without authentication, and reports the same Git SHA as GitHub `main`. Re-run one desktop and one mobile smoke test against production.
