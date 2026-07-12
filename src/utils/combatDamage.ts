import { ElementType } from '../types';
import { getElementalReactionById } from '../data/elementalReactions';

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
  const outcome = (id: string, reactionName: string, damageColor: string): ReactionDamageOutcome => {
    const reaction = getElementalReactionById(id);
    const multiplier = reaction?.damageMultiplier ?? 1;
    return {
      reactionName,
      finalDamage: Math.round(base * multiplier),
      damageColor,
      consumesElements: true
    };
  };

  if ((has('Hydro') && incomingElement === 'Pyro') || (has('Pyro') && incomingElement === 'Hydro')) {
    return outcome('vaporize', 'VAPORIZE (2x!)', '#f97316');
  }
  if ((has('Hydro') && incomingElement === 'Cryo') || (has('Cryo') && incomingElement === 'Hydro')) {
    return outcome('frozen', 'FROZEN!', '#38bdf8');
  }
  if ((has('Dendro') && incomingElement === 'Hydro') || (has('Hydro') && incomingElement === 'Dendro')) {
    return outcome('bloom-eruption', 'BLOOM ERUPTION!', '#22c55e');
  }
  if ((has('Dendro') && incomingElement === 'Electro') || (has('Electro') && incomingElement === 'Dendro')) {
    return outcome('hyperbloom-quasar', 'HYPERBLOOM QUASAR!', '#10b981');
  }
  if ((has('Pyro') && incomingElement === 'Electro') || (has('Electro') && incomingElement === 'Pyro')) {
    return outcome('overloaded', 'OVERLOADED!', '#ec4899');
  }
  if ((has('Cryo') && incomingElement === 'Pyro') || (has('Pyro') && incomingElement === 'Cryo')) {
    return outcome('melt', 'MELT (2x!)', '#f59e0b');
  }
  if ((has('Hydro') && incomingElement === 'Electro') || (has('Electro') && incomingElement === 'Hydro')) {
    return outcome('electro-charged', 'ELECTRO-CHARGED!', '#a855f7');
  }
  if ((has('Cryo') && incomingElement === 'Electro') || (has('Electro') && incomingElement === 'Cryo')) {
    return outcome('superconduct', 'SUPERCONDUCT (DEF SHRED)!', '#c084fc');
  }
  if ((has('Dendro') && incomingElement === 'Pyro') || (has('Pyro') && incomingElement === 'Dendro')) {
    return outcome('burning', 'BURNING!', '#e11d48');
  }
  if (incomingElement === 'Geo') {
    return outcome('crystallize', 'CRYSTALLIZE SHARD DROPPED!', '#eab308');
  }
  if (incomingElement === 'Anemo') {
    return outcome('swirl-splash', 'SWIRL SPLASH!', '#34d399');
  }

  return null;
};
