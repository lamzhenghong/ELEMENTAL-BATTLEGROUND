import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDamageTextBucket,
  getCombatImpactProfile,
  getDirectionalKnockback,
  mergeDamageTextBucket,
  requestStrongestHitStop,
  selectImpactSoundRequest,
} from './combatImpact';

test('combat impact profiles scale timing and target resistance', () => {
  const normal = getCombatImpactProfile({
    source: 'normal-attack',
    isCrit: false,
    targetClass: 'normal',
    combatSpeed: 1,
    screenShakeEnabled: true,
    shielded: false,
  });
  assert.equal(normal.anticipationMs, 45);
  assert.equal(normal.hitStopMs, 35);
  assert.equal(normal.recoilPx, 3);

  const elite = getCombatImpactProfile({
    source: 'elemental-skill',
    isCrit: false,
    targetClass: 'elite',
    combatSpeed: 1,
    screenShakeEnabled: true,
    shielded: false,
  });
  const boss = getCombatImpactProfile({
    source: 'elemental-skill',
    isCrit: false,
    targetClass: 'boss',
    combatSpeed: 1,
    screenShakeEnabled: true,
    shielded: false,
  });
  const reducedMotion = getCombatImpactProfile({
    source: 'normal-attack',
    isCrit: true,
    targetClass: 'normal',
    combatSpeed: 2,
    screenShakeEnabled: false,
    shielded: false,
  });

  assert.equal(elite.knockbackDistance, 10);
  assert.equal(boss.knockbackDistance, 0);
  assert.equal(reducedMotion.anticipationMs, 22.5);
  assert.equal(reducedMotion.hitStopMs, 12.5);
  assert.equal(reducedMotion.recoilPx, 0);
});

test('strongest frame feedback wins and knockback follows the impact direction', () => {
  assert.equal(requestStrongestHitStop(35, 65), 65);
  assert.equal(
    selectImpactSoundRequest({ tier: 'light', at: 100 }, { tier: 'critical', at: 110 }).tier,
    'critical',
  );
  assert.equal(
    selectImpactSoundRequest({ tier: 'critical', at: 100 }, { tier: 'light', at: 110 }).tier,
    'critical',
  );
  assert.equal(
    selectImpactSoundRequest({ tier: 'critical', at: 100 }, { tier: 'light', at: 200 }).tier,
    'light',
  );
  assert.deepEqual(
    getDirectionalKnockback({ x: 0, y: 0 }, { x: 3, y: 4 }, 10),
    { x: 6, y: 8 },
  );
  assert.deepEqual(
    getDirectionalKnockback({ x: 2, y: 2 }, { x: 2, y: 2 }, 10),
    { x: 0, y: 0 },
  );
});

test('damage text buckets only merge matching hits inside 90 milliseconds', () => {
  const first = createDamageTextBucket({
    targetId: 'enemy',
    source: 'normal-attack',
    amount: 100,
    isCrit: false,
    reaction: '',
    at: 100,
  });
  const merged = mergeDamageTextBucket(first, {
    targetId: 'enemy',
    source: 'normal-attack',
    amount: 75,
    isCrit: false,
    reaction: '',
    at: 180,
  });

  assert.equal(merged?.amount, 175);
  assert.equal(merged?.hitCount, 2);
  assert.equal(mergeDamageTextBucket(first, {
    targetId: 'enemy', source: 'normal-attack', amount: 75, isCrit: true, reaction: '', at: 180,
  }), null);
  assert.equal(mergeDamageTextBucket(first, {
    targetId: 'enemy', source: 'normal-attack', amount: 75, isCrit: false, reaction: '', at: 191,
  }), null);
});
