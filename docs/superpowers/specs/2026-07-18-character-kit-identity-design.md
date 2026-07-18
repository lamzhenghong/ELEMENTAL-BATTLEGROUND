# Character Kit Identity And Role System Design

## Objective

Give every playable character a visible combat role and give Aurelia, Kaelen, Maelis, and Veyra genuinely distinct M1, Skill, and Burst behavior without duplicating combat implementations or regressing reactions, switching, normal Bursts, Special Ultimates, mobile controls, weather, Echoes, artifacts, damage skins, or story and dungeon modes.

The attached user specification is the approved product design. This document records how it maps onto the repository that actually exists.

## Audited Baseline

- `CombatArena.tsx` is the shared combat implementation for Arena, Infinite, Artifact Grind, Rogue/Dungeon, Story, Character Story, elite, and boss battles.
- Normal attacks currently perform a short directional hit and call the same damage/reaction path as Skills and Bursts.
- Every Elemental Skill currently emits a 150-unit radial attack, uses the active character's ATK and configured multiplier, grants energy, and sets a skill cooldown.
- Every normal Burst currently keeps its gauge, cutscene, audio, camera shake, particles, global damage timing, and Echo mirror behavior in one shared handler.
- Reactions currently live inside `applySkillDamage`, using `enemy.activeElements` and `getReactionDamageOutcome`.
- Character switching preserves `combatParty`, dungeon HP/energy, weapon swap passives, and Aether Echo identity.
- Special Ultimates are configured in `specialUltimates.ts` and remain independent from normal Bursts, including Level 40/dev unlocks, valid pairs, gauges, cooldown, dialogue, cutscenes, BGM, damage, and gauge resets.
- Enemies, elites, and all three boss templates are spawned through `CombatArena`; bosses already have multi-phase mechanics.
- Rendering is currently React plus Canvas 2D. Three.js/R3F is not installed in the current package, so the new gameplay rules must remain renderer-neutral. Canvas and future R3F visuals may consume the same effect state.

## Architecture

### Character roles

`types.ts` owns `CharacterRole` and adds `role` to `PlayableCharacter` and `CombatCharacter`. `characterRoles.ts` owns labels, modifiers, filtering helpers, and idempotent stat/cooldown calculation. The original base character records remain immutable.

Role modifiers:

| Role | ATK | HP | DEF | Skill/Burst cooldown | M1 speed |
| --- | ---: | ---: | ---: | ---: | ---: |
| DPS | 1.15x | 1.00x | 1.00x | 1.00x | 1.08x |
| Sub DPS | 1.00x | 1.00x | 1.00x | 1.00x | 1.00x |
| Support | 0.92x | 0.92x | 0.92x | 0.80x | 1.00x |
| Tank | 1.00x | 1.25x | 1.10x | 1.00x | 1.00x |

The cooldown helper applies to configured Skill and Burst cooldown values, while the existing energy requirement remains the authoritative normal-Burst gate.

### Role assignments

| Character | Role | Reason |
| --- | --- | --- |
| Aurelia | DPS | On-field Pyro sword attacker |
| Ignis | Tank | High HP/DEF and shield identity |
| Kaelen | Sub DPS | Hydro control and reaction setup |
| Maelis | Support | Party shield and reaction field |
| Veyra | DPS | Ranged M1 and Burst empowerment |
| Marina | Support | Hydro utility and bubble control |
| Lyra | DPS | High-rarity Cryo damage kit |
| Varek | Tank | Highest defensive Cryo profile |
| Zephyr | Sub DPS | Anemo crowd control and reaction spread |
| Seraphina | Support | Sanctuary and team utility |
| Goliath | Tank | Highest HP/DEF Geo guardian |
| Tessa | Sub DPS | Geo constructs and detonation |
| Raijin | DPS | High-ATK Electro duelist |
| Luna | Sub DPS | Deployable Electro sentry |
| Verdant | Sub DPS | Dendro snare and reaction setup |
| Flora | Support | Spore and field utility |
| Valerie | DPS | High-ATK Pyro attacker |
| Nero | Sub DPS | Counter-focused Electro bruiser |
| Cynthia | DPS | Highest 4-star ATK assassin |
| Aero | Sub DPS | Mobility and Anemo grouping |
| Kira | Support | Barrier and resource utility |
| Sylvia | Support | Sleep and control field |
| Arthur | DPS | Straightforward Pyro attacker |
| Chloe | Support | Hydro barrier identity |
| Hans | Tank | Defensive Cryo claymore profile |
| Stella | Sub DPS | Anemo decoy and grouping |
| Brock | Tank | Defensive Geo guard |
| Tesla | Sub DPS | Electro deployable damage |
| Ivy | Support | Dendro pollen and rooting utility |
| Skip | DPS | Fast Electro sword attacker |
| Dusty | Tank | Geo stormward protection |
| River | Sub DPS | Hydro setup and battlefield control |

### Limited kit registry

`characterKits.ts` stores typed, data-driven limited-kit definitions keyed by character id. Combat branches on effect `kind`, never repeated character-name comparisons. Future limited characters can add a registry entry without creating another game-mode implementation.

The registry defines:

- Role and polished identity copy.
- M1 range, damage, speed, proc chance, and optional status effect.
- Skill shape, direct-damage eligibility, range, status application, and party effect.
- Burst shape, direct-damage eligibility, range, status application, and persistent effect.

### Reaction source validation

`reactionSources.ts` defines `CombatDamageSource`, `ReactionTriggerContext`, and `canTriggerElementalReaction`. Only eligible direct Skill, Burst, and existing Special Ultimate damage may apply/consume an aura and trigger a reaction. M1, DoT, persistent fields, environment, reaction damage, shields, heals, buffs, debuffs, crowd control, field creation, switching, and visual effects cannot.

`CombatArena` passes an explicit context into its existing damage pipeline. Reaction damage never re-enters that pipeline as an eligible source. Special Ultimates use `special-ultimate` and preserve their current reaction behavior.

### Enemy status effects

`combatStatusEffects.ts` is a pure TypeScript reducer for burn, slow, stun, damage-down, shield metadata, reaction amplification, and persistent-damage metadata. Each effect carries source character, ability, duration, remaining time, strength, stack behavior, visual kind, tick timing, and boss rules.

- Same-source Burning refreshes instead of stacking and ticks every second for six seconds.
- Slow and stun refresh by source/ability and enforce safe speed floors.
- Damage-down uses the strongest active reduction.
- Bosses reject slow, stun, pull, and forced movement while still accepting damage, burn, damage-down, and reaction amplification.
- Immunity feedback is rate-limited per enemy.
- The reducer is renderer-neutral and returns tick events for `CombatArena` to attribute damage and kills correctly.

### Shared party effects

`combatPartyEffects.ts` owns session-level effects in a ref managed by `CombatArena`:

- A Maelis party shield with current and maximum HP, additive 1,000-point casts, and a 3,000 cap.
- Maelis reaction fields fixed at cast position for 15 seconds.
- Kaelen whirlpools fixed at cast position for about 1.8 seconds.
- Veyra Dominion with a 10-second self M1 buff and a following electric field that snapshots Veyra's ATK and ticks every two seconds.

Effects survive switching, waves, normal Bursts, Special Ultimate presentation, and camera/control changes. They are idempotently cleared on restart, defeat, victory, exit, unmount, and new run initialization.

## Limited Character Behavior

### Aurelia

- M1: 1.5x Aurelia-only damage, no aura or reaction.
- Skill: medium direct Pyro hit plus one refreshable six-second Burn at 35% snapshotted ATK per second. Burn ticks are reaction-ineligible.
- Burst: preserve the current normal-Q flow and damage scaling while constraining the hit to a very large radius and adding a stronger explosion presentation.

### Kaelen

- M1: refreshable 10% slow for 0.5 seconds, no aura or reaction.
- Skill: full-AOE direct Hydro damage plus 40% slow for three seconds; boss receives damage and `IMMUNE` for control.
- Burst: preserve the current normal-Q flow and direct Hydro damage, then add a visible 1.8-second whirlpool that smoothly pulls normal and elite enemies without teleporting or overlapping the player. Bosses remain stationary.

### Maelis

- M1: 10% proc for 10% outgoing-damage reduction for three seconds, no aura or reaction.
- Skill: no direct damage; add 1,000 party shield HP to a 3,000 cap.
- Burst: preserve existing normal-Q direct damage and presentation, then create a 15-second field. Enemy outgoing damage uses the strongest 20% reduction. Valid direct-hit reactions inside use exactly 2x reaction damage and eligible CC duration even with overlapping fields.

### Veyra

- M1: 15% proc stun for one second on normals, 0.5 seconds on elites, boss immune; no aura or reaction.
- Skill: full-AOE direct Electro damage plus four-second normal/two-second elite stun; boss receives damage and immunity feedback.
- Burst: preserve normal-Q direct damage and presentation, add ten seconds of Veyra-only 1.5x M1 damage and 2x range, and add a following field that deals 100% snapshotted Veyra ATK every two seconds without aura/reaction behavior.

## Combat Integration

`CombatArena` remains the single mode integration point. It will:

1. Apply role modifiers once while constructing `CombatCharacter` records.
2. Resolve actions through the kit registry.
3. Pass explicit reaction contexts into the existing reaction path.
4. Tick status and party effects from the same combat loop using combat seconds.
5. Apply shield absorption before HP damage.
6. Apply enemy slow/stun/damage-down during AI and outgoing-damage calculation.
7. Render bounded Canvas effects and status indicators from the same state.
8. Preserve existing normal-Q and Special Ultimate timing paths.

## UI Integration

Reusable `CharacterRoleBadge` and kit-copy helpers appear in:

- Forge roster and character details.
- Party setup cards, details, and role filter.
- Wiki/index cards and character details.
- Limited and standard banners where a character is featured.
- Summon results and splash cards.
- Combat party cards where space allows without covering controls.

Role labels use `DPS`, `Sub DPS`, `Support`, and `Tank`. Mobile layouts use compact badges and wrapping rather than fixed widths.

## Test Harness

`/kit-test` renders a development harness through the existing Vite entry and a Vercel rewrite. It uses the same pure role, reaction, status, party-effect, and kit registry modules as combat, not a duplicate simulation. Deterministic proc controls exist only on this route.

The harness exposes character and enemy selectors, action controls, switching/reset, enemy and party state, auras, statuses, fields, reaction multiplier/source, and a bounded event log. It remains responsive at desktop, portrait mobile, and landscape mobile sizes.

## Visual And Performance Rules

- Existing Canvas effects remain the default battlefield renderer.
- Status visuals use fixed upper particle counts, simple fills/strokes, and no per-frame DOM creation.
- R3F may be introduced later as a presentation adapter consuming the same typed state; gameplay logic must not depend on Three.js objects.
- No effect creates new `Audio`, timer, or particle systems per frame.
- Mobile uses reduced particle counts while preserving telegraphs.
- Shield and field HUD elements sit above the battlefield bottom edge without overlapping joystick or action controls.

## Compatibility And Verification

- Existing save data needs no migration because roles live in central character definitions, not save records.
- All existing tests remain regression requirements.
- New tests cover role modifiers, reaction eligibility, status refresh/ticks/immunity, shield stacking/consumption, fields, snapshots, switching, Special Ultimate survival, and cleanup.
- Build, TypeScript, all tests, `/kit-test`, desktop, portrait mobile, landscape mobile, normal/elite/boss targets, both Special Ultimate pairs, and cutscene enabled/disabled paths must pass before publishing.
