# Campaign Boss Identity and Mechanics Design

## Objective

Make Story Campaign boss identity consistent across stage cards, dialogue, battles, and the Boss encyclopedia. Replace the generic Chapter 4-10 Colossus names with lore-specific identities and give each campaign boss a distinct mechanic without changing boss models, model VFX, or any non-campaign boss behavior.

Campaign dialogue also presents the current player as the protagonist by replacing the legacy `Eldric Thorne` name with the player's current username.

## Scope

### Included

- Personalize Story Campaign dialogue with the current cloud username.
- Use `Traveler` when no username is available.
- Replace both the `Eldric Thorne` speaker label and whole-word `Eldric` or `Eldric Thorne` references inside campaign dialogue text.
- Keep Character Story dialogue unchanged.
- Synchronize each campaign Stage 5 boss name across:
  - campaign stage card and stage details;
  - pre-battle and post-battle dialogue speakers;
  - in-battle enemy and boss HUD name;
  - Boss encyclopedia identity.
- Keep the existing Chapter 1-3 boss names and mechanics.
- Rename Chapter 4-10 bosses and add seven campaign-only mechanics.
- Update the Boss encyclopedia mechanic and counter descriptions.
- Preserve existing boss models, colors, model VFX, and animation identities.

### Excluded

- World, Combat Arena, Endless Arena, Artifact Grind, and Rogue Ruins boss mechanics.
- Character Story Trial boss mechanics.
- Boss model or model VFX changes.
- Campaign enemy changes outside Stage 5 bosses.
- Balance changes to regular, Elite, or archetype enemies.

## Architecture

### Shared Campaign Boss Registry

Add one campaign boss registry keyed by Story Campaign stage ID. Each entry owns:

- stage ID;
- boss identity ID;
- display name;
- element;
- existing visual identity;
- legacy mechanic profile used as a safe fallback;
- campaign-only mechanic ID;
- skill name;
- mechanic description;
- counter description.

Story stage data, dialogue, battle spawning, and the Boss encyclopedia consume this registry instead of maintaining independent boss names or mechanic copy.

The runtime enemy keeps its existing `bossType` so model selection and legacy fallback behavior remain compatible. A separate optional campaign mechanic ID activates only for authored Story Campaign bosses.

### Dialogue Personalization

Add a pure dialogue personalization helper that returns copied lines without mutating authored story data. For Story Campaign scenes only it:

1. normalizes the supplied username;
2. falls back to `Traveler` when empty;
3. changes the exact speaker `Eldric Thorne` to the resolved name;
4. replaces whole-word `Eldric Thorne` and `Eldric` references in dialogue text.

`StoryMode` personalizes pre-battle scenes. `App` personalizes post-battle scenes. Character Stories do not call the helper.

### Campaign-Only Combat Dispatch

Extract campaign mechanic scheduling into a focused utility. It accepts the campaign mechanic ID, phase, timers, boss position, player position, and deterministic random input. It returns attack actions and updated timers.

`CombatArena` translates those actions into the existing lightweight projectile, warning-marker, patch, text, pull, and damage systems. If no campaign mechanic ID exists, the existing `fire_dragon`, `ice_golem`, or `thunderbird` logic runs unchanged.

This keeps the new behavior isolated and prevents model rendering or unrelated combat systems from being rewritten.

## Campaign Boss Roster

### Chapter 1

- Name: Calamity Pyro Dragon
- Skill: Ruins Core Calamity
- Mechanic: Existing aimed fireballs, burning arena patches, and final meteors.
- Counter: Keep moving, leave burning zones, and dash out of meteor markers.

### Chapter 2

- Name: Glacial Frost Golem
- Skill: Absolute Zero Lens
- Mechanic: Existing shard spread, slowing blizzard fields, and Frozen Tomb aura.
- Counter: Sidestep the shard fan, avoid ice fields, and stay outside the close aura.

### Chapter 3

- Name: Tempest Thunderbird
- Skill: Summit Storm Matrix
- Mechanic: Existing targeted lightning, three-point walls, and rapid final-phase bolts.
- Counter: Move on every marker and preserve Dash for grouped warnings.

### Chapter 4

- Name: Nhal'Kyr, Warden of Whispers
- Skill: Sepulchral Silence
- Mechanic:
  - Phase I launches a radial burst of memory shards with a deliberate escape gap.
  - Phase II closes silence-ring warning markers around the player's current position.
  - Phase III adds a pulsing frozen-heart zone around the boss.
- Counter: Read the shard gap, cross the closing ring before impact, and keep distance during the heart pulse.

### Chapter 5

- Name: Aevum, Knight of the Last Vow
- Skill: Vowclock Edict
- Mechanic:
  - Phase I draws paired clock-hand strike markers across the player.
  - Phase II repeats an attack at the player's recently recorded position.
  - Phase III accelerates the vow-clock sequence without removing warning time.
- Counter: Move perpendicular to the clock hands, leave recorded positions, and chain movement instead of doubling back.

### Chapter 6

- Name: Rimeflare, Wyrm of Two Seasons
- Skill: Seasonal Convergence
- Mechanic:
  - Alternates between aimed Flame attacks and spreading Frost attacks.
  - Phase II leaves alternating fire and ice zones.
  - Phase III combines a delayed meteor with a Frost shard fan.
- Counter: Identify the active season by attack color, avoid overlapping zones, and save Dash for the combined attack.

### Chapter 7

- Name: Aureolith, the Crownless Skywarden
- Skill: Seven-Anchor Dominion
- Mechanic:
  - Phase I drops geometric anchor-marker formations around the player.
  - Phase II periodically pulls the player toward the boss while anchors form.
  - Phase III creates a wider sky-anchor collapse with a visible escape lane.
- Counter: Exit through the formation gap, move against the pull early, and avoid waiting inside the final pattern.

### Chapter 8

- Name: Verdigris, Root of the First Command
- Skill: Worldforge Root
- Mechanic:
  - Phase I grows root-cage markers around the player.
  - Phase II creates persistent command-root hazard zones.
  - Phase III chains sequential worldforge eruptions from the boss toward the player's position.
- Counter: Leave the cage before it closes, rotate away from persistent roots, and move sideways across the eruption chain.

### Chapter 9

- Name: Solvane, Monarch of the Final Second
- Skill: One Perfect Second
- Mechanic:
  - Records recent player positions and attacks those afterimages after a delay.
  - Phase II adds clockface markers around the boss.
  - Phase III repeats recorded-position strikes faster while retaining telegraphs.
- Counter: Avoid retracing your route, cross the clockface between markers, and keep a continuous path during the final phase.

### Chapter 10

- Name: Orison Prime, Keeper of the Empty Throne
- Skill: Sevenfold Convergence
- Mechanic:
  - Phase I sends seven colored orbit strikes in a readable sequence.
  - Phase II collapses orbit rings inward around the player's position.
  - Phase III combines all seven orbit warnings into a final convergence pattern.
- Counter: Follow the strike sequence rather than panic-dashing, cross rings before they collapse, and reserve Dash for the final convergence.

## Data Flow

1. Story Campaign renders Stage 5 metadata from authored stage data backed by the campaign boss registry.
2. Before battle, `StoryMode` resolves and personalizes the campaign scene.
3. `CombatArena` resolves the same stage specification and copies the registry identity and campaign mechanic ID onto the runtime boss.
4. The campaign-only dispatcher runs the matching mechanic.
5. After victory, `App` resolves and personalizes the same campaign scene.
6. The Boss encyclopedia reads the registry-backed boss identity and mechanic copy.

## Performance and Device Safety

- Reuse the existing canvas projectile and warning systems.
- Do not add extra canvas layers or per-frame React state.
- Keep mobile attack particle counts within current limits.
- Use timer fields on runtime enemies and return small action arrays.
- Preserve current desktop controls and mobile controls.
- Keep warning timings readable at every supported combat speed.

## Testing

### Automated

- Assert all ten Stage 5 stage names equal their boss enemy names.
- Assert all boss dialogue speakers use the same campaign boss name.
- Assert the Boss encyclopedia registry uses the same name and mechanic copy.
- Assert Chapters 4-10 have seven unique campaign mechanic IDs.
- Assert world and Character Trial bosses have no campaign mechanic ID.
- Assert username personalization replaces speaker labels and text references, preserves source data, and falls back to `Traveler`.
- Test each mechanic scheduler for its phase-specific actions and counter-safe telegraphs.
- Run the complete tracked test suite, TypeScript lint, production build, and `git diff --check`.

### Manual

- Verify campaign stage cards, pre-battle dialogue, battle HUD, post-battle dialogue, and encyclopedia on desktop.
- Repeat representative checks at a mobile viewport.
- Confirm Arena, Artifact Grind, Rogue Ruins, and Character Story Trial bosses retain their existing mechanics and models.
- Confirm no horizontal overflow, invisible controls, blank canvases, or runtime errors.
