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
