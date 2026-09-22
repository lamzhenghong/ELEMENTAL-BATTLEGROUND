export interface WeaponTemplate {
  name: string;
  rarity: 3 | 4 | 5;
  weaponType: 'Sword' | 'Claymore' | 'Bow' | 'Catalyst' | 'Polearm';
  baseAtk: number;
  statBonus: string;
  featureDesc: string;
}

export const WEAPONS_DATABASE: WeaponTemplate[] = [
  // Swords
  {
    name: "Solar Searing Blade",
    rarity: 5,
    weaponType: "Sword",
    baseAtk: 48,
    statBonus: "Crit Rate +10%",
    featureDesc: "Searing Aura: Reduces Elemental Skill cooldown by 10% and increases elemental damage by 12%."
  },
  {
    name: "Sacrificial Sword",
    rarity: 4,
    weaponType: "Sword",
    baseAtk: 32,
    statBonus: "Energy Recharge +8%",
    featureDesc: "Composed: Elemental Skill damage has a 40% chance to reset its cooldown. Can trigger once every 30s."
  },
  {
    name: "Favonius Sword",
    rarity: 4,
    weaponType: "Sword",
    baseAtk: 30,
    statBonus: "Energy Recharge +10%",
    featureDesc: "Windfall: Critical hits have a 60% chance to restore 6 Energy. Can trigger once every 3s."
  },
  {
    name: "Cool Steel",
    rarity: 3,
    weaponType: "Sword",
    baseAtk: 18,
    statBonus: "ATK +4%",
    featureDesc: "Suppression: Increases DMG against opponents affected by Hydro or Cryo by 12%."
  },
  {
    name: "Harbinger of Dawn",
    rarity: 3,
    weaponType: "Sword",
    baseAtk: 20,
    statBonus: "Crit DMG +8%",
    featureDesc: "Vigorous: When HP is above 90%, increases Crit Rate by 14%."
  },
  {
    name: "Dull Blade",
    rarity: 3,
    weaponType: "Sword",
    baseAtk: 14,
    statBonus: "ATK +2%",
    featureDesc: "Novice Steel: Increases Normal Attack damage by 5%."
  },

  // Claymores
  {
    name: "Calamity Blaze",
    rarity: 5,
    weaponType: "Claymore",
    baseAtk: 54,
    statBonus: "ATK +12%",
    featureDesc: "Exploding Sweep: Normal attacks gain 35% reach, deal 18% more damage, and push normal enemies back slightly."
  },
  {
    name: "Favonius Greatsword",
    rarity: 4,
    weaponType: "Claymore",
    baseAtk: 34,
    statBonus: "Energy Recharge +8%",
    featureDesc: "Windfall: Critical hits have a 60% chance to restore 6 Energy. Can trigger once every 3s."
  },
  {
    name: "Royal Claymore",
    rarity: 4,
    weaponType: "Claymore",
    baseAtk: 36,
    statBonus: "ATK +6%",
    featureDesc: "Focus: A non-critical normal hit grants 4% Crit Rate. Max 4 stacks; landing a critical hit clears all stacks."
  },
  {
    name: "Debate Club",
    rarity: 3,
    weaponType: "Claymore",
    baseAtk: 20,
    statBonus: "ATK +4%",
    featureDesc: "Blunt Conclusion: For 6s after using an Elemental Skill, normal hits deal 12% area damage once every 2s."
  },
  {
    name: "Bloodtainted Greatsword",
    rarity: 3,
    weaponType: "Claymore",
    baseAtk: 22,
    statBonus: "Elemental Mastery +12",
    featureDesc: "Bane of Fire & Thunders: Increases DMG against opponents affected by Pyro or Electro by 16%."
  },
  {
    name: "Iron Point Claymore",
    rarity: 3,
    weaponType: "Claymore",
    baseAtk: 17,
    statBonus: "Physical DMG +3%",
    featureDesc: "Heavy Cleave: Increases Normal Attack damage by 6%."
  },

  // Bows
  {
    name: "Solar Wind Bow",
    rarity: 5,
    weaponType: "Bow",
    baseAtk: 46,
    statBonus: "Crit DMG +12%",
    featureDesc: "Hurricane Snipe: Normal attacks gain 100% range, pierce enemies, and deal 18% more damage."
  },
  {
    name: "Rust",
    rarity: 4,
    weaponType: "Bow",
    baseAtk: 34,
    statBonus: "ATK +6%",
    featureDesc: "Rapid Fire: Increases Normal Attack damage by 16%."
  },
  {
    name: "Sacrificial Bow",
    rarity: 4,
    weaponType: "Bow",
    baseAtk: 32,
    statBonus: "Energy Recharge +8%",
    featureDesc: "Composed: Elemental Skill damage has a 40% chance to reset its cooldown. Can trigger once every 30s."
  },
  {
    name: "Slingshot",
    rarity: 3,
    weaponType: "Bow",
    baseAtk: 20,
    statBonus: "Crit Rate +5%",
    featureDesc: "Sureshot: Normal attacks deal 8% more damage to nearby enemies."
  },
  {
    name: "Raven Bow",
    rarity: 3,
    weaponType: "Bow",
    baseAtk: 18,
    statBonus: "Elemental Mastery +10",
    featureDesc: "Bane of Flame & Water: Increases DMG against opponents affected by Pyro or Hydro by 12%."
  },
  {
    name: "Hunter's Bow",
    rarity: 3,
    weaponType: "Bow",
    baseAtk: 14,
    statBonus: "ATK +2%",
    featureDesc: "Wilds Tracker: Increases Normal Attack damage by 6%."
  },

  // Catalysts
  {
    name: "Abyssal Ocean Scepter",
    rarity: 5,
    weaponType: "Catalyst",
    baseAtk: 45,
    statBonus: "Crit Rate +9%",
    featureDesc: "Sea Whirlpool: Normal hits create a Hydro bubble dealing 28% ATK as area damage. Can trigger once every 1.25s."
  },
  {
    name: "Widsith",
    rarity: 4,
    weaponType: "Catalyst",
    baseAtk: 33,
    statBonus: "Crit DMG +10%",
    featureDesc: "Debut: On taking the field, gain either 30% ATK or 24% elemental damage for 10s. Can trigger once every 30s."
  },
  {
    name: "Favonius Codex",
    rarity: 4,
    weaponType: "Catalyst",
    baseAtk: 30,
    statBonus: "Energy Recharge +10%",
    featureDesc: "Windfall: Critical hits have a 60% chance to restore 6 Energy. Can trigger once every 3s."
  },
  {
    name: "Thrilling Tales of Dragon Slayers",
    rarity: 3,
    weaponType: "Catalyst",
    baseAtk: 19,
    statBonus: "HP +6%",
    featureDesc: "Heritage: Switching out grants the incoming character 16% ATK for 8s. Can trigger once every 20s."
  },
  {
    name: "Magic Guide",
    rarity: 3,
    weaponType: "Catalyst",
    baseAtk: 17,
    statBonus: "Elemental Mastery +8",
    featureDesc: "Bane of Storm & Tide: Increases DMG against opponents affected by Hydro or Electro by 12%."
  },
  {
    name: "Apprentice's Notes",
    rarity: 3,
    weaponType: "Catalyst",
    baseAtk: 13,
    statBonus: "HP +3%",
    featureDesc: "Fresh Insights: Increases Elemental Skill damage by 5%."
  },

  // Polearms
  {
    name: "Primordial Jade Winged-Spear",
    rarity: 5,
    weaponType: "Polearm",
    baseAtk: 47,
    statBonus: "Crit Rate +11%",
    featureDesc: "Jade Stack: Normal attacks deal 8% more damage and echo for 30% damage once every 1.2s."
  },
  {
    name: "Dragon's Bane",
    rarity: 4,
    weaponType: "Polearm",
    baseAtk: 32,
    statBonus: "Elemental Mastery +14",
    featureDesc: "Bane of Burning Sands: Increases DMG against opponents affected by Hydro or Pyro by 20%."
  },
  {
    name: "Crescent Pike",
    rarity: 4,
    weaponType: "Polearm",
    baseAtk: 34,
    statBonus: "Physical DMG +5%",
    featureDesc: "Infusion Needle: After collecting an Elemental Shard, normal attacks deal an extra 20% damage for 5s."
  },
  {
    name: "White Tassel",
    rarity: 3,
    weaponType: "Polearm",
    baseAtk: 19,
    statBonus: "Crit Rate +4%",
    featureDesc: "Sharp Spearhead: Increases Normal Attack damage by 8%."
  },
  {
    name: "Black Tassel",
    rarity: 3,
    weaponType: "Polearm",
    baseAtk: 17,
    statBonus: "HP +5%",
    featureDesc: "Bane of Soft Bodies: Increases damage against slimes by 30%."
  },
  {
    name: "Beginner's Protector",
    rarity: 3,
    weaponType: "Polearm",
    baseAtk: 13,
    statBonus: "ATK +2%",
    featureDesc: "Novice Spike: Increases Normal Attack damage by 5%."
  }
];
