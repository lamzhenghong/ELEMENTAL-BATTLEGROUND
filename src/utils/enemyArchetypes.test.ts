import assert from 'node:assert/strict';
import {
  ENEMY_ARCHETYPE_DEFINITIONS,
  ENEMY_ARCHETYPE_IDS,
  RELIC_CARRIER_SPAWN_CHANCE,
  applyRelicCarrierArchetype,
  applyEnemyArchetype,
  getBulwarkProtection,
  getRelicCarrierReward,
  shouldSpawnRelicCarrier
} from './enemyArchetypes';

assert.deepEqual(ENEMY_ARCHETYPE_IDS, [
  'bulwark',
  'channeler',
  'artillery',
  'siphon',
  'mimic',
  'summoner',
  'stalker',
  'relic-carrier'
]);

assert.deepEqual(
  ENEMY_ARCHETYPE_DEFINITIONS.map(definition => definition.color),
  ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#f8fafc', '#5b21b6', '#09090b', '#facc15']
);

const normalEnemy = applyEnemyArchetype({
  id: 'normal',
  type: 'Normal' as const,
  color: '#ef4444',
  maxHp: 1000
}, () => 0);
assert.equal(normalEnemy.archetypeId, 'bulwark');
assert.equal(normalEnemy.color, '#3b82f6');
assert.equal(normalEnemy.archetypeState.shieldHp, 250);

const eliteEnemy = applyEnemyArchetype({
  id: 'elite',
  type: 'Elite' as const,
  color: '#ef4444',
  maxHp: 2000
}, () => 0.9999);
assert.equal(eliteEnemy.archetypeId, 'stalker');
assert.equal(eliteEnemy.color, '#09090b');
assert.equal(eliteEnemy.archetypeState.abilityCooldownFrames, 210);

const lastCommonEnemy = applyEnemyArchetype({
  id: 'common-boundary',
  type: 'Normal' as const,
  color: '#ef4444',
  maxHp: 1000
}, () => 0.7999);
assert.equal(lastCommonEnemy.archetypeId, 'siphon');

const firstSpecialistEnemy = applyEnemyArchetype({
  id: 'specialist-boundary',
  type: 'Normal' as const,
  color: '#ef4444',
  maxHp: 1000
}, () => 0.8);
assert.equal(firstSpecialistEnemy.archetypeId, 'mimic');

assert.equal(RELIC_CARRIER_SPAWN_CHANCE, 0.1);
assert.equal(shouldSpawnRelicCarrier(() => 0.0999), true);
assert.equal(shouldSpawnRelicCarrier(() => 0.1), false);

const relicCarrier = applyRelicCarrierArchetype({
  id: 'wave-relic',
  type: 'Normal' as const,
  color: '#ef4444',
  maxHp: 900
});
assert.equal(relicCarrier.archetypeId, 'relic-carrier');
assert.equal(relicCarrier.color, '#facc15');
assert.equal(relicCarrier.archetypeState.escaped, false);

const bossEnemy = {
  id: 'boss',
  type: 'Boss' as const,
  color: '#dc2626',
  maxHp: 25000
};
assert.equal(applyEnemyArchetype(bossEnemy, () => 0), bossEnemy);
assert.equal('archetypeId' in bossEnemy, false);

const protection = getBulwarkProtection(
  { id: 'target', x: 100, y: 100 },
  [
    {
      id: 'guard',
      x: 150,
      y: 100,
      hp: 1000,
      archetypeId: 'bulwark',
      archetypeState: { abilityCooldownFrames: 0, shieldHp: 200 }
    }
  ],
  100
);
assert.equal(protection.damage, 60);
assert.equal(protection.absorbedDamage, 40);
assert.equal(protection.bulwarkId, 'guard');

const unprotected = getBulwarkProtection(
  { id: 'target', x: 100, y: 100 },
  [
    {
      id: 'distant-guard',
      x: 500,
      y: 500,
      hp: 1000,
      archetypeId: 'bulwark',
      archetypeState: { abilityCooldownFrames: 0, shieldHp: 200 }
    }
  ],
  100
);
assert.equal(unprotected.damage, 100);
assert.equal(unprotected.bulwarkId, null);

assert.equal(getRelicCarrierReward(() => 0.1).kind, 'gems');
assert.equal(getRelicCarrierReward(() => 0.5).kind, 'mora');
assert.equal(getRelicCarrierReward(() => 0.9).kind, 'artifact');

console.log('enemy archetype rules ok');
