import assert from 'node:assert/strict';
import {
  FIVE_STAR_BASE_RATE,
  getDuplicateWeaponMoraRefund,
  isFiveStarRoll
} from './gachaEconomy';

assert.equal(FIVE_STAR_BASE_RATE, 0.005);
assert.equal(isFiveStarRoll(0.0049, 1), true);
assert.equal(isFiveStarRoll(0.005, 1), false);
assert.equal(isFiveStarRoll(0.99, 90), true);

assert.equal(getDuplicateWeaponMoraRefund(3), 20_000);
assert.equal(getDuplicateWeaponMoraRefund(4), 50_000);
assert.equal(getDuplicateWeaponMoraRefund(5), 100_000);

console.log('gacha economy rules ok');
