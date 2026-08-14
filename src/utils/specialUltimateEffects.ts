import type { ElementType } from '../types';

export type SpecialUltimateTargetClass = 'normal' | 'elite' | 'boss';

export interface SpecialUltimateTarget {
  id: string;
  targetClass: SpecialUltimateTargetClass;
}

interface BoilingPointTargetState extends SpecialUltimateTarget {
  stacks: number;
  vulnerabilityRemaining: number;
}

interface BoilingPointState {
  remainingDuration: number;
  snapshotAtk: number;
  targets: Record<string, BoilingPointTargetState>;
}

interface LivingStormState {
  remainingDuration: number;
  snapshotAtk: number;
  linkedTargetIds: string[];
  targetClasses: Record<string, SpecialUltimateTargetClass>;
  echoCooldown: number;
  timeUntilPulse: number;
}

export interface SpecialUltimateEffectState {
  boilingPoint: BoilingPointState | null;
  livingStorm: LivingStormState | null;
}

export type SpecialUltimateEffectEvent =
  | {
      kind: 'damage';
      targetId: string;
      damage: number;
      element: ElementType;
      label: string;
    }
  | {
      kind: 'pull';
      centerTargetId: string;
      radius: number;
      distance: number;
    }
  | {
      kind: 'root';
      targetId: string;
      duration: number;
    };

export interface SpecialUltimateEffectResult {
  state: SpecialUltimateEffectState;
  events: SpecialUltimateEffectEvent[];
}

const BOILING_POINT_DURATION = 10;
const BOILING_POINT_STACKS = 5;
const BOILING_POINT_DETONATION_MULTIPLIER = 1.5;
const BOILING_POINT_BOSS_VULNERABILITY_DURATION = 4;
const LIVING_STORM_DURATION = 12;
const LIVING_STORM_MAX_TARGETS = 5;
const LIVING_STORM_ECHO_MULTIPLIER = 0.2;
const LIVING_STORM_ECHO_THROTTLE = 0.25;
const LIVING_STORM_PULSE_INTERVAL = 3;
const LIVING_STORM_BOSS_STRIKE_MULTIPLIER = 0.75;

const roundDuration = (value: number) => Math.round(Math.max(0, value) * 1000) / 1000;
const roundDamage = (value: number) => Math.max(0, Math.round(value));

const normalizeTargets = (targets: readonly SpecialUltimateTarget[]) => {
  const seen = new Set<string>();
  return targets.filter(target => {
    if (!target.id || seen.has(target.id)) return false;
    seen.add(target.id);
    return true;
  });
};

export const createSpecialUltimateEffectState = (): SpecialUltimateEffectState => ({
  boilingPoint: null,
  livingStorm: null,
});

export const clearSpecialUltimateEffects = (_state: SpecialUltimateEffectState): SpecialUltimateEffectState => {
  return createSpecialUltimateEffectState();
};

export const activateBoilingPoint = (
  _state: SpecialUltimateEffectState,
  targets: readonly SpecialUltimateTarget[],
  snapshotAtk: number,
): SpecialUltimateEffectState => {
  const targetStates = normalizeTargets(targets).reduce<Record<string, BoilingPointTargetState>>((result, target) => {
    result[target.id] = {
      ...target,
      stacks: 0,
      vulnerabilityRemaining: 0,
    };
    return result;
  }, {});

  return {
    boilingPoint: {
      remainingDuration: BOILING_POINT_DURATION,
      snapshotAtk: Math.max(0, snapshotAtk),
      targets: targetStates,
    },
    livingStorm: null,
  };
};

export const activateLivingStormNetwork = (
  _state: SpecialUltimateEffectState,
  targets: readonly SpecialUltimateTarget[],
  snapshotAtk: number,
): SpecialUltimateEffectState => {
  const priority: Record<SpecialUltimateTargetClass, number> = { boss: 0, elite: 1, normal: 2 };
  const linkedTargets = normalizeTargets(targets)
    .map((target, index) => ({ target, index }))
    .sort((left, right) => priority[left.target.targetClass] - priority[right.target.targetClass] || left.index - right.index)
    .slice(0, LIVING_STORM_MAX_TARGETS)
    .map(entry => entry.target);

  return {
    boilingPoint: null,
    livingStorm: {
      remainingDuration: LIVING_STORM_DURATION,
      snapshotAtk: Math.max(0, snapshotAtk),
      linkedTargetIds: linkedTargets.map(target => target.id),
      targetClasses: Object.fromEntries(linkedTargets.map(target => [target.id, target.targetClass])),
      echoCooldown: 0,
      timeUntilPulse: LIVING_STORM_PULSE_INTERVAL,
    },
  };
};

export const getSpecialUltimateDamageMultiplier = (
  state: SpecialUltimateEffectState,
  targetId: string,
): number => {
  const target = state.boilingPoint?.targets[targetId];
  return target && target.targetClass === 'boss' && target.vulnerabilityRemaining > 0 ? 1.1 : 1;
};

export const registerSpecialUltimateDirectHit = (
  state: SpecialUltimateEffectState,
  targetId: string,
  damage: number,
): SpecialUltimateEffectResult => {
  const events: SpecialUltimateEffectEvent[] = [];
  let nextState = state;

  const boilingTarget = state.boilingPoint?.targets[targetId];
  if (state.boilingPoint && boilingTarget && damage > 0) {
    const stacks = boilingTarget.stacks + 1;
    const detonated = stacks >= BOILING_POINT_STACKS;
    const nextTarget: BoilingPointTargetState = {
      ...boilingTarget,
      stacks: detonated ? 0 : stacks,
      vulnerabilityRemaining: detonated && boilingTarget.targetClass === 'boss'
        ? BOILING_POINT_BOSS_VULNERABILITY_DURATION
        : boilingTarget.vulnerabilityRemaining,
    };

    nextState = {
      ...nextState,
      boilingPoint: {
        ...state.boilingPoint,
        targets: { ...state.boilingPoint.targets, [targetId]: nextTarget },
      },
    };

    if (detonated) {
      events.push({
        kind: 'damage',
        targetId,
        damage: roundDamage(state.boilingPoint.snapshotAtk * BOILING_POINT_DETONATION_MULTIPLIER),
        element: 'Pyro',
        label: 'VAPOR PRESSURE BURST',
      });
      events.push({ kind: 'pull', centerTargetId: targetId, radius: 240, distance: 70 });
    }
  }

  const livingStorm = state.livingStorm;
  if (
    livingStorm
    && damage > 0
    && livingStorm.echoCooldown <= 0
    && livingStorm.linkedTargetIds.includes(targetId)
  ) {
    const echoDamage = Math.min(
      roundDamage(damage * LIVING_STORM_ECHO_MULTIPLIER),
      roundDamage(livingStorm.snapshotAtk),
    );

    if (echoDamage > 0) {
      livingStorm.linkedTargetIds.forEach(linkedTargetId => {
        if (linkedTargetId === targetId) return;
        events.push({
          kind: 'damage',
          targetId: linkedTargetId,
          damage: echoDamage,
          element: 'Electro',
          label: 'LIVING STORM ECHO',
        });
      });
    }

    nextState = {
      ...nextState,
      livingStorm: { ...livingStorm, echoCooldown: LIVING_STORM_ECHO_THROTTLE },
    };
  }

  return { state: nextState, events };
};

export const tickSpecialUltimateEffects = (
  state: SpecialUltimateEffectState,
  deltaSeconds: number,
): SpecialUltimateEffectResult => {
  const delta = Math.max(0, deltaSeconds);
  const events: SpecialUltimateEffectEvent[] = [];
  let boilingPoint = state.boilingPoint;
  let livingStorm = state.livingStorm;

  if (boilingPoint) {
    const remainingDuration = roundDuration(boilingPoint.remainingDuration - delta);
    const targets = Object.fromEntries(
      Object.entries(boilingPoint.targets).map(([targetId, target]) => [
        targetId,
        {
          ...target,
          vulnerabilityRemaining: roundDuration(target.vulnerabilityRemaining - delta),
        },
      ]),
    );
    boilingPoint = remainingDuration > 0 ? { ...boilingPoint, remainingDuration, targets } : null;
  }

  if (livingStorm) {
    const activeDelta = Math.min(delta, livingStorm.remainingDuration);
    let timeUntilPulse = livingStorm.timeUntilPulse;
    let pulseWindow = activeDelta;

    while (pulseWindow + 0.0001 >= timeUntilPulse) {
      const normalTargets = livingStorm.linkedTargetIds.filter(
        targetId => livingStorm?.targetClasses[targetId] === 'normal',
      );
      const eliteTargets = livingStorm.linkedTargetIds.filter(
        targetId => livingStorm?.targetClasses[targetId] === 'elite',
      );
      const bossTargets = livingStorm.linkedTargetIds.filter(
        targetId => livingStorm?.targetClasses[targetId] === 'boss',
      );

      normalTargets.forEach(targetId => events.push({ kind: 'root', targetId, duration: 1.2 }));
      eliteTargets.forEach(targetId => events.push({ kind: 'root', targetId, duration: 0.7 }));
      bossTargets.forEach(targetId => events.push({
        kind: 'damage',
        targetId,
        damage: roundDamage(livingStorm!.snapshotAtk * LIVING_STORM_BOSS_STRIKE_MULTIPLIER),
        element: 'Electro',
        label: 'CONCENTRATED LIGHTNING',
      }));

      pulseWindow -= timeUntilPulse;
      timeUntilPulse = LIVING_STORM_PULSE_INTERVAL;
    }

    timeUntilPulse = roundDuration(timeUntilPulse - pulseWindow);
    const remainingDuration = roundDuration(livingStorm.remainingDuration - delta);
    livingStorm = remainingDuration > 0
      ? {
          ...livingStorm,
          remainingDuration,
          echoCooldown: roundDuration(livingStorm.echoCooldown - delta),
          timeUntilPulse,
        }
      : null;
  }

  return { state: { boilingPoint, livingStorm }, events };
};
