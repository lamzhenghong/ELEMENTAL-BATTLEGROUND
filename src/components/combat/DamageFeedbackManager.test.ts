import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DamageFeedbackManager } from './DamageFeedbackManager';

test('damage feedback manager reuses a fixed pool and clears every entry', () => {
  const manager = new DamageFeedbackManager(2);
  manager.spawnImpact({ x: 10, y: 10, directionX: 1, directionY: 0, shape: 'slash', color: '#fff', strength: 1 });
  manager.spawnImpact({ x: 20, y: 10, directionX: 1, directionY: 0, shape: 'pierce', color: '#fff', strength: 1 });
  manager.spawnImpact({ x: 30, y: 10, directionX: 1, directionY: 0, shape: 'radial', color: '#fff', strength: 1 });
  assert.equal(manager.capacity, 2);
  assert.equal(manager.activeCount, 2);
  manager.clear();
  assert.equal(manager.activeCount, 0);
});

test('final-hit flashes use the same bounded manager and boss deaths stay opt-in', () => {
  const manager = new DamageFeedbackManager(2);
  assert.equal(manager.spawnFinalHit({ x: 10, y: 10, radius: 20, color: '#fff', isBoss: true }), false);
  assert.equal(manager.spawnFinalHit({ x: 10, y: 10, radius: 20, color: '#fff', isBoss: false }), true);
  assert.equal(manager.activeFinalHitCount, 1);
});

test('canvas feedback source includes viewport culling and no per-frame material cloning', () => {
  const source = readFileSync(new URL('./DamageFeedbackManager.ts', import.meta.url), 'utf8');
  assert.match(source, /isVisible/);
  assert.doesNotMatch(source, /clone\(/);
  assert.doesNotMatch(source, /requestAnimationFrame/);
});
