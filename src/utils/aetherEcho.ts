import { ElementType } from '../types';

export type AetherEchoRarity = 'Common' | 'Rare' | 'Legendary';

export interface AetherEchoPartyMember {
  id: string;
  name: string;
  element: ElementType;
}

export interface AetherEchoState {
  id: string;
  rarity: AetherEchoRarity;
  damageMultiplier: number;
  auraColor: string;
  characterId: string;
  characterName: string;
  element: ElementType;
  notification?: string;
}

const ECHO_TIERS: Record<AetherEchoRarity, {
  threshold: number;
  damageMultiplier: number;
  auraColor: string;
  notification?: string;
}> = {
  Legendary: {
    threshold: 0.001,
    damageMultiplier: 2,
    auraColor: '#fbbf24',
    notification: 'LEGENDARY ECHO AWAKENED'
  },
  Rare: {
    threshold: 0.006,
    damageMultiplier: 1.5,
    auraColor: '#a855f7'
  },
  Common: {
    threshold: 0.016,
    damageMultiplier: 1,
    auraColor: '#38bdf8'
  }
};

export const rollAetherEcho = (
  party: readonly AetherEchoPartyMember[],
  spawnRoll = Math.random(),
  partyRoll = Math.random()
): AetherEchoState | null => {
  if (party.length === 0) return null;

  const rarity: AetherEchoRarity | null =
    spawnRoll < ECHO_TIERS.Legendary.threshold ? 'Legendary' :
    spawnRoll < ECHO_TIERS.Rare.threshold ? 'Rare' :
    spawnRoll < ECHO_TIERS.Common.threshold ? 'Common' :
    null;

  if (!rarity) return null;

  const pickedIndex = Math.min(party.length - 1, Math.floor(partyRoll * party.length));
  const picked = party[pickedIndex];
  const tier = ECHO_TIERS[rarity];

  return {
    id: `echo_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    rarity,
    damageMultiplier: tier.damageMultiplier,
    auraColor: tier.auraColor,
    characterId: picked.id,
    characterName: picked.name,
    element: picked.element,
    notification: tier.notification
  };
};
