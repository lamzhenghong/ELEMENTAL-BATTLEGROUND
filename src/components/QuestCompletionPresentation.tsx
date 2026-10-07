import { useEffect, useLayoutEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Quest } from '../types';
import {
  createQuestCompletionState,
  getQuestCompletionRows,
  reconcileQuestCompletions,
  requestQuestCompletions,
} from './QuestCompletion';

export function useQuestCompletionPresentation(activeQuests: Quest[], completedQuestIds?: string[]) {
  const [state, setState] = useState(createQuestCompletionState);

  useLayoutEffect(() => {
    setState(previous => reconcileQuestCompletions(previous, activeQuests, completedQuestIds, Date.now()));
  }, [activeQuests, completedQuestIds, state]);

  useEffect(() => {
    const nextDeadline = Math.min(
      ...state.pending.map(request => request.expiresAt),
      ...state.retained.map(entry => entry.expiresAt),
    );
    if (!Number.isFinite(nextDeadline)) return;
    const timer = window.setTimeout(() => {
      setState(previous => reconcileQuestCompletions(previous, activeQuests, completedQuestIds, Date.now()));
    }, Math.max(0, nextDeadline - Date.now()));
    return () => window.clearTimeout(timer);
  }, [state, activeQuests, completedQuestIds]);

  const requestClaims = (ids: string[]) => {
    const now = Date.now();
    setState(previous => requestQuestCompletions(previous, activeQuests, completedQuestIds, ids, now));
  };

  return { rows: getQuestCompletionRows(state, activeQuests), announcement: state.announcement, requestClaims };
}

export function QuestCompletionStamp() {
  return (
    <span className="quest-completion-stamp" aria-label="Rewards claimed">
      <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
      Claimed
    </span>
  );
}

export function QuestCompletionAnnouncement({ announcement }: {
  announcement: { id: number; text: string } | null;
}) {
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement && <span key={announcement.id}>{announcement.text}</span>}
    </div>
  );
}
