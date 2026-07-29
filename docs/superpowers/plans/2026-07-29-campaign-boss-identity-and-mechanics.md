# Campaign Boss Identity and Mechanics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize every Story Campaign Stage 5 boss identity, personalize campaign dialogue with the player's username, and add seven isolated lore-specific mechanics for Chapters 4-10.

**Architecture:** A shared campaign boss registry owns names and encyclopedia copy. Story scenes are personalized at display time by a pure helper. A pure campaign mechanic scheduler returns lightweight combat actions that `CombatArena` translates through its existing canvas projectiles, warnings, patches, player movement, and damage systems; all non-campaign bosses continue through the unchanged legacy profiles.

**Tech Stack:** React 19, TypeScript, Vite, HTML Canvas 2D, Node test runner through `tsx`.

## Global Constraints

- Keep Chapter 1-3 boss names and mechanics.
- Change only Story Campaign boss mechanics; World, Arena, Artifact Grind, Rogue, and Character Trial bosses remain unchanged.
- Do not change boss models, model VFX, animation identities, colors, or rendering.
- Use the current cloud username in Story Campaign dialogue and `Traveler` when no username is available.
- Keep desktop and mobile controls unchanged.
- Reuse existing canvas projectiles, warnings, patches, floating text, damage, and movement systems.
- Do not add per-frame React state or extra canvas layers.
- Stage card, dialogue speaker, battle HUD, and Boss encyclopedia must use the same campaign boss name.

---

### Task 1: Shared Campaign Boss Registry and Identity Synchronization

**Files:**
- Create: `src/data/story/campaignBosses.ts`
- Modify: `src/data/story/types.ts`
- Modify: `src/data/storyStages.ts`
- Modify: `src/data/story/campaign/chapter4.ts`
- Modify: `src/data/story/campaign/chapter5.ts`
- Modify: `src/data/story/campaign/chapter6.ts`
- Modify: `src/data/story/campaign/chapter7.ts`
- Modify: `src/data/story/campaign/chapter8.ts`
- Modify: `src/data/story/campaign/chapter9.ts`
- Modify: `src/data/story/campaign/chapter10.ts`
- Modify: `src/utils/bossIdentities.ts`
- Create: `src/data/story/campaignBosses.test.ts`
- Modify: `src/utils/bossIdentities.test.ts`

**Interfaces:**
- Produces:

```ts
export type CampaignBossMechanicId =
  | 'sepulchral-silence'
  | 'vowclock-edict'
  | 'seasonal-convergence'
  | 'seven-anchor-dominion'
  | 'worldforge-root'
  | 'one-perfect-second'
  | 'sevenfold-convergence';

export interface CampaignBossDefinition {
  stageId: `${number}-5`;
  identityId: string;
  name: string;
  element: ElementType;
  legacyBossType: 'fire_dragon' | 'ice_golem' | 'thunderbird';
  campaignMechanicId?: CampaignBossMechanicId;
  skillName: string;
  mechanic: string;
  counter: string;
}

export const CAMPAIGN_BOSSES: Readonly<Record<`${number}-5`, CampaignBossDefinition>>;
export const getCampaignBossForStage: (stageId: string) => CampaignBossDefinition | undefined;
export const createCampaignBossEnemySpec: (stageId: string, level: number) => StoryEnemySpec;
```

- `StoryEnemySpec` gains:

```ts
campaignMechanicId?: CampaignBossMechanicId;
```

- `BossIdentity` gains the same optional property so the encyclopedia can expose campaign-only scheduling without changing models.

- [ ] **Step 1: Write failing campaign registry tests**

Create tests that assert:

```ts
for (let chapter = 1; chapter <= 10; chapter += 1) {
  const stageId = `${chapter}-5`;
  const stage = getStageSpec(stageId);
  const boss = stage.enemies.find(enemy => enemy.type === 'Boss');
  const definition = getCampaignBossForStage(stageId);
  assert.ok(boss);
  assert.ok(definition);
  assert.equal(stage.name, definition.name);
  assert.equal(boss.name, definition.name);
}

assert.deepEqual(
  Array.from({ length: 7 }, (_, index) => getCampaignBossForStage(`${index + 4}-5`)?.name),
  [
    "Nhal'Kyr, Warden of Whispers",
    'Aevum, Knight of the Last Vow',
    'Rimeflare, Wyrm of Two Seasons',
    'Aureolith, the Crownless Skywarden',
    'Verdigris, Root of the First Command',
    'Solvane, Monarch of the Final Second',
    'Orison Prime, Keeper of the Empty Throne',
  ]
);

const newIds = Array.from(
  { length: 7 },
  (_, index) => getCampaignBossForStage(`${index + 4}-5`)?.campaignMechanicId
);
assert.equal(new Set(newIds).size, 7);
assert.equal(newIds.every(Boolean), true);
```

Extend `bossIdentities.test.ts` to assert each campaign identity matches its registry name, skill, mechanic, counter, and optional campaign mechanic ID.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
npx tsx --test src/data/story/campaignBosses.test.ts src/utils/bossIdentities.test.ts
```

Expected: FAIL because `campaignBosses.ts`, the new type, and synchronized names do not exist.

- [ ] **Step 3: Implement the shared registry**

Create all ten definitions. Chapters 1-3 use their current names, skill copy, and no campaign-only mechanic ID. Chapters 4-10 use the seven approved names and mechanic copy from the design specification.

Add `campaignMechanicId` to `StoryEnemySpec`. Implement `createCampaignBossEnemySpec()` so it copies name, element, `legacyBossType` to `bossType`, and the optional campaign mechanic ID.

- [ ] **Step 4: Replace duplicated stage and dialogue boss names**

For each Stage 5 definition, declare:

```ts
const BOSS = CAMPAIGN_BOSSES['4-5'];
```

Then use:

```ts
name: BOSS.name,
enemies: [createCampaignBossEnemySpec(BOSS.stageId, 53)],
beforeSlides: [
  { speaker: BOSS.name, element: BOSS.element, text: 'NO KING PASSES. NO GRIEF LEAVES.' },
]
```

Apply the same pattern to Chapters 1-3 inside `storyStages.ts` and Chapters 4-10 in their authored chapter files.

- [ ] **Step 5: Make Boss encyclopedia campaign entries consume the registry**

Keep every existing `identityId`, `visualKind`, color, and secondary color. Replace duplicated names and mechanic copy with the matching `CAMPAIGN_BOSSES` entry.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```powershell
npx tsx --test src/data/story/campaignBosses.test.ts src/utils/bossIdentities.test.ts src/storyBossRules.test.ts src/storyCampaign45.test.ts src/storyCampaign68.test.ts src/storyCampaign910.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the registry task**

```powershell
git add src/data/story src/data/storyStages.ts src/utils/bossIdentities.ts src/utils/bossIdentities.test.ts
git commit -m "feat: synchronize campaign boss identities"
```

---

### Task 2: Story Campaign Username Personalization

**Files:**
- Create: `src/utils/storyDialoguePersonalization.ts`
- Create: `src/utils/storyDialoguePersonalization.test.ts`
- Modify: `src/components/StoryMode.tsx`
- Modify: `src/App.tsx`
- Create: `src/storyDialogueIntegration.test.ts`

**Interfaces:**
- Produces:

```ts
export const getCampaignPlayerName = (username: string | null | undefined) => string;
export const personalizeCampaignDialogueLine = (
  line: StoryDialogueLine,
  username: string | null | undefined
) => StoryDialogueLine;
export const personalizeCampaignScene = (
  scene: StoryScene,
  username: string | null | undefined
) => StoryScene;
```

- `StoryModeProps` gains:

```ts
playerUsername?: string | null;
```

- [ ] **Step 1: Write failing personalization unit tests**

Cover exact speaker replacement, whole-word text replacement, source immutability, unrelated names, and guest fallback:

```ts
const source: StoryScene = {
  slides: [
    { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Eldric will hold the line.' },
    { speaker: 'Marina', element: 'Hydro', text: 'You feel it too, Eldric?' },
  ],
  backgroundId: 'chapter-1',
};

const personalized = personalizeCampaignScene(source, 'sadin');
assert.equal(personalized.slides[0].speaker, 'sadin');
assert.equal(personalized.slides[0].text, 'sadin will hold the line.');
assert.equal(personalized.slides[1].text, 'You feel it too, sadin?');
assert.equal(source.slides[0].speaker, 'Eldric Thorne');
assert.equal(personalizeCampaignScene(source, '   ').slides[0].speaker, 'Traveler');
```

- [ ] **Step 2: Run the unit test and verify RED**

Run:

```powershell
npx tsx --test src/utils/storyDialoguePersonalization.test.ts
```

Expected: FAIL because the helper module does not exist.

- [ ] **Step 3: Implement the pure helper**

Normalize the username with `trim()`. Replace `Eldric Thorne` before `Eldric` using whole-word, case-sensitive regular expressions. Return copied scene and line objects.

- [ ] **Step 4: Run the unit test and verify GREEN**

Run:

```powershell
npx tsx --test src/utils/storyDialoguePersonalization.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing integration tests**

Assert `App.tsx` passes `cloudAccount.profile?.username` to `StoryMode`, `StoryMode` personalizes campaign pre-battle scenes, and `App` personalizes campaign post-battle scenes but leaves Character Story scenes untouched.

- [ ] **Step 6: Run the integration test and verify RED**

Run:

```powershell
npx tsx --test src/storyDialogueIntegration.test.ts
```

Expected: FAIL because the prop and integration calls are absent.

- [ ] **Step 7: Integrate pre-battle and post-battle personalization**

In `StoryMode`, wrap campaign scenes immediately before setting `activeCutsceneScene`. In `App`, wrap only the non-character Story Campaign victory scene. Pass:

```tsx
playerUsername={cloudAccount.profile?.username ?? null}
```

- [ ] **Step 8: Run focused integration tests and verify GREEN**

Run:

```powershell
npx tsx --test src/utils/storyDialoguePersonalization.test.ts src/storyDialogueIntegration.test.ts src/storyModeLimitedLore.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit the dialogue task**

```powershell
git add src/utils/storyDialoguePersonalization.ts src/utils/storyDialoguePersonalization.test.ts src/components/StoryMode.tsx src/App.tsx src/storyDialogueIntegration.test.ts
git commit -m "feat: personalize campaign dialogue"
```

---

### Task 3: Pure Campaign Boss Mechanic Scheduler

**Files:**
- Create: `src/utils/campaignBossMechanics.ts`
- Create: `src/utils/campaignBossMechanics.test.ts`

**Interfaces:**
- Consumes: `CampaignBossMechanicId` from `src/data/story/types.ts`.
- Produces:

```ts
export interface CampaignBossMechanicState {
  timers: Record<string, number>;
  mode?: 'frost' | 'flame';
  pullFrames?: number;
  recordedTargets?: Array<{ x: number; y: number }>;
}

export interface CampaignBossMechanicContext {
  mechanicId: CampaignBossMechanicId;
  phase: 1 | 2 | 3;
  combatSpeed: number;
  bossX: number;
  bossY: number;
  targetX: number;
  targetY: number;
  random: () => number;
}

export type CampaignBossAction =
  | {
      kind: 'projectile';
      projectileType: 'fireball' | 'ice_shard';
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      damage: number;
      element: ElementType;
      color: string;
      timer: number;
    }
  | {
      kind: 'warning';
      x: number;
      y: number;
      radius: number;
      innerRadius?: number;
      damage: number;
      element: ElementType;
      color: string;
      delayFrames: number;
      label: string;
      knockback?: number;
    }
  | {
      kind: 'patch';
      x: number;
      y: number;
      radius: number;
      damage: number;
      element: ElementType;
      color: string;
      durationFrames: number;
      label: string;
    }
  | { kind: 'pull'; strength: number }
  | { kind: 'text'; text: string; color: string; emphasized?: boolean };

export interface CampaignBossMechanicStep {
  state: CampaignBossMechanicState;
  actions: CampaignBossAction[];
}

export const createCampaignBossMechanicState = (): CampaignBossMechanicState;
export const stepCampaignBossMechanic = (
  state: CampaignBossMechanicState,
  context: CampaignBossMechanicContext
) => CampaignBossMechanicStep;
```

- [ ] **Step 1: Write failing scheduler tests for all seven mechanics**

For each ID, advance the scheduler with a deterministic `random: () => 0.25` until its thresholds and assert:

- `sepulchral-silence`: seven radial shard projectiles in Phase I, ring warnings in Phase II, boss-centered pulse warning in Phase III.
- `vowclock-edict`: crossed clock-hand warnings, recorded-position echo warnings, shorter Phase III intervals.
- `seasonal-convergence`: alternating Flame and Frost projectile types, alternating patches in Phase II, meteor-style warning plus Frost fan in Phase III.
- `seven-anchor-dominion`: anchor formation warnings, active pull window in Phase II, wider final formation with an escape gap.
- `worldforge-root`: root-cage warnings, persistent patches, staggered chained eruption warnings.
- `one-perfect-second`: stored target history, delayed warnings at previous positions, clockface warnings, faster final sequence.
- `sevenfold-convergence`: seven colored sequential warnings, annular collapsing warnings using `innerRadius`, final convergence pattern.

Also assert every warning has at least 30 frames of telegraph time and no single scheduler step produces more than 16 actions.

- [ ] **Step 2: Run the scheduler test and verify RED**

Run:

```powershell
npx tsx --test src/utils/campaignBossMechanics.test.ts
```

Expected: FAIL because the scheduler module does not exist.

- [ ] **Step 3: Implement shared scheduler helpers**

Implement immutable timer updates, `warningRing()`, `radialProjectiles()`, `crossWarnings()`, `recordTarget()`, and `staggeredLineWarnings()` helpers. Keep the public scheduler switch exhaustive with a `never` check.

- [ ] **Step 4: Implement the seven mechanic branches**

Use the exact phase behavior and safe telegraph limits from the design. Return action data only; do not access DOM, React state, canvas, or mutable refs.

- [ ] **Step 5: Run scheduler tests and verify GREEN**

Run:

```powershell
npx tsx --test src/utils/campaignBossMechanics.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the scheduler task**

```powershell
git add src/utils/campaignBossMechanics.ts src/utils/campaignBossMechanics.test.ts
git commit -m "feat: add campaign boss mechanic scheduler"
```

---

### Task 4: CombatArena Campaign Mechanic Integration

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Create: `src/campaignBossCombatIntegration.test.ts`
- Modify: `src/components/combat/bossModelRenderer.test.ts`

**Interfaces:**
- Consumes: `createCampaignBossMechanicState()` and `stepCampaignBossMechanic()`.
- Runtime Story Campaign boss receives:

```ts
campaignMechanicId: enemySpec.campaignMechanicId;
campaignMechanicState: createCampaignBossMechanicState();
```

- New internal canvas projectile records:

```ts
{
  type: 'campaign_boss_warning';
  innerRadius?: number;
  impactLabel: string;
  ownerId: string;
}

{
  type: 'campaign_boss_patch';
  impactLabel: string;
  ownerId: string;
}
```

- [ ] **Step 1: Write failing combat integration contract tests**

Assert that:

- story boss spawning copies `campaignMechanicId`;
- random world boss spawning does not set it;
- Character Trial stage definitions have no campaign mechanic ID;
- `CombatArena` calls the scheduler before the legacy `bossType` branches;
- legacy branches run only when no campaign mechanic ID is present;
- warning collision, pending-hazard detection, drawing, and impact labels include `campaign_boss_warning`;
- patch collision and drawing include `campaign_boss_patch`;
- `drawBossModel` remains unchanged and does not consume mechanic actions.

- [ ] **Step 2: Run integration tests and verify RED**

Run:

```powershell
npx tsx --test src/campaignBossCombatIntegration.test.ts src/components/combat/bossModelRenderer.test.ts
```

Expected: FAIL because the scheduler is not integrated.

- [ ] **Step 3: Copy campaign mechanic identity during Story Campaign spawning**

Add the optional ID and initialized mechanic state to the boss object created from `StoryEnemySpec`. Do not add either property in `spawnRandomBoss()`.

- [ ] **Step 4: Translate scheduler actions**

Add one local adapter that:

- pushes projectile actions as existing `fireball` or `ice_shard` records;
- pushes warning actions as `campaign_boss_warning`;
- pushes patch actions as `campaign_boss_patch`;
- clamps pull movement to `WORLD_WIDTH` and `WORLD_HEIGHT`;
- sends text actions through `spawnTextRef`.

- [ ] **Step 5: Extend existing projectile update and drawing paths**

For annular warnings, collision is:

```ts
const insideOuter = distToPlayer < proj.radius;
const outsideInner = proj.innerRadius === undefined || distToPlayer > proj.innerRadius;
const playerInsideWarning = insideOuter && outsideInner;
```

Draw annular warnings with even-odd fill or two arcs. Use `impactLabel` instead of hard-coded meteor or bolt text. Draw campaign patches with their stored color and current patch alpha.

- [ ] **Step 6: Dispatch campaign mechanics before legacy mechanics**

Inside the Boss AI block:

```ts
if (enemy.campaignMechanicId) {
  const step = stepCampaignBossMechanic(enemy.campaignMechanicState, context);
  enemy.campaignMechanicState = step.state;
  applyCampaignBossActions(enemy, step.actions);
} else if (enemy.bossType === 'fire_dragon') {
  // existing logic unchanged
}
```

- [ ] **Step 7: Run focused tests and verify GREEN**

Run:

```powershell
npx tsx --test src/campaignBossCombatIntegration.test.ts src/utils/campaignBossMechanics.test.ts src/components/combat/bossModelRenderer.test.ts src/enemyArchetypeIntegration.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit the combat integration task**

```powershell
git add src/components/CombatArena.tsx src/campaignBossCombatIntegration.test.ts src/components/combat/bossModelRenderer.test.ts
git commit -m "feat: integrate unique story boss mechanics"
```

---

### Task 5: Full Verification, Device QA, and Release

**Files:**
- Modify only if verification exposes a scoped defect.

**Interfaces:**
- Consumes the completed registry, personalization helper, scheduler, and combat adapter.
- Produces a verified GitHub `main` commit and matching `READY` Vercel production deployment.

- [ ] **Step 1: Run all tracked tests**

```powershell
$log = Join-Path $env:TEMP 'elemental-campaign-boss-tests.log'
npx tsx --test "src/**/*.test.ts" "src/**/*.test.tsx" *> $log
$code = $LASTEXITCODE
Get-Content -LiteralPath $log -Tail 50
exit $code
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run TypeScript and production checks**

```powershell
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 3: Verify desktop Story Campaign flow**

At a desktop viewport:

- confirm Stage 1-5, 2-5, and 3-5 card names equal their battle boss names;
- confirm all Chapter 4-10 new names on stage cards;
- start one renamed boss stage with developer unlocks;
- confirm username replacement in pre-battle dialogue;
- confirm battle HUD uses the same name;
- confirm the Boss encyclopedia uses the same name, skill, mechanic, and counter.

- [ ] **Step 4: Verify mobile Story Campaign flow**

At `390x844`:

- confirm campaign cards remain scrollable without horizontal page overflow;
- confirm long boss names wrap without clipping;
- confirm dialogue username and battle HUD remain readable;
- confirm warning markers and mobile controls do not overlap critically.

- [ ] **Step 5: Verify isolation**

Open one Combat Arena boss, one Rogue boss, and one Character Story Trial boss. Confirm their existing names, models, and three legacy mechanic profiles remain unchanged.

- [ ] **Step 6: Commit any final scoped fixes**

```powershell
git add -u -- src/App.tsx src/components/StoryMode.tsx src/components/CombatArena.tsx src/data/story src/data/storyStages.ts src/utils/bossIdentities.ts src/utils/campaignBossMechanics.ts src/utils/storyDialoguePersonalization.ts
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "fix: polish campaign boss integration"
}
```

Skip this step when QA requires no fixes.

- [ ] **Step 7: Push GitHub main**

```powershell
git push origin main
```

- [ ] **Step 8: Verify Vercel exact-commit deployment**

Match `githubCommitSha` to `git rev-parse HEAD`, confirm `readyState: READY`, confirm the production alias loads, repeat a production Boss encyclopedia check, and confirm no recent Vercel runtime errors.

- [ ] **Step 9: Report the complete change summary**

List:

- the username substitution behavior;
- Chapters 1-3 stage-title synchronization;
- every Chapter 4-10 old name and new name;
- each new skill, mechanic phases, and counter;
- unchanged systems;
- automated and device verification;
- GitHub commit and Vercel production URL.
