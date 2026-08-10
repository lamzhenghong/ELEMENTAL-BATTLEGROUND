# Mobile Remappable Controls and Combat Feel Design

## Summary

Add individually remappable mobile combat controls and a restrained combat-impact layer without changing desktop controls or duplicating battle-mode logic. The mobile editor is available from Settings on mobile devices. Combat feedback is centralized and consumed by the shared `CombatArena`, so Combat Arena, Endless Arena, Artifact Grind, Story battles, Character Stories, Rogue Ruins, elite encounters, and boss encounters receive the same behavior.

The implementation must preserve existing damage formulas, cooldowns, gauges, reactions, character kits, Special Ultimates, weather, enemy mechanics, and save data.

## Goals

- Let mobile players reposition the joystick and every primary combat action independently.
- Persist the layout per device and restore it on future launches.
- Keep controls inside landscape safe areas and prevent unusable layouts.
- Improve attack readability and weight with short anticipation, hit-stop, visual recoil, directional knockback, clearer impact audio, and cleaner damage text.
- Apply combat polish consistently to every mode that renders `CombatArena`.
- Keep desktop keyboard, mouse, and HUD behavior unchanged.
- Avoid frame drops, stacked sounds, timer leaks, and excessive React renders.

## Non-Goals

- No desktop key-remapping system in this change.
- No control-size or opacity editor in this change.
- No change to character stats, damage multipliers, reaction multipliers, rewards, or enemy HP.
- No new music or downloaded sound assets.
- No Three.js/R3F conversion.
- No redesign of party-switch cards, pause controls, or the mobile minimap.
- No cloud synchronization for a device-specific touch layout.

## Current Architecture

- `MobileControls.tsx` renders Attack, Skill, Parry, Dash, and Ultimate inside one fixed 192 by 192 pixel cluster.
- `MobileJoystick.tsx` owns a separate fixed-position joystick.
- the Special Ultimate button is rendered by `CombatArena` outside `MobileControls`.
- `App.tsx` owns persisted gameplay settings and passes them to each `CombatArena` instance.
- `CombatArena.tsx` is the shared battle implementation for all current combat modes.
- Damage resolves through `applySkillDamage`, while normal attacks begin in `triggerBasicAttack`.
- The audio engine already synthesizes Slash and Hit sounds through Web Audio.
- Floating damage text is rendered as DOM overlays and currently includes repeated source words such as `Click`, `Skill`, and `ULT`.

## Approach

Use one typed layout model and one centralized combat-impact profile system. Rendering components consume those models; they do not invent independent defaults or combat constants.

### New Modules

- `src/utils/mobileControlLayout.ts`
  - Control identifiers, defaults, parsing, validation, safe-area clamping, and overlap detection.
- `src/utils/useMobileControlLayout.ts`
  - Local persistence and update/reset behavior.
- `src/components/MobileControlEditor.tsx`
  - Fullscreen landscape editor opened from Settings.
- `src/utils/combatImpact.ts`
  - Pure impact-profile selection for anticipation, hit-stop, knockback, recoil, sound tier, and damage-text style.

## Mobile Control Layout

### Data Model

```ts
export type MobileControlId =
  | 'joystick'
  | 'attack'
  | 'skill'
  | 'parry'
  | 'dash'
  | 'ultimate'
  | 'specialUltimate';

export interface MobileControlPlacement {
  x: number;
  y: number;
}

export type MobileControlLayout = Record<MobileControlId, MobileControlPlacement>;
```

`x` and `y` are normalized center coordinates from 0 to 1. This keeps a layout usable across different landscape resolutions. Render-time code converts coordinates to pixels after accounting for safe-area insets and each control's fixed dimensions.

### Persistence

- Storage key: `aetheria_pref_mobile_control_layout_v1`.
- Persistence uses local storage because this is a physical-device preference.
- Missing, malformed, incomplete, non-finite, or out-of-range data falls back to the complete default layout.
- A layout from another aspect ratio is clamped to the current usable viewport before rendering.
- No `SaveState` or Supabase schema change is required.

### Settings Entry

- Add `CUSTOMIZE MOBILE CONTROLS` to both Main Menu Settings and in-game Gameplay settings so a player can configure controls before entering battle.
- Show the entry only when the existing mobile-runtime check is true. A coarse pointer alone must not change desktop Settings on a touch-enabled laptop.
- Desktop Settings remains unchanged.
- Selecting the entry opens `MobileControlEditor` above the Settings modal.

### Editor Experience

- The editor occupies the current landscape viewport and uses a dimmed battlefield-style grid.
- All seven controls appear at their saved positions.
- The Special Ultimate control appears as a preview even when the current party cannot activate it.
- Dragging uses pointer capture and works with touch or mouse during development.
- The selected control receives a bright outline and its name appears in a compact top bar.
- Safe-area boundaries are visible only while editing.
- `RESET DEFAULT`, `CANCEL`, and `SAVE LAYOUT` remain fixed in the top bar.
- Cancel closes the editor without changing the active layout.
- Reset changes the editor draft only until Save is selected.
- Pointer cancel or orientation interruption ends the active drag safely.

### Layout Safety

- Every control center is clamped so its full hit target remains inside the usable viewport.
- The joystick cannot overlap an action control by more than 20 percent of the smaller control's bounding area.
- Two action controls cannot overlap by more than 35 percent of the smaller control's bounding area.
- Invalid overlaps show a red outline and disable Save.
- The editor never changes control sizes, preserving existing touch-target behavior.
- Runtime rendering applies safe-area clamping again, even to previously valid saved data.

### Runtime Rendering

- `MobileControls` becomes a full-screen pointer-transparent layer with individually positioned pointer-active buttons.
- `MobileJoystick` accepts a placement instead of owning a fixed bottom-left offset.
- `CombatArena` positions the mobile Special Ultimate button from the same layout.
- Existing action callbacks, cooldown overlays, Ultimate energy, Parry press/release behavior, and pointer propagation remain unchanged.
- Party-switch UI, minimap, announcements, and pause controls are not moved.

## Combat Impact System

### Impact Profiles

`combatImpact.ts` maps an event to one deterministic profile. Inputs include source, critical state, target class, damage magnitude, combat speed, mobile status, and Screen Shake setting.

```ts
export type CombatImpactSource =
  | 'normal-attack'
  | 'elemental-skill'
  | 'elemental-burst'
  | 'special-ultimate'
  | 'reaction'
  | 'damage-over-time';

export type CombatTargetClass = 'normal' | 'elite' | 'boss';
```

The profile returns:

- anticipation duration
- hit-stop duration
- directional knockback distance
- visual recoil distance
- optional screen-shake intensity
- impact sound tier
- damage-text size and grouping behavior

No profile changes the damage amount.

### Attack Anticipation

- Normal attack: 45 ms before hit resolution.
- Elemental Skill: 70 ms before its first direct hit when the skill is currently immediate.
- Normal and Special Ultimates retain their existing cinematic timing and do not receive an extra wind-up delay.
- Anticipation durations are divided by the selected combat-speed multiplier.
- A small directional arc and brief player compression/lunge make the pending attack readable.
- Damage, reactions, hit sounds, knockback, and hit-stop occur at the impact point, not at pointer-down.
- The action cooldown starts on input, preventing duplicate queued attacks.
- Pending actions are cancelled on death, battle end, restart, unmount, or an invalid active character.
- Pause freezes pending action progress and resumes it without duplicating the hit.

### Hit-Stop

- Normal direct hit: 35 ms.
- Critical normal hit: 50 ms.
- Elemental Skill direct hit: 55 ms.
- Critical Skill hit: 65 ms.
- Normal Ultimate impact: 70 ms.
- Special Ultimate impact: 80 ms.
- Damage-over-time and persistent fields do not request hit-stop.
- Reactions can upgrade the current impact by at most 15 ms but cannot stack separate stops.
- Multiple targets hit in the same frame request only the strongest profile.
- Duration is divided by combat speed.
- The render loop continues drawing the held frame and UI; only combat-world simulation pauses.
- Cooldown UI, touch input state, audio playback, and modal controls remain responsive.
- With Screen Shake disabled, hit-stop duration is reduced by 50 percent and visual recoil is disabled.

### Recoil and Directional Knockback

- Recoil is a temporary render offset, not a change to the player's world position.
- Normal hit recoil: up to 3 pixels opposite the attack direction.
- Skill recoil: up to 5 pixels.
- Ultimate recoil: up to 7 pixels.
- Recoil eases back within 90 ms and is disabled when Screen Shake is disabled.
- Directional knockback uses the normalized vector from attacker to target.
- Normal enemies receive the full profile distance.
- Elite enemies receive 50 percent.
- Bosses do not move; they receive a short visual stagger pulse instead.
- Shielded Bulwarks receive 25 percent until their shield breaks.
- Knockback is clamped to arena boundaries and cannot move an enemy outside the playable world.
- Existing mechanic-specific knockback, such as Overloaded and configured boss projectiles, remains authoritative and is not applied twice.

### Impact Audio

- Replace unconditional identical `playHit()` calls with `playCombatImpact(tier, element, isCritical)`.
- Tiers: light, heavy, critical, shield, and boss.
- Reuse synthesized Web Audio and a prebuilt short noise buffer; do not load new files.
- Add a soft compressor before the SFX output to reduce clipping.
- Rate-limit light impacts to one every 30 ms and heavy impacts to one every 45 ms.
- A stronger impact in the same window replaces the weaker request.
- Critical, shield-break, and boss impacts remain distinct without multiplying volume.
- Existing SFX mute and volume controls continue to apply.

### Cleaner Damage Text

- Normal damage displays only the formatted number.
- Critical damage displays a larger gold `CRIT` label with the number; no `Click`, `Skill`, or `ULT` prefix.
- Reaction names remain a separate colored line and appear once per reaction event.
- Damage-over-time uses smaller text and no critical animation.
- Rapid hits against the same target from the same source within 90 ms merge into one floater using `total x hitCount`.
- Different reactions and critical states are never merged together.
- Keep Ice, Void, and Celestial damage-skin number formatting.
- Cap active DOM damage floaters at 24; the oldest non-critical floater is removed first when the cap is reached.
- Position jitter is reduced so numbers remain attached to the target without forming an unreadable pile.

## Performance Rules

- All action scheduling, hit-stop timing, recoil, and impact accumulation use refs inside the existing animation loop.
- Do not create React state updates every animation frame.
- Resolve at most one hit-stop and one impact sound request per render frame.
- Reuse the audio noise buffer and do not create persistent Audio objects per attack.
- Keep normal-hit particle counts unchanged or lower on mobile; combat polish must not add unbounded particles.
- Clean pending actions, drag listeners, timers, and audio scheduling on unmount and battle reset.
- The FPS limiter continues to control rendering; impact timing uses elapsed time rather than assuming 60 FPS.

## Compatibility

### Mobile

- Editor and controls are designed for the game's enforced landscape entry.
- Verify Android-style and iPhone-style landscape aspect ratios.
- Respect CSS safe-area insets.
- Maintain multi-touch: joystick movement must continue while an action button is pressed.
- No page scrolling or browser zoom should begin while dragging a control or playing combat.

### Desktop

- No mobile editor entry is shown for a desktop pointer environment.
- Existing keyboard and mouse bindings remain unchanged.
- Desktop combat receives hit-stop, anticipation, audio, knockback, recoil, and damage-text cleanup.
- No mobile layout layer intercepts desktop pointer input.

### Game Modes

The shared implementation must cover:

- Combat Arena
- Endless Arena
- Artifact Grind
- Story Campaign battles
- Character Story battles
- Rogue Ruins battles
- Normal, Elite, and Boss waves

## Error Handling

- Local-storage read or write failure must not block Settings or combat.
- Invalid layout data resets to defaults and is replaced on the next successful save.
- A missing control placement uses that control's default without discarding valid placements for other controls.
- Losing pointer capture during editing ends the drag without moving the control further.
- A failed audio node creation silently falls back to the existing basic hit sound.
- A cancelled pending attack cannot apply delayed damage after leaving combat.

## Testing

### Unit Tests

- Default layout contains every control exactly once.
- Layout parser accepts valid normalized placements.
- Missing, malformed, non-finite, and out-of-range values are repaired safely.
- Safe-area clamping keeps complete hit targets visible.
- Overlap validation follows joystick and action thresholds.
- Reset restores the exact default layout.
- Combat-impact profiles return the specified timing and resistance values.
- Boss knockback is zero and Elite knockback is half of Normal.
- Screen Shake disabled reduces hit-stop and removes visual recoil.
- Damage-text grouping combines only compatible events.
- Audio priority and rate limiting choose the strongest event.

### Integration Tests

- Both Settings surfaces expose the editor only in the mobile runtime.
- Saved placements flow through App into every `CombatArena` instance.
- Joystick, five normal actions, and Special Ultimate consume the shared layout.
- Parry release behavior survives remapping.
- Basic attack damage resolves after anticipation exactly once.
- Multi-target attacks request one strongest hit-stop and sound.
- Battle restart and exit clear pending actions and hit-stop.
- Damage formulas and existing reaction outcomes remain unchanged.
- Desktop keyboard bindings remain present.

### Manual Browser Verification

- 844 by 390 landscape mobile viewport.
- 873 by 393 landscape mobile viewport.
- 915 by 412 landscape mobile viewport.
- 1024 by 768 tablet landscape viewport.
- 1366 by 768 and 1920 by 1080 desktop viewports.
- Drag every control, save, reload, and verify persistence.
- Test simultaneous joystick plus Attack, Skill, Dash, Parry, and Ultimate touches.
- Test Normal, Elite, Bulwark, and Boss knockback behavior.
- Test normal, critical, Skill, reaction, Ultimate, and damage-over-time text.
- Test Screen Shake enabled and disabled.
- Test Arena, Story, Artifact Grind, and Rogue entry paths.

### Release Gate

- Run all tracked TypeScript tests.
- Run `npm run lint`.
- Run `npm run build`.
- Run `git diff --check`.
- Verify the published GitHub SHA matches the READY Vercel deployment.
- Verify the public production alias on mobile landscape and desktop.

## Acceptance Criteria

- A mobile player can independently move all seven combat controls from Settings.
- A saved layout survives a refresh and a later launch on the same device.
- Invalid layouts cannot hide controls or make Save produce an unusable arrangement.
- Joystick and action multi-touch continues working.
- Desktop controls and Settings presentation remain unchanged.
- Direct attacks visibly anticipate before impact without feeling delayed.
- Hit-stop never stacks per enemy or freezes UI/audio.
- Normal and Elite enemies move in the correct attack direction; Bosses stay in place.
- Impact audio is clearer without clipping or rapid overlap.
- Damage text no longer repeats `Click`, `Skill`, or `ULT` on every hit.
- Existing combat math, cooldowns, reactions, rewards, and mode progression remain unchanged.
- No requested behavior is limited to only one combat mode.
