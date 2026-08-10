import assert from 'node:assert/strict';
import {
  appendRewardEvents,
  createRewardPulseController,
  INVENTORY_FALLBACK_SELECTOR,
  normalizeRewardEvents,
  type RewardPulseTarget,
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
assert.deepEqual(grouped[0].constituentIds, ['a', 'b']);
assert.deepEqual(
  appendRewardEvents(grouped, [{ id: 'b', kind: 'gems', quantity: 20 }]),
  grouped,
);

const overflow = normalizeRewardEvents([
  { id: 'max-first', kind: 'gems', quantity: Number.MAX_VALUE },
  { id: 'max-second', kind: 'gems', quantity: Number.MAX_VALUE },
]);
assert.deepEqual(overflow.map((event) => [event.id, event.quantity, event.constituentIds]), [[
  'max-first',
  Number.MAX_VALUE,
  ['max-first'],
]]);
assert.ok(overflow.every((event) => Number.isFinite(event.quantity)));

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

const scheduled = new Map<number, () => void>();
const cleared = new Set<number>();
const delays = new Map<number, number>();
let nextTimer = 0;
const scheduler = {
  setTimeout(callback: () => void, delay: number) {
    const timer = ++nextTimer;
    scheduled.set(timer, callback);
    delays.set(timer, delay);
    return timer;
  },
  clearTimeout(timer: number) {
    cleared.add(timer);
    scheduled.delete(timer);
  },
};
const target: RewardPulseTarget = {
  dataset: {},
  removeAttribute(name) {
    if (name === 'data-reward-pulse') delete this.dataset.rewardPulse;
  },
};
const secondTarget: RewardPulseTarget = {
  dataset: {},
  removeAttribute(name) {
    if (name === 'data-reward-pulse') delete this.dataset.rewardPulse;
  },
};
const pulses = createRewardPulseController(scheduler);

pulses.trigger(target);
const staleTimer = scheduled.get(1);
pulses.trigger(target);
assert.equal(target.dataset.rewardPulse, 'true');
assert.equal(delays.get(2), 260);
assert.ok(cleared.has(1));
staleTimer?.();
assert.equal(target.dataset.rewardPulse, 'true');
const latestTimer = scheduled.get(2);
scheduled.delete(2);
latestTimer?.();
assert.equal(target.dataset.rewardPulse, undefined);

pulses.trigger(target);
pulses.trigger(secondTarget);
pulses.reset();
assert.equal(target.dataset.rewardPulse, undefined);
assert.equal(secondTarget.dataset.rewardPulse, undefined);
assert.equal(scheduled.size, 0);

console.log('reward reveal utility ok');
