import { WEAPONS_DATABASE } from '../data/weapons';
import type { ElementType, Weapon } from '../types';

export type WeaponDamageSource = 'normal-attack' | 'elemental-skill' | 'ultimate' | 'special-ultimate' | 'reaction' | 'other';

export interface WeaponSecondaryStats {
  atkPercent: number;
  hpPercent: number;
  critRate: number;
  critDmg: number;
  energyRecharge: number;
  elementalMastery: number;
  physicalDamagePercent: number;
}

export interface WeaponEffectDefinition {
  id: string;
  name: string;
  rarity: 3 | 4 | 5;
  description: string;
  normalDamagePercent?: number;
  skillDamagePercent?: number;
  elementalDamagePercent?: number;
  skillCooldownReduction?: number;
  attackRangePercent?: number;
  pierces?: boolean;
  knockbackDistance?: number;
  conditionalElements?: ElementType[];
  conditionalDamagePercent?: number;
  targetNameIncludes?: string;
  minimumHpRatio?: number;
  conditionalCritRate?: number;
  closeRangeDamagePercent?: number;
  closeRangeLimit?: number;
  royalCritRatePerStack?: number;
  royalMaxStacks?: number;
  sacrificialChance?: number;
  sacrificialCooldownSeconds?: number;
  favoniusChance?: number;
  favoniusEnergy?: number;
  favoniusCooldownSeconds?: number;
  widsithAtkPercent?: number;
  widsithElementalPercent?: number;
  widsithDurationSeconds?: number;
  widsithCooldownSeconds?: number;
  swapAtkPercent?: number;
  swapDurationSeconds?: number;
  swapCooldownSeconds?: number;
  aoeProcDamagePercent?: number;
  aoeProcCooldownSeconds?: number;
  aoeProcDurationSeconds?: number;
  echoDamagePercent?: number;
  echoCooldownSeconds?: number;
}

const descriptions = new Map(WEAPONS_DATABASE.map(weapon => [weapon.name, weapon.featureDesc]));
const definition = (
  id: string,
  name: string,
  rarity: 3 | 4 | 5,
  effect: Omit<WeaponEffectDefinition, 'id' | 'name' | 'rarity' | 'description'> = {},
): WeaponEffectDefinition => ({
  id,
  name,
  rarity,
  description: descriptions.get(name) || '',
  ...effect,
});

export const WEAPON_EFFECTS: Record<string, WeaponEffectDefinition> = {
  'solar-searing-blade': definition('solar-searing-blade', 'Solar Searing Blade', 5, { skillCooldownReduction: 0.10, elementalDamagePercent: 0.12 }),
  'sacrificial-sword': definition('sacrificial-sword', 'Sacrificial Sword', 4, { sacrificialChance: 0.40, sacrificialCooldownSeconds: 30 }),
  'favonius-sword': definition('favonius-sword', 'Favonius Sword', 4, { favoniusChance: 0.60, favoniusEnergy: 6, favoniusCooldownSeconds: 3 }),
  'cool-steel': definition('cool-steel', 'Cool Steel', 3, { conditionalElements: ['Hydro', 'Cryo'], conditionalDamagePercent: 0.12 }),
  'harbinger-of-dawn': definition('harbinger-of-dawn', 'Harbinger of Dawn', 3, { minimumHpRatio: 0.90, conditionalCritRate: 0.14 }),
  'dull-blade': definition('dull-blade', 'Dull Blade', 3, { normalDamagePercent: 0.05 }),
  'calamity-blaze': definition('calamity-blaze', 'Calamity Blaze', 5, { normalDamagePercent: 0.18, attackRangePercent: 0.35, knockbackDistance: 24 }),
  'favonius-greatsword': definition('favonius-greatsword', 'Favonius Greatsword', 4, { favoniusChance: 0.60, favoniusEnergy: 6, favoniusCooldownSeconds: 3 }),
  'royal-claymore': definition('royal-claymore', 'Royal Claymore', 4, { royalCritRatePerStack: 0.04, royalMaxStacks: 4 }),
  'debate-club': definition('debate-club', 'Debate Club', 3, { aoeProcDamagePercent: 0.12, aoeProcCooldownSeconds: 2, aoeProcDurationSeconds: 6 }),
  'bloodtainted-greatsword': definition('bloodtainted-greatsword', 'Bloodtainted Greatsword', 3, { conditionalElements: ['Pyro', 'Electro'], conditionalDamagePercent: 0.16 }),
  'iron-point-claymore': definition('iron-point-claymore', 'Iron Point Claymore', 3, { normalDamagePercent: 0.06 }),
  'solar-wind-bow': definition('solar-wind-bow', 'Solar Wind Bow', 5, { normalDamagePercent: 0.18, attackRangePercent: 1, pierces: true }),
  rust: definition('rust', 'Rust', 4, { normalDamagePercent: 0.16 }),
  'sacrificial-bow': definition('sacrificial-bow', 'Sacrificial Bow', 4, { sacrificialChance: 0.40, sacrificialCooldownSeconds: 30 }),
  slingshot: definition('slingshot', 'Slingshot', 3, { closeRangeDamagePercent: 0.08, closeRangeLimit: 75 }),
  'raven-bow': definition('raven-bow', 'Raven Bow', 3, { conditionalElements: ['Pyro', 'Hydro'], conditionalDamagePercent: 0.12 }),
  'hunters-bow': definition('hunters-bow', "Hunter's Bow", 3, { normalDamagePercent: 0.06 }),
  'abyssal-ocean-scepter': definition('abyssal-ocean-scepter', 'Abyssal Ocean Scepter', 5, { aoeProcDamagePercent: 0.28, aoeProcCooldownSeconds: 1.25 }),
  widsith: definition('widsith', 'Widsith', 4, { widsithAtkPercent: 0.30, widsithElementalPercent: 0.24, widsithDurationSeconds: 10, widsithCooldownSeconds: 30 }),
  'favonius-codex': definition('favonius-codex', 'Favonius Codex', 4, { favoniusChance: 0.60, favoniusEnergy: 6, favoniusCooldownSeconds: 3 }),
  'thrilling-tales': definition('thrilling-tales', 'Thrilling Tales of Dragon Slayers', 3, { swapAtkPercent: 0.16, swapDurationSeconds: 8, swapCooldownSeconds: 20 }),
  'magic-guide': definition('magic-guide', 'Magic Guide', 3, { conditionalElements: ['Hydro', 'Electro'], conditionalDamagePercent: 0.12 }),
  'apprentices-notes': definition('apprentices-notes', "Apprentice's Notes", 3, { skillDamagePercent: 0.05 }),
  'primordial-jade-winged-spear': definition('primordial-jade-winged-spear', 'Primordial Jade Winged-Spear', 5, { normalDamagePercent: 0.08, echoDamagePercent: 0.30, echoCooldownSeconds: 1.2 }),
  'dragons-bane': definition('dragons-bane', "Dragon's Bane", 4, { conditionalElements: ['Hydro', 'Pyro'], conditionalDamagePercent: 0.20 }),
  'crescent-pike': definition('crescent-pike', 'Crescent Pike', 4, { echoDamagePercent: 0.20, aoeProcDurationSeconds: 5 }),
  'white-tassel': definition('white-tassel', 'White Tassel', 3, { normalDamagePercent: 0.08 }),
  'black-tassel': definition('black-tassel', 'Black Tassel', 3, { targetNameIncludes: 'slime', conditionalDamagePercent: 0.30 }),
  'beginners-protector': definition('beginners-protector', "Beginner's Protector", 3, { normalDamagePercent: 0.05 }),
};

const WEAPON_ALIASES: Record<string, string> = {
  'dull blade sword': 'dull-blade',
  'iron point claymore': 'iron-point-claymore',
  'hunter bow bow': 'hunters-bow',
  'apprentice scroll catalyst': 'apprentices-notes',
  'beginner pole polearm': 'beginners-protector',
};

const normalizeWeaponName = (name: string): string => name
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[()]/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const effectIdByNormalizedName = new Map(
  Object.values(WEAPON_EFFECTS).map(effect => [normalizeWeaponName(effect.name), effect.id]),
);

export const resolveWeaponEffect = (weaponOrName: Weapon | string | null | undefined): WeaponEffectDefinition | null => {
  const name = typeof weaponOrName === 'string' ? weaponOrName : weaponOrName?.name;
  if (!name) return null;
  const normalized = normalizeWeaponName(name);
  const id = WEAPON_ALIASES[normalized] || effectIdByNormalizedName.get(normalized);
  return id ? WEAPON_EFFECTS[id] || null : null;
};

const EMPTY_SECONDARY_STATS: WeaponSecondaryStats = {
  atkPercent: 0,
  hpPercent: 0,
  critRate: 0,
  critDmg: 0,
  energyRecharge: 0,
  elementalMastery: 0,
  physicalDamagePercent: 0,
};

export const getWeaponSecondaryStats = (weapon?: Weapon): WeaponSecondaryStats => {
  if (!weapon) return { ...EMPTY_SECONDARY_STATS };
  const normalized = weapon.statBonus.toLowerCase();
  const baseValue = Number(weapon.statBonus.match(/\d+(?:\.\d+)?/)?.[0] || 0);
  const upgradeSteps = Math.floor((weapon.level || 1) / 5);
  const value = baseValue * (1 + upgradeSteps * 0.12);
  const stats = { ...EMPTY_SECONDARY_STATS };

  if (normalized.includes('crit rate')) stats.critRate = value / 100;
  else if (normalized.includes('crit dmg') || normalized.includes('crit damage')) stats.critDmg = value / 100;
  else if (normalized.includes('energy recharge')) stats.energyRecharge = value / 100;
  else if (normalized.includes('elemental mastery')) stats.elementalMastery = value;
  else if (normalized.includes('physical dmg')) stats.physicalDamagePercent = value / 100;
  else if (normalized.includes('hp')) stats.hpPercent = value / 100;
  else if (normalized.includes('atk') || normalized.includes('attack')) stats.atkPercent = value / 100;
  return stats;
};

export interface WeaponDamageContext {
  source: WeaponDamageSource;
  targetElements?: readonly ElementType[];
  targetName?: string;
  distance?: number;
  isElemental?: boolean;
}

export const getWeaponDamageMultiplier = (
  weaponOrName: Weapon | string | null | undefined,
  context: WeaponDamageContext,
): number => {
  const effect = resolveWeaponEffect(weaponOrName);
  if (!effect) return 1;
  let bonus = 0;

  if (context.source === 'normal-attack') bonus += effect.normalDamagePercent || 0;
  if (context.source === 'elemental-skill') bonus += effect.skillDamagePercent || 0;
  if (context.isElemental !== false && !['reaction', 'other'].includes(context.source)) {
    bonus += effect.elementalDamagePercent || 0;
  }
  if (
    effect.conditionalElements?.some(element => context.targetElements?.includes(element))
    || (effect.targetNameIncludes && context.targetName?.toLowerCase().includes(effect.targetNameIncludes))
  ) {
    bonus += effect.conditionalDamagePercent || 0;
  }
  if (
    context.source === 'normal-attack'
    && effect.closeRangeLimit !== undefined
    && context.distance !== undefined
    && context.distance <= effect.closeRangeLimit
  ) {
    bonus += effect.closeRangeDamagePercent || 0;
  }
  return 1 + bonus;
};

export const getWeaponAttackRangeMultiplier = (weaponOrName: Weapon | string | null | undefined): number => (
  1 + (resolveWeaponEffect(weaponOrName)?.attackRangePercent || 0)
);
