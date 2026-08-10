import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearCombatActionQueue,
  createCombatActionQueue,
  enqueueCombatAction,
  tickCombatActionQueue,
} from './combatActionQueue';

test('queued combat actions resolve once after their anticipation window', () => {
  let queue = createCombatActionQueue();
  queue = enqueueCombatAction(queue, {
    id: 'a',
    kind: 'normal-attack',
    characterId: 'hero',
    remainingMs: 45,
    direction: { x: 1, y: 0 },
  });

  let tick = tickCombatActionQueue(queue, 20, false);
  assert.equal(tick.ready.length, 0);
  assert.equal(tick.queue.actions[0].remainingMs, 25);
  tick = tickCombatActionQueue(tick.queue, 25, false);
  assert.deepEqual(tick.ready.map(action => action.id), ['a']);
  assert.equal(tick.queue.actions.length, 0);
  assert.equal(tickCombatActionQueue(tick.queue, 25, false).ready.length, 0);
});

test('paused combat does not advance queued actions and clear cancels them', () => {
  const queue = enqueueCombatAction(createCombatActionQueue(), {
    id: 'b',
    kind: 'elemental-skill',
    characterId: 'hero',
    remainingMs: 70,
    direction: { x: 0, y: 1 },
  });
  const paused = tickCombatActionQueue(queue, 100, true);

  assert.equal(paused.ready.length, 0);
  assert.equal(paused.queue, queue);
  assert.deepEqual(clearCombatActionQueue(), { actions: [] });
});
