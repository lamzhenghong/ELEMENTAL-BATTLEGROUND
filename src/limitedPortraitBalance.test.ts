import assert from 'node:assert/strict';
import {
  CHARACTER_PORTRAIT_BUFFS,
  getAccumulatedPortraitBuffs,
  getPortraitInfoList
} from './utils/portraits';
import { FIVE_STAR_PORTRAITS } from './utils/fiveStarPortraits';

const expectedFiveStarPortraits = {
  aurelia: [
    {}, { critRate: 0.10 }, {}, { elementalDamage: 0.18 }, {}, {}
  ],
  kaelen: [
    {}, { energyRecharge: 0.20 }, {}, { elementalDamage: 0.15 }, {}, {}
  ],
  maelis: [
    { hp: 0.20 }, {}, {}, { def: 0.18 }, {}, {}
  ],
  veyra: [
    {}, { critRate: 0.10 }, {}, { elementalDamage: 0.18 }, {}, {}
  ],
  lyra: [
    {}, { critRate: 0.10 }, {}, { elementalDamage: 0.18 }, {}, {}
  ],
  zephyr: [
    {}, { elementalMastery: 80 }, {}, { energyRecharge: 0.18 }, {}, {}
  ],
  goliath: [
    { def: 0.25 }, {}, {}, { hp: 0.20 }, {}, {}
  ],
  raijin: [
    {}, { critRate: 0.10 }, {}, { elementalDamage: 0.18 }, {}, {}
  ]
} as const;

for (const [characterId, expected] of Object.entries(expectedFiveStarPortraits)) {
  assert.deepEqual(CHARACTER_PORTRAIT_BUFFS[characterId], expected);
  const info = getPortraitInfoList('', characterId);
  assert.equal(info.length, 6);
  assert.deepEqual(info, FIVE_STAR_PORTRAITS[characterId].tiers.map(({ name, description }) => ({ name, desc: description })));
  assert.ok(info.every(portrait => !/additional \+20%|ancient potential/i.test(portrait.desc)));
}

assert.deepEqual(getAccumulatedPortraitBuffs('aurelia', 6), {
  hp: 0, def: 0, atk: 0, critRate: 0.10, critDmg: 0,
  elementalDamage: 0.18, energyRecharge: 0, elementalMastery: 0
});
assert.deepEqual(getAccumulatedPortraitBuffs('kaelen', 6), {
  hp: 0, def: 0, atk: 0, critRate: 0, critDmg: 0,
  elementalDamage: 0.15, energyRecharge: 0.20, elementalMastery: 0
});
assert.deepEqual(getAccumulatedPortraitBuffs('maelis', 6), {
  hp: 0.20, def: 0.18, atk: 0, critRate: 0, critDmg: 0,
  elementalDamage: 0, energyRecharge: 0, elementalMastery: 0
});
assert.deepEqual(getAccumulatedPortraitBuffs('zephyr', 6), {
  hp: 0, def: 0, atk: 0, critRate: 0, critDmg: 0,
  elementalDamage: 0, energyRecharge: 0.18, elementalMastery: 80
});

console.log('limited portrait balance and descriptions ok');
