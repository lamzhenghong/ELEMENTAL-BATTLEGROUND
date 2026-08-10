import assert from 'node:assert/strict';
import {
  createIdleTransition,
  getTransitionTimings,
  getTransitionTone,
  reduceAetherTransition,
} from './aetherTransition';

assert.deepEqual(getTransitionTone('story'), { id: 'story', color: '#10b981', label: 'Story' });
assert.equal(getTransitionTone('inventory').color, '#f97316');
assert.deepEqual(getTransitionTimings('standard', false), { coverMs: 220, swapMs: 450, totalMs: 850 });
assert.deepEqual(getTransitionTimings('standard', true), { coverMs: 100, swapMs: 140, totalMs: 280 });
assert.equal(getTransitionTimings('title', false).totalMs, 1550);

const requested = reduceAetherTransition(createIdleTransition('home'), {
  type: 'request',
  requestId: 1,
  destination: 'story',
  kind: 'standard',
});

assert.equal(requested.phase, 'covering');
assert.equal(
  reduceAetherTransition(requested, { type: 'request', requestId: 1, destination: 'story', kind: 'standard' }),
  requested,
);
assert.equal(reduceAetherTransition(requested, { type: 'covered', requestId: 1 }).phase, 'covered');
assert.equal(reduceAetherTransition(requested, { type: 'reveal', requestId: 1 }).phase, 'revealing');
assert.equal(reduceAetherTransition(requested, { type: 'complete', requestId: 1 }).phase, 'idle');

const covered = reduceAetherTransition(requested, { type: 'covered', requestId: 1 });
const replacement = reduceAetherTransition(covered, {
  type: 'request',
  requestId: 2,
  destination: 'arena',
  kind: 'standard',
});
assert.equal(replacement.source, 'story');
assert.equal(
  reduceAetherTransition(replacement, { type: 'request', requestId: 1, destination: 'home', kind: 'standard' }),
  replacement,
);

console.log('aether transition state machine ok');
