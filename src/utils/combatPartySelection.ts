import type { CombatCharacter } from '../types';

const LIVE_COMBAT_FIELDS = [
  'currentHp', 'ultimateEnergy', 'skillCooldownRemaining', 'royalStacks',
  'widsithBuffTimer', 'widsithCooldown', 'widsithBuffAtk', 'widsithBuffEle',
  'sacrificialCooldown', 'swapBuffTimer', 'swapBuffAtk', 'swapBuffCooldown',
  'crescentPikeTimer', 'debateClubTimer', 'debateClubCd', 'scepterBubbleCd',
  'spearDoubleCd', 'favoniusCooldown', 'portraitNormalHitCount', 'portraitUltimateTimer',
] as const;

export const reconcileCombatParty = (
  previousParty: CombatCharacter[],
  rebuiltParty: CombatCharacter[],
): CombatCharacter[] => {
  const previousById = new Map(previousParty.map(character => [character.id, character]));
  return rebuiltParty.map(character => {
    const previous = previousById.get(character.id);
    if (!previous) return character;
    const liveState: Partial<CombatCharacter> = {};
    // Build props can change on reward saves without starting a new battle.
    for (const field of LIVE_COMBAT_FIELDS) liveState[field] = previous[field];
    return {
      ...character,
      ...liveState,
      currentHp: Math.min(previous.currentHp, character.maxHp),
      ultimateEnergy: Math.min(previous.ultimateEnergy, character.ultimateMaxEnergy),
    };
  });
};

export interface CombatPartySelectionMember {
  id: string;
  currentHp: number;
}

export const resolveActivePartyIndex = (
  nextParty: CombatPartySelectionMember[],
  previousActiveCharacterId?: string,
): number => {
  if (previousActiveCharacterId) {
    const preservedIndex = nextParty.findIndex(
      character => character.id === previousActiveCharacterId && character.currentHp > 0,
    );
    if (preservedIndex >= 0) return preservedIndex;
  }

  const firstLivingIndex = nextParty.findIndex(character => character.currentHp > 0);
  return firstLivingIndex >= 0 ? firstLivingIndex : 0;
};
