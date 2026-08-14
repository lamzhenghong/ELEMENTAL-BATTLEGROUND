# Special Ultimate Follow-up Effects Design

## Scope

Keep the existing Special Ultimate names, eligibility rules, dialogue, cutscenes, BGM, shared cooldown, gauge reset, controls, and button behavior. Replace the current oversized one-shot damage with a 500% active-character ATK full-AOE opener followed by the approved combo-specific effect.

## Eternal Vapor: Boiling Point

- Opening hit: 500% of the active character's ATK to every living enemy.
- Follow-up: all surviving enemies receive Vapor Pressure for 10 seconds.
- Direct party hits add one Pressure stack to the struck marked enemy.
- At five stacks, that target takes a focused Vapor burst equal to 150% of the cast-time active-character ATK and its stacks reset.
- The burst pulls nearby normal and elite enemies toward the marked target. Bosses are never displaced.
- A boss whose Pressure detonates takes 10% increased damage for four seconds. Repeated detonations refresh, rather than stack, the vulnerability.
- Damage-over-time, reaction, environmental, and persistent-field damage cannot add Pressure stacks.

## Worldstorm Genesis: Living Storm Network

- Opening hit: 500% of the active character's ATK to every living enemy.
- Follow-up: link up to five surviving enemies for 12 seconds, prioritizing bosses, then elites, then normal enemies.
- The first direct hit received by a linked enemy echoes 20% of its final damage to every other linked enemy, capped at 100% of the cast-time active-character ATK per echoed target.
- The network has a shared 0.25-second echo throttle so one multi-target action cannot recursively multiply echoes.
- Every three seconds, linked normal enemies are rooted for 1.2 seconds and linked elites for 0.7 seconds.
- Linked bosses resist roots and instead take a concentrated strike equal to 75% of the cast-time active-character ATK every three seconds.
- Echoes and periodic strikes cannot trigger further network echoes or elemental reactions.

## Architecture And Safety

- `specialUltimateEffects.ts` owns immutable activation, hit registration, ticking, expiry, vulnerability, and event generation.
- `CombatArena.tsx` owns target lookup, damage application, movement, status application, text, and restrained canvas VFX.
- Follow-up damage is queued until the next combat frame to avoid recursive death handling and duplicate rewards.
- Effects reset on wave changes, restart, battle exit, and unmount.
- VFX use a maximum of five links and simple canvas strokes; no new DOM loops, audio objects, post-processing, or particle clouds are introduced.

