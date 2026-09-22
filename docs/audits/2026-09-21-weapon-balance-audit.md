# Weapon Runtime and Balance Audit

This table records the pre-edit runtime audit. Practical power estimates include realistic uptime and trigger difficulty, not only displayed percentages.

| Weapon | Rarity | Current stats | Current passive | Works | Runtime issue | Est. power | Decision | Final behavior | Reason |
|---|---:|---|---|---|---|---:|---|---|---|
| Solar Searing Blade | 5 | 48 ATK, CR 10% | 20% skill CD reduction, 10% damage | Partial | Damage applies to physical too; combined uptime is high | 30% | Nerf/fix | 10% skill CD reduction, 12% elemental damage | Keeps speed identity within 5-star target |
| Calamity Blaze | 5 | 54 ATK, ATK 12% | +50% reach, unbounded knockback | Partial | No stated damage benefit; knockback fires on every source | 14% | Rework | +35% normal reach, +18% normal damage, controlled knockback | Strong heavy-weapon identity without displacement spam |
| Solar Wind Bow | 5 | 46 ATK, CD 12% | +150% range and pierce | Yes | Range is excessive and passive lacks output value | 17% | Rework | +100% normal range, piercing, +18% normal damage | Strong ranged identity with bounded output |
| Abyssal Ocean Scepter | 5 | 45 ATK, CR 9% | 40% AoE every 0.75s | Yes | Proc rate produces excessive multi-target scaling | 40%+ | Nerf | 28% AoE, 1.25s internal cooldown | Keeps splash identity in target band |
| Primordial Jade Winged-Spear | 5 | 47 ATK, CR 11% | 75% extra strike every 0.5s | Yes | Far above 5-star practical target | 60%+ | Nerf/rework | +8% normal damage; 30% echo every 1.2s | Fast combo identity with bounded echo |
| Sacrificial Sword | 4 | 32 ATK, ER 8% | 40% skill reset, 30s ICD | Yes | ICD omitted from description; ER stat inactive | 13% | Fix | Keep 40%, 30s ICD; activate ER | Good specialized 4-star |
| Favonius Sword | 4 | 30 ATK, ER 10% | 60% crit proc for 6 energy | Partial | No internal cooldown; ER inactive | 18%+ | Fix | 60%, 6 energy, 3s ICD; activate ER | Prevents rapid multi-hit energy loops |
| Cool Steel | 3 | 18 ATK, ATK 4% | +12% vs Hydro/Cryo | Yes | None | 6-8% | Keep | Unchanged | Clear early niche |
| Harbinger of Dawn | 3 | 20 ATK, CD 8% | +14% CR above 90% HP | Yes | None | 8-10% | Keep | Unchanged | Strong but fragile condition |
| Dull Blade | 3 | 14 ATK, ATK 2% | Flavor only | No | No runtime passive | 0% | Buff | +5% normal attack damage | Simple starter benefit |
| Favonius Greatsword | 4 | 34 ATK, ER 8% | 60% crit proc for 6 energy | Partial | No ICD; ER inactive | 18%+ | Fix | 60%, 6 energy, 3s ICD; activate ER | Same family behavior |
| Royal Claymore | 4 | 36 ATK, ATK 6% | +8% CR per non-crit, max 5, reset on crit | Yes | Peaks at +40% CR too easily | 22% | Nerf | +4% CR, max 4, reset on crit | Bounded consistency tool |
| Debate Club | 3 | 20 ATK, ATK 4% | 60% AoE for 10s after skill, 1.5s ICD | Yes | 3-star output exceeds 5-stars | 30%+ | Nerf | 12% AoE for 6s, 2s ICD | Preserves skill-to-basic loop |
| Bloodtainted Greatsword | 3 | 22 ATK, EM 12 | +16% vs Pyro/Electro | Partial | Passive works; EM inactive | 7-9% | Fix | Keep passive; activate EM | Correct niche value |
| Iron Point Claymore | 3 | 17 ATK, Physical 3% | Flavor only | No | No runtime passive; physical stat inactive | 0% | Buff | +6% normal damage; activate physical bonus | Simple heavy starter benefit |
| Rust | 4 | 34 ATK, ATK 6% | +40% normal, -10% charged | No | No charged-attack system and passive disconnected | 0% | Rework | +16% normal attack damage | Matches available combat verbs |
| Sacrificial Bow | 4 | 32 ATK, ER 8% | 40% skill reset, 30s ICD | Yes | ER inactive; ICD omitted | 13% | Fix | Keep 40%, 30s ICD; activate ER | Good specialized 4-star |
| Slingshot | 3 | 20 ATK, CR 5% | +36% when projectile lands in 1.2s | No | Travel time is not represented | 0% | Rework | +8% normal damage within close range | Testable, readable niche |
| Raven Bow | 3 | 18 ATK, EM 10 | +12% vs Pyro/Hydro | Partial | Passive works; EM inactive | 6-8% | Fix | Keep passive; activate EM | Correct early reaction niche |
| Hunter's Bow | 3 | 14 ATK, ATK 2% | Flavor only | No | No runtime passive | 0% | Buff | +6% normal attack damage | Reliable starter value |
| Widsith | 4 | 33 ATK, CD 10% | Swap grants +60% ATK or +48% damage for 10s/30s | Yes | Burst values are excessive | 18-24% | Nerf | +30% ATK or +24% elemental damage for 10s/30s | Keeps random-song identity |
| Favonius Codex | 4 | 30 ATK, ER 10% | 60% crit proc for 6 energy | Partial | No ICD; ER inactive | 18%+ | Fix | 60%, 6 energy, 3s ICD; activate ER | Same family behavior |
| Thrilling Tales of Dragon Slayers | 3 | 19 ATK, HP 6% | Incoming ally +24% ATK for 10s/20s | Partial | HP inactive; party buff exceeds 3-star budget | 12% | Nerf/fix | +16% ATK for 8s/20s; activate HP | Valuable support niche without dominance |
| Magic Guide | 3 | 17 ATK, EM 8 | +12% vs Hydro/Electro | Partial | Passive works; EM inactive | 6-8% | Fix | Keep passive; activate EM | Correct early reaction niche |
| Apprentice's Notes | 3 | 13 ATK, HP 3% | Flavor only | No | HP inactive and no passive | 0% | Buff | +5% elemental-skill damage; activate HP | Simple catalyst starter benefit |
| Dragon's Bane | 4 | 32 ATK, EM 14 | +20% vs Hydro/Pyro | Partial | Passive works; EM inactive | 12-16% | Fix | Keep passive; activate EM | Specialized 4-star target |
| Crescent Pike | 4 | 34 ATK, Physical 5% | +20% basic damage after shard for 5s | Partial | Physical inactive; trigger duration absent from text | 8-14% | Fix | Keep 20% for 5s; activate physical bonus | Trigger difficulty limits uptime |
| White Tassel | 3 | 19 ATK, CR 4% | +24% normal damage | Yes | Unrestricted multiplier too high | 24% | Nerf | +8% normal damage | Fits 3-star target |
| Black Tassel | 3 | 17 ATK, HP 5% | +40% vs slimes | Partial | HP inactive; niche value acceptable but number is noisy | 5-10% | Nerf/fix | +30% vs slimes; activate HP | Keeps anti-slime identity |
| Beginner's Protector | 3 | 13 ATK, ATK 2% | Flavor only | No | No runtime passive | 0% | Buff | +5% normal attack damage | Simple starter benefit |

## Cross-Cutting Findings

- HP, Energy Recharge, Elemental Mastery, and Physical DMG secondary stats were displayed but ignored by the shared build calculator and combat.
- Runtime passive values were hard-coded by weapon-name checks, so descriptions could drift from behavior.
- Favonius had no internal cooldown, allowing rapid multi-hit energy loops.
- The five starter-save aliases did not match canonical database names, preventing exact definition lookup.
- Combat and Forge separately rebuilt stats, allowing display/runtime drift.
