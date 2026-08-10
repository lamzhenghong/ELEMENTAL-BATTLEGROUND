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
}

export const INVENTORY_FALLBACK_SELECTOR: RewardRevealTarget = '[data-reward-target="inventory-fallback"]';

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

const targetRewardEvent = (event: RewardRevealEvent): RewardRevealEvent => ({
  id: event.id,
  kind: event.kind,
  quantity: event.quantity,
  source: event.source,
  target: REWARD_TARGETS[event.kind],
});

export const getRewardRevealTarget = (kind: RewardKind): RewardRevealTarget => REWARD_TARGETS[kind];

export const normalizeRewardEvents = (events: readonly RewardRevealEvent[]): RewardRevealEvent[] => {
  const seenIds = new Set<string>();
  const groups = new Map<RewardKind, RewardRevealEvent>();

  for (const event of events) {
    if (!isUsableRewardEvent(event) || seenIds.has(event.id)) continue;
    seenIds.add(event.id);

    const existing = groups.get(event.kind);
    if (existing) {
      existing.quantity += event.quantity;
      continue;
    }

    groups.set(event.kind, targetRewardEvent(event));
  }

  return Array.from(groups.values()).slice(0, MAX_TRANSACTION_GROUPS);
};

export const appendRewardEvents = (
  queue: readonly RewardRevealEvent[],
  events: readonly RewardRevealEvent[],
): RewardRevealEvent[] => {
  const next: RewardRevealEvent[] = [];
  const seenIds = new Set<string>();

  for (const event of [...queue, ...events]) {
    if (!isUsableRewardEvent(event) || seenIds.has(event.id)) continue;
    seenIds.add(event.id);
    next.push(targetRewardEvent(event));
    if (next.length === MAX_QUEUE_GROUPS) break;
  }

  return next;
};
