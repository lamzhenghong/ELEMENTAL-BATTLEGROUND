import type { ElementType } from '../types';

export type PartyResonanceKey = 'pyro' | 'hydro' | 'cryo' | 'electro' | 'geo' | 'anemo' | 'dendro' | 'unique';

export interface PartyResonance {
  key: PartyResonanceKey;
  name: string;
  desc: string;
}

export const PARTY_RESONANCES: Record<PartyResonanceKey, PartyResonance> = {
  pyro: { key: 'pyro', name: 'Fervent Flames (2 Pyro)', desc: '+15% ATK boost' },
  hydro: { key: 'hydro', name: 'Soothing Waters (2 Hydro)', desc: '+20% Energy Recharge rate boost' },
  cryo: { key: 'cryo', name: 'Shattering Ice (2 Cryo)', desc: '+15% Crit Rate against Frozen/Cryo targets' },
  electro: { key: 'electro', name: 'High Voltage (2 Electro)', desc: '-20% Skill Cooldown reduction' },
  geo: { key: 'geo', name: 'Enduring Rock (2 Geo)', desc: '+15% Shield Strength and +15% DMG when shielded' },
  anemo: { key: 'anemo', name: 'Impetuous Winds (2 Anemo)', desc: '+15% Move Speed and -15% Skill cooldown' },
  dendro: { key: 'dendro', name: 'Sprawling Greenery (2 Dendro)', desc: '+50 Elemental Mastery' },
  unique: { key: 'unique', name: 'Protective Canopy (4 Unique)', desc: '+15% All Elemental/Physical DMG' },
};

const RESONANCE_ELEMENT_KEYS: Array<[ElementType, Exclude<PartyResonanceKey, 'unique'>]> = [
  ['Pyro', 'pyro'],
  ['Hydro', 'hydro'],
  ['Cryo', 'cryo'],
  ['Electro', 'electro'],
  ['Geo', 'geo'],
  ['Anemo', 'anemo'],
  ['Dendro', 'dendro'],
];

export const getActivePartyResonances = (elements: readonly ElementType[]): PartyResonance[] => {
  const counts = elements.reduce<Partial<Record<ElementType, number>>>((result, element) => {
    result[element] = (result[element] || 0) + 1;
    return result;
  }, {});
  const active = RESONANCE_ELEMENT_KEYS
    .filter(([element]) => (counts[element] || 0) >= 2)
    .map(([, key]) => PARTY_RESONANCES[key]);

  if (Object.keys(counts).length >= 4) active.push(PARTY_RESONANCES.unique);
  return active;
};

export const getPartyResonanceModifiers = (resonances: readonly PartyResonance[]) => {
  const keys = new Set(resonances.map(resonance => resonance.key));
  return {
    atkPercent: keys.has('pyro') ? 0.15 : 0,
    energyRecharge: keys.has('hydro') ? 0.20 : 0,
    conditionalCritRate: keys.has('cryo') ? 0.15 : 0,
    electroSkillCooldownReduction: keys.has('electro') ? 0.20 : 0,
    shieldStrength: keys.has('geo') ? 0.15 : 0,
    shieldedDamagePercent: keys.has('geo') ? 0.15 : 0,
    moveSpeedPercent: keys.has('anemo') ? 0.15 : 0,
    anemoSkillCooldownReduction: keys.has('anemo') ? 0.15 : 0,
    elementalMastery: keys.has('dendro') ? 50 : 0,
    allDamagePercent: keys.has('unique') ? 0.15 : 0,
  };
};

export const hasPartyResonance = (
  resonances: readonly PartyResonance[],
  key: PartyResonanceKey,
): boolean => resonances.some(resonance => resonance.key === key);
