import { ElementType } from '../types';

export interface ReactionDamageOutcome {
  reactionName: string;
  finalDamage: number;
  damageColor: string;
  consumesElements: boolean;
}

export const getStatScaledAttackDamage = (atk: number, multiplier: number, extraMultiplier: number = 1) => {
  return Math.round(Math.max(0, atk) * Math.max(0, multiplier) * Math.max(0, extraMultiplier));
};

export const getSpecialUltimateStatDamage = (
  activeHeroAtk: number,
  participantAtks: readonly number[],
  comboDamageMultiplier: number
) => {
  const averagePartnerAtk = participantAtks.length > 0
    ? participantAtks.reduce((sum, atk) => sum + atk, 0) / participantAtks.length
    : activeHeroAtk;

  // Active hero ATK leads the hit while partner ATK adds combo weight.
  return Math.round((activeHeroAtk + averagePartnerAtk * 0.35) * comboDamageMultiplier);
};

export const getReactionDamageOutcome = (
  activeElements: readonly ElementType[],
  incomingElement: ElementType,
  statScaledDamage: number
): ReactionDamageOutcome | null => {
  const has = (element: ElementType) => activeElements.includes(element);
  const base = Math.max(0, statScaledDamage);

  if ((has('Hydro') && incomingElement === 'Pyro') || (has('Pyro') && incomingElement === 'Hydro')) {
    return { reactionName: 'VAPORIZE (2x!)', finalDamage: Math.round(base * 2), damageColor: '#f97316', consumesElements: true };
  }
  if ((has('Hydro') && incomingElement === 'Cryo') || (has('Cryo') && incomingElement === 'Hydro')) {
    return { reactionName: 'FROZEN!', finalDamage: Math.round(base * 1.1), damageColor: '#38bdf8', consumesElements: true };
  }
  if ((has('Dendro') && incomingElement === 'Hydro') || (has('Hydro') && incomingElement === 'Dendro')) {
    return { reactionName: 'BLOOM ERUPTION!', finalDamage: Math.round(base * 1.75), damageColor: '#22c55e', consumesElements: true };
  }
  if ((has('Dendro') && incomingElement === 'Electro') || (has('Electro') && incomingElement === 'Dendro')) {
    return { reactionName: 'HYPERBLOOM QUASAR!', finalDamage: Math.round(base * 2.3), damageColor: '#10b981', consumesElements: true };
  }
  if ((has('Pyro') && incomingElement === 'Electro') || (has('Electro') && incomingElement === 'Pyro')) {
    return { reactionName: 'OVERLOADED!', finalDamage: Math.round(base * 1.65), damageColor: '#ec4899', consumesElements: true };
  }
  if ((has('Cryo') && incomingElement === 'Pyro') || (has('Pyro') && incomingElement === 'Cryo')) {
    return { reactionName: 'MELT (2x!)', finalDamage: Math.round(base * 2), damageColor: '#f59e0b', consumesElements: true };
  }
  if ((has('Hydro') && incomingElement === 'Electro') || (has('Electro') && incomingElement === 'Hydro')) {
    return { reactionName: 'ELECTRO-CHARGED!', finalDamage: Math.round(base * 1.55), damageColor: '#a855f7', consumesElements: true };
  }
  if ((has('Cryo') && incomingElement === 'Electro') || (has('Electro') && incomingElement === 'Cryo')) {
    return { reactionName: 'SUPERCONDUCT (DEF SHRED)!', finalDamage: Math.round(base * 1.45), damageColor: '#c084fc', consumesElements: true };
  }
  if ((has('Dendro') && incomingElement === 'Pyro') || (has('Pyro') && incomingElement === 'Dendro')) {
    return { reactionName: 'BURNING!', finalDamage: Math.round(base * 1.25), damageColor: '#e11d48', consumesElements: true };
  }
  if (incomingElement === 'Geo') {
    return { reactionName: 'CRYSTALLIZE SHARD DROPPED!', finalDamage: Math.round(base * 1.15), damageColor: '#eab308', consumesElements: true };
  }
  if (incomingElement === 'Anemo') {
    return { reactionName: 'SWIRL SPLASH!', finalDamage: Math.round(base * 1.25), damageColor: '#34d399', consumesElements: true };
  }

  return null;
};
