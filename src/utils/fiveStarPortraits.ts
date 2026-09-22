import type { ElementType } from '../types';

export interface FiveStarPortraitStatBuffs {
  hp?: number;
  def?: number;
  critRate?: number;
  elementalDamage?: number;
  energyRecharge?: number;
  elementalMastery?: number;
}

export interface FiveStarPortraitTier {
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  kind: 'stat' | 'mechanic';
  name: string;
  description: string;
  statBuff?: FiveStarPortraitStatBuffs;
}

export interface FiveStarPortraitDefinition {
  characterId: string;
  rotationSummary: string;
  tiers: readonly FiveStarPortraitTier[];
}

export const FIVE_STAR_PORTRAITS: Readonly<Record<string, FiveStarPortraitDefinition>> = {
  aurelia: {
    characterId: 'aurelia',
    rotationSummary: 'Brand enemies, pressure them with direct hits, detonate Solar Ruptures, then extend the rotation through Solar Detonation.',
    tiers: [
      { tier: 1, kind: 'mechanic', name: 'Solar Temper', description: 'Burning damage increases by 20%. Burning enemies are also considered Sun-Branded.' },
      { tier: 2, kind: 'stat', name: 'Brand Precision', description: 'Critical Rate increases by 10%.', statBuff: { critRate: 0.10 } },
      { tier: 3, kind: 'mechanic', name: 'Searing Solstice', description: 'Searing Brand cooldown is reduced by 2 seconds and its Burning duration increases by 2 seconds.' },
      { tier: 4, kind: 'stat', name: 'Sunflare Focus', description: 'Pyro damage increases by 18%.', statBuff: { elementalDamage: 0.18 } },
      { tier: 5, kind: 'mechanic', name: 'Daybreak Combustion', description: 'Solar Detonation initial damage increases by 25%, and its Burning damage increases from 75% to 100% ATK per tick.' },
      { tier: 6, kind: 'mechanic', name: 'Eternal Warden Dominion', description: 'Every fourth direct hit against a Sun-Branded enemy triggers Solar Rupture for 160% ATK and extends Burning by 1.5 seconds. Each target can trigger this once every 1.8 seconds.' }
    ]
  },
  kaelen: {
    characterId: 'kaelen',
    rotationSummary: 'Chart controlled enemies, trigger reactions to call spectral cannons, then gather the battlefield and finish with the Whirlpool broadside.',
    tiers: [
      { tier: 1, kind: 'mechanic', name: 'Admiral\'s Chart', description: 'Enemies Slowed or pulled by Kaelen become Charted for 6 seconds.' },
      { tier: 2, kind: 'stat', name: 'Tidal Reserve', description: 'Energy Recharge increases by 20%.', statBuff: { energyRecharge: 0.20 } },
      { tier: 3, kind: 'mechanic', name: 'Frozen Tide Pressure', description: 'Frozen Tide cooldown is reduced by 2 seconds. Its Slow becomes 50% and lasts 4 seconds.' },
      { tier: 4, kind: 'stat', name: 'Pearl Fleet Poise', description: 'Hydro damage increases by 15%.', statBuff: { elementalDamage: 0.15 } },
      { tier: 5, kind: 'mechanic', name: 'Abyssal Broadside', description: 'Abyssal Whirlpool lasts 1 second longer and ends with a broadside dealing 150% ATK Hydro damage.' },
      { tier: 6, kind: 'mechanic', name: 'Grand Admiral Command', description: 'Reactions against Charted enemies call a spectral cannon for 110% ATK Hydro damage and refresh Charted. This can occur once every 1.3 seconds per target.' }
    ]
  },
  maelis: {
    characterId: 'maelis',
    rotationSummary: 'Raise a stronger Aegis, establish the Resonance Field, then use reactions to sustain the shield and trigger Growth Blooms.',
    tiers: [
      { tier: 1, kind: 'stat', name: 'Deepwood Vitality', description: 'Max HP increases by 20%.', statBuff: { hp: 0.20 } },
      { tier: 2, kind: 'mechanic', name: 'Heartwood Communion', description: 'Shielded heroes gain 50 Elemental Mastery. Their reactions restore 150 shield HP once every 1.5 seconds.' },
      { tier: 3, kind: 'mechanic', name: 'Canopy Bastion', description: 'Heartwood Aegis cooldown is reduced by 2 seconds and its maximum shared shield increases from 3,000 to 4,000 HP.' },
      { tier: 4, kind: 'stat', name: 'Rootbound Guard', description: 'Defense increases by 18%.', statBuff: { def: 0.18 } },
      { tier: 5, kind: 'mechanic', name: 'Sovereign Grove', description: 'Verdant Resonance Field lasts 18 seconds. Enemies inside deal 25% less damage and have 12% lower Dendro resistance.' },
      { tier: 6, kind: 'mechanic', name: 'Sovereign Bloom', description: 'Reactions inside the field grant Growth. At 3 Growth, deal 180% ATK Dendro damage, restore 500 shield HP, and increase party reaction damage by 18% for 5 seconds.' }
    ]
  },
  veyra: {
    characterId: 'veyra',
    rotationSummary: 'Prime Prism Pursuit with a dodge, expose priority targets with Thunder Lock, then fire rapid prism bolts throughout Dominion.',
    tiers: [
      { tier: 1, kind: 'mechanic', name: 'Prism Pursuit', description: 'Dodging charges Prism Pursuit. Veyra\'s next normal attack releases a chain spark dealing 70% ATK Electro damage.' },
      { tier: 2, kind: 'stat', name: 'Stormglass Precision', description: 'Critical Rate increases by 10%.', statBuff: { critRate: 0.10 } },
      { tier: 3, kind: 'mechanic', name: 'Thunder Lock Aperture', description: 'Thunder Lock cooldown is reduced by 2 seconds. Bosses resist its Stun but become 12% more vulnerable for 4 seconds.' },
      { tier: 4, kind: 'stat', name: 'Nocturne Refraction', description: 'Electro damage increases by 18%.', statBuff: { elementalDamage: 0.18 } },
      { tier: 5, kind: 'mechanic', name: 'Dominion Overcharge', description: 'Stormglass Dominion lasts 12.5 seconds and its field pulses deal 125% ATK.' },
      { tier: 6, kind: 'mechanic', name: 'Prismatic Tempest', description: 'During Dominion, every third normal attack fires a prism bolt dealing 170% ATK Electro damage and advances the next field pulse by 0.5 seconds.' }
    ]
  },
  lyra: {
    characterId: 'lyra',
    rotationSummary: 'Complete attack strings to collect Royal Notes, establish Frost Lotus, then spend four Notes on an Avalanche and Frozen shatter.',
    tiers: [
      { tier: 1, kind: 'mechanic', name: 'Royal Note', description: 'Normal attack finishers release a Cryo spike dealing 90% ATK and grant 1 Royal Note.' },
      { tier: 2, kind: 'stat', name: 'Frostbloom Precision', description: 'Critical Rate increases by 10%.', statBuff: { critRate: 0.10 } },
      { tier: 3, kind: 'mechanic', name: 'Frost Lotus', description: 'Skill cooldown is reduced by 1.5 seconds. Frost Lotus lasts 4 seconds and deals 60% ATK Cryo damage each second.' },
      { tier: 4, kind: 'stat', name: 'Glacial Crown', description: 'Cryo damage increases by 18%.', statBuff: { elementalDamage: 0.18 } },
      { tier: 5, kind: 'mechanic', name: 'Avalanche Overture', description: 'Ultimate damage increases by 30% and affected enemies take 12% more Cryo damage for 10 seconds.' },
      { tier: 6, kind: 'mechanic', name: 'Winter Queen\'s Cadenza', description: 'At 4 Royal Notes, casting Skill triggers a mini Avalanche for 200% ATK. Frozen enemies also shatter for 100% ATK Cryo damage.' }
    ]
  },
  zephyr: {
    characterId: 'zephyr',
    rotationSummary: 'Record multiple elements through Swirl, fire an empowered ricochet, absorb an element with the Ultimate, then awaken the Storm Wyrm.',
    tiers: [
      { tier: 1, kind: 'mechanic', name: 'Wandering Current', description: 'Skill gains 2 additional bounces and records every element it Swirls.' },
      { tier: 2, kind: 'stat', name: 'Aerial Insight', description: 'Elemental Mastery increases by 80.', statBuff: { elementalMastery: 80 } },
      { tier: 3, kind: 'mechanic', name: 'Fourfold Ricochet', description: 'Skill cooldown is reduced by 2 seconds and gains 10% damage for each unique recorded element, up to 40%.' },
      { tier: 4, kind: 'stat', name: 'Tempest Reserve', description: 'Energy Recharge increases by 18%.', statBuff: { energyRecharge: 0.18 } },
      { tier: 5, kind: 'mechanic', name: 'Wyrm Eye', description: 'Ultimate duration increases by 3 seconds and reduces resistance to its absorbed element by 12%.' },
      { tier: 6, kind: 'mechanic', name: 'Living Storm', description: 'After 3 Swirls, awaken the Storm Wyrm for 8 seconds. Direct attacks and party reactions launch a 110% ATK Anemo gust once per second.' }
    ]
  },
  goliath: {
    characterId: 'goliath',
    rotationSummary: 'Build Mountain Force by absorbing damage, refresh the shield through seismic pulses, then recast Skill to release the stored force.',
    tiers: [
      { tier: 1, kind: 'stat', name: 'Bedrock Frame', description: 'Defense increases by 25%.', statBuff: { def: 0.25 } },
      { tier: 2, kind: 'mechanic', name: 'Mountain Reservoir', description: 'Shield strength increases by 20%. Damage absorbed by shields becomes Mountain Force.' },
      { tier: 3, kind: 'mechanic', name: 'Faultline Reprisal', description: 'Skill cooldown is reduced by 2 seconds. When a shield breaks, deal 160% DEF Geo damage nearby.' },
      { tier: 4, kind: 'stat', name: 'Monolith Heart', description: 'Max HP increases by 20%.', statBuff: { hp: 0.20 } },
      { tier: 5, kind: 'mechanic', name: 'Seismic Renewal', description: 'Ultimate pulse damage increases by 30% and every pulse restores 300 shield HP.' },
      { tier: 6, kind: 'mechanic', name: 'Worldspine Release', description: 'Recasting Skill consumes Mountain Force to deal stored Geo damage, capped at 500% DEF, then restores 50% of the active shield.' }
    ]
  },
  raijin: {
    characterId: 'raijin',
    rotationSummary: 'Land three-hit strings to apply Lightning Sigils, double-cast Skill, enter the Ultimate stance, then consume rebuilt Sigils for execution strikes.',
    tiers: [
      { tier: 1, kind: 'mechanic', name: 'Thunder Cadence', description: 'Every third normal hit deals 35% additional damage and applies 1 Lightning Sigil.' },
      { tier: 2, kind: 'stat', name: 'Volt Precision', description: 'Critical Rate increases by 10%.', statBuff: { critRate: 0.10 } },
      { tier: 3, kind: 'mechanic', name: 'Twin Flash', description: 'Skill may be recast within 3 seconds for 80% damage and applies another Lightning Sigil.' },
      { tier: 4, kind: 'stat', name: 'Storm Crown', description: 'Electro damage increases by 18%.', statBuff: { elementalDamage: 0.18 } },
      { tier: 5, kind: 'mechanic', name: 'Raijin Ascendant', description: 'Ultimate duration increases by 2.5 seconds and persistent lightning damage increases by 25%.' },
      { tier: 6, kind: 'mechanic', name: 'Heavenbolt Execution', description: 'Skill consumes up to 3 Lightning Sigils, calling a 160% ATK lightning strike for each. During Ultimate, every third normal hit reapplies a Sigil.' }
    ]
  }
};

export const isPortraitTierActive = (portraitLevel: number, tier: number) =>
  Math.max(0, Math.min(6, portraitLevel)) >= tier;

export const getActiveFiveStarPortrait = (characterId: string, portraitLevel: number) => {
  const definition = FIVE_STAR_PORTRAITS[characterId];
  if (!definition) return null;
  const activeTiers = definition.tiers.filter(tier => isPortraitTierActive(portraitLevel, tier.tier));
  const statBuffs = activeTiers.reduce<FiveStarPortraitStatBuffs>((total, tier) => {
    if (!tier.statBuff) return total;
    for (const [key, value] of Object.entries(tier.statBuff) as [keyof FiveStarPortraitStatBuffs, number][]) {
      total[key] = (total[key] ?? 0) + value;
    }
    return total;
  }, {});
  return { definition, activeTiers, statBuffs };
};

export interface PortraitCombatState {
  aureliaHitsByTarget: Record<string, number>;
  aureliaRuptureCooldowns: Record<string, number>;
  kaelenCharted: Record<string, number>;
  kaelenCannonCooldowns: Record<string, number>;
  maelisGrowth: number;
  maelisShieldRestoreCooldown: number;
  maelisReactionBuffDuration: number;
  veyraPrismPursuit: boolean;
  veyraDominionNormalHits: number;
  lyraRoyalNotes: number;
  zephyrRecordedElements: ElementType[];
  zephyrSwirlCount: number;
  zephyrWyrmDuration: number;
  zephyrGustCooldown: number;
  goliathMountainForceRatio: number;
  raijinNormalHits: number;
  raijinSigils: Record<string, number>;
  raijinSkillRecastWindow: number;
  raijinSkillRecastAvailable: boolean;
}

export const createPortraitCombatState = (): PortraitCombatState => ({
  aureliaHitsByTarget: {}, aureliaRuptureCooldowns: {}, kaelenCharted: {}, kaelenCannonCooldowns: {},
  maelisGrowth: 0, maelisShieldRestoreCooldown: 0, maelisReactionBuffDuration: 0,
  veyraPrismPursuit: false, veyraDominionNormalHits: 0, lyraRoyalNotes: 0,
  zephyrRecordedElements: [], zephyrSwirlCount: 0, zephyrWyrmDuration: 0, zephyrGustCooldown: 0,
  goliathMountainForceRatio: 0, raijinNormalHits: 0, raijinSigils: {},
  raijinSkillRecastWindow: 0, raijinSkillRecastAvailable: false
});

export type PortraitCombatProc =
  | { kind: 'damage'; multiplier: number; element: ElementType; label: string }
  | { kind: 'bonus-damage'; bonusMultiplier: number; element: ElementType; label: string }
  | { kind: 'def-damage'; multiplier: number; element: ElementType; label: string }
  | { kind: 'shield-restore'; amount: number; label: string }
  | { kind: 'shield-restore-percent'; percent: number; label: string }
  | { kind: 'reaction-buff'; multiplier: number; duration: number; label: string }
  | { kind: 'advance-field-tick'; seconds: number; label: string }
  | { kind: 'apply-sigil'; count: number; label: string };

export type PortraitCombatEvent =
  | { kind: 'aurelia-direct-hit'; characterId: 'aurelia'; portraitLevel: number; targetId: string; targetIsSunBranded: boolean }
  | { kind: 'kaelen-control'; characterId: 'kaelen'; portraitLevel: number; targetId: string }
  | { kind: 'kaelen-reaction'; characterId: 'kaelen'; portraitLevel: number; targetId: string }
  | { kind: 'maelis-reaction'; characterId: 'maelis'; portraitLevel: number; insideField: boolean; shielded: boolean }
  | { kind: 'veyra-dodge'; characterId: 'veyra'; portraitLevel: number }
  | { kind: 'veyra-normal-hit'; characterId: 'veyra'; portraitLevel: number; duringDominion: boolean }
  | { kind: 'lyra-combo-finisher'; characterId: 'lyra'; portraitLevel: number; targetId: string }
  | { kind: 'lyra-skill'; characterId: 'lyra'; portraitLevel: number; targetId: string; targetIsFrozen: boolean }
  | { kind: 'zephyr-swirl'; characterId: 'zephyr'; portraitLevel: number; element?: ElementType }
  | { kind: 'zephyr-direct-or-reaction'; characterId: 'zephyr'; portraitLevel: number }
  | { kind: 'goliath-shield-absorbed'; characterId: 'goliath'; portraitLevel: number; amount: number; defense?: number }
  | { kind: 'goliath-skill'; characterId: 'goliath'; portraitLevel: number }
  | { kind: 'raijin-normal-hit'; characterId: 'raijin'; portraitLevel: number; targetId: string; duringUltimate?: boolean }
  | { kind: 'raijin-skill'; characterId: 'raijin'; portraitLevel: number; targetId?: string };

const decrementRecord = (record: Record<string, number>, delta: number) => Object.fromEntries(
  Object.entries(record).map(([key, value]) => [key, Math.max(0, value - delta)])
);

export const tickPortraitCombatState = (state: PortraitCombatState, deltaSeconds: number): PortraitCombatState => {
  const delta = Math.max(0, deltaSeconds);
  const raijinSkillRecastWindow = Math.max(0, state.raijinSkillRecastWindow - delta);
  return {
    ...state,
    aureliaRuptureCooldowns: decrementRecord(state.aureliaRuptureCooldowns, delta),
    kaelenCharted: decrementRecord(state.kaelenCharted, delta),
    kaelenCannonCooldowns: decrementRecord(state.kaelenCannonCooldowns, delta),
    maelisShieldRestoreCooldown: Math.max(0, state.maelisShieldRestoreCooldown - delta),
    maelisReactionBuffDuration: Math.max(0, state.maelisReactionBuffDuration - delta),
    zephyrWyrmDuration: Math.max(0, state.zephyrWyrmDuration - delta),
    zephyrGustCooldown: Math.max(0, state.zephyrGustCooldown - delta),
    raijinSkillRecastWindow,
    raijinSkillRecastAvailable: raijinSkillRecastWindow > 0 && state.raijinSkillRecastAvailable
  };
};

export const resolvePortraitCombatEvent = (
  state: PortraitCombatState,
  event: PortraitCombatEvent
): { state: PortraitCombatState; procs: PortraitCombatProc[] } => {
  let next = { ...state };
  const procs: PortraitCombatProc[] = [];

  switch (event.kind) {
    case 'aurelia-direct-hit': {
      if (!isPortraitTierActive(event.portraitLevel, 6) || !event.targetIsSunBranded) break;
      const hits = (state.aureliaHitsByTarget[event.targetId] ?? 0) + 1;
      next.aureliaHitsByTarget = { ...state.aureliaHitsByTarget, [event.targetId]: hits };
      if (hits >= 4 && (state.aureliaRuptureCooldowns[event.targetId] ?? 0) <= 0) {
        next.aureliaHitsByTarget[event.targetId] = 0;
        next.aureliaRuptureCooldowns = { ...state.aureliaRuptureCooldowns, [event.targetId]: 1.8 };
        procs.push({ kind: 'damage', multiplier: 1.6, element: 'Pyro', label: 'SOLAR RUPTURE' });
      }
      break;
    }
    case 'kaelen-control':
      if (isPortraitTierActive(event.portraitLevel, 1)) next.kaelenCharted = { ...state.kaelenCharted, [event.targetId]: 6 };
      break;
    case 'kaelen-reaction':
      if (isPortraitTierActive(event.portraitLevel, 6) && (state.kaelenCharted[event.targetId] ?? 0) > 0 && (state.kaelenCannonCooldowns[event.targetId] ?? 0) <= 0) {
        next.kaelenCharted = { ...state.kaelenCharted, [event.targetId]: 6 };
        next.kaelenCannonCooldowns = { ...state.kaelenCannonCooldowns, [event.targetId]: 1.3 };
        procs.push({ kind: 'damage', multiplier: 1.1, element: 'Hydro', label: 'SPECTRAL CANNON' });
      }
      break;
    case 'maelis-reaction':
      if (isPortraitTierActive(event.portraitLevel, 2) && event.shielded && state.maelisShieldRestoreCooldown <= 0) {
        next.maelisShieldRestoreCooldown = 1.5;
        procs.push({ kind: 'shield-restore', amount: 150, label: 'HEARTWOOD COMMUNION' });
      }
      if (isPortraitTierActive(event.portraitLevel, 6) && event.insideField) {
        next.maelisGrowth = state.maelisGrowth + 1;
        if (next.maelisGrowth >= 3) {
          next.maelisGrowth = 0;
          next.maelisReactionBuffDuration = 5;
          procs.push(
            { kind: 'damage', multiplier: 1.8, element: 'Dendro', label: 'GROWTH BLOOM' },
            { kind: 'shield-restore', amount: 500, label: 'SOVEREIGN BLOOM' },
            { kind: 'reaction-buff', multiplier: 1.18, duration: 5, label: 'GROWTH RESONANCE' }
          );
        }
      }
      break;
    case 'veyra-dodge':
      if (isPortraitTierActive(event.portraitLevel, 1)) next.veyraPrismPursuit = true;
      break;
    case 'veyra-normal-hit':
      if (isPortraitTierActive(event.portraitLevel, 1) && state.veyraPrismPursuit) {
        next.veyraPrismPursuit = false;
        procs.push({ kind: 'damage', multiplier: 0.7, element: 'Electro', label: 'PRISM PURSUIT' });
      }
      if (isPortraitTierActive(event.portraitLevel, 6) && event.duringDominion) {
        next.veyraDominionNormalHits = state.veyraDominionNormalHits + 1;
        if (next.veyraDominionNormalHits >= 3) {
          next.veyraDominionNormalHits = 0;
          procs.push(
            { kind: 'damage', multiplier: 1.7, element: 'Electro', label: 'PRISM BOLT' },
            { kind: 'advance-field-tick', seconds: 0.5, label: 'DOMINION ACCELERATION' }
          );
        }
      }
      break;
    case 'lyra-combo-finisher':
      if (isPortraitTierActive(event.portraitLevel, 1)) {
        next.lyraRoyalNotes = Math.min(4, state.lyraRoyalNotes + 1);
        procs.push({ kind: 'damage', multiplier: 0.9, element: 'Cryo', label: 'ROYAL NOTE' });
      }
      break;
    case 'lyra-skill':
      if (isPortraitTierActive(event.portraitLevel, 6) && state.lyraRoyalNotes >= 4) {
        next.lyraRoyalNotes = 0;
        procs.push({ kind: 'damage', multiplier: 2, element: 'Cryo', label: 'MINI AVALANCHE' });
        if (event.targetIsFrozen) procs.push({ kind: 'damage', multiplier: 1, element: 'Cryo', label: 'FROST SHATTER' });
      }
      break;
    case 'zephyr-swirl':
      if (event.element && isPortraitTierActive(event.portraitLevel, 1) && !state.zephyrRecordedElements.includes(event.element)) {
        next.zephyrRecordedElements = [...state.zephyrRecordedElements, event.element];
      }
      if (isPortraitTierActive(event.portraitLevel, 6)) {
        next.zephyrSwirlCount = state.zephyrSwirlCount + 1;
        if (next.zephyrSwirlCount >= 3) {
          next.zephyrSwirlCount = 0;
          next.zephyrWyrmDuration = 8;
        }
      }
      break;
    case 'zephyr-direct-or-reaction':
      if (isPortraitTierActive(event.portraitLevel, 6) && state.zephyrWyrmDuration > 0 && state.zephyrGustCooldown <= 0) {
        next.zephyrGustCooldown = 1;
        procs.push({ kind: 'damage', multiplier: 1.1, element: 'Anemo', label: 'STORM WYRM' });
      }
      break;
    case 'goliath-shield-absorbed':
      if (isPortraitTierActive(event.portraitLevel, 2)) {
        const defense = Math.max(1, event.defense ?? 1000);
        next.goliathMountainForceRatio = Math.min(5, state.goliathMountainForceRatio + event.amount / defense);
      }
      break;
    case 'goliath-skill':
      if (isPortraitTierActive(event.portraitLevel, 6) && state.goliathMountainForceRatio > 0) {
        procs.push(
          { kind: 'def-damage', multiplier: state.goliathMountainForceRatio, element: 'Geo', label: 'MOUNTAIN FORCE' },
          { kind: 'shield-restore-percent', percent: 0.5, label: 'MOUNTAIN AEGIS' }
        );
        next.goliathMountainForceRatio = 0;
      }
      break;
    case 'raijin-normal-hit': {
      if (!isPortraitTierActive(event.portraitLevel, 1)) break;
      const hits = state.raijinNormalHits + 1;
      next.raijinNormalHits = hits >= 3 ? 0 : hits;
      if (hits >= 3) {
        procs.push({ kind: 'bonus-damage', bonusMultiplier: 0.35, element: 'Electro', label: 'THUNDER DISCHARGE' });
        next.raijinSigils = { ...state.raijinSigils, [event.targetId]: Math.min(3, (state.raijinSigils[event.targetId] ?? 0) + 1) };
        procs.push({ kind: 'apply-sigil', count: 1, label: 'LIGHTNING SIGIL' });
      }
      break;
    }
    case 'raijin-skill': {
      if (isPortraitTierActive(event.portraitLevel, 3)) {
        if (state.raijinSkillRecastAvailable && state.raijinSkillRecastWindow > 0) {
          next.raijinSkillRecastAvailable = false;
          next.raijinSkillRecastWindow = 0;
          if (event.targetId) {
            next.raijinSigils = { ...state.raijinSigils, [event.targetId]: Math.min(3, (state.raijinSigils[event.targetId] ?? 0) + 1) };
            procs.push({ kind: 'apply-sigil', count: 1, label: 'LIGHTNING SIGIL' });
          }
        } else {
          next.raijinSkillRecastAvailable = true;
          next.raijinSkillRecastWindow = 3;
        }
      }
      if (isPortraitTierActive(event.portraitLevel, 6) && event.targetId) {
        const sigils = Math.min(3, state.raijinSigils[event.targetId] ?? 0);
        if (sigils > 0) {
          next.raijinSigils = { ...next.raijinSigils, [event.targetId]: 0 };
          for (let index = 0; index < sigils; index++) {
            procs.push({ kind: 'damage', multiplier: 1.6, element: 'Electro', label: 'HEAVENBOLT' });
          }
        }
      }
      break;
    }
  }

  return { state: next, procs };
};
