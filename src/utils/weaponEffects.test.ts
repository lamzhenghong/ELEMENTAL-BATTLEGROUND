import assert from 'node:assert/strict';
import { WEAPONS_DATABASE } from '../data/weapons';
import type { Weapon } from '../types';
import {
  WEAPON_EFFECTS,
  getWeaponDamageMultiplier,
  getWeaponSecondaryStats,
  resolveWeaponEffect,
} from './weaponEffects';

assert.equal(Object.keys(WEAPON_EFFECTS).length, WEAPONS_DATABASE.length);
for (const weapon of WEAPONS_DATABASE) {
  const effect = resolveWeaponEffect(weapon.name);
  assert.ok(effect, `${weapon.name} must have a runtime effect definition`);
  assert.equal(effect?.rarity, weapon.rarity);
  assert.equal(effect?.description, weapon.featureDesc);
}

assert.equal(resolveWeaponEffect('Dull Blade (Sword)')?.id, 'dull-blade');
assert.equal(resolveWeaponEffect('Iron Point (Claymore)')?.id, 'iron-point-claymore');
assert.equal(resolveWeaponEffect('Hunter Bow (Bow)')?.id, 'hunters-bow');
assert.equal(resolveWeaponEffect('Apprentice Scroll (Catalyst)')?.id, 'apprentices-notes');
assert.equal(resolveWeaponEffect('Beginner Pole (Polearm)')?.id, 'beginners-protector');

const secondaryFixtures: Array<[string, Partial<ReturnType<typeof getWeaponSecondaryStats>>]> = [
  ['HP +6%', { hpPercent: 0.06 }],
  ['Energy Recharge +10%', { energyRecharge: 0.10 }],
  ['Elemental Mastery +14', { elementalMastery: 14 }],
  ['Physical DMG +5%', { physicalDamagePercent: 0.05 }],
];
for (const [statBonus, expected] of secondaryFixtures) {
  const weapon: Weapon = { id: statBonus, name: 'Fixture', rarity: 4, weaponType: 'Sword', baseAtk: 1, level: 1, statBonus };
  assert.deepEqual(getWeaponSecondaryStats(weapon), {
    atkPercent: 0,
    hpPercent: 0,
    critRate: 0,
    critDmg: 0,
    energyRecharge: 0,
    elementalMastery: 0,
    physicalDamagePercent: 0,
    ...expected,
  });
}

assert.equal(getWeaponDamageMultiplier('White Tassel', { source: 'normal-attack' }), 1.08);
assert.equal(getWeaponDamageMultiplier('Rust', { source: 'normal-attack' }), 1.16);
assert.equal(getWeaponDamageMultiplier('Apprentice Scroll (Catalyst)', { source: 'elemental-skill' }), 1.05);
assert.equal(getWeaponDamageMultiplier('Cool Steel', { source: 'normal-attack', targetElements: ['Hydro'] }), 1.12);
assert.equal(getWeaponDamageMultiplier('Cool Steel', { source: 'normal-attack', targetElements: [] }), 1);

console.log('weapon runtime coverage, aliases, secondary stats, and balance rules ok');
