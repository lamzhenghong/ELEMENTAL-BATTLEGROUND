import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCriticalVisualIdentity,
  getDamageNumberMotion,
  getEnemyDamageVisualState,
  getImpactShape,
} from './damageFeedback';

test('weapon and attack source select a readable impact silhouette', () => {
  assert.equal(getImpactShape({ weaponType: 'Sword', source: 'normal-attack' }), 'slash');
  assert.equal(getImpactShape({ weaponType: 'Claymore', source: 'normal-attack' }), 'radial');
  assert.equal(getImpactShape({ weaponType: 'Polearm', source: 'normal-attack' }), 'pierce');
  assert.equal(getImpactShape({ weaponType: 'Bow', source: 'normal-attack' }), 'projectile');
  assert.equal(getImpactShape({ weaponType: 'Catalyst', source: 'normal-attack' }), 'magic');
  assert.equal(getImpactShape({ weaponType: 'Sword', source: 'ultimate' }), 'aoe-ring');
  assert.equal(getImpactShape({ weaponType: 'Bow', source: 'special-ultimate' }), 'aoe-ring');
});

test('damage-number motion follows attack direction and alternates multi-hit offsets', () => {
  const left = getDamageNumberMotion({ attackDirectionX: -1, source: 'normal-attack', isCrit: false, hitIndex: 0 });
  const right = getDamageNumberMotion({ attackDirectionX: 1, source: 'normal-attack', isCrit: false, hitIndex: 0 });
  const alternate = getDamageNumberMotion({ attackDirectionX: 1, source: 'normal-attack', isCrit: false, hitIndex: 1 });
  const heavy = getDamageNumberMotion({ attackDirectionX: 1, source: 'elemental-skill', isCrit: true, hitIndex: 0 });
  const launch = getDamageNumberMotion({ attackDirectionX: 0, source: 'normal-attack', isCrit: false, hitIndex: 0, upwardLaunch: true });

  assert.ok(left.velocityX < 0);
  assert.ok(right.velocityX > 0);
  assert.ok(alternate.velocityX < right.velocityX);
  assert.ok(Math.abs(heavy.velocityX) > Math.abs(right.velocityX));
  assert.ok(launch.velocityY < right.velocityY);
  assert.ok(Math.abs(heavy.velocityX) <= 72, 'damage numbers stay close to their target');
  assert.deepEqual(
    getDamageNumberMotion({ attackDirectionX: 1, source: 'normal-attack', isCrit: false, hitIndex: 0 }),
    right,
    'motion is deterministic',
  );
});

test('critical identity follows elements while premium skins override element styling', () => {
  assert.equal(getCriticalVisualIdentity('Pyro', 'Default'), 'pyro');
  assert.equal(getCriticalVisualIdentity('Hydro', 'Default'), 'hydro');
  assert.equal(getCriticalVisualIdentity('Electro', 'Default'), 'electro');
  assert.equal(getCriticalVisualIdentity('Cryo', 'Default'), 'cryo');
  assert.equal(getCriticalVisualIdentity('Dendro', 'Default'), 'verdant');
  assert.equal(getCriticalVisualIdentity('Geo', 'Default'), 'neutral');
  assert.equal(getCriticalVisualIdentity('Pyro', 'Ice'), 'cryo');
  assert.equal(getCriticalVisualIdentity('Hydro', 'Void'), 'void');
  assert.equal(getCriticalVisualIdentity('Electro', 'Celestial'), 'celestial');
});

test('enemy damage state uses exact 50 and 25 percent boundaries', () => {
  assert.equal(getEnemyDamageVisualState(51, 100), 'normal');
  assert.equal(getEnemyDamageVisualState(50, 100), 'damaged');
  assert.equal(getEnemyDamageVisualState(25, 100), 'damaged');
  assert.equal(getEnemyDamageVisualState(24, 100), 'critical');
  assert.equal(getEnemyDamageVisualState(0, 0), 'normal');
});
