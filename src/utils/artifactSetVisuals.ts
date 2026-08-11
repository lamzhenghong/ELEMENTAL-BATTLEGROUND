import type { Artifact, ArtifactSet, ArtifactSlot } from '../types';

export type ArtifactSetVisualTier = 0 | 2 | 4;

export interface ArtifactSetVisualTheme {
  color: string;
  softColor: string;
  emblem: 'sword' | 'shield' | 'star' | 'clock';
  aura: 'sharp-motes' | 'protective-ring' | 'star-sparks' | 'time-ring';
}

export interface ArtifactSetProgress {
  set: ArtifactSet;
  count: number;
  tier: ArtifactSetVisualTier;
  isTwoPieceActive: boolean;
  isFourPieceActive: boolean;
  activeSlots: ArtifactSlot[];
  missingSlots: ArtifactSlot[];
}

export const ARTIFACT_SLOT_ORDER: readonly ArtifactSlot[] = ['helmet', 'hands', 'leg', 'shoe'];
export const ARTIFACT_SET_ORDER: readonly ArtifactSet[] = ['Vanguard', 'Guardian', 'Celestial', 'Chrono'];

export const ARTIFACT_SET_VISUALS: Record<ArtifactSet, ArtifactSetVisualTheme> = {
  Vanguard: { color: '#fb7185', softColor: '#881337', emblem: 'sword', aura: 'sharp-motes' },
  Guardian: { color: '#34d399', softColor: '#064e3b', emblem: 'shield', aura: 'protective-ring' },
  Celestial: { color: '#fbbf24', softColor: '#78350f', emblem: 'star', aura: 'star-sparks' },
  Chrono: { color: '#a78bfa', softColor: '#4c1d95', emblem: 'clock', aura: 'time-ring' },
};

export const getArtifactSetProgress = (
  equippedArtifacts: readonly Pick<Artifact, 'set' | 'slot'>[],
): ArtifactSetProgress[] => ARTIFACT_SET_ORDER.map(set => {
  const activeSlots = ARTIFACT_SLOT_ORDER.filter(slot => (
    equippedArtifacts.some(artifact => artifact.set === set && artifact.slot === slot)
  ));
  const count = activeSlots.length;
  const tier: ArtifactSetVisualTier = count >= 4 ? 4 : count >= 2 ? 2 : 0;
  return {
    set,
    count,
    tier,
    isTwoPieceActive: count >= 2,
    isFourPieceActive: count >= 4,
    activeSlots,
    missingSlots: ARTIFACT_SLOT_ORDER.filter(slot => !activeSlots.includes(slot)),
  };
});

export const getPrimaryIncompleteSet = (
  progress: readonly ArtifactSetProgress[],
): ArtifactSetProgress | null => {
  const candidates = progress.filter(entry => entry.count > 0 && entry.count < 4);
  if (candidates.length === 0) return null;
  const maxCount = Math.max(...candidates.map(entry => entry.count));
  const leaders = candidates.filter(entry => entry.count === maxCount);
  return leaders.length === 1 ? leaders[0] : null;
};
