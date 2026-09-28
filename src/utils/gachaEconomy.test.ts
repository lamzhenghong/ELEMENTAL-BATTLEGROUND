import assert from 'node:assert/strict';
import {
  FIVE_STAR_BASE_RATE,
  FOUR_STAR_BASE_RATE,
  getDuplicateWeaponMoraRefund,
  getWishCost,
  isFiveStarRoll
} from './gachaEconomy';

assert.equal(FIVE_STAR_BASE_RATE, 0.005);
assert.equal(FOUR_STAR_BASE_RATE, 0.051);
assert.equal(1 - FIVE_STAR_BASE_RATE - FOUR_STAR_BASE_RATE, 0.944);
assert.equal(getWishCost(1), 160);
assert.equal(getWishCost(10), 1440);
assert.equal(isFiveStarRoll(0.0049, 1), true);
assert.equal(isFiveStarRoll(0.005, 1), false);
assert.equal(isFiveStarRoll(0.99, 90), true);

assert.equal(getDuplicateWeaponMoraRefund(3), 20_000);
assert.equal(getDuplicateWeaponMoraRefund(4), 50_000);
assert.equal(getDuplicateWeaponMoraRefund(5), 100_000);

console.log('gacha economy rules ok');
