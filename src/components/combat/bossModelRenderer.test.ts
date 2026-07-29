import assert from 'node:assert/strict';
import { getBossIdentityById } from '../../utils/bossIdentities';
import {
  getBossModelFrame,
  getBossParticleBudget
} from './bossModelRenderer';
import { readFileSync } from 'node:fs';

const identity = getBossIdentityById('campaign-chronos-monarch');
assert.ok(identity);

const start = getBossModelFrame(identity, 0, false);
const animated = getBossModelFrame(identity, 900, false);
const reduced = getBossModelFrame(identity, 900, true);

assert.notEqual(start.bobOffset, animated.bobOffset, 'Boss idle animation should move');
assert.notEqual(start.rotation, animated.rotation, 'Boss idle animation should rotate');
assert.equal(reduced.bobOffset, 0, 'Reduced motion should stop idle movement');
assert.equal(reduced.rotation, 0, 'Reduced motion should stop idle rotation');

assert.ok(getBossParticleBudget(false) <= 10, 'Desktop boss VFX should remain restrained');
assert.ok(getBossParticleBudget(true) <= 5, 'Mobile boss VFX should use a smaller budget');
assert.ok(getBossParticleBudget(true) < getBossParticleBudget(false));
assert.doesNotMatch(
  readFileSync(new URL('./bossModelRenderer.ts', import.meta.url), 'utf8'),
  /campaignBossMechanic|campaignMechanic/,
  'Campaign mechanics must not alter boss models or model VFX',
);

console.log('boss model renderer helpers ok');
