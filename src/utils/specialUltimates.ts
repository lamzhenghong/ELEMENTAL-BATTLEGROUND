import { ElementType } from '../types';

export const SPECIAL_ULTIMATE_UNLOCK_LEVEL = 40;
export const SPECIAL_ULTIMATE_COOLDOWN_MS = 60_000;

export type SpecialUltimateId = 'eternal_vapor' | 'worldstorm_genesis';
export type SpecialUltimateStyle = 'vapor' | 'worldstorm';
export type SpecialUltimateFollowup = 'boiling-point' | 'living-storm-network';

export interface SpecialUltimateDialogueLine {
  characterId: string;
  speaker: string;
  line: string;
}

export interface SpecialUltimateCombo {
  id: SpecialUltimateId;
  name: string;
  requiredCharacterIds: readonly [string, string];
  dialogue: readonly SpecialUltimateDialogueLine[];
  damageElement: ElementType;
  damageMultiplier: number;
  impactText: string;
  style: SpecialUltimateStyle;
  followup: SpecialUltimateFollowup;
}

export interface SpecialUltimateCombatant {
  id: string;
  currentHp?: number;
  ultimateEnergy: number;
  ultimateMaxEnergy: number;
}

export interface SpecialUltimateQuery {
  partyIds: readonly string[];
  combatParty: readonly SpecialUltimateCombatant[];
  activeCharacterId: string | null | undefined;
  playerLevel: number;
  devCheatsEnabled: boolean;
  cooldownReadyAt: number;
  now?: number;
}

export interface AvailableSpecialUltimate {
  combo: SpecialUltimateCombo;
  cooldownRemainingMs: number;
}

export interface SpecialUltimateCharacterEntry {
  characterId: string;
  comboName: string;
  partnerName: string;
  damageMultiplier: number;
  unlockRule: string;
  fullDescription: string;
}

export const SPECIAL_ULTIMATE_COMBOS: readonly SpecialUltimateCombo[] = [
  {
    id: 'eternal_vapor',
    name: 'Eternal Vapor',
    requiredCharacterIds: ['aurelia', 'kaelen'],
    dialogue: [
      { characterId: 'aurelia', speaker: 'Aurelia', line: 'Together?' },
      { characterId: 'kaelen', speaker: 'Kaelen', line: 'Always.' }
    ],
    damageElement: 'Pyro',
    damageMultiplier: 5,
    impactText: 'MASSIVE VAPORIZE DETONATION',
    style: 'vapor',
    followup: 'boiling-point'
  },
  {
    id: 'worldstorm_genesis',
    name: 'Worldstorm Genesis',
    requiredCharacterIds: ['maelis', 'veyra'],
    dialogue: [
      { characterId: 'maelis', speaker: 'Maelis', line: 'The forest answers.' },
      { characterId: 'veyra', speaker: 'Veyra', line: 'Then let the heavens roar.' }
    ],
    damageElement: 'Electro',
    damageMultiplier: 5,
    impactText: 'HYPERBLOOM WORLDSTORM',
    style: 'worldstorm',
    followup: 'living-storm-network'
  }
];

const SPECIAL_ULTIMATE_CHARACTER_ENTRIES: Readonly<Record<string, SpecialUltimateCharacterEntry>> = {
  aurelia: {
    characterId: 'aurelia', comboName: 'Eternal Vapor', partnerName: 'Kaelen Tidebound', damageMultiplier: 5,
    unlockRule: 'Unlocks at Player Level 40. Developer Cheats bypass the level requirement for testing.',
    fullDescription: 'When Aurelia Sunflare and Kaelen Tidebound are both in the party with full Ultimate gauges, activate Eternal Vapor while either partner is active. The opening blast deals 500% full-AoE damage based on the active hero and inherits their Portrait bonuses. It then applies Vapor Pressure for 10 seconds. Party hits add Pressure; at 5 stacks the target erupts for focused Pyro damage. Normal and elite enemies are briefly pulled inward, while bosses resist the pull and become 10% more vulnerable for 4 seconds.'
  },
  kaelen: {
    characterId: 'kaelen', comboName: 'Eternal Vapor', partnerName: 'Aurelia Sunflare', damageMultiplier: 5,
    unlockRule: 'Unlocks at Player Level 40. Developer Cheats bypass the level requirement for testing.',
    fullDescription: 'When Kaelen Tidebound and Aurelia Sunflare are both in the party with full Ultimate gauges, activate Eternal Vapor while either partner is active. The opening blast deals 500% full-AoE damage based on the active hero and inherits their Portrait bonuses. It then applies Vapor Pressure for 10 seconds. Party hits add Pressure; at 5 stacks the target erupts for focused Pyro damage. Normal and elite enemies are briefly pulled inward, while bosses resist the pull and become 10% more vulnerable for 4 seconds.'
  },
  maelis: {
    characterId: 'maelis', comboName: 'Worldstorm Genesis', partnerName: 'Veyra Stormglass', damageMultiplier: 5,
    unlockRule: 'Unlocks at Player Level 40. Developer Cheats bypass the level requirement for testing.',
    fullDescription: 'When Maelis Verdantveil and Veyra Stormglass are both in the party with full Ultimate gauges, activate Worldstorm Genesis while either partner is active. The opening blast deals 500% full-AoE damage based on the active hero and inherits their Portrait bonuses. Living Storm Network then links up to five enemies for 12 seconds. Direct damage to one linked target echoes 20% damage to the others, capped at the active hero\'s snapshotted ATK. Every 3 seconds normal and elite enemies are rooted; bosses resist the root and receive a concentrated 75% ATK lightning strike instead.'
  },
  veyra: {
    characterId: 'veyra', comboName: 'Worldstorm Genesis', partnerName: 'Maelis Verdantveil', damageMultiplier: 5,
    unlockRule: 'Unlocks at Player Level 40. Developer Cheats bypass the level requirement for testing.',
    fullDescription: 'When Veyra Stormglass and Maelis Verdantveil are both in the party with full Ultimate gauges, activate Worldstorm Genesis while either partner is active. The opening blast deals 500% full-AoE damage based on the active hero and inherits their Portrait bonuses. Living Storm Network then links up to five enemies for 12 seconds. Direct damage to one linked target echoes 20% damage to the others, capped at the active hero\'s snapshotted ATK. Every 3 seconds normal and elite enemies are rooted; bosses resist the root and receive a concentrated 75% ATK lightning strike instead.'
  }
};

export const getSpecialUltimateCharacterEntry = (characterId: string): SpecialUltimateCharacterEntry | null =>
  SPECIAL_ULTIMATE_CHARACTER_ENTRIES[characterId] ?? null;

export const isSpecialUltimateUnlocked = (playerLevel: number, devCheatsEnabled: boolean) => {
  return devCheatsEnabled || playerLevel >= SPECIAL_ULTIMATE_UNLOCK_LEVEL;
};

export const getSpecialUltimateCooldownRemaining = (cooldownReadyAt: number, now: number = Date.now()) => {
  return Math.max(0, cooldownReadyAt - now);
};

const hasFullUltimateGauge = (combatant: SpecialUltimateCombatant | undefined) => {
  if (!combatant || (combatant.currentHp !== undefined && combatant.currentHp <= 0)) return false;
  return combatant.ultimateEnergy >= combatant.ultimateMaxEnergy;
};

export function getAvailableSpecialUltimate(query: SpecialUltimateQuery): AvailableSpecialUltimate | null {
  const now = query.now ?? Date.now();
  if (!isSpecialUltimateUnlocked(query.playerLevel, query.devCheatsEnabled)) return null;

  const cooldownRemainingMs = getSpecialUltimateCooldownRemaining(query.cooldownReadyAt, now);
  if (cooldownRemainingMs > 0) return null;

  const partyIdSet = new Set(query.partyIds);
  const combatantsById = new Map(query.combatParty.map(combatant => [combatant.id, combatant]));

  for (const combo of SPECIAL_ULTIMATE_COMBOS) {
    const [firstId, secondId] = combo.requiredCharacterIds;
    const comboIsInParty = partyIdSet.has(firstId) && partyIdSet.has(secondId);
    if (!comboIsInParty) continue;

    const activeIsParticipant = query.activeCharacterId === firstId || query.activeCharacterId === secondId;
    if (!activeIsParticipant) continue;

    if (!hasFullUltimateGauge(combatantsById.get(firstId))) continue;
    if (!hasFullUltimateGauge(combatantsById.get(secondId))) continue;

    return { combo, cooldownRemainingMs };
  }

  return null;
}
