import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Quest } from '../types';
import {
  createQuestCompletionState,
  getQuestCompletionRows,
  reconcileQuestCompletions,
  requestQuestCompletions,
} from './QuestCompletion';

const quest = (id: string, overrides: Partial<Quest> = {}): Quest => ({
  id, name: `Quest ${id}`, desc: 'An objective', type: 'kill_enemy',
  targetValue: 10, currentValue: 10, rewardTokens: 20, rewardMora: 100,
  completed: true, group: 'daily', ...overrides,
});

test('a button request or rejected claim never presents or announces completion', () => {
  const active = [quest('a')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['a'], 0);
  const rejected = reconcileQuestCompletions(requested, active, [], 100);
  assert.equal(rejected.retained.length, 0);
  assert.equal(rejected.announcement, null);
  assert.equal(getQuestCompletionRows(rejected, active)[0].claimed, false);
});

test('missing and unfinished quests cannot become completion requests', () => {
  const active = [quest('a', { completed: false, currentValue: 3 })];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['a', 'missing'], 0);
  const result = reconcileQuestCompletions(requested, [], ['a', 'missing'], 100);
  assert.equal(result.pending.length, 0);
  assert.equal(result.retained.length, 0);
  assert.equal(result.announcement, null);
});

test('removal alone and a completed ID alone are insufficient', () => {
  const active = [quest('a')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['a'], 0);
  assert.equal(reconcileQuestCompletions(requested, [], [], 100).retained.length, 0);
  assert.equal(reconcileQuestCompletions(requested, active, ['a'], 100).retained.length, 0);
  assert.equal(reconcileQuestCompletions(requested, [], undefined, 100).retained.length, 0);
});

test('authoritative removal and a newly appended completed ID retain the requested card', () => {
  const active = [quest('a'), quest('b', { completed: false })];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['a'], 0);
  const accepted = reconcileQuestCompletions(requested, [active[1]], ['a'], 100);
  const rows = getQuestCompletionRows(accepted, [active[1]]);
  assert.deepEqual(rows.map(row => [row.quest.id, row.claimed]), [['a', true], ['b', false]]);
  assert.match(accepted.announcement!.text, /Quest a.*claimed/i);
  assert.equal(accepted.pending.length, 0);
});

test('either confirmation prop can arrive first without claiming prematurely', () => {
  const active = [quest('a')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['a'], 0);
  const removedFirst = reconcileQuestCompletions(requested, [], [], 100);
  const completedFirst = reconcileQuestCompletions(requested, active, ['a'], 100);
  assert.equal(reconcileQuestCompletions(removedFirst, [], ['a'], 200).retained.length, 1);
  assert.equal(reconcileQuestCompletions(completedFirst, [], ['a'], 200).retained.length, 1);
});

test('historical completed IDs do not acknowledge a rejected repeatable claim', () => {
  const active = [quest('a')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, ['a'], ['a'], 0);
  const reset = [quest('a', { completed: false, currentValue: 0 })];
  assert.equal(reconcileQuestCompletions(requested, [], ['a'], 100).retained.length, 0);
  assert.equal(reconcileQuestCompletions(requested, reset, ['a'], 100).retained.length, 0);
});

test('same-ID replenishment removes the completed instance only with a new claim record', () => {
  const active = [quest('a')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, ['a'], ['a'], 0);
  const reset = [quest('a', { completed: false, currentValue: 0 })];
  const accepted = reconcileQuestCompletions(requested, reset, ['a', 'a'], 100);
  const held = getQuestCompletionRows(accepted, reset);
  assert.deepEqual(held.map(row => [row.quest.currentValue, row.claimed]), [[10, true]]);
  const settled = reconcileQuestCompletions(accepted, reset, ['a', 'a'], 1200);
  const fresh = getQuestCompletionRows(settled, reset);
  assert.deepEqual(fresh.map(row => [row.quest.currentValue, row.claimed]), [[0, false]]);
  assert.notEqual(fresh[0].key, held[0].key);
  const nextRequest = requestQuestCompletions(settled, active, ['a', 'a'], ['a'], 1500);
  const nextClaim = reconcileQuestCompletions(nextRequest, reset, ['a', 'a', 'a'], 1600);
  assert.equal(nextClaim.retained.length, 1);
  assert.notEqual(nextClaim.announcement!.id, accepted.announcement!.id);
});

test('Claim All deduplicates requests and announces only actually accepted cards', () => {
  const active = [quest('a'), quest('b', { group: 'weekly' }), quest('c', { completed: false })];
  let requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['a', 'a', 'b', 'c'], 0);
  requested = requestQuestCompletions(requested, active, [], ['a', 'b'], 10);
  assert.equal(requested.pending.length, 2);
  const partial = reconcileQuestCompletions(requested, active.slice(1), ['a'], 100);
  assert.deepEqual(partial.retained.map(entry => entry.quest.id), ['a']);
  const accepted = reconcileQuestCompletions(partial, [active[2]], ['a', 'b'], 200);
  assert.deepEqual(accepted.retained.map(entry => entry.quest.id), ['a', 'b']);
  assert.equal(accepted.pending.length, 0);
  assert.equal(reconcileQuestCompletions(accepted, [active[2]], ['a', 'b'], 250), accepted);
});

test('simultaneous Claim All preserves card order and announces a single batch', () => {
  const active = [quest('a'), quest('b', { completed: false }), quest('c')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['c', 'a'], 0);
  const accepted = reconcileQuestCompletions(requested, [active[1]], ['a', 'c'], 100);
  assert.deepEqual(getQuestCompletionRows(accepted, [active[1]]).map(row => row.quest.id), ['a', 'b', 'c']);
  assert.match(accepted.announcement!.text, /2.*quests.*claimed/i);
});

test('unrequested removals and mounting saved completions are not animated', () => {
  const state = createQuestCompletionState();
  const result = reconcileQuestCompletions(state, [], ['a'], 100);
  assert.equal(result, state);
  assert.deepEqual(getQuestCompletionRows(result, []), []);
});

test('the hold expires without replaying completion on later renders', () => {
  const active = [quest('a')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['a'], 0);
  const accepted = reconcileQuestCompletions(requested, [], ['a'], 100);
  assert.equal(reconcileQuestCompletions(accepted, [], ['a'], 800).retained.length, 1);
  const settled = reconcileQuestCompletions(accepted, [], ['a'], 1200);
  assert.equal(settled.retained.length, 0);
  assert.equal(reconcileQuestCompletions(settled, [], ['a'], 2000), settled);
  assert.equal(settled.announcement, accepted.announcement);
});

test('expired rejected requests cannot acknowledge an unrelated later save update', () => {
  const active = [quest('a')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, [], ['a'], 0);
  const expired = reconcileQuestCompletions(requested, active, [], 60_000);
  const later = reconcileQuestCompletions(expired, [], ['a'], 60_100);
  assert.equal(later.pending.length, 0);
  assert.equal(later.retained.length, 0);
  assert.equal(later.announcement, null);
});

test('the optional completion prop remains backward compatible without false claims', () => {
  const active = [quest('a')];
  const requested = requestQuestCompletions(createQuestCompletionState(), active, undefined, ['a'], 0);
  assert.equal(reconcileQuestCompletions(requested, [], ['a'], 100).retained.length, 0);
});
