# Mobile Remappable Controls and Combat Feel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent, individually remappable mobile combat controls and centralized combat-impact feedback across every battle mode without changing combat math or desktop controls.

**Architecture:** Keep device-layout rules, action timing, and impact selection in pure TypeScript modules with direct tests. `App` owns the editor state and passes one normalized layout into every `CombatArena`; the shared arena consumes one combat-impact profile system for anticipation, hit-stop, recoil, knockback, audio, and damage text.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Canvas 2D, Web Audio API, Tailwind CSS, Node test runner through `tsx`.

## Global Constraints

- Desktop keyboard, mouse, Settings, and HUD behavior must remain unchanged.
- Mobile controls remain touch-friendly in the enforced landscape launch flow.
- No damage formula, cooldown, gauge, reaction, reward, enemy HP, weather, character-kit, or Special Ultimate balance changes.
- No new audio files, Three.js/R3F dependency, cloud schema, currency, or save-state field.
- Control layout persists only in local storage under `aetheria_pref_mobile_control_layout_v1`.
- Hit-stop pauses combat simulation only and never blocks React UI or audio.
- Bosses never receive positional knockback.
- Existing mechanic-specific knockback must not be applied twice.
- Every manual edit uses `apply_patch`; unrelated QA files remain untouched.

---

## File Map

### Create

- `src/utils/mobileControlLayout.ts`: layout types, defaults, persistence, pixel conversion, clamping, and overlap validation.
- `src/utils/mobileControlLayout.test.ts`: pure layout and storage regression tests.
- `src/components/MobileControlEditor.tsx`: fullscreen mobile layout editor.
- `src/components/MobileControlEditor.test.ts`: source-level UI contract test matching the repository's existing component test style.
- `src/utils/combatImpact.ts`: impact profiles, sound priority, knockback vectors, hit-stop selection, and damage-text grouping rules.
- `src/utils/combatImpactFeedback.test.ts`: pure combat-impact tests.
- `src/utils/combatActionQueue.ts`: elapsed-time pending action queue for normal attacks and Skills.
- `src/utils/combatActionQueue.test.ts`: queue timing, pause, cancellation, and exactly-once tests.

### Modify

- `src/components/MobileJoystick.tsx`: consume an externally calculated style and preserve pointer capture.
- `src/components/MobileControls.tsx`: position five action buttons independently and expose stable accessible labels.
- `src/components/MainMenuSettingsModal.tsx`: mobile-only editor entry.
- `src/components/InGameSettingsModal.tsx`: mobile-only editor entry.
- `src/components/CombatArena.tsx`: consume layout, queue attacks, apply hit-stop/recoil/knockback, route impact audio, and group text.
- `src/App.tsx`: load/persist layout, open the editor, and pass layout to every arena instance.
- `src/utils/audio.ts`: add rate-limited synthesized impact tiers and a reusable noise buffer.
- `src/types.ts`: no save change; add no mobile layout field.

---

### Task 1: Mobile Control Layout Domain

**Files:**
- Create: `src/utils/mobileControlLayout.ts`
- Create: `src/utils/mobileControlLayout.test.ts`

**Interfaces:**
- Produces: `MobileControlId`, `MobileControlPlacement`, `MobileControlLayout`, `MobileControlMetrics`, `MOBILE_CONTROL_IDS`, `DEFAULT_MOBILE_CONTROL_LAYOUT`, `parseMobileControlLayout`, `loadMobileControlLayout`, `persistMobileControlLayout`, `toMobileControlPixelRect`, `clampMobileControlLayout`, and `getMobileControlLayoutErrors`.

- [ ] **Step 1: Write the failing layout tests**

```ts
import assert from 'node:assert/strict';
import {
  DEFAULT_MOBILE_CONTROL_LAYOUT,
  MOBILE_CONTROL_IDS,
  clampMobileControlLayout,
  getMobileControlLayoutErrors,
  loadMobileControlLayout,
  parseMobileControlLayout,
  persistMobileControlLayout,
} from './mobileControlLayout';

assert.deepEqual(Object.keys(DEFAULT_MOBILE_CONTROL_LAYOUT).sort(), [...MOBILE_CONTROL_IDS].sort());
assert.deepEqual(parseMobileControlLayout(null), DEFAULT_MOBILE_CONTROL_LAYOUT);
assert.deepEqual(parseMobileControlLayout('{bad json'), DEFAULT_MOBILE_CONTROL_LAYOUT);

const repaired = parseMobileControlLayout(JSON.stringify({
  attack: { x: 2, y: Number.NaN },
  joystick: { x: 0.1, y: 0.75 },
}));
assert.deepEqual(repaired.attack, DEFAULT_MOBILE_CONTROL_LAYOUT.attack);
assert.deepEqual(repaired.joystick, { x: 0.1, y: 0.75 });

const metrics = {
  width: 844,
  height: 390,
  safeInsets: { top: 12, right: 16, bottom: 12, left: 16 },
};
const clamped = clampMobileControlLayout({
  ...DEFAULT_MOBILE_CONTROL_LAYOUT,
  attack: { x: 1, y: 1 },
}, metrics);
assert.equal(getMobileControlLayoutErrors(clamped, metrics).length, 0);

const map = new Map<string, string>();
const storage = {
  getItem: (key: string) => map.get(key) ?? null,
  setItem: (key: string, value: string) => void map.set(key, value),
};
persistMobileControlLayout(storage, clamped);
assert.deepEqual(loadMobileControlLayout(storage), clamped);
```

- [ ] **Step 2: Run the layout test and verify RED**

Run: `npx tsx --test src/utils/mobileControlLayout.test.ts`

Expected: FAIL because `mobileControlLayout.ts` does not exist.

- [ ] **Step 3: Implement the layout model**

Use this public shape:

```ts
export const MOBILE_CONTROL_STORAGE_KEY = 'aetheria_pref_mobile_control_layout_v1';

export const MOBILE_CONTROL_IDS = [
  'joystick',
  'attack',
  'skill',
  'parry',
  'dash',
  'ultimate',
  'specialUltimate',
] as const;

export type MobileControlId = typeof MOBILE_CONTROL_IDS[number];
export interface MobileControlPlacement { x: number; y: number }
export type MobileControlLayout = Record<MobileControlId, MobileControlPlacement>;
export interface MobileSafeInsets { top: number; right: number; bottom: number; left: number }
export interface MobileControlMetrics { width: number; height: number; safeInsets: MobileSafeInsets }
```

Use fixed runtime sizes matching current controls: joystick 120, attack 72, Skill/Parry/Dash/Ultimate 44, Special Ultimate 240 by 64. Convert normalized centers to pixel rectangles. Clamp each rectangle inside safe insets. Report `joystick-overlap` above 20 percent and `action-overlap` above 35 percent of the smaller rectangle. Persistence catches storage exceptions and returns defaults rather than throwing.

- [ ] **Step 4: Run the layout test and verify GREEN**

Run: `npx tsx --test src/utils/mobileControlLayout.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the layout domain**

```powershell
git add -- src/utils/mobileControlLayout.ts src/utils/mobileControlLayout.test.ts
git commit -m "feat: add mobile control layout model"
```

---

### Task 2: Mobile Control Editor and Settings Entries

**Files:**
- Create: `src/components/MobileControlEditor.tsx`
- Create: `src/components/MobileControlEditor.test.ts`
- Modify: `src/components/MainMenuSettingsModal.tsx`
- Modify: `src/components/InGameSettingsModal.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `MobileControlLayout`, `DEFAULT_MOBILE_CONTROL_LAYOUT`, `clampMobileControlLayout`, `getMobileControlLayoutErrors`, `loadMobileControlLayout`, and `persistMobileControlLayout` from Task 1.
- Produces: `MobileControlEditor({ open, initialLayout, onCancel, onSave })` and App-owned `mobileControlLayout`.

- [ ] **Step 1: Write the failing editor contract test**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const editor = readFileSync(new URL('./MobileControlEditor.tsx', import.meta.url), 'utf8');
const mainSettings = readFileSync(new URL('./MainMenuSettingsModal.tsx', import.meta.url), 'utf8');
const gameSettings = readFileSync(new URL('./InGameSettingsModal.tsx', import.meta.url), 'utf8');

assert.match(editor, /setPointerCapture/);
assert.match(editor, /RESET DEFAULT/);
assert.match(editor, /SAVE LAYOUT/);
assert.match(editor, /specialUltimate/);
assert.match(editor, /getMobileControlLayoutErrors/);
assert.match(mainSettings, /CUSTOMIZE MOBILE CONTROLS/);
assert.match(gameSettings, /CUSTOMIZE MOBILE CONTROLS/);
assert.match(mainSettings, /isMobile/);
assert.match(gameSettings, /isMobile/);
```

- [ ] **Step 2: Run the editor test and verify RED**

Run: `npx tsx --test src/components/MobileControlEditor.test.ts`

Expected: FAIL because the editor file and Settings props do not exist.

- [ ] **Step 3: Implement the fullscreen editor**

Use this component contract:

```ts
interface MobileControlEditorProps {
  open: boolean;
  initialLayout: MobileControlLayout;
  onCancel: () => void;
  onSave: (layout: MobileControlLayout) => void;
}
```

Keep a draft layout while open. Measure the viewport and CSS safe insets. Use pointer capture while dragging. Convert pointer coordinates to normalized centers, clamp the draft, and validate overlaps. Render all seven controls with names, a selected outline, safe-area guide, and top-bar Reset/Cancel/Save commands. Disable Save when validation returns errors.

- [ ] **Step 4: Integrate both Settings surfaces and App persistence**

Add `isMobile` and `onOpenMobileControlEditor` props to both Settings modals. Render the button only when `isMobile` is true. In `App`, initialize layout through `loadMobileControlLayout(window.localStorage)`, mount one editor above all screens, and persist only after Save. Cancel leaves the active layout untouched.

- [ ] **Step 5: Run editor and layout tests**

Run: `npx tsx --test src/components/MobileControlEditor.test.ts src/utils/mobileControlLayout.test.ts`

Expected: PASS.

- [ ] **Step 6: Run TypeScript validation**

Run: `npm run lint`

Expected: PASS with no prop or pointer-event errors.

- [ ] **Step 7: Commit the editor**

```powershell
git add -- src/components/MobileControlEditor.tsx src/components/MobileControlEditor.test.ts src/components/MainMenuSettingsModal.tsx src/components/InGameSettingsModal.tsx src/App.tsx
git commit -m "feat: add mobile control layout editor"
```

---

### Task 3: Apply Individual Positions During Combat

**Files:**
- Modify: `src/components/MobileJoystick.tsx`
- Modify: `src/components/MobileControls.tsx`
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/MobileControlEditor.test.ts`

**Interfaces:**
- Consumes: `MobileControlLayout` and `toMobileControlPixelRect` from Task 1.
- Produces: `CombatArenaProps.mobileControlLayout`, `MobileJoystickProps.placementStyle`, and `MobileControlsProps.layoutStyles`.

- [ ] **Step 1: Extend the failing integration assertions**

Add these assertions to `MobileControlEditor.test.ts`:

```ts
const arena = readFileSync(new URL('./CombatArena.tsx', import.meta.url), 'utf8');
const controls = readFileSync(new URL('./MobileControls.tsx', import.meta.url), 'utf8');
const joystick = readFileSync(new URL('./MobileJoystick.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

assert.match(arena, /mobileControlLayout/);
assert.match(controls, /attack.*layoutStyles|layoutStyles.*attack/s);
assert.match(joystick, /placementStyle/);
assert.match(arena, /specialUltimate.*mobileControlLayout|mobileControlLayout.*specialUltimate/s);
assert.ok((app.match(/mobileControlLayout=/g) ?? []).length >= 3);
```

- [ ] **Step 2: Run the editor test and verify RED**

Run: `npx tsx --test src/components/MobileControlEditor.test.ts`

Expected: FAIL because combat components do not consume the layout.

- [ ] **Step 3: Refactor mobile controls to independent placement**

Make `MobileControls` a fixed `inset-0` pointer-transparent layer. Give each action button `pointer-events-auto` and the pixel style calculated by `CombatArena`. Preserve all current action callbacks, disabled states, cooldown overlays, Ultimate percentage, and Parry pointer-up/pointer-cancel behavior. Add stable labels: `Attack`, `Elemental Skill`, `Parry`, `Dash`, and `Ultimate`.

- [ ] **Step 4: Position joystick and Special Ultimate from the same layout**

Pass the joystick rectangle as `placementStyle`. Position the Special Ultimate button from `specialUltimate` while retaining its desktop placement and mobile-only text rules. Recalculate styles on resize/orientation change from the current arena dimensions and safe insets.

- [ ] **Step 5: Pass layout to every arena**

Set `mobileControlLayout={mobileControlLayout}` on Arena, Artifact Grind, Rogue, and Story `CombatArena` instances in `App`. Keep the prop optional with `DEFAULT_MOBILE_CONTROL_LAYOUT` as the component default for isolated tests.

- [ ] **Step 6: Run tests and TypeScript validation**

Run: `npx tsx --test src/components/MobileControlEditor.test.ts src/utils/mobileControlLayout.test.ts`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 7: Commit runtime positioning**

```powershell
git add -- src/components/MobileJoystick.tsx src/components/MobileControls.tsx src/components/CombatArena.tsx src/components/MobileControlEditor.test.ts src/App.tsx
git commit -m "feat: apply remapped mobile combat controls"
```

---

### Task 4: Combat Impact Profiles and Action Queue

**Files:**
- Create: `src/utils/combatImpact.ts`
- Create: `src/utils/combatImpactFeedback.test.ts`
- Create: `src/utils/combatActionQueue.ts`
- Create: `src/utils/combatActionQueue.test.ts`

**Interfaces:**
- Produces: `getCombatImpactProfile`, `getDirectionalKnockback`, `requestStrongestHitStop`, `selectImpactSoundRequest`, `createDamageTextBucket`, `mergeDamageTextBucket`, `createCombatActionQueue`, `enqueueCombatAction`, `tickCombatActionQueue`, and `clearCombatActionQueue`.

- [ ] **Step 1: Write the failing impact tests**

```ts
import assert from 'node:assert/strict';
import {
  getCombatImpactProfile,
  getDirectionalKnockback,
  requestStrongestHitStop,
  selectImpactSoundRequest,
} from './combatImpact';

const normal = getCombatImpactProfile({
  source: 'normal-attack', isCrit: false, targetClass: 'normal', combatSpeed: 1, screenShakeEnabled: true, shielded: false,
});
assert.equal(normal.anticipationMs, 45);
assert.equal(normal.hitStopMs, 35);

const elite = getCombatImpactProfile({
  source: 'elemental-skill', isCrit: false, targetClass: 'elite', combatSpeed: 1, screenShakeEnabled: true, shielded: false,
});
const boss = getCombatImpactProfile({
  source: 'elemental-skill', isCrit: false, targetClass: 'boss', combatSpeed: 1, screenShakeEnabled: true, shielded: false,
});
assert.equal(elite.knockbackDistance, 10);
assert.equal(boss.knockbackDistance, 0);
assert.equal(requestStrongestHitStop(35, 65), 65);
assert.equal(selectImpactSoundRequest({ tier: 'light', at: 100 }, { tier: 'critical', at: 110 }).tier, 'critical');
assert.deepEqual(getDirectionalKnockback({ x: 0, y: 0 }, { x: 3, y: 4 }, 10), { x: 6, y: 8 });
```

- [ ] **Step 2: Write the failing queue tests**

```ts
import assert from 'node:assert/strict';
import { createCombatActionQueue, enqueueCombatAction, tickCombatActionQueue } from './combatActionQueue';

let queue = createCombatActionQueue();
queue = enqueueCombatAction(queue, { id: 'a', kind: 'normal-attack', characterId: 'hero', remainingMs: 45, direction: { x: 1, y: 0 } });
let tick = tickCombatActionQueue(queue, 20, false);
assert.equal(tick.ready.length, 0);
tick = tickCombatActionQueue(tick.queue, 25, false);
assert.deepEqual(tick.ready.map(action => action.id), ['a']);
assert.equal(tick.queue.actions.length, 0);

queue = enqueueCombatAction(createCombatActionQueue(), { id: 'b', kind: 'elemental-skill', characterId: 'hero', remainingMs: 70, direction: { x: 0, y: 1 } });
assert.equal(tickCombatActionQueue(queue, 100, true).ready.length, 0);
```

- [ ] **Step 3: Run both tests and verify RED**

Run: `npx tsx --test src/utils/combatImpactFeedback.test.ts src/utils/combatActionQueue.test.ts`

Expected: FAIL because both modules are missing.

- [ ] **Step 4: Implement deterministic profiles**

Encode the exact durations and resistance rules from the approved specification. Divide anticipation and hit-stop by `Math.max(0.5, combatSpeed)`. Screen Shake off halves hit-stop and sets recoil to zero. Shielded Bulwarks multiply knockback by 0.25. Normalize directional vectors and return zero for coincident points.

Sound priority order is `light < heavy < shield < critical < boss`. Within the same throttle window, return the higher-priority request.

- [ ] **Step 5: Implement the elapsed-time queue**

Use immutable queue objects in tests and refs in runtime. Paused ticks return the same queue and no ready actions. A tick removes ready actions exactly once. `clearCombatActionQueue()` returns an empty queue.

- [ ] **Step 6: Run both tests and verify GREEN**

Run: `npx tsx --test src/utils/combatImpactFeedback.test.ts src/utils/combatActionQueue.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the pure combat domain**

```powershell
git add -- src/utils/combatImpact.ts src/utils/combatImpactFeedback.test.ts src/utils/combatActionQueue.ts src/utils/combatActionQueue.test.ts
git commit -m "feat: add combat impact timing rules"
```

---

### Task 5: Rate-Limited Impact Audio

**Files:**
- Modify: `src/utils/audio.ts`
- Modify: `src/utils/combatImpactFeedback.test.ts`
- Modify: `src/components/CombatArena.tsx`

**Interfaces:**
- Consumes: `ImpactSoundTier` and `selectImpactSoundRequest` from Task 4.
- Produces: `AetheriaAudioEngine.playCombatImpact(tier, element, isCritical)`.

- [ ] **Step 1: Add a failing audio contract assertion**

Append to `combatImpactFeedback.test.ts`:

```ts
import { readFileSync } from 'node:fs';
const audioSource = readFileSync(new URL('./audio.ts', import.meta.url), 'utf8');
assert.match(audioSource, /playCombatImpact/);
assert.match(audioSource, /DynamicsCompressor/);
assert.match(audioSource, /impactNoiseBuffer/);
```

- [ ] **Step 2: Run the impact test and verify RED**

Run: `npx tsx --test src/utils/combatImpactFeedback.test.ts`

Expected: FAIL because the audio engine lacks the new method.

- [ ] **Step 3: Implement synthesized impact tiers**

Create one short noise buffer after the AudioContext is available. Route impact oscillators/noise through a dynamics compressor into the existing SFX gain. Track the last impact timestamp and tier. Throttle light to 30 ms and heavy to 45 ms; allow a higher-priority request to replace a lower one in the same window. Preserve mute and SFX volume behavior. Catch audio-node failures and call `playHit()` as fallback.

- [ ] **Step 4: Route arena impacts through the new method**

Remove the unconditional identical `playHit()` call from each damage event. Request one tier from the strongest impact accumulated in the current frame. Keep slash anticipation audio on input.

- [ ] **Step 5: Run tests and TypeScript validation**

Run: `npx tsx --test src/utils/combatImpactFeedback.test.ts src/utils/bgm.test.ts src/utils/specialUltimateBgm.test.ts`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 6: Commit impact audio**

```powershell
git add -- src/utils/audio.ts src/utils/combatImpactFeedback.test.ts src/components/CombatArena.tsx
git commit -m "feat: add layered combat impact audio"
```

---

### Task 6: Anticipation, Hit-Stop, Recoil, and Knockback Integration

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/combatGameplayRules.test.ts`
- Modify: `src/utils/combatActionQueue.test.ts`

**Interfaces:**
- Consumes: all Task 4 queue and impact functions plus Task 5 audio method.

- [ ] **Step 1: Add failing arena integration assertions**

Append to `combatGameplayRules.test.ts`:

```ts
assert.match(source, /combatActionQueueRef/);
assert.match(source, /hitStopRemainingMsRef/);
assert.match(source, /visualRecoilRef/);
assert.match(source, /getDirectionalKnockback/);
assert.match(source, /clearCombatActionQueue/);
assert.doesNotMatch(source, /AetheriaAudioEngine\.playHit\(\);/);
```

- [ ] **Step 2: Run integration tests and verify RED**

Run: `npx tsx --test src/combatGameplayRules.test.ts src/utils/combatActionQueue.test.ts src/utils/combatImpactFeedback.test.ts`

Expected: FAIL because the arena has not integrated the new refs.

- [ ] **Step 3: Split input from normal-attack resolution**

Keep `triggerBasicAttack` as the input validator. Start cooldown immediately, play Slash, store character ID and direction, render the anticipation arc, and enqueue 45 ms. Move current collision/damage code into `resolveBasicAttack(action)`. Before resolution, confirm battle is active and the queued character still exists. Do not require that the same character remains active; cancel on character swap to avoid applying another character's stats.

- [ ] **Step 4: Split input from immediate Skill resolution**

Keep cooldown validation in `triggerElementalSkill`, start cooldown immediately, enqueue 70 ms, and move the current effect body into `resolveElementalSkill(action)`. Cancel on swap, death, restart, battle end, or unmount. Ultimates retain existing timing.

- [ ] **Step 5: Tick and clear the action queue**

Tick by elapsed frame milliseconds multiplied by combat speed. Do not advance while paused, game-over, counting down, or in an Ultimate cutscene. Execute each ready action once. Clear on restart, result transition, exit cleanup, and unmount.

- [ ] **Step 6: Add frame-level hit-stop accumulation**

Each direct damage call requests a profile. Store the maximum requested duration and strongest sound tier for the frame. At the top of the next world update, decrement `hitStopRemainingMsRef` by elapsed real milliseconds and schedule the next animation frame without mutating world state while positive. Keep the already-drawn canvas frame visible.

- [ ] **Step 7: Add visual recoil and target knockback**

Draw the player with `visualRecoilRef` offset and ease it to zero over 90 ms. For non-mechanic direct impacts, use attacker-to-target direction and profile distance. Multiply Elite and shielded Bulwark resistance through the profile. Clamp target coordinates. Do not move Bosses or reapply knockback for Overloaded, Calamity Blaze, or actions already carrying configured knockback.

- [ ] **Step 8: Run focused tests and lint**

Run: `npx tsx --test src/combatGameplayRules.test.ts src/utils/combatActionQueue.test.ts src/utils/combatImpactFeedback.test.ts src/limitedCharacterCombat.test.ts src/campaignBossCombatIntegration.test.ts`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 9: Commit combat integration**

```powershell
git add -- src/components/CombatArena.tsx src/combatGameplayRules.test.ts src/utils/combatActionQueue.test.ts
git commit -m "feat: add responsive combat impact feedback"
```

---

### Task 7: Cleaner and Grouped Damage Text

**Files:**
- Modify: `src/utils/combatImpact.ts`
- Modify: `src/utils/combatImpactFeedback.test.ts`
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/components/combat/CombatVisuals.tsx`

**Interfaces:**
- Consumes: `createDamageTextBucket` and `mergeDamageTextBucket` from Task 4.

- [ ] **Step 1: Add failing grouping and source-copy tests**

Append to `combatImpactFeedback.test.ts`:

```ts
const first = createDamageTextBucket({ targetId: 'enemy', source: 'normal-attack', amount: 100, isCrit: false, reaction: '', at: 100 });
const merged = mergeDamageTextBucket(first, { targetId: 'enemy', source: 'normal-attack', amount: 75, isCrit: false, reaction: '', at: 180 });
assert.equal(merged?.amount, 175);
assert.equal(merged?.hitCount, 2);
assert.equal(mergeDamageTextBucket(first, { targetId: 'enemy', source: 'normal-attack', amount: 75, isCrit: true, reaction: '', at: 180 }), null);

const arenaSource = readFileSync(new URL('../components/CombatArena.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(arenaSource, /`Click \$\{finalDmg\}`/);
assert.doesNotMatch(arenaSource, /`Skill \$\{finalDmg\}`/);
assert.doesNotMatch(arenaSource, /`ULT \$\{finalDmg\}`/);
```

- [ ] **Step 2: Run the impact test and verify RED**

Run: `npx tsx --test src/utils/combatImpactFeedback.test.ts`

Expected: FAIL while the old source labels remain and grouping is incomplete.

- [ ] **Step 3: Implement 90 ms compatible grouping**

Key buckets by target ID, source, critical state, reaction, and damage skin. Compatible events within 90 ms update one DOM floater to `total x hitCount`. Critical and reaction events never merge with incompatible events. Damage-over-time uses a smaller style and does not animate as critical.

- [ ] **Step 4: Clean runtime copy and cap floaters**

Normal damage is only the formatted number. Critical damage is `CRIT number` in gold and larger. Keep one separate reaction line. Remove `Click`, `Skill`, and `ULT` source words. Cap at 24 floaters, removing the oldest non-critical entry first. Reduce position jitter to plus or minus 10 pixels.

- [ ] **Step 5: Preserve damage skins**

Apply Ice, Void, and Celestial formatting after grouping so the final total is wrapped exactly once. Keep the current Celestial critical flash and one-particle critical budget.

- [ ] **Step 6: Run focused tests and lint**

Run: `npx tsx --test src/utils/combatImpactFeedback.test.ts src/combatGameplayRules.test.ts src/releaseUiFixes.test.ts`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 7: Commit damage-text cleanup**

```powershell
git add -- src/utils/combatImpact.ts src/utils/combatImpactFeedback.test.ts src/components/CombatArena.tsx src/components/combat/CombatVisuals.tsx
git commit -m "fix: simplify combat damage text"
```

---

### Task 8: Full Regression, Responsive QA, and Publication

**Files:**
- Modify only files required by confirmed verification defects.

**Interfaces:**
- Consumes: completed Tasks 1-7.

- [ ] **Step 1: Run the full tracked test suite**

Run: `npx tsx --test --test-reporter=dot`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run TypeScript, build, and whitespace gates**

Run: `npm run lint`

Expected: PASS.

Run: `npm run build`

Expected: PASS and PWA assets generated.

Run: `git diff --check`

Expected: no output and exit code 0.

- [ ] **Step 3: Verify mobile Settings and persistence in-browser**

Start the production preview on an unused localhost port. At 844 by 390, 873 by 393, and 915 by 412:

- Open both Settings surfaces.
- Open the editor, drag every control, reject an overlap, save a valid layout, reload, and confirm positions persist.
- Reset to default and verify all controls remain inside safe bounds.
- Confirm no document-level horizontal overflow or console errors.

- [ ] **Step 4: Verify combat on mobile**

Use a valid party in Arena and one Story battle. Hold joystick while pressing each action. Verify cooldowns, Parry release, Special Ultimate placement, anticipation, hit-stop, recoil, Normal/Elite/Boss knockback, impact sounds, and grouped damage text. Confirm pause, restart, and exit clear pending feedback.

- [ ] **Step 5: Verify desktop remains unchanged**

At 1366 by 768 and 1920 by 1080:

- Confirm neither Settings surface shows mobile customization.
- Confirm mouse attack and W/A/S/D, E, Q, Z, Space, and C bindings still work.
- Confirm combat polish appears without mobile controls or horizontal overflow.

- [ ] **Step 6: Inspect final scope**

Run: `git status --short`

Expected: only intended implementation files plus the pre-existing untracked `GAME_QA_REVIEW.md` and `qa-evidence/`.

- [ ] **Step 7: Commit any verified final corrections**

Stage only intended files and commit with a focused message. Do not stage `GAME_QA_REVIEW.md` or `qa-evidence/`.

- [ ] **Step 8: Push and verify Vercel**

Run: `git push origin main`

Verify the latest production deployment is `READY`, its Git SHA matches local `HEAD`, and `https://elemental-battleground.vercel.app/` passes fresh mobile and desktop launch checks.
