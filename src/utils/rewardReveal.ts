export type RewardKind = 'mora' | 'gems' | 'weapon' | 'artifact';

export type RewardRevealTarget =
  | '[data-reward-target="mora"]'
  | '[data-reward-target="gems"]'
  | '[data-reward-target="forge"]'
  | '[data-reward-target="inventory-fallback"]';

export interface RewardRevealEvent {
  id: string;
  kind: RewardKind;
  quantity: number;
  source?: string;
  target?: RewardRevealTarget;
  constituentIds?: readonly string[];
}

export interface NormalizedRewardRevealEvent extends RewardRevealEvent {
  target: RewardRevealTarget;
  constituentIds: readonly string[];
}

export interface RewardPulseTarget {
  dataset: { rewardPulse?: string };
  removeAttribute: (name: string) => void;
}

export interface RewardPulseScheduler {
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (timer: number) => void;
}

export interface RewardPulseController {
  trigger: (target: RewardPulseTarget) => void;
  reset: () => void;
}

export const INVENTORY_FALLBACK_SELECTOR: RewardRevealTarget = '[data-reward-target="inventory-fallback"]';
export const REWARD_DESTINATION_PULSE_MS = 260;

const REWARD_TARGETS: Record<RewardKind, RewardRevealTarget> = {
  mora: '[data-reward-target="mora"]',
  gems: '[data-reward-target="gems"]',
  weapon: '[data-reward-target="forge"]',
  artifact: '[data-reward-target="forge"]',
};

const MAX_TRANSACTION_GROUPS = 4;
const MAX_QUEUE_GROUPS = 12;

const isRewardKind = (kind: unknown): kind is RewardKind => (
  kind === 'mora' || kind === 'gems' || kind === 'weapon' || kind === 'artifact'
);

const isUsableRewardEvent = (event: RewardRevealEvent): boolean => (
  typeof event.id === 'string'
  && event.id.length > 0
  && isRewardKind(event.kind)
  && Number.isFinite(event.quantity)
  && event.quantity > 0
);

const getConstituentIds = (event: RewardRevealEvent): string[] => Array.from(new Set([
  event.id,
  ...(event.constituentIds ?? []),
].filter((id): id is string => typeof id === 'string' && id.length > 0)));

const targetRewardEvent = (
  event: RewardRevealEvent,
  quantity = event.quantity,
  constituentIds = getConstituentIds(event),
): NormalizedRewardRevealEvent => ({
  id: event.id,
  kind: event.kind,
  quantity,
  source: event.source,
  target: REWARD_TARGETS[event.kind],
  constituentIds,
});

export const getRewardRevealTarget = (kind: RewardKind): RewardRevealTarget => REWARD_TARGETS[kind];

export const normalizeRewardEvents = (
  events: readonly RewardRevealEvent[],
): NormalizedRewardRevealEvent[] => {
  const seenIds = new Set<string>();
  const groups = new Map<RewardKind, NormalizedRewardRevealEvent>();

  for (const event of events) {
    if (!isUsableRewardEvent(event)) continue;
    const constituentIds = getConstituentIds(event);
    if (constituentIds.some((id) => seenIds.has(id))) continue;

    const existing = groups.get(event.kind);
    if (existing) {
      const quantity = existing.quantity + event.quantity;
      if (!Number.isFinite(quantity)) {
        constituentIds.forEach((id) => seenIds.add(id));
        continue;
      }
      groups.set(event.kind, {
        ...existing,
        quantity,
        constituentIds: [...existing.constituentIds, ...constituentIds],
      });
      constituentIds.forEach((id) => seenIds.add(id));
      continue;
    }

    if (groups.size === MAX_TRANSACTION_GROUPS) continue;
    groups.set(event.kind, targetRewardEvent(event, event.quantity, constituentIds));
    constituentIds.forEach((id) => seenIds.add(id));
  }

  return Array.from(groups.values());
};

export const appendRewardEvents = (
  queue: readonly RewardRevealEvent[],
  events: readonly RewardRevealEvent[],
): NormalizedRewardRevealEvent[] => {
  const next: NormalizedRewardRevealEvent[] = [];
  const seenIds = new Set<string>();

  for (const event of [...queue, ...events]) {
    if (!isUsableRewardEvent(event)) continue;
    const constituentIds = getConstituentIds(event);
    if (constituentIds.some((id) => seenIds.has(id))) continue;
    constituentIds.forEach((id) => seenIds.add(id));
    next.push(targetRewardEvent(event));
    if (next.length === MAX_QUEUE_GROUPS) break;
  }

  return next;
};

export const createRewardPulseController = (
  scheduler: RewardPulseScheduler,
  duration = REWARD_DESTINATION_PULSE_MS,
): RewardPulseController => {
  let generation = 0;
  const activePulses = new Map<RewardPulseTarget, { generation: number; timer: number }>();

  return {
    trigger(target) {
      const previous = activePulses.get(target);
      if (previous) scheduler.clearTimeout(previous.timer);

      const currentGeneration = ++generation;
      target.dataset.rewardPulse = 'true';
      const timer = scheduler.setTimeout(() => {
        if (activePulses.get(target)?.generation !== currentGeneration) return;
        target.removeAttribute('data-reward-pulse');
        activePulses.delete(target);
      }, duration);
      activePulses.set(target, { generation: currentGeneration, timer });
    },
    reset() {
      for (const [target, pulse] of activePulses) {
        scheduler.clearTimeout(pulse.timer);
        target.removeAttribute('data-reward-pulse');
      }
      activePulses.clear();
    },
  };
};
