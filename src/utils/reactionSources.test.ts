import assert from 'node:assert/strict';
import {
  DEFAULT_REACTION_ELIGIBILITY,
  canTriggerElementalReaction,
  createReactionContext,
  getReactionAmplification
} from './reactionSources';

assert.deepEqual(DEFAULT_REACTION_ELIGIBILITY, {
  'normal-attack': false,
  'elemental-skill': true,
  'elemental-burst': true,
  'special-ultimate': true,
  'damage-over-time': false,
  'persistent-field': false,
  environment: false,
  reaction: false
});

for (const source of ['elemental-skill', 'elemental-burst', 'special-ultimate'] as const) {
  assert.equal(canTriggerElementalReaction(createReactionContext(source, true)), true);
  assert.equal(canTriggerElementalReaction(createReactionContext(source, false)), false);
}

for (const source of ['normal-attack', 'damage-over-time', 'persistent-field', 'environment', 'reaction'] as const) {
  assert.equal(canTriggerElementalReaction(createReactionContext(source, true)), false);
}

assert.equal(canTriggerElementalReaction({
  ...createReactionContext('elemental-skill', true),
  isReactionDamage: true
}), false);
assert.equal(getReactionAmplification([]), 1);
assert.equal(getReactionAmplification([2]), 2);
assert.equal(getReactionAmplification([2, 2, 1.5]), 2);

console.log('reaction source validation ok');
