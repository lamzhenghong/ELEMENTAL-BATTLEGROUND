# Combat Records, Aether Transitions, Reward Reveals, and Forge Focus Design

## Summary

Correct mode-specific combat labels and records, replace direct screen swaps with one dark Aether Core transition system, add lightweight reward travel animations, and make the selected Forge item the visual focus during upgrades and fusion. The implementation must preserve combat balance, reward values, inventory behavior, BGM content, mobile landscape behavior, and existing game-mode progression.

The transition takes inspiration from the ceremonial clarity of anime RPG loading screens, but it uses original Elemental Battleground artwork, motion, colors, timing, and composition. It must not reproduce another game's white background, exact icon row, symbols, or animation.

## Goals

- Show the correct mode, chapter, Act, room, stage, wave, and record in every combat surface.
- Keep Endless Arena and Artifact Grind wave records independent.
- Save fastest clear times for Story stages, Character Story Acts, and completed Rogue Ruins runs.
- Remove white and black flashes between application screens.
- Give every section a recognizable elemental transition color without introducing separate transition implementations.
- Make earned rewards feel physical by moving them toward the relevant UI destination.
- Make Forge upgrades and fusion visually centered on the selected weapon or artifact.
- Keep all changes responsive and performant on desktop and mobile.

## Non-Goals

- No combat damage, enemy, wave, reward-value, pity, inventory-capacity, or drop-rate changes.
- No BGM replacement or new audio content.
- No change to mobile fullscreen or landscape admission behavior.
- No rewrite of the existing combat engine.
- No new Three.js dependency for these UI effects.
- No photorealistic 3D weapon or artifact model production.
- No reward animation for spending or losing currency.
- No copying of third-party loading assets, symbols, layout, or exact timings.

## Current Problems

### Combat Presentation

- `CombatArena` currently labels the active encounter as a wave even during Story battles.
- The top record badge always displays the Endless Arena wave record.
- Story deployment, pause, defeat, and victory surfaces do not share one mode-aware presentation model.
- Story duration is measured but not stored as a per-stage best time.
- Rogue Ruins stores deepest room progress but not a completed-run best time.

### Record Integrity

- Story and Rogue Ruins return through separate completion paths, so they do not overwrite the Endless Arena record. Their current Arena record display is a presentation bug.
- Artifact Grind uses the same `highScoreWave` update path as Endless Arena. It can overwrite the Arena record and therefore requires a data fix, not only a label fix.

### Navigation

- Most screens call `setActiveScreen` directly.
- The existing main-menu transition is specialized for entering and returning from the title, so normal navigation can expose the old or new screen before the overlay is fully opaque.
- Content and BGM changes are not coordinated through one navigation transaction, allowing flashes during some route changes.

### Rewards and Forge

- Rewards update counters immediately with little spatial feedback.
- Weapons and artifacts have structured identity but no per-item model assets.
- Forge controls are functional, but the selected item does not dominate the composition and successful operations lack a focused visual ritual.

## Architecture

Implement four focused shared systems:

1. `CombatSessionPresentation`
   - Produces mode-aware labels, progress text, record type, and record value.
2. `AetherCoreTransition`
   - Owns the single full-screen transition lifecycle for application navigation.
3. `RewardRevealLayer`
   - Queues, groups, animates, and completes positive reward reveals.
4. `ForgeFocusStage`
   - Renders a lightweight weapon or artifact silhouette and operation animation.

Each system exposes a small typed interface. Feature components consume the output and do not duplicate mode or animation rules.

## Combat Session Presentation

### Session Model

Add a pure session-presentation helper with explicit modes:

```ts
export type CombatSessionMode =
  | 'endless-arena'
  | 'artifact-grind'
  | 'story-campaign'
  | 'character-story'
  | 'rogue-ruins';

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

The helper accepts typed session metadata and returns display strings. Components must not infer the mode from visible copy.

### Mode Labels

- Endless Arena: `ENDLESS ARENA - WAVE 8`
- Artifact Grind: `ARTIFACT GRIND - WAVE 12`
- Story Campaign: `STORY CAMPAIGN - CHAPTER 4 - STAGE 3`
- Character Story: `CHARACTER STORY - AURELIA - ACT 2`
- Rogue Ruins: `ROGUE RUINS - ROOM 6/10 - ELITE`

The actual typography may use existing separators and uppercase styling. The semantic content must remain the same across the top HUD, deployment screen, pause panel, defeat panel, and victory panel.

Story Campaign and Character Stories must never display a wave label. Rogue Ruins must use room terminology. Endless Arena and Artifact Grind keep wave terminology.

### Record Types

- Endless Arena: highest wave reached.
- Artifact Grind: highest grind wave reached.
- Story Campaign: fastest clear for each individual stage ID.
- Character Story: fastest clear for each character Act stage ID.
- Rogue Ruins before completion: deepest room reached.
- Rogue Ruins after at least one completion: fastest complete 10-room run, while deepest room remains available in the result details.

### Victory and Defeat Details

Story victory adds three dedicated rows:

- `CLEAR TIME`
- `BEST TIME`
- `NEW RECORD` when the completed run improves the stored record

The existing under-one-minute star criterion remains separate from the permanent record display.

Defeat and pause panels show the current mode's progress label rather than `Wave Reached` for every mode.

## Persistence and Migration

Extend save data additively:

```ts
interface StoryProgress {
  fastestClearTimes: Record<string, number>;
}

interface SaveStats {
  highScoreArtifactWave?: number;
  fastestRogueClearSecs?: number;
}
```

- Fastest Story times use existing stage IDs, including `4-3` and `char-aurelia-2`.
- Times are stored as whole seconds because current Story timing already uses seconds.
- Missing, invalid, negative, or non-finite values are ignored during normalization.
- `normalizeStoryProgress` supplies an empty record for older saves.
- `highScoreWave` remains the Endless Arena record for backward compatibility.
- Existing `highScoreRogueRoom` remains the deepest Rogue room record.
- A missing Artifact Grind record starts from the current run rather than copying the Arena record.
- Cloud saves require no destructive migration; the new fields are optional and normalized locally.

Record updates occur once at a successful result boundary. React state updater functions must not enqueue animations or other side effects, avoiding Strict Mode duplication.

## Dark Aether Constellation Transition

### Visual Identity

The transition background is a deep midnight Aether field, never white:

- Base: near-black navy `#050815`.
- Secondary depth: restrained indigo and destination-colored radial illumination.
- Texture: a subtle star-grid, dust, or thin constellation lines rendered with CSS layers.
- No large gradient-only wash; the recognizable visual focus is the animated Aether Core and sigils.

At the center, a faceted diamond-shaped Aether Core opens like four energy petals. Seven original Elemental Battleground sigils orbit it in a shallow ellipse instead of forming a static horizontal row. The sigils represent the game's seven elements using existing original project iconography or newly constructed simple geometric marks; no third-party game icons are reused.

The destination section contributes the primary glow color:

- Home: cyan
- Story: emerald
- Arena: crimson
- Rogue Ruins: violet
- Celestial Summons: gold
- Forge: orange
- Party Setup: blue
- Quest Log: yellow
- Gems Shop: teal
- God Lore Wiki: fuchsia
- Settings and neutral overlays: cool silver-blue

### Motion Sequence

Normal navigation uses 850 ms total:

1. Cover, 0-220 ms
   - The midnight field fades in while two thin constellation arcs sweep toward the center.
   - The old screen remains mounted until the overlay is fully opaque.
2. Convergence, 220-450 ms
   - Seven sigils orbit inward and briefly align around the Aether Core.
   - The Core takes on the destination color.
3. Swap, near 450 ms
   - `activeScreen` and BGM context change while the opaque overlay hides the swap.
4. Reveal, 450-850 ms
   - The Core releases a restrained colored ring.
   - Sigils disperse into short light trails and the destination screen fades in beneath the overlay.

The title-to-Home and Home-to-title transitions keep their existing gold Dawning Core tone and ceremonial duration, but they use this same underlying transition controller so the return path cannot render twice.

### Reduced Motion and Mobile

- `prefers-reduced-motion` uses a 280 ms dark crossfade with a static Core.
- Low graphics uses three visible sigils instead of seven moving sigils and removes dust particles.
- Mobile uses transform and opacity animation only, with no blur animation or canvas particle system.
- Transition elements use fixed counts and are reused rather than recreated per frame.
- Pointer input is blocked only while the transaction is active.
- ARIA status text identifies the destination without presenting long visible loading copy.

### Navigation Transaction

Create one `navigateWithTransition(destination, options)` entry point for normal application screens.

The controller must:

- Ignore or safely replace duplicate requests while already navigating.
- Cover the old screen before changing `activeScreen`.
- Change BGM only after the overlay is opaque.
- Reveal the new screen only after its first render.
- Clear all timers on unmount.
- Keep modal open/close animations local; ordinary modals do not trigger a full-screen transition.
- Skip the transition when navigation only changes an internal tab.

The transition overlay stays mounted once near the App root. It must not be instantiated independently by destination screens.

## Reward Reveal Layer

### Reward Events

Use a typed queue:

```ts
export type RewardKind = 'mora' | 'gems' | 'weapon' | 'artifact';

export interface RewardRevealEvent {
  id: string;
  kind: RewardKind;
  quantity: number;
  rarity?: number;
  label?: string;
}
```

Events are emitted only after a confirmed positive reward mutation. Spending, refunds caused by invalid actions, and save hydration do not animate.

### Destinations

- Mora travels to the Mora header counter.
- Gems travel to the Gems header counter.
- Weapons travel to the Forge navigation destination.
- Artifacts travel to the Forge navigation destination.
- If a target is not mounted, the animation travels to a stable top-right inventory beacon and completes without error.

Add stable data anchors to the counters and Forge navigation control. The reveal layer measures start and end positions once per event, then animates with transforms.

### Presentation

- A compact reward chip appears near the reward source or result panel.
- The icon lifts, follows a curved path, and contracts into its destination.
- The destination pulses once after arrival.
- Multiple rewards of the same kind received in one transaction are grouped.
- Result screens can stagger up to four reward groups; overflow is summarized rather than producing dozens of objects.
- Weapon and artifact reveals use rarity color plus a simple class or slot silhouette.
- The animation never delays the actual save update or blocks navigation.

### Coverage

The shared event API covers:

- Story and Character Story rewards
- Combat Arena and Artifact Grind rewards
- Rogue Ruins rewards
- Quest claims and login rewards
- Summon weapon acquisition
- Gems Shop positive item delivery
- Developer rewards only when developer cheats are manually enabled

## Forge Focus Stage

### Layout

Add a visual chamber inside the existing Forge content area:

- Desktop at 1280 CSS pixels or wider: a wide focus stage beside the action controls.
- Desktop below 1280 CSS pixels: the focus stage sits immediately above the action controls.
- Mobile landscape: the stage sits above the controls and uses a shorter fixed aspect ratio.
- The selected item remains readable without pushing primary actions below an unusable fold.

Do not wrap the whole Forge in another decorative card. The stage is an unframed focal region within the current panel.

### Item Representation

No new 3D dependency is required. Render lightweight layered silhouettes with Motion and CSS:

- Weapon silhouette determined by weapon class.
- Artifact silhouette determined by artifact slot.
- Rarity controls edge color, particles, and pedestal ring.
- Item name, level, rarity, and primary stat remain concise and adjacent to the visual.
- Existing selected-item information and all functional controls remain authoritative.

### Upgrade Animation

On a successful upgrade:

1. Required material icons orbit the selected item on fixed paths.
2. Icons accelerate inward and collapse into the item.
3. The item flashes once using its rarity color.
4. The changed level or stat receives a short count-up emphasis.

On failure or insufficient resources, no orbit animation plays. Existing validation feedback remains visible.

### Artifact Fusion Animation

On a successful fusion:

1. Three source artifact silhouettes appear around the selected target identity.
2. They orbit once, converge, and become one higher-rarity silhouette.
3. The result name and rarity are revealed without changing the existing fusion result logic.

The animation is presentation-only. Inventory consumption and result generation remain in the existing authoritative callback.

### Performance

- Use a maximum of six orbiting material nodes.
- Use CSS transforms and Motion, not per-frame React state.
- Disable decorative particles on low graphics.
- Reduced motion uses a short glow and stat update only.
- Clear animation completion callbacks and timers on unmount.

## Data and Event Flow

### Navigation

1. A screen requests navigation.
2. `navigateWithTransition` resolves the destination palette.
3. The overlay covers the current screen.
4. App changes the active screen and audio context.
5. The destination renders.
6. The overlay reveals and unlocks input.

### Combat Records

1. A battle creates explicit session metadata.
2. The presentation helper formats every visible label from that metadata.
3. Completion calculates duration or wave progress.
4. App compares the result with the correct mode-specific saved record.
5. The save update and result-panel record state are committed once.

### Rewards

1. Existing game logic validates and applies the reward.
2. The successful operation emits grouped reveal events.
3. The global layer measures current UI anchors.
4. Icons travel to destinations and pulse them.
5. The queue removes completed events.

### Forge

1. Inventory selection updates the focus stage.
2. Existing validation checks the operation.
3. Existing game logic applies a successful upgrade or fusion.
4. The focus stage receives a success event and plays the corresponding presentation.

## Error Handling

- Unknown combat metadata falls back to a neutral `BATTLE` label and hides the record badge rather than displaying an incorrect Arena record.
- Malformed stored times are ignored and replaced only by a valid completion.
- A missing reward destination uses the inventory beacon fallback.
- Repeated reward event IDs are ignored.
- A transition interrupted by unmount clears timers and leaves input unlocked.
- A destination render failure must allow the transition overlay to dismiss into the existing application error handling.
- Forge presentation failure cannot prevent inventory mutation or leave controls disabled.

## Testing Strategy

### Unit Tests

- Mode label and record formatting for all five combat session modes.
- Campaign and Character Story stage ID parsing.
- Fastest-time comparison, equal-time behavior, and invalid stored values.
- Save normalization for old saves without new fields.
- Separate Endless Arena and Artifact Grind record updates.
- Transition palette selection and duplicate navigation handling.
- Reward grouping and fallback destination behavior.
- Forge animation profile selection for upgrade and fusion.

### Component Tests

- Story HUD, deployment, pause, victory, and defeat contain no wave labels.
- Story victory shows clear time, best time, and new-record state.
- Character Story uses character and Act labels.
- Rogue Ruins uses room labels and switches to fastest-completion record after completion.
- Transition swaps content only while opaque and does not run twice on return to title.
- Reward reveal does not duplicate under React Strict Mode.
- Forge focus stage updates when selection changes and animates only after success.
- Reduced-motion variants avoid orbit and particle motion.

### Browser Verification

Desktop viewports:

- 1920 x 1080
- 1366 x 768
- 1024 x 768

Mobile landscape viewports:

- 844 x 390
- 873 x 393
- 915 x 412
- 800 x 360

Verify:

- Every major screen transition is dark, smooth, single-instance, and free from white or black flashes.
- Rapid repeated navigation cannot create duplicate overlays or stale screens.
- Existing BGM changes once and does not overlap.
- Mode labels and records are correct in gameplay, pause, victory, and defeat.
- Reward icons reach visible destinations without crossing primary modal actions.
- Forge focus visuals fit without clipping or forcing actions off-screen.
- Mobile safe areas, landscape gate, scrolling, and touch controls remain intact.

### Release Verification

- Run focused tests first.
- Run the full test suite.
- Run `npm run lint`.
- Run `npm run build`.
- Inspect production-sized desktop and mobile screenshots.
- Push the completed implementation to GitHub.
- Confirm the canonical Vercel production deployment is READY and matches the pushed commit SHA.

## Acceptance Criteria

- Artifact Grind can no longer overwrite the Endless Arena record.
- Story and Character Story screens never say Wave or show the Arena record.
- Rogue Ruins displays rooms and stores a fastest completed-run time.
- Story victory clearly displays clear time and saved best time.
- Navigation uses one dark Aether Constellation transition with original project sigils and destination colors.
- No white or black frame appears during normal navigation or title return.
- The title return transition runs exactly once.
- Positive Mora, Gems, weapon, and artifact rewards visibly travel to the correct destination or safe fallback.
- Forge upgrades and fusion visibly focus the selected item without changing operation results.
- Desktop and mobile remain fully functional, responsive, and performant.
