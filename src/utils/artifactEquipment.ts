import type { Artifact } from '../types';

export type CharacterEquippedArtifacts = Record<string, Record<string, string>>;

export interface UnequipAllArtifactsResult {
  inventoryArtifacts: Artifact[];
  characterEquippedArtifacts: CharacterEquippedArtifacts;
  didUnequip: boolean;
}

export function unequipAllArtifactsForCharacter(
  inventoryArtifacts: readonly Artifact[],
  characterEquippedArtifacts: CharacterEquippedArtifacts,
  characterId: string,
): UnequipAllArtifactsResult {
  const equippedIds = new Set(Object.values(characterEquippedArtifacts[characterId] ?? {}));
  const didUnequip = equippedIds.size > 0 || inventoryArtifacts.some(artifact => artifact.equippedTo === characterId);

  const nextArtifacts = inventoryArtifacts.map(artifact => {
    if (!equippedIds.has(artifact.id) && artifact.equippedTo !== characterId) return artifact;
    const { equippedTo: _equippedTo, ...unequippedArtifact } = artifact;
    return unequippedArtifact;
  });

  const nextEquipped = Object.fromEntries(
    Object.entries(characterEquippedArtifacts).map(([id, slots]) => [id, { ...slots }]),
  ) as CharacterEquippedArtifacts;
  nextEquipped[characterId] = {};

  return {
    inventoryArtifacts: nextArtifacts,
    characterEquippedArtifacts: nextEquipped,
    didUnequip,
  };
}
