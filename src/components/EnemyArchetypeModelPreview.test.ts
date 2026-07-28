import assert from 'node:assert/strict';
import {
  createEnemyArchetypePreviewState,
  getEnemyArchetypePreviewFrame
} from './EnemyArchetypeModelPreview';
import { ENEMY_ARCHETYPE_DEFINITIONS } from '../utils/enemyArchetypes';

for (const archetype of ENEMY_ARCHETYPE_DEFINITIONS) {
  const state = createEnemyArchetypePreviewState(archetype);
  assert.equal(state.archetypeId, archetype.id);
  assert.equal(state.color, archetype.color);
  assert.equal(state.type, 'Elite');
  assert.ok(state.archetypeState, `${archetype.name} preview should include runtime VFX state`);
}

const bulwark = ENEMY_ARCHETYPE_DEFINITIONS.find(({ id }) => id === 'bulwark');
assert.ok(bulwark);
const bulwarkState = createEnemyArchetypePreviewState(bulwark);
assert.equal(bulwarkState.archetypeState.shieldHp, 100);
assert.equal(bulwarkState.archetypeState.maxShieldHp, 100);

const startFrame = getEnemyArchetypePreviewFrame(0, 240, 132, false);
const animatedFrame = getEnemyArchetypePreviewFrame(600, 240, 132, false);
const reducedMotionFrame = getEnemyArchetypePreviewFrame(600, 240, 132, true);

assert.notEqual(startFrame.y, animatedFrame.y);
assert.equal(reducedMotionFrame.y, 66);
assert.equal(reducedMotionFrame.facingX, 1);
assert.equal(reducedMotionFrame.facingY, 0);

console.log('enemy archetype model preview helpers ok');
