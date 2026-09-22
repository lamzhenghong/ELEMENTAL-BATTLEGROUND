export type CharacterProgressionIntensity = 'normal' | 'milestone' | 'ascension';

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
