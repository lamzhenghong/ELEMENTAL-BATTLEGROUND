import type { Artifact } from '../types';

export type CharacterEquippedArtifacts = Record<string, Record<string, string>>;

export interface UnequipAllArtifactsResult {
  inventoryArtifacts: Artifact[];
  characterEquippedArtifacts: CharacterEquippedArtifacts;
  didUnequip: boolean;
}

const ARTIFACT_SLOTS = new Set(['helmet', 'hands', 'leg', 'shoe']);

export function normalizeArtifactEquipment(
  inventoryArtifacts: readonly Artifact[],
  characterEquippedArtifacts: CharacterEquippedArtifacts,
): Pick<UnequipAllArtifactsResult, 'inventoryArtifacts' | 'characterEquippedArtifacts'> {
  const artifactsById = new Map(inventoryArtifacts.map(artifact => [artifact.id, artifact]));
  const claimedArtifactIds = new Set<string>();
  const normalizedEquipped: CharacterEquippedArtifacts = {};

  for (const [characterId, slots] of Object.entries(characterEquippedArtifacts || {})) {
    const normalizedSlots: Record<string, string> = {};
    for (const [slot, artifactId] of Object.entries(slots || {})) {
      const artifact = artifactsById.get(artifactId);
      if (!ARTIFACT_SLOTS.has(slot) || !artifact || artifact.slot !== slot || claimedArtifactIds.has(artifactId)) continue;
      claimedArtifactIds.add(artifactId);
      normalizedSlots[slot] = artifactId;
    }
    normalizedEquipped[characterId] = normalizedSlots;
  }

  const ownerByArtifactId = new Map<string, string>();
  for (const [characterId, slots] of Object.entries(normalizedEquipped)) {
    Object.values(slots).forEach(artifactId => ownerByArtifactId.set(artifactId, characterId));
  }

  return {
    inventoryArtifacts: inventoryArtifacts.map(artifact => {
      const equippedTo = ownerByArtifactId.get(artifact.id);
      if (equippedTo) return artifact.equippedTo === equippedTo ? artifact : { ...artifact, equippedTo };
      if (!artifact.equippedTo) return artifact;
      const { equippedTo: _equippedTo, ...unequipped } = artifact;
      return unequipped;
    }),
    characterEquippedArtifacts: normalizedEquipped,
  };
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
