import assert from 'node:assert/strict';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import {
  ROLE_MODIFIERS,
  applyRoleStatModifiers,
  getRoleAdjustedCooldown,
  getRoleLabel
} from './characterRoles';

const expectedRoles = {
  aurelia: 'dps', ignis: 'tank', kaelen: 'sub-dps', maelis: 'support',
  veyra: 'dps', marina: 'support', lyra: 'dps', varek: 'tank',
  zephyr: 'sub-dps', seraphina: 'support', goliath: 'tank', tessa: 'sub-dps',
  raijin: 'dps', luna: 'sub-dps', verdant: 'sub-dps', flora: 'support',
  valerie: 'dps', nero: 'sub-dps', cynthia: 'dps', aero: 'sub-dps',
  kira: 'support', sylvia: 'support', arthur: 'dps', chloe: 'support',
  hans: 'tank', stella: 'sub-dps', brock: 'tank', tesla: 'sub-dps',
  ivy: 'support', skip: 'dps', dusty: 'tank', river: 'sub-dps'
} as const;

assert.equal(PLAYABLE_CHARACTERS.length, 32);
assert.deepEqual(
  Object.fromEntries(PLAYABLE_CHARACTERS.map(character => [character.id, character.role])),
  expectedRoles
);

assert.deepEqual(ROLE_MODIFIERS.dps, { atk: 1.15, hp: 1, def: 1, normalAttackSpeed: 1.08, cooldown: 1 });
assert.equal(getRoleLabel('sub-dps'), 'Sub DPS');
assert.equal(getRoleLabel('support'), 'Support');

const originalStats = { atk: 100, hp: 1000, def: 200 };
const dpsStats = applyRoleStatModifiers(originalStats, 'dps');
assert.deepEqual(dpsStats, { atk: 115, hp: 1000, def: 200 });
assert.deepEqual(originalStats, { atk: 100, hp: 1000, def: 200 });
assert.deepEqual(applyRoleStatModifiers(originalStats, 'dps'), dpsStats);
assert.deepEqual(applyRoleStatModifiers(originalStats, 'support'), { atk: 92, hp: 920, def: 184 });
assert.deepEqual(applyRoleStatModifiers(originalStats, 'tank'), { atk: 100, hp: 1250, def: 220 });

assert.equal(getRoleAdjustedCooldown(12, 'support', 'skill'), 9.6);
assert.equal(getRoleAdjustedCooldown(20, 'support', 'ultimate'), 16);
assert.equal(getRoleAdjustedCooldown(12, 'support', 'basic'), 12);
assert.equal(getRoleAdjustedCooldown(12, 'dps', 'skill'), 12);

console.log('character roles ok');
