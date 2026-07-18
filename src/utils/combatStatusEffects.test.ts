import assert from 'node:assert/strict';
import {
  applyCombatStatus,
  getStatusMovementMultiplier,
  getStatusOutgoingDamageMultiplier,
  isTargetStunned,
  tickCombatStatuses,
  type CombatStatusEffect
} from './combatStatusEffects';

const burn: CombatStatusEffect = {
  id: 'burn:aurelia:skill',
  type: 'burn',
  sourceCharacterId: 'aurelia',
  sourceAbility: 'skill',
  duration: 6,
  remainingDuration: 6,
  strength: 0.35,
  stackBehavior: 'strongest',
  visualKind: 'burning',
  tickInterval: 1,
  timeUntilNextTick: 1,
  snapshotAtk: 1000
};

let result = applyCombatStatus([], burn, 'normal');
assert.equal(result.applied, true);
assert.equal(result.statuses.length, 1);

let ticked = tickCombatStatuses(result.statuses, 2);
assert.equal(ticked.events.length, 2);
assert.deepEqual(ticked.events.map(event => event.damage), [350, 350]);
assert.ok(ticked.events.every(event => event.reactionContext.source === 'damage-over-time'));
assert.ok(ticked.events.every(event => event.reactionContext.appliesElement === false));

result = applyCombatStatus(ticked.statuses, burn, 'normal');
assert.equal(result.statuses.length, 1);
assert.equal(result.statuses[0]?.remainingDuration, 6);

const burstBurn: CombatStatusEffect = {
  ...burn,
  id: 'burn:aurelia:burst',
  sourceAbility: 'burst',
  duration: 10,
  remainingDuration: 10,
  strength: 0.75,
  snapshotAtk: 1200
};
result = applyCombatStatus(result.statuses, burstBurn, 'normal');
assert.equal(result.statuses.length, 1);
assert.equal(result.statuses[0]?.sourceAbility, 'burst');
assert.equal(result.statuses[0]?.remainingDuration, 10);
assert.equal(result.statuses[0]?.strength, 0.75);
assert.equal(result.statuses[0]?.snapshotAtk, 1200);

result = applyCombatStatus(result.statuses, burn, 'normal');
assert.equal(result.statuses.length, 1);
assert.equal(result.statuses[0]?.sourceAbility, 'burst');
assert.equal(result.statuses[0]?.remainingDuration, 10);

ticked = tickCombatStatuses(result.statuses, 10);
assert.equal(ticked.events.length, 10);
assert.ok(ticked.events.every(event => event.damage === 900));
assert.equal(ticked.statuses.length, 0);

const slow = (strength: number, duration = 3): CombatStatusEffect => ({
  id: `slow:kaelen:${strength}`,
  type: 'slow',
  sourceCharacterId: 'kaelen',
  sourceAbility: 'skill',
  duration,
  remainingDuration: duration,
  strength,
  stackBehavior: 'refresh',
  visualKind: 'slow'
});

const slowed = applyCombatStatus([], slow(0.4), 'elite');
assert.equal(getStatusMovementMultiplier(slowed.statuses), 0.6);
assert.equal(getStatusMovementMultiplier([slow(0.9)]), 0.25);

const bossSlow = applyCombatStatus([], slow(0.4), 'boss');
assert.equal(bossSlow.applied, false);
assert.equal(bossSlow.immune, true);

const stun: CombatStatusEffect = {
  id: 'stun:veyra:skill',
  type: 'stun',
  sourceCharacterId: 'veyra',
  sourceAbility: 'skill',
  duration: 4,
  remainingDuration: 4,
  strength: 1,
  stackBehavior: 'refresh',
  visualKind: 'stunned'
};
assert.equal(isTargetStunned(applyCombatStatus([], stun, 'normal').statuses), true);
assert.equal(applyCombatStatus([], stun, 'boss').immune, true);

const damageDown = (strength: number): CombatStatusEffect => ({
  id: `damage-down:maelis:${strength}`,
  type: 'damage-down',
  sourceCharacterId: 'maelis',
  sourceAbility: 'burst',
  duration: 15,
  remainingDuration: 15,
  strength,
  stackBehavior: 'strongest',
  visualKind: 'weakened'
});
assert.equal(getStatusOutgoingDamageMultiplier([damageDown(0.1), damageDown(0.2)]), 0.8);
assert.equal(tickCombatStatuses([damageDown(0.2)], 16).statuses.length, 0);

console.log('combat status effects ok');
