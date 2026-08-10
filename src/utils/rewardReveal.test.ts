import assert from 'node:assert/strict';
import {
  appendRewardEvents,
  INVENTORY_FALLBACK_SELECTOR,
  normalizeRewardEvents,
} from './rewardReveal';

const grouped = normalizeRewardEvents([
  { id: 'a', kind: 'gems', quantity: 10 },
  { id: 'b', kind: 'gems', quantity: 20 },
  { id: 'c', kind: 'mora', quantity: 1000 },
]);

assert.deepEqual(
  grouped.map((event) => [event.kind, event.quantity]),
  [['gems', 30], ['mora', 1000]],
);
assert.deepEqual(
  grouped.map((event) => event.target),
  ['[data-reward-target="gems"]', '[data-reward-target="mora"]'],
);

const valid = normalizeRewardEvents([
  { id: 'weapon', kind: 'weapon', quantity: 1 },
  { id: 'artifact', kind: 'artifact', quantity: 1 },
  { id: 'zero', kind: 'mora', quantity: 0 },
  { id: 'negative', kind: 'mora', quantity: -5 },
  { id: 'infinite', kind: 'gems', quantity: Infinity },
  { id: 'duplicate', kind: 'mora', quantity: 10 },
  { id: 'duplicate', kind: 'mora', quantity: 100 },
]);

assert.deepEqual(
  valid.map((event) => [event.id, event.kind, event.quantity, event.target]),
  [
    ['weapon', 'weapon', 1, '[data-reward-target="forge"]'],
    ['artifact', 'artifact', 1, '[data-reward-target="forge"]'],
    ['duplicate', 'mora', 10, '[data-reward-target="mora"]'],
  ],
);
assert.equal(INVENTORY_FALLBACK_SELECTOR, '[data-reward-target="inventory-fallback"]');

const queue = appendRewardEvents([], grouped);
assert.equal(appendRewardEvents(queue, [grouped[0]]).length, queue.length);
assert.equal(
  appendRewardEvents([], Array.from({ length: 20 }, (_, index) => ({
    id: `reward-${index}`,
    kind: 'artifact' as const,
    quantity: 1,
  }))).length,
  12,
);
assert.equal(normalizeRewardEvents(Array.from({ length: 8 }, (_, index) => ({
  id: `kind-${index}`,
  kind: index % 2 === 0 ? 'gems' as const : 'mora' as const,
  quantity: 1,
}))).length, 2);

console.log('reward reveal utility ok');
