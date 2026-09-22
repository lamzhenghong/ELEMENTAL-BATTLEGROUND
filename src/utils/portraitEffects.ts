import type { CSSProperties } from 'react';
import type { ElementType } from '../types';
import { getAccumulatedPortraitBuffs } from './portraits';

export type PortraitTierMap = Record<string, number>;

const PORTRAIT_ELEMENT_COLORS: Record<ElementType, string> = {
  Pyro: '#fb7185',
  Hydro: '#38bdf8',
  Cryo: '#a5f3fc',
  Electro: '#c084fc',
  Anemo: '#5eead4',
  Geo: '#fbbf24',
  Dendro: '#4ade80',
};

const clampPortraitTier = (value: unknown, maximum = 6): number => {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : 0;
  return Math.max(0, Math.min(maximum, numeric));
};

export const resolvePortraitEffect = (
  characterId: string,
  unlockedPortraits: PortraitTierMap | undefined,
  element: ElementType,
  characterIsUnlocked = true,
) => {
  const unlockedTier = characterIsUnlocked
    ? clampPortraitTier(unlockedPortraits?.[characterId])
    : 0;
  const frameColor = PORTRAIT_ELEMENT_COLORS[element];

  return {
    characterId,
    unlockedTier,
    activeTier: unlockedTier,
    isActive: unlockedTier > 0,
    buffs: getAccumulatedPortraitBuffs(characterId, unlockedTier),
    frameColor,
    frameStyle: {
      '--portrait-effect-color': frameColor,
      '--portrait-effect-strength': Math.max(0.18, unlockedTier / 6),
    } as CSSProperties,
  };
};

export const unlockNextPortraitTier = (
  unlockedPortraits: PortraitTierMap | undefined,
  characterId: string,
): number => Math.min(6, clampPortraitTier(unlockedPortraits?.[characterId]) + 1);
