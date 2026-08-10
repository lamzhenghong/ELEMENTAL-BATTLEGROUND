export type QueuedCombatActionKind = 'normal-attack' | 'elemental-skill';

export interface QueuedCombatAction {
  id: string;
  kind: QueuedCombatActionKind;
  characterId: string;
  remainingMs: number;
  direction: { x: number; y: number };
}

export interface CombatActionQueue {
  actions: QueuedCombatAction[];
}

export interface CombatActionTick {
  queue: CombatActionQueue;
  ready: QueuedCombatAction[];
}

export function createCombatActionQueue(): CombatActionQueue {
  return { actions: [] };
}

export function enqueueCombatAction(
  queue: CombatActionQueue,
  action: QueuedCombatAction,
): CombatActionQueue {
  return { actions: [...queue.actions, { ...action, direction: { ...action.direction } }] };
}

export function tickCombatActionQueue(
  queue: CombatActionQueue,
  elapsedMs: number,
  paused: boolean,
): CombatActionTick {
  if (paused) return { queue, ready: [] };

  const ready: QueuedCombatAction[] = [];
  const actions: QueuedCombatAction[] = [];
  const delta = Math.max(0, elapsedMs);
  for (const action of queue.actions) {
    const next = { ...action, remainingMs: action.remainingMs - delta };
    if (next.remainingMs <= 0) ready.push(next);
    else actions.push(next);
  }
  return { queue: { actions }, ready };
}

export function clearCombatActionQueue(): CombatActionQueue {
  return createCombatActionQueue();
}
