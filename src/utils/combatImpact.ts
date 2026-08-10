export type CombatImpactSource =
  | 'normal-attack'
  | 'elemental-skill'
  | 'ultimate'
  | 'special-ultimate'
  | 'dot'
  | 'persistent-field';

export type CombatTargetClass = 'normal' | 'elite' | 'boss';
export type ImpactSoundTier = 'light' | 'heavy' | 'shield' | 'critical' | 'boss';

export interface CombatImpactProfileInput {
  source: CombatImpactSource;
  isCrit: boolean;
  targetClass: CombatTargetClass;
  combatSpeed: number;
  screenShakeEnabled: boolean;
  shielded: boolean;
}

export interface CombatImpactProfile {
  anticipationMs: number;
  hitStopMs: number;
  recoilPx: number;
  knockbackDistance: number;
  soundTier: ImpactSoundTier;
}

export interface ImpactSoundRequest {
  tier: ImpactSoundTier;
  at: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface DamageTextEvent {
  targetId: string;
  source: CombatImpactSource;
  amount: number;
  isCrit: boolean;
  reaction: string;
  at: number;
}

export interface DamageTextBucket extends DamageTextEvent {
  hitCount: number;
}

const SOURCE_VALUES: Record<CombatImpactSource, {
  anticipationMs: number;
  normalHitStopMs: number;
  criticalHitStopMs: number;
  recoilPx: number;
  knockbackDistance: number;
}> = {
  'normal-attack': { anticipationMs: 45, normalHitStopMs: 35, criticalHitStopMs: 50, recoilPx: 3, knockbackDistance: 12 },
  'elemental-skill': { anticipationMs: 70, normalHitStopMs: 55, criticalHitStopMs: 65, recoilPx: 5, knockbackDistance: 20 },
  ultimate: { anticipationMs: 0, normalHitStopMs: 70, criticalHitStopMs: 70, recoilPx: 7, knockbackDistance: 28 },
  'special-ultimate': { anticipationMs: 0, normalHitStopMs: 80, criticalHitStopMs: 80, recoilPx: 7, knockbackDistance: 32 },
  dot: { anticipationMs: 0, normalHitStopMs: 0, criticalHitStopMs: 0, recoilPx: 0, knockbackDistance: 0 },
  'persistent-field': { anticipationMs: 0, normalHitStopMs: 0, criticalHitStopMs: 0, recoilPx: 0, knockbackDistance: 0 },
};

const SOUND_PRIORITY: Record<ImpactSoundTier, number> = {
  light: 0,
  heavy: 1,
  shield: 2,
  critical: 3,
  boss: 4,
};

export function getCombatImpactProfile(input: CombatImpactProfileInput): CombatImpactProfile {
  const source = SOURCE_VALUES[input.source];
  const speed = Math.max(0.5, input.combatSpeed);
  const targetResistance = input.targetClass === 'boss' ? 0 : input.targetClass === 'elite' ? 0.5 : 1;
  const shieldResistance = input.shielded ? 0.25 : 1;
  const baseHitStop = input.isCrit ? source.criticalHitStopMs : source.normalHitStopMs;
  const motionMultiplier = input.screenShakeEnabled ? 1 : 0.5;

  let soundTier: ImpactSoundTier = input.source === 'normal-attack' ? 'light' : 'heavy';
  if (input.isCrit) soundTier = 'critical';
  if (input.shielded) soundTier = 'shield';
  if (input.targetClass === 'boss') soundTier = 'boss';

  return {
    anticipationMs: source.anticipationMs / speed,
    hitStopMs: (baseHitStop / speed) * motionMultiplier,
    recoilPx: input.screenShakeEnabled ? source.recoilPx : 0,
    knockbackDistance: source.knockbackDistance * targetResistance * shieldResistance,
    soundTier,
  };
}

export function getDirectionalKnockback(origin: Point2D, target: Point2D, distance: number): Point2D {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const magnitude = Math.hypot(dx, dy);
  if (magnitude === 0 || distance === 0) return { x: 0, y: 0 };
  return { x: (dx / magnitude) * distance, y: (dy / magnitude) * distance };
}

export function requestStrongestHitStop(currentMs: number, requestedMs: number): number {
  return Math.max(currentMs, requestedMs);
}

export function selectImpactSoundRequest(
  current: ImpactSoundRequest,
  incoming: ImpactSoundRequest,
  throttleWindowMs = 45,
): ImpactSoundRequest {
  if (incoming.at - current.at > throttleWindowMs) return incoming;
  return SOUND_PRIORITY[incoming.tier] > SOUND_PRIORITY[current.tier] ? incoming : current;
}

export function createDamageTextBucket(event: DamageTextEvent): DamageTextBucket {
  return { ...event, hitCount: 1 };
}

export function mergeDamageTextBucket(
  bucket: DamageTextBucket,
  event: DamageTextEvent,
  mergeWindowMs = 90,
): DamageTextBucket | null {
  const matches = bucket.targetId === event.targetId
    && bucket.source === event.source
    && bucket.isCrit === event.isCrit
    && bucket.reaction === event.reaction
    && event.at >= bucket.at
    && event.at - bucket.at <= mergeWindowMs;
  if (!matches) return null;

  return {
    ...bucket,
    amount: bucket.amount + event.amount,
    at: event.at,
    hitCount: bucket.hitCount + 1,
  };
}
