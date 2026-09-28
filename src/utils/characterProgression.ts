import type { SaveState } from '../types';

export type CharacterProgressionIntensity = 'normal' | 'milestone' | 'ascension';

export const getCharacterLevelUpCost = (currentLevel: number) => ({
  mora: currentLevel * 800,
  materials: Math.ceil(currentLevel / 5),
  materialType: currentLevel < 50 ? 'char_xp' as const : 'ascension' as const,
});

export const tryLevelUpCharacter = (state: SaveState, characterId: string): SaveState => {
  if (!state.unlockedCharacterIds.includes(characterId)) return state;
  const currentLevel = state.characterLevels[characterId] ?? 1;
  if (currentLevel >= 80) return state;

  const cost = getCharacterLevelUpCost(currentLevel);
  const material = state.inventoryItems.find(item => item.type === cost.materialType);
  if (state.mora < cost.mora || (material?.count ?? 0) < cost.materials) return state;

  return {
    ...state,
    mora: state.mora - cost.mora,
    characterLevels: { ...state.characterLevels, [characterId]: currentLevel + 1 },
    inventoryItems: state.inventoryItems.map(item => item.type === cost.materialType
      ? { ...item, count: item.count - cost.materials }
      : item),
  };
};

export interface CharacterProgressionEvent {
  previousLevel: number;
  nextLevel: number;
  intensity: CharacterProgressionIntensity;
  label: string;
}

export const createCharacterProgressionEvent = (
  previousLevel: number,
  nextLevel: number,
): CharacterProgressionEvent => {
  const clampedPrevious = Math.max(1, Math.min(80, Math.floor(previousLevel)));
  const clampedNext = Math.max(clampedPrevious, Math.min(80, Math.floor(nextLevel)));
  const isAscension = clampedPrevious === 50 && clampedNext === 51;
  const isMilestone = clampedNext % 10 === 0;

  return {
    previousLevel: clampedPrevious,
    nextLevel: clampedNext,
    intensity: isAscension ? 'ascension' : isMilestone ? 'milestone' : 'normal',
    label: clampedNext === 80
      ? 'MAX LEVEL'
      : isAscension
        ? 'ASCENSION COMPLETE'
        : isMilestone
          ? `LEVEL ${clampedNext} MILESTONE`
          : 'LEVEL UP',
  };
};
