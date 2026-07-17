import { Artifact } from '../types';

export type ArtifactFusionInputRarity = 3 | 4;

export interface ArtifactFusionRule {
  inputRarity: ArtifactFusionInputRarity;
  resultRarity: 4 | 5;
  moraCost: number;
  gemCost: number;
  inputLabel: string;
  outputLabel: string;
}

export const ARTIFACT_FUSION_RULES: Record<ArtifactFusionInputRarity, ArtifactFusionRule> = {
  3: {
    inputRarity: 3,
    resultRarity: 4,
    moraCost: 10000,
    gemCost: 1000,
    inputLabel: '3 Blue',
    outputLabel: '1 Purple'
  },
  4: {
    inputRarity: 4,
    resultRarity: 5,
    moraCost: 25000,
    gemCost: 2500,
    inputLabel: '3 Purple',
    outputLabel: '1 Gold'
  }
};

export const getArtifactFusionRule = (rarity: Artifact['rarity']): ArtifactFusionRule | null => {
  if (rarity === 3 || rarity === 4) {
    return ARTIFACT_FUSION_RULES[rarity];
  }
  return null;
};

export interface ArtifactFusionAvailabilityInput {
  artifact: Pick<Artifact, 'name' | 'rarity' | 'isLocked' | 'equippedTo'>;
  matchingArtifactCount: number;
  mora: number;
  aetherGems: number;
  hasFuseHandler: boolean;
}

export interface ArtifactFusionAvailability {
  canFuse: boolean;
  blockReason: string;
}

export const getArtifactFusionAvailability = ({
  artifact,
  matchingArtifactCount,
  mora,
  aetherGems,
  hasFuseHandler
}: ArtifactFusionAvailabilityInput): ArtifactFusionAvailability => {
  const rule = getArtifactFusionRule(artifact.rarity);
  if (!rule) {
    return { canFuse: false, blockReason: 'Gold artifacts are already at maximum tier.' };
  }
  if (artifact.isLocked) {
    return { canFuse: false, blockReason: 'Unlock this artifact before fusion.' };
  }
  if (artifact.equippedTo) {
    return { canFuse: false, blockReason: 'Unequip this artifact before fusion.' };
  }
  if (matchingArtifactCount < 3) {
    return {
      canFuse: false,
      blockReason: `Need 3 unlocked, unequipped copies of ${artifact.name}.`
    };
  }
  if (mora < rule.moraCost || aetherGems < rule.gemCost) {
    return {
      canFuse: false,
      blockReason: `Requires ${rule.moraCost.toLocaleString()} Mora and ${rule.gemCost.toLocaleString()} Gems.`
    };
  }
  if (!hasFuseHandler) {
    return { canFuse: false, blockReason: 'Artifact fusion is unavailable right now.' };
  }
  return { canFuse: true, blockReason: 'Ready to fuse this artifact part.' };
};

export const isSameArtifactPart = (a: Artifact, b: Artifact) => (
  a.name === b.name &&
  a.set === b.set &&
  a.slot === b.slot &&
  a.rarity === b.rarity
);

export const getEligibleFusionArtifacts = (artifacts: Artifact[], baseArtifact: Artifact) => {
  const rule = getArtifactFusionRule(baseArtifact.rarity);
  if (!rule) return [];

  return artifacts
    .filter(art => (
      isSameArtifactPart(art, baseArtifact) &&
      !art.isLocked &&
      !art.equippedTo
    ))
    .slice(0, 3);
};

export const createFusedArtifact = (baseArtifact: Artifact, id = `art_fuse_${Date.now()}_${Math.floor(Math.random() * 100000)}`): Artifact => {
  const rule = getArtifactFusionRule(baseArtifact.rarity);
  if (!rule) {
    return {
      ...baseArtifact,
      id,
      isLocked: false,
      equippedTo: undefined
    };
  }

  return {
    id,
    name: baseArtifact.name,
    slot: baseArtifact.slot,
    set: baseArtifact.set,
    rarity: rule.resultRarity,
    isLocked: false,
    equippedTo: undefined
  };
};
