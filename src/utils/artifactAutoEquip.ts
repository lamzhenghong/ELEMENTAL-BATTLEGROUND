import {
  Artifact,
  ArtifactSet,
  ArtifactSlot,
  CharacterRole
} from '../types';

const ARTIFACT_SLOTS: ArtifactSlot[] = ['helmet', 'hands', 'leg', 'shoe'];

const RECOMMENDED_SET_BY_ROLE: Record<CharacterRole, ArtifactSet> = {
  dps: 'Vanguard',
  tank: 'Guardian',
  'sub-dps': 'Celestial',
  support: 'Chrono'
};

export interface ArtifactAutoEquipInput {
  artifacts: Artifact[];
  characterId: string;
  role: CharacterRole;
}

export const getRecommendedArtifactSet = (role: CharacterRole): ArtifactSet =>
  RECOMMENDED_SET_BY_ROLE[role];

const getArtifactRecommendationScore = (
  artifact: Artifact,
  targetSet: ArtifactSet,
  characterId: string
) => {
  let score = artifact.rarity * 100;

  if (artifact.set === targetSet) {
    score += 1000;
  }

  if (artifact.equippedTo === characterId) {
    score += 50;
  } else if (artifact.equippedTo) {
    score -= 200;
  }

  return score;
};

export const recommendArtifactsForCharacter = ({
  artifacts,
  characterId,
  role
}: ArtifactAutoEquipInput): Partial<Record<ArtifactSlot, Artifact>> => {
  const targetSet = getRecommendedArtifactSet(role);
  const recommendations: Partial<Record<ArtifactSlot, Artifact>> = {};

  for (const slot of ARTIFACT_SLOTS) {
    let bestArtifact: Artifact | undefined;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const artifact of artifacts) {
      if (artifact.slot !== slot) continue;

      const score = getArtifactRecommendationScore(
        artifact,
        targetSet,
        characterId
      );

      if (score > bestScore) {
        bestArtifact = artifact;
        bestScore = score;
      }
    }

    if (bestArtifact) {
      recommendations[slot] = bestArtifact;
    }
  }

  return recommendations;
};
