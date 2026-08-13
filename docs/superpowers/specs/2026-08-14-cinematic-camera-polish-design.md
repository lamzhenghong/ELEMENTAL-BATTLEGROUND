# Cinematic Camera Polish Design

## Goal

Add restrained combat camera motion to every `CombatArena`-powered mode without changing combat rules, controls, HUD placement, or existing cutscenes.

## Camera Language

- Dash briefly expands the visible field with a small zoom-out, then returns smoothly.
- A successful parry pushes in toward the midpoint between the player and attacker.
- Heavy impacts add a short directional camera recoil. Normal light attacks do not trigger it.
- Boss waves frame the boss using its world position and radius, then ease back to the player.
- Normal and Special Ultimate completion use a longer smooth return to the player instead of snapping to neutral.
- Camera motion never pauses combat and does not replace existing screen shake.

## Architecture

`src/utils/cinematicCamera.ts` owns cue state, interpolation, world clamping, and world/screen projection. `CombatArena` owns one director instance and emits semantic cues. Rendering, floating damage placement, impact VFX, pointer aiming, and canvas transforms all consume the same computed camera frame so zoom cannot desynchronize controls or effects.

## Motion Preference

Add a `0-100%` Motion Intensity slider to both settings surfaces. The value is persisted in `localStorage` as `aetheria_pref_motion_intensity`, defaults to `70`, and is passed through Arena, Story, Artifact Grind, and Rogue Ruins combat. At `0`, all cinematic camera cues resolve to neutral while existing Screen Shake remains independently configurable.

## Performance And Safety

The director uses one mutable state object and constant-time math per rendered frame. It creates no particles, timers, React state updates, or animation objects per frame. Mobile uses the same effects scaled by the user preference. Camera state resets on restart, battle end, and component cleanup.

## Validation

Unit tests cover cue targets, intensity zero, radius-aware boss framing, interpolation, clamping, and projection round trips. Integration tests protect cue wiring, persisted settings, and all combat-mode prop paths. Browser checks cover desktop and `844x390` mobile combat, pointer alignment, settings persistence, overflow, and console errors.
