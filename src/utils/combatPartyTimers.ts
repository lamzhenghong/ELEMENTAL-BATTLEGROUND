import type { CombatCharacter } from '../types';

const FRAME_TIMER_FIELDS = [
  'sacrificialCooldown',
  'widsithCooldown',
  'widsithBuffTimer',
  'swapBuffTimer',
  'swapBuffCooldown',
  'crescentPikeTimer',
  'debateClubTimer',
  'debateClubCd',
  'scepterBubbleCd',
  'spearDoubleCd',
  'favoniusCooldown',
] as const;

export const tickCombatPartyTimers = (
  party: CombatCharacter[],
  elapsedFrames: number,
): CombatCharacter[] => {
  if (elapsedFrames <= 0) return party;

  const elapsedSeconds = elapsedFrames / 60;
  let partyChanged = false;
  const nextParty = party.map(character => {
    const next: Partial<CombatCharacter> = {};
    const skillCooldown = Math.max(0, character.skillCooldownRemaining - elapsedSeconds);
    if (skillCooldown !== character.skillCooldownRemaining) {
      next.skillCooldownRemaining = skillCooldown;
    }

    for (const field of FRAME_TIMER_FIELDS) {
      const current = character[field] ?? 0;
      if (current > 0) next[field] = Math.max(0, current - elapsedFrames);
    }

    const ultimateTimer = character.portraitUltimateTimer ?? 0;
    if (ultimateTimer > 0) {
      next.portraitUltimateTimer = Math.max(0, ultimateTimer - elapsedSeconds);
    }

    if (Object.keys(next).length === 0) return character;
    partyChanged = true;
    return { ...character, ...next };
  });

  return partyChanged ? nextParty : party;
};
