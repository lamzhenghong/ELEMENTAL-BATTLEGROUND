import assert from 'node:assert/strict';
import {
  SIPHON_DRAIN_INTERVAL_FRAMES,
  SIPHON_ENERGY_DRAIN_RATIO,
  chooseChannelerSupportAction,
  getArchetypeMoveDirection,
  getElapsedCombatFrames,
  getSiphonEnergyTransfer,
  getStalkerAmbushPosition,
  isAttackerFlanking,
  isRelicCarrierAtExit,
  tickSiphonDrainTimer
} from './enemyArchetypeCombat';

assert.equal(getArchetypeMoveDirection('artillery', 120), -1);
assert.equal(getArchetypeMoveDirection('artillery', 310), 0);
assert.equal(getArchetypeMoveDirection('artillery', 520), 1);
assert.equal(getArchetypeMoveDirection('relic-carrier', 520), -1);
assert.equal(getArchetypeMoveDirection('channeler', 120), 1);

const supportEnemies = [
  { id: 'channeler', type: 'Normal' as const, hp: 400, maxHp: 400 },
  { id: 'wounded', type: 'Elite' as const, hp: 200, maxHp: 1000 },
  { id: 'defeated', type: 'Normal' as const, hp: 0, maxHp: 500 },
  { id: 'boss', type: 'Boss' as const, hp: 0, maxHp: 25000 }
];
assert.deepEqual(chooseChannelerSupportAction('channeler', supportEnemies), {
  kind: 'revive',
  targetId: 'defeated',
  amount: 150
});

assert.deepEqual(
  chooseChannelerSupportAction('channeler', supportEnemies.filter(enemy => enemy.id !== 'defeated')),
  { kind: 'heal', targetId: 'wounded', amount: 180 }
);

assert.equal(SIPHON_DRAIN_INTERVAL_FRAMES, 300);
assert.equal(SIPHON_ENERGY_DRAIN_RATIO, 0.05);
assert.deepEqual(getSiphonEnergyTransfer(80), { remainingEnergy: 76, stolenEnergy: 4 });
assert.deepEqual(getSiphonEnergyTransfer(15), { remainingEnergy: 14.25, stolenEnergy: 0.75 });
assert.deepEqual(tickSiphonDrainTimer(300, 299), {
  remainingFrames: 1,
  shouldDrain: false
});
assert.deepEqual(tickSiphonDrainTimer(1, 1), {
  remainingFrames: 300,
  shouldDrain: true
});
assert.equal(getElapsedCombatFrames(1000 / 60), 1);
assert.equal(getElapsedCombatFrames(1000 / 30), 2);
assert.equal(getElapsedCombatFrames(1000), 3, 'long tab stalls must not trigger multiple instant drains');

assert.deepEqual(
  getStalkerAmbushPosition({ x: 500, y: 500, lastDirX: 1, lastDirY: 0 }, 90),
  { x: 410, y: 500 }
);
assert.equal(isRelicCarrierAtExit(20, 500), true);
assert.equal(isRelicCarrierAtExit(1000, 1000), false);
assert.equal(isAttackerFlanking(
  { x: 100, y: 100 },
  { x: 110, y: 100, facingX: 1, facingY: 0 }
), true);
assert.equal(isAttackerFlanking(
  { x: 140, y: 100 },
  { x: 110, y: 100, facingX: 1, facingY: 0 }
), false);

console.log('enemy archetype combat helpers ok');
