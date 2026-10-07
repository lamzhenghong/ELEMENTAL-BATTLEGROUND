export type TelegraphCounterCue = 'parry' | 'evade';
export type WarningDamageRoute = 'player-hit' | 'direct-damage';

export const getCountdownTelegraphProgress = (remaining: number, duration?: number): number => {
  if (!Number.isFinite(remaining) || !Number.isFinite(duration) || !(duration! > 0)) return 0;
  return Math.max(0, Math.min(1, (duration! - remaining) / duration!));
};

export const getGenericTelegraphProgress = (
  timer: number,
  enabled: boolean,
  previousTimer: number,
): number | null => {
  if (!enabled || !Number.isFinite(timer) || timer <= 60) return null;
  // Show the completed border on the impact frame, including a skipped crossing.
  if (timer >= 115 && previousTimer >= 115) return null;
  return getCountdownTelegraphProgress(115 - timer, 55);
};

export const getStalkerTelegraphProgress = (
  remaining: number,
  initialDuration: number,
  impacted: boolean,
): number | null => remaining > 0 || impacted
  ? getCountdownTelegraphProgress(remaining, initialDuration)
  : null;

export const getWarningCounterCue = (
  type: string,
  damageRoute: WarningDamageRoute,
): TelegraphCounterCue | null => {
  switch (type) {
    case 'generic_enemy':
    case 'stalker_strike':
    case 'meteor_warning':
    case 'lightning_strike_warning':
    case 'archetype_artillery_warning':
    case 'archetype_mimic_warning':
    case 'campaign_boss_warning':
    case 'weather_lightning':
      // Environmental hits also enter the parry handler in this combat engine.
      return damageRoute === 'player-hit' ? 'parry' : 'evade';
    default:
      return null;
  }
};
