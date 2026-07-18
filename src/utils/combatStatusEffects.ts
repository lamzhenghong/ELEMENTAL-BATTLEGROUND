import { createReactionContext, type ReactionTriggerContext } from './reactionSources';

export type CombatTargetClass = 'normal' | 'elite' | 'boss';
export type StatusEffectType =
  | 'burn'
  | 'slow'
  | 'stun'
  | 'damage-down'
  | 'shield'
  | 'reaction-amplification'
  | 'persistent-damage-field';
export type StatusStackBehavior = 'refresh' | 'strongest' | 'additive' | 'unique';

export interface CombatStatusEffect {
  id: string;
  type: StatusEffectType;
  sourceCharacterId: string;
  sourceAbility: string;
  duration: number;
  remainingDuration: number;
  strength: number;
  stackBehavior: StatusStackBehavior;
  visualKind: string;
  tickInterval?: number;
  timeUntilNextTick?: number;
  snapshotAtk?: number;
}

export interface StatusApplicationResult {
  statuses: CombatStatusEffect[];
  applied: boolean;
  immune: boolean;
}

export interface CombatStatusTickEvent {
  kind: 'status-damage';
  statusId: string;
  statusType: StatusEffectType;
  sourceCharacterId: string;
  damage: number;
  reactionContext: ReactionTriggerContext;
}

export interface CombatStatusTickResult {
  statuses: CombatStatusEffect[];
  events: CombatStatusTickEvent[];
}

const isCrowdControl = (type: StatusEffectType) => type === 'slow' || type === 'stun';

export const applyCombatStatus = (
  statuses: readonly CombatStatusEffect[],
  incoming: CombatStatusEffect,
  targetClass: CombatTargetClass
): StatusApplicationResult => {
  if (targetClass === 'boss' && isCrowdControl(incoming.type)) {
    return { statuses: [...statuses], applied: false, immune: true };
  }

  const matchIndex = statuses.findIndex(status =>
    status.type === incoming.type
    && status.sourceCharacterId === incoming.sourceCharacterId
    && (incoming.type === 'burn' || status.sourceAbility === incoming.sourceAbility)
  );

  if (matchIndex < 0) {
    return { statuses: [...statuses, { ...incoming }], applied: true, immune: false };
  }

  const next = [...statuses];
  const current = next[matchIndex];
  if (!current) return { statuses: [...statuses], applied: false, immune: false };

  if (incoming.stackBehavior === 'unique') {
    return { statuses: next, applied: false, immune: false };
  }

  if (incoming.stackBehavior === 'strongest' && current.strength > incoming.strength) {
    next[matchIndex] = current;
  } else if (incoming.stackBehavior === 'additive') {
    next[matchIndex] = {
      ...incoming,
      strength: current.strength + incoming.strength,
      remainingDuration: Math.max(current.remainingDuration, incoming.duration)
    };
  } else {
    next[matchIndex] = { ...incoming, remainingDuration: incoming.duration };
  }

  return { statuses: next, applied: true, immune: false };
};

export const tickCombatStatuses = (
  statuses: readonly CombatStatusEffect[],
  deltaSeconds: number
): CombatStatusTickResult => {
  const delta = Math.max(0, deltaSeconds);
  const nextStatuses: CombatStatusEffect[] = [];
  const events: CombatStatusTickEvent[] = [];

  for (const status of statuses) {
    const activeWindow = Math.min(delta, Math.max(0, status.remainingDuration));
    let nextTick = status.timeUntilNextTick ?? status.tickInterval ?? Number.POSITIVE_INFINITY;
    let remainingWindow = activeWindow;

    if (status.tickInterval && status.tickInterval > 0 && status.type === 'burn') {
      while (remainingWindow + 1e-9 >= nextTick) {
        remainingWindow -= nextTick;
        events.push({
          kind: 'status-damage',
          statusId: status.id,
          statusType: status.type,
          sourceCharacterId: status.sourceCharacterId,
          damage: Math.round(Math.max(0, status.snapshotAtk ?? 0) * Math.max(0, status.strength)),
          reactionContext: createReactionContext('damage-over-time', true, false)
        });
        nextTick = status.tickInterval;
      }
      nextTick -= remainingWindow;
    }

    const remainingDuration = Math.max(0, status.remainingDuration - delta);
    if (remainingDuration > 0) {
      nextStatuses.push({
        ...status,
        remainingDuration,
        ...(status.tickInterval ? { timeUntilNextTick: Math.max(0, nextTick) } : {})
      });
    }
  }

  return { statuses: nextStatuses, events };
};

export const getStatusMovementMultiplier = (statuses: readonly CombatStatusEffect[]) => {
  const strongestSlow = Math.max(0, ...statuses
    .filter(status => status.type === 'slow' && status.remainingDuration > 0)
    .map(status => status.strength));
  return Math.max(0.25, 1 - strongestSlow);
};

export const getStatusOutgoingDamageMultiplier = (statuses: readonly CombatStatusEffect[]) => {
  const strongestReduction = Math.max(0, ...statuses
    .filter(status => status.type === 'damage-down' && status.remainingDuration > 0)
    .map(status => status.strength));
  return Math.max(0, 1 - strongestReduction);
};

export const isTargetStunned = (statuses: readonly CombatStatusEffect[]) =>
  statuses.some(status => status.type === 'stun' && status.remainingDuration > 0);
