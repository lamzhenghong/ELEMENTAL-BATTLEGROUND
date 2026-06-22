import assert from 'node:assert/strict';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import {
  DAY_MS,
  LIMITED_CHARACTER_IDS,
  getLimitedCharacterBannerForTime,
  getStandardFiveStarCharacters,
  isLimitedCharacterId
} from './limitedBanners';

const rotationIds = Array.from({ length: 4 }, (_, day) =>
  getLimitedCharacterBannerForTime(day * DAY_MS + 1).featured5StarId
);

assert.deepEqual(rotationIds, ['aurelia', 'kaelen', 'maelis', 'veyra']);
assert.equal(getLimitedCharacterBannerForTime(4 * DAY_MS + 1).featured5StarId, 'aurelia');
assert.equal(getLimitedCharacterBannerForTime(2 * DAY_MS + 1, 1).featured5StarId, 'veyra');
assert.equal(getLimitedCharacterBannerForTime(2 * DAY_MS + 1, -1).featured5StarId, 'kaelen');

assert.deepEqual(LIMITED_CHARACTER_IDS, ['aurelia', 'kaelen', 'maelis', 'veyra']);
assert.ok(isLimitedCharacterId('maelis'));
assert.ok(isLimitedCharacterId('veyra'));

const maelis = PLAYABLE_CHARACTERS.find(c => c.id === 'maelis');
const veyra = PLAYABLE_CHARACTERS.find(c => c.id === 'veyra');
assert.equal(maelis?.rarity, 5);
assert.equal(maelis?.element, 'Dendro');
assert.equal(maelis?.weaponType, 'Claymore');
assert.equal(veyra?.rarity, 5);
assert.equal(veyra?.element, 'Electro');
assert.equal(veyra?.weaponType, 'Bow');

const standardIds = getStandardFiveStarCharacters(PLAYABLE_CHARACTERS).map(c => c.id);
for (const limitedId of LIMITED_CHARACTER_IDS) {
  assert.ok(!standardIds.includes(limitedId), `${limitedId} must not appear in standard 5-star pools`);
}

console.log('limited banner rotation rules ok');
