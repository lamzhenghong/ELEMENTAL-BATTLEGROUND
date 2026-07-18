import type { CharacterRole } from '../types';

export interface RoleModifiers {
  atk: number;
  hp: number;
  def: number;
  normalAttackSpeed: number;
  cooldown: number;
}

export const ROLE_MODIFIERS: Readonly<Record<CharacterRole, RoleModifiers>> = {
  dps: { atk: 1.15, hp: 1, def: 1, normalAttackSpeed: 1.08, cooldown: 1 },
  'sub-dps': { atk: 1, hp: 1, def: 1, normalAttackSpeed: 1, cooldown: 1 },
  support: { atk: 0.92, hp: 0.92, def: 0.92, normalAttackSpeed: 1, cooldown: 0.8 },
  tank: { atk: 1, hp: 1.25, def: 1.1, normalAttackSpeed: 1, cooldown: 1 }
};

const ROLE_LABELS: Readonly<Record<CharacterRole, string>> = {
  dps: 'DPS',
  'sub-dps': 'Sub DPS',
  support: 'Support',
  tank: 'Tank'
};

export const getRoleLabel = (role: CharacterRole) => ROLE_LABELS[role];

export const applyRoleStatModifiers = <T extends { atk: number; hp: number; def: number }>(
  stats: T,
  role: CharacterRole
) => {
  const modifiers = ROLE_MODIFIERS[role];
  return {
    atk: Math.round(stats.atk * modifiers.atk),
    hp: Math.round(stats.hp * modifiers.hp),
    def: Math.round(stats.def * modifiers.def)
  };
};

export type CharacterAbilityKind = 'basic' | 'skill' | 'ultimate';

export const getRoleAdjustedCooldown = (
  cooldown: number,
  role: CharacterRole,
  ability: CharacterAbilityKind
) => {
  const multiplier = ability === 'skill' || ability === 'ultimate'
    ? ROLE_MODIFIERS[role].cooldown
    : 1;
  return Math.round(Math.max(0, cooldown) * multiplier * 1000) / 1000;
};

export const getRoleNormalAttackSpeedMultiplier = (role: CharacterRole) =>
  ROLE_MODIFIERS[role].normalAttackSpeed;
