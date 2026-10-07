import type { Quest } from '../types';

export const QUEST_COMPLETION_HOLD_MS = 900;
const CLAIM_REQUEST_EXPIRY_MS = 15_000;

interface QuestCompletionRequest {
  quest: Quest;
  position: number;
  completedCountBefore: number;
  expiresAt: number;
  sequence: number;
}

interface QuestCompletionEntry {
  quest: Quest;
  position: number;
  key: string;
  expiresAt: number;
}

export interface QuestCompletionState {
  pending: QuestCompletionRequest[];
  retained: QuestCompletionEntry[];
  generations: Record<string, number>;
  nextSequence: number;
  announcement: { id: number; text: string } | null;
}

export interface QuestCompletionRow {
  quest: Quest;
  key: string;
  claimed: boolean;
}

export function createQuestCompletionState(): QuestCompletionState {
  return { pending: [], retained: [], generations: {}, nextSequence: 1, announcement: null };
}

export function requestQuestCompletions(
  state: QuestCompletionState,
  activeQuests: readonly Quest[],
  completedQuestIds: readonly string[] | undefined,
  requestedIds: readonly string[],
  now: number,
): QuestCompletionState {
  if (!completedQuestIds) return state;
  const pending = state.pending.filter(request => request.expiresAt > now);
  const requested = new Set(requestedIds);
  let nextSequence = state.nextSequence;
  activeQuests.forEach((quest, position) => {
    if (!quest.completed || !requested.has(quest.id) || pending.some(request => request.quest.id === quest.id)) return;
    pending.push({
      quest: { ...quest }, position,
      completedCountBefore: completedQuestIds.filter(id => id === quest.id).length,
      expiresAt: now + CLAIM_REQUEST_EXPIRY_MS,
      sequence: nextSequence++,
    });
  });
  if (nextSequence === state.nextSequence && pending.length === state.pending.length) return state;
  return { ...state, pending, nextSequence };
}

export function reconcileQuestCompletions(
  state: QuestCompletionState,
  activeQuests: readonly Quest[],
  completedQuestIds: readonly string[] | undefined,
  now: number,
): QuestCompletionState {
  const pending: QuestCompletionRequest[] = [];
  const retained = state.retained.filter(entry => entry.expiresAt > now);
  const accepted: QuestCompletionRequest[] = [];
  const generations = { ...state.generations };
  for (const request of state.pending) {
    if (request.expiresAt <= now) continue;
    const current = activeQuests.find(quest => quest.id === request.quest.id);
    // Replenishment reuses template IDs; an unfinished replacement is not the claimed instance.
    const removed = !current || !current.completed;
    const completedCount = completedQuestIds?.filter(id => id === request.quest.id).length ?? 0;
    if (removed && completedCount > request.completedCountBefore) {
      const generation = generations[request.quest.id] ?? 0;
      retained.push({
        quest: request.quest, position: request.position,
        key: `${request.quest.id}:${generation}`,
        expiresAt: now + QUEST_COMPLETION_HOLD_MS,
      });
      generations[request.quest.id] = generation + 1;
      accepted.push(request);
    } else {
      pending.push(request);
    }
  }
  if (!accepted.length && pending.length === state.pending.length && retained.length === state.retained.length) return state;
  return {
    ...state, pending, retained, generations,
    announcement: accepted.length ? {
      id: accepted[accepted.length - 1].sequence,
      text: accepted.length === 1
        ? `${accepted[0].quest.name}: rewards claimed.`
        : `${accepted.length} quests: rewards claimed.`,
    } : state.announcement,
  };
}

export function getQuestCompletionRows(
  state: QuestCompletionState,
  activeQuests: readonly Quest[],
): QuestCompletionRow[] {
  const heldIds = new Set(state.retained.map(entry => entry.quest.id));
  const rows: QuestCompletionRow[] = activeQuests
    .filter(quest => !heldIds.has(quest.id))
    .map(quest => ({ quest, key: `${quest.id}:${state.generations[quest.id] ?? 0}`, claimed: false }));
  for (const entry of [...state.retained].sort((a, b) => a.position - b.position)) {
    rows.splice(Math.min(entry.position, rows.length), 0, { quest: entry.quest, key: entry.key, claimed: true });
  }
  return rows;
}
