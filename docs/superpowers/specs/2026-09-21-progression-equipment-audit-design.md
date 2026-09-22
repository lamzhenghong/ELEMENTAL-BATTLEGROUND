# Progression, Equipment, and Reward Integrity Design

## Goal

Make portrait attunement, weapon passives, artifact bonuses, party resonance, character progression, and reward presentation use one verified runtime path while preserving existing saves and combat rules.

## Architecture

- `portraitEffects` resolves unlocked and equipped portrait tiers, clamps invalid save data, supplies accumulated buffs, and supplies one visual-frame model to every portrait surface.
- `weaponEffects` owns canonical weapon-name aliases, passive values, secondary-stat parsing, damage modifiers, range modifiers, proc chances, durations, and cooldowns. Weapon descriptions come from the same definitions.
- `characterBuildStats` remains the shared final-stat calculator and consumes portrait, weapon-secondary, and artifact data. Combat initialization consumes its output instead of rebuilding stats.
- `artifactEquipment` validates slot ownership and repairs stale/deleted/duplicate assignments during save migration.
- `partyResonance` resolves party composition once for both Party Setup and combat. Runtime effects query the same keys and values shown in the UI.
- `characterProgression` classifies normal, milestone, and ascension upgrades and creates the presentation payload independently from state mutation.
- `rewardReveal` remains the sole presentation queue. It expands to materials, items, skins, characters, and progression rewards while preserving immediate state grants and the combat artifact-drop exception.

## Save Compatibility

`characterPortraits` is the single portrait progression map. A character at P3 automatically receives P1, P2, and P3 effects; a P6 character receives every effect from P1 through P6. Portrait bonuses are never individually equipped or disabled, and higher tiers remain locked until unlocked.

Artifact equipment is normalized on load. Only existing artifacts in their actual slot may remain equipped, one artifact may have one owner, and `equippedTo` is rebuilt from the authoritative character-slot map.

## Presentation

Portrait tiers use a restrained element-colored frame and pulse. Low tiers are static; higher tiers add a bounded highlight animation that respects reduced motion.

Character progression appears in the existing Forge surface. Normal upgrades are brief, milestones add a crest pulse, and the level-50 ascension uses a focused overlay with stat deltas and a skip action. Mobile uses the same content in a compact layout.

Reward events resolve source and destination dynamically. Hidden destinations fall back to the visible Forge/navigation target or a centered confirmation. State updates never wait for animation completion.

## Verification Strategy

Pure resolvers receive exhaustive unit coverage. Source integration tests assert that combat and UI use those resolvers. Browser verification covers desktop, mobile landscape, reduced motion, portrait selection, character progression, artifact equip/remove, and reward queue interruption.
