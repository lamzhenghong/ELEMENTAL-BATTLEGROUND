import assert from 'node:assert/strict';
import {
  chooseChannelerSupportAction,
  getArchetypeMoveDirection,
  getSiphonEnergyTransfer,
  getStalkerAmbushPosition,
  isAttackerFlanking,
  isRelicCarrierAtExit
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

assert.deepEqual(getSiphonEnergyTransfer(8, 12), { remainingEnergy: 0, stolenEnergy: 8 });
assert.deepEqual(getSiphonEnergyTransfer(80, 12), { remainingEnergy: 68, stolenEnergy: 12 });

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
