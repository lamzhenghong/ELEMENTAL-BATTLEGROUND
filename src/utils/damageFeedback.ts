import type { ElementType, WeaponType } from '../types';
import type { CombatImpactSource } from './combatImpact';

export type ImpactShape = 'slash' | 'radial' | 'pierce' | 'projectile' | 'magic' | 'aoe-ring';
export type CriticalVisualIdentity =
  | 'neutral'
  | 'pyro'
  | 'hydro'
  | 'electro'
  | 'cryo'
  | 'verdant'
  | 'void'
  | 'celestial';
export type EnemyDamageVisualState = 'normal' | 'damaged' | 'critical';
export type FeedbackQuality = 'low' | 'medium' | 'high';

export interface ImpactShapeInput {
  weaponType: WeaponType;
  source: CombatImpactSource;
}

export interface DamageNumberMotionInput {
  attackDirectionX: number;
  source: CombatImpactSource;
  isCrit: boolean;
  hitIndex: number;
  upwardLaunch?: boolean;
}

export interface DamageNumberMotion {
  velocityX: number;
  velocityY: number;
  gravity: number;
  duration: number;
}

const WEAPON_IMPACT_SHAPES: Record<WeaponType, ImpactShape> = {
  Sword: 'slash',
  Claymore: 'radial',
  Polearm: 'pierce',
  Bow: 'projectile',
  Catalyst: 'magic',
};

const ELEMENT_CRITICAL_IDENTITIES: Record<ElementType, CriticalVisualIdentity> = {
  Pyro: 'pyro',
  Hydro: 'hydro',
  Electro: 'electro',
  Cryo: 'cryo',
  Dendro: 'verdant',
  Anemo: 'neutral',
  Geo: 'neutral',
};

export const getImpactShape = ({ weaponType, source }: ImpactShapeInput): ImpactShape => {
  if (source === 'ultimate' || source === 'special-ultimate') return 'aoe-ring';
  return WEAPON_IMPACT_SHAPES[weaponType];
};

export const getDamageNumberMotion = ({
  attackDirectionX,
  source,
  isCrit,
  hitIndex,
  upwardLaunch = false,
}: DamageNumberMotionInput): DamageNumberMotion => {
  const direction = Math.abs(attackDirectionX) < 0.05 ? (hitIndex % 2 === 0 ? 1 : -1) : Math.sign(attackDirectionX);
  const isHeavy = source === 'elemental-skill' || source === 'ultimate' || source === 'special-ultimate';
  const baseHorizontal = isHeavy ? 46 : 26;
  const critScale = isCrit ? 1.2 : 1;
  const alternatingOffset = hitIndex % 2 === 0 ? 6 : -6;
  const velocityX = Math.max(-72, Math.min(72, direction * baseHorizontal * critScale + alternatingOffset));
  const baseVelocityY = upwardLaunch ? -168 : isHeavy ? -132 : -112;

  return {
    velocityX,
    velocityY: baseVelocityY * (isCrit ? 1.08 : 1),
    gravity: isCrit ? 390 : 430,
    duration: isCrit ? 0.66 : 0.75,
  };
};

export const getCriticalVisualIdentity = (
  element: ElementType,
  damageSkin: string = 'Default',
): CriticalVisualIdentity => {
  if (damageSkin === 'Ice') return 'cryo';
  if (damageSkin === 'Void') return 'void';
  if (damageSkin === 'Celestial') return 'celestial';
  return ELEMENT_CRITICAL_IDENTITIES[element];
};

export const getEnemyDamageVisualState = (
  hp: number,
  maxHp: number,
): EnemyDamageVisualState => {
  if (!Number.isFinite(hp) || !Number.isFinite(maxHp) || maxHp <= 0) return 'normal';
  const ratio = Math.max(0, hp) / maxHp;
  if (ratio < 0.25) return 'critical';
  if (ratio <= 0.5) return 'damaged';
  return 'normal';
};
