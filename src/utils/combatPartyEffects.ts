import { createReactionContext, getReactionAmplification, type ReactionTriggerContext } from './reactionSources';

export interface CombatPosition {
  x: number;
  y: number;
}

export interface PartyShield {
  sourceCharacterId: string;
  currentHp: number;
  maxHp: number;
}

interface TimedPartyEffectBase {
  id: string;
  sourceCharacterId: string;
  duration: number;
  remainingDuration: number;
  x: number;
  y: number;
  radius: number;
}

export interface ReactionFieldEffect extends TimedPartyEffectBase {
  kind: 'reaction-field';
  reactionMultiplier: number;
  crowdControlDurationMultiplier: number;
  enemyDamageMultiplier: number;
}

export interface WhirlpoolEffect extends TimedPartyEffectBase {
  kind: 'whirlpool';
  snapshotAtk?: number;
  endDamageMultiplier?: number;
}

export interface DominionEffect extends TimedPartyEffectBase {
  kind: 'veyra-dominion';
  normalAttackDamageMultiplier: number;
  normalAttackRangeMultiplier: number;
}

export interface ElectricFieldEffect extends TimedPartyEffectBase {
  kind: 'electric-field';
  snapshotAtk: number;
  tickInterval: number;
  timeUntilNextTick: number;
}

export type CombatPartyEffect = ReactionFieldEffect | WhirlpoolEffect | DominionEffect | ElectricFieldEffect;

export interface CombatPartyEffectState {
  shield: PartyShield | null;
  effects: CombatPartyEffect[];
  nextEffectId: number;
}

export interface PartyEffectTickEvent {
  kind: 'field-damage';
  effectId: string;
  sourceCharacterId: string;
  damage: number;
  position: CombatPosition;
  radius: number;
  reactionContext: ReactionTriggerContext;
}

export const createPartyEffectState = (): CombatPartyEffectState => ({
  shield: null,
  effects: [],
  nextEffectId: 1
});

export const addMaelisShield = (
  state: CombatPartyEffectState,
  amount: number = 1000,
  cap: number = 3000
): CombatPartyEffectState => {
  const safeCap = Math.max(0, cap);
  const currentHp = state.shield?.currentHp ?? 0;
  return {
    ...state,
    shield: {
      sourceCharacterId: 'maelis',
      currentHp: Math.min(safeCap, currentHp + Math.max(0, amount)),
      maxHp: safeCap
    }
  };
};

export const consumePartyShield = (state: CombatPartyEffectState, damage: number) => {
  const incoming = Math.max(0, damage);
  if (!state.shield || incoming === 0) {
    return { state, absorbedDamage: 0, remainingDamage: incoming };
  }

  const absorbedDamage = Math.min(state.shield.currentHp, incoming);
  const shieldHp = state.shield.currentHp - absorbedDamage;
  return {
    state: { ...state, shield: shieldHp > 0 ? { ...state.shield, currentHp: shieldHp } : null },
    absorbedDamage,
    remainingDamage: incoming - absorbedDamage
  };
};

export const restorePartyShield = (state: CombatPartyEffectState, amount: number): CombatPartyEffectState => {
  if (!state.shield || amount <= 0) return state;
  return {
    ...state,
    shield: {
      ...state.shield,
      currentHp: Math.min(state.shield.maxHp, state.shield.currentHp + amount)
    }
  };
};

const appendEffect = <TEffect extends Omit<CombatPartyEffect, 'id'>>(
  state: CombatPartyEffectState,
  effect: TEffect
): CombatPartyEffectState => ({
  ...state,
  effects: [...state.effects, { ...effect, id: `${effect.kind}:${state.nextEffectId}` } as CombatPartyEffect],
  nextEffectId: state.nextEffectId + 1
});

export const addReactionField = (
  state: CombatPartyEffectState,
  position: CombatPosition,
  options: Partial<Pick<ReactionFieldEffect,
    'duration' | 'radius' | 'reactionMultiplier' | 'crowdControlDurationMultiplier' | 'enemyDamageMultiplier'>> = {}
): CombatPartyEffectState => appendEffect(state, {
  kind: 'reaction-field',
  sourceCharacterId: 'maelis',
  duration: options.duration ?? 15,
  remainingDuration: options.duration ?? 15,
  x: position.x,
  y: position.y,
  radius: options.radius ?? 420,
  reactionMultiplier: options.reactionMultiplier ?? 2,
  crowdControlDurationMultiplier: options.crowdControlDurationMultiplier ?? 2,
  enemyDamageMultiplier: options.enemyDamageMultiplier ?? 0.8
});

export const addWhirlpool = (
  state: CombatPartyEffectState,
  position: CombatPosition,
  options: { duration?: number; radius?: number; snapshotAtk?: number; endDamageMultiplier?: number } = {}
): CombatPartyEffectState => appendEffect(state, {
  kind: 'whirlpool',
  sourceCharacterId: 'kaelen',
  duration: options.duration ?? 1.8,
  remainingDuration: options.duration ?? 1.8,
  x: position.x,
  y: position.y,
  radius: options.radius ?? 460,
  snapshotAtk: options.snapshotAtk,
  endDamageMultiplier: options.endDamageMultiplier
});

export const activateVeyraDominion = (
  state: CombatPartyEffectState,
  options: CombatPosition & {
    snapshotAtk: number;
    duration?: number;
    fieldAttackMultiplier?: number;
    fieldTickInterval?: number;
  }
): CombatPartyEffectState => {
  const duration = options.duration ?? 10;
  const tickInterval = options.fieldTickInterval ?? 2;
  const withoutOldVeyraEffects = {
    ...state,
    effects: state.effects.filter(effect =>
      effect.kind !== 'veyra-dominion' && effect.kind !== 'electric-field'
    )
  };
  const dominion = appendEffect(withoutOldVeyraEffects, {
    kind: 'veyra-dominion',
    sourceCharacterId: 'veyra',
    duration,
    remainingDuration: duration,
    x: options.x,
    y: options.y,
    radius: 360,
    normalAttackDamageMultiplier: 1.5,
    normalAttackRangeMultiplier: 2
  });
  return appendEffect(dominion, {
    kind: 'electric-field',
    sourceCharacterId: 'veyra',
    duration,
    remainingDuration: duration,
    x: options.x,
    y: options.y,
    radius: 300,
    snapshotAtk: Math.max(0, options.snapshotAtk) * (options.fieldAttackMultiplier ?? 1),
    tickInterval,
    timeUntilNextTick: tickInterval
  });
};

export const addPeriodicField = (
  state: CombatPartyEffectState,
  options: CombatPosition & {
    sourceCharacterId: string;
    radius: number;
    duration: number;
    snapshotAtk: number;
    attackMultiplier: number;
    tickInterval: number;
  }
): CombatPartyEffectState => appendEffect(state, {
  kind: 'electric-field',
  sourceCharacterId: options.sourceCharacterId,
  duration: options.duration,
  remainingDuration: options.duration,
  x: options.x,
  y: options.y,
  radius: options.radius,
  snapshotAtk: Math.max(0, options.snapshotAtk * options.attackMultiplier),
  tickInterval: options.tickInterval,
  timeUntilNextTick: options.tickInterval
});

export const advanceVeyraFieldTick = (
  state: CombatPartyEffectState,
  seconds: number
): CombatPartyEffectState => ({
  ...state,
  effects: state.effects.map(effect => effect.kind === 'electric-field' && effect.sourceCharacterId === 'veyra'
    ? { ...effect, timeUntilNextTick: Math.max(0, effect.timeUntilNextTick - Math.max(0, seconds)) }
    : effect)
});

export const getReactionFieldModifiers = (
  state: CombatPartyEffectState,
  x: number,
  y: number
) => {
  const fields = state.effects.filter((effect): effect is ReactionFieldEffect => {
    if (effect.kind !== 'reaction-field' || effect.remainingDuration <= 0) return false;
    return Math.hypot(x - effect.x, y - effect.y) <= effect.radius;
  });
  return {
    reactionMultiplier: getReactionAmplification(fields.map(field => field.reactionMultiplier)),
    crowdControlDurationMultiplier: Math.max(1, ...fields.map(field => field.crowdControlDurationMultiplier)),
    enemyDamageMultiplier: Math.min(1, ...fields.map(field => field.enemyDamageMultiplier))
  };
};

export const tickPartyEffects = (
  state: CombatPartyEffectState,
  deltaSeconds: number,
  sourcePositions: Readonly<Record<string, CombatPosition>> = {}
): { state: CombatPartyEffectState; events: PartyEffectTickEvent[] } => {
  const delta = Math.max(0, deltaSeconds);
  const effects: CombatPartyEffect[] = [];
  const events: PartyEffectTickEvent[] = [];

  for (const current of state.effects) {
    const sourcePosition = sourcePositions[current.sourceCharacterId];
    const effect = sourcePosition && (current.kind === 'electric-field' || current.kind === 'veyra-dominion')
      ? { ...current, x: sourcePosition.x, y: sourcePosition.y }
      : current;
    const activeWindow = Math.min(delta, Math.max(0, effect.remainingDuration));

    if (effect.kind === 'electric-field') {
      let remainingWindow = activeWindow;
      let nextTick = effect.timeUntilNextTick;
      while (remainingWindow + 1e-9 >= nextTick) {
        remainingWindow -= nextTick;
        events.push({
          kind: 'field-damage',
          effectId: effect.id,
          sourceCharacterId: effect.sourceCharacterId,
          damage: Math.round(effect.snapshotAtk),
          position: { x: effect.x, y: effect.y },
          radius: effect.radius,
          reactionContext: createReactionContext('persistent-field', true, false)
        });
        nextTick = effect.tickInterval;
      }
      effect.timeUntilNextTick = Math.max(0, nextTick - remainingWindow);
    }

    if (
      effect.kind === 'whirlpool'
      && effect.remainingDuration > 0
      && effect.remainingDuration - delta <= 0
      && effect.snapshotAtk
      && effect.endDamageMultiplier
    ) {
      events.push({
        kind: 'field-damage',
        effectId: effect.id,
        sourceCharacterId: effect.sourceCharacterId,
        damage: Math.round(effect.snapshotAtk * effect.endDamageMultiplier),
        position: { x: effect.x, y: effect.y },
        radius: effect.radius,
        reactionContext: createReactionContext('persistent-field', true, false)
      });
    }

    const remainingDuration = Math.max(0, effect.remainingDuration - delta);
    if (remainingDuration > 0) effects.push({ ...effect, remainingDuration });
  }

  return { state: { ...state, effects }, events };
};

export const clearPartyEffects = (_state: CombatPartyEffectState): CombatPartyEffectState =>
  createPartyEffectState();
