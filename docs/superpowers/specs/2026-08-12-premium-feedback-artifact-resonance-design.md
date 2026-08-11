# Premium Feedback and Artifact Resonance Design

## Scope

Add premium combat feedback and artifact set resonance visuals without changing combat damage, artifact statistics, set-bonus thresholds, inventory ownership, save schemas, controls, or progression.

## Combat Feedback Architecture

`damageFeedback.ts` is the pure decision layer. It maps weapon/source data to a short impact shape, creates deterministic directional number motion, maps character elements or equipped damage skins to restrained critical identities, and derives enemy damage states from HP percentage.

`DamageFeedbackManager` owns a fixed pool of canvas impacts and final-hit flashes. Combat emits a visual event after its existing damage calculation has finished; the manager updates and draws active pool entries in the existing render loop. Off-screen effects are skipped and all entries are cleared on wave reset, death, pause teardown, and unmount.

`HapticManager` owns the five requested presets and arbitrates throttle and priority. It supports `navigator.vibrate` and controller dual-rumble when available, exposes a single stop method, and never changes gameplay state.

Damage numbers retain the existing DOM renderer. New optional motion and critical identity metadata makes their paths deterministic while preserving compatibility for non-damage messages.

Enemy cracks are derived from current HP each frame. This avoids mutating shared materials and guarantees that reused enemies return to a clean state. Canvas enemies receive scratches, fractures, or unstable emissive lines according to their presentation class.

## Artifact Resonance Architecture

`artifactSetVisuals.ts` is the single visual derivation layer. It counts equipped set pieces, identifies 2-piece and 4-piece tiers, reports missing slots, and provides the set theme. It does not calculate or apply bonuses.

`ArtifactSetEmblem` and `ArtifactSetProgress` render compact Forge and HUD feedback using existing styling. The Forge compares the previous and current visual tier to play an inline 2-piece or 4-piece activation pulse and quiet sound. Ties between incomplete sets do not produce a forced recommendation.

The combat aura is a lightweight canvas ring/mote renderer around the active player. Mobile uses the low-quality path, desktop uses the standard/high path, and no persistent particle objects are allocated.

## Mappings

- Sword: thin directional slash.
- Claymore: broad radial burst.
- Polearm: narrow piercing streak.
- Bow: compact forward projectile burst.
- Catalyst: element-shaped magic impact.
- Ultimate and special ultimate: expanding impact ring.
- Pyro: ember edge; Hydro: ripple; Electro: angular jitter; Cryo/Ice: crystalline edge; Dendro: leaf/rune; Void: distortion; Celestial: radiant spark. Other elements use the shared critical base.
- Vanguard: sharp crimson motes; Guardian: protective emerald ring; Celestial: gold star sparks; Chrono: violet rotating time ring.

## Performance and Compatibility

- Fixed-size pools prevent per-hit impact allocation.
- Damage text paths are calculated once per mounted entry.
- Haptics merge rapid M1 pulses and prioritize parry, ultimate, and final hits.
- Enemy damage marks are deterministic and allocation-free in the render loop.
- Artifact aura complexity is reduced on mobile and respects the existing low-graphics path.
- Existing save data needs no migration; haptics is a separate local preference with a default of enabled.
- Boss deaths keep their existing presentation.

## Verification

Pure utility tests cover weapon shape mapping, directional motion, critical identity, HP thresholds, haptic arbitration, set counts, missing slots, replacements, removal, and ties. Integration tests and source-contract tests cover settings, combat emission, Forge rendering, cleanup, and unchanged bonus formulas. Final QA includes lint, production build, desktop and mobile landscape viewports, combat smoke testing, and Forge open/equip/remove flows.
