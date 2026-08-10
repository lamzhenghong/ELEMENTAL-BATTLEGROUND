import type { ArtifactSlot, WeaponType } from '../types';

export type ForgeRarity = 3 | 4 | 5;
export type ForgeOperation = 'upgrade' | 'fusion' | 'failure';
export type ForgeSilhouetteId =
  | 'sword'
  | 'claymore'
  | 'bow'
  | 'catalyst'
  | 'polearm'
  | 'helmet'
  | 'hands'
  | 'legs'
  | 'boots';

export interface ForgeSilhouette {
  id: ForgeSilhouetteId;
  label: string;
  icon: 'sword' | 'axe' | 'bow' | 'wand' | 'shield' | 'hand' | 'legs' | 'boots';
}

export type ForgeVisualItem =
  | {
      kind: 'weapon';
      id: string;
      name: string;
      rarity: ForgeRarity;
      level: number;
      primaryStat: string;
      weaponType: WeaponType;
    }
  | {
      kind: 'artifact';
      id: string;
      name: string;
      rarity: ForgeRarity;
      level: number;
      primaryStat: string;
      slot: ArtifactSlot;
    };

export type ForgeOperationEvent =
  | {
      operation: 'upgrade';
      item: ForgeVisualItem;
      previousLevel: number;
      nextLevel: number;
      materialCount: number;
    }
  | {
      operation: 'fusion';
      item: ForgeVisualItem;
      sourceItems: readonly [ForgeVisualItem, ForgeVisualItem, ForgeVisualItem];
    }
  | {
      operation: 'failure';
      item: ForgeVisualItem;
    };

export type ForgeOperationResult =
  | { success: true; event: ForgeOperationEvent }
  | { success: false };

export interface ForgeAnimationProfile {
  orbitingNodes: number;
  sourceNodes: number;
  durationMs: number;
}

type ArtifactSilhouetteSlot = ArtifactSlot | 'Helmet' | 'Hands' | 'Leg' | 'Shoe';

const WEAPON_SILHOUETTES: Record<WeaponType, ForgeSilhouette> = {
  Sword: { id: 'sword', label: 'Sword', icon: 'sword' },
  Claymore: { id: 'claymore', label: 'Claymore', icon: 'axe' },
  Bow: { id: 'bow', label: 'Bow', icon: 'bow' },
  Catalyst: { id: 'catalyst', label: 'Catalyst', icon: 'wand' },
  Polearm: { id: 'polearm', label: 'Polearm', icon: 'sword' },
};

const ARTIFACT_SILHOUETTES: Record<ArtifactSlot, ForgeSilhouette> = {
  helmet: { id: 'helmet', label: 'Helmet', icon: 'shield' },
  hands: { id: 'hands', label: 'Hands', icon: 'hand' },
  leg: { id: 'legs', label: 'Leg Armor', icon: 'legs' },
  shoe: { id: 'boots', label: 'Boots', icon: 'boots' },
};

const ANIMATION_PROFILES: Record<ForgeOperation, ForgeAnimationProfile> = {
  upgrade: { orbitingNodes: 6, sourceNodes: 0, durationMs: 720 },
  fusion: { orbitingNodes: 0, sourceNodes: 3, durationMs: 860 },
  failure: { orbitingNodes: 0, sourceNodes: 0, durationMs: 0 },
};

const RARITY_COLORS: Record<ForgeRarity, string> = {
  3: '#60a5fa',
  4: '#c084fc',
  5: '#fbbf24',
};

export function getWeaponSilhouette(type: WeaponType): ForgeSilhouette {
  return WEAPON_SILHOUETTES[type];
}

export function getArtifactSilhouette(slot: ArtifactSilhouetteSlot): ForgeSilhouette {
  const normalizedSlot = slot.toLowerCase() as ArtifactSlot;
  return ARTIFACT_SILHOUETTES[normalizedSlot];
}

export function getRarityColor(rarity: ForgeRarity): string {
  return RARITY_COLORS[rarity];
}

export function getForgeAnimationProfile(operation: ForgeOperation): ForgeAnimationProfile {
  return ANIMATION_PROFILES[operation];
}
