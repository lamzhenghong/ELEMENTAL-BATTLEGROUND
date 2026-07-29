import assert from 'node:assert/strict';
import { getBossIdentityById } from '../utils/bossIdentities';
import {
  createBossPreviewEnemy,
  getBossPreviewPosition
} from './BossModelPreview';

const identity = getBossIdentityById('campaign-eldric-core-prime');
assert.ok(identity);

const enemy = createBossPreviewEnemy(identity);
assert.equal(enemy.name, identity.name);
assert.equal(enemy.bossIdentityId, identity.id);
assert.equal(enemy.bossType, identity.mechanicProfile);
assert.equal(enemy.radius, 48);

const still = getBossPreviewPosition(600, 240, 132, true);
const moving = getBossPreviewPosition(600, 240, 132, false);
assert.deepEqual(still, { x: 120, y: 66 });
assert.notEqual(moving.y, still.y);

console.log('boss model preview helpers ok');
