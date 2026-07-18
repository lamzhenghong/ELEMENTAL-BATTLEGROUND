import assert from 'node:assert/strict';
import {
  CHARACTER_PORTRAIT_BUFFS,
  getAccumulatedPortraitBuffs,
  getPortraitInfoList
} from './utils/portraits';

const expectedLimitedPortraits = {
  aurelia: [
    { atk: 0.08 },
    { critRate: 0.04 },
    { atk: 0.08 },
    { critDmg: 0.1 },
    { critRate: 0.04 },
    { atk: 0.12, critDmg: 0.12 }
  ],
  kaelen: [
    { atk: 0.06 },
    { hp: 0.08 },
    { critRate: 0.04 },
    { critDmg: 0.1 },
    { def: 0.08 },
    { atk: 0.1, critRate: 0.04 }
  ],
  maelis: [
    { hp: 0.08 },
    { def: 0.08 },
    { atk: 0.06 },
    { hp: 0.08, def: 0.08 },
    { critRate: 0.04 },
    { hp: 0.1, def: 0.1, atk: 0.08 }
  ],
  veyra: [
    { critRate: 0.04 },
    { critDmg: 0.1 },
    { atk: 0.08 },
    { critRate: 0.04 },
    { critDmg: 0.12 },
    { atk: 0.12, critRate: 0.04, critDmg: 0.12 }
  ]
} as const;

for (const [characterId, expected] of Object.entries(expectedLimitedPortraits)) {
  assert.deepEqual(CHARACTER_PORTRAIT_BUFFS[characterId], expected);
  const info = getPortraitInfoList('', characterId);
  assert.equal(info.length, 6);
  assert.ok(info.every(portrait => !/additional \+20%|ancient potential/i.test(portrait.desc)));
}

assert.deepEqual(getAccumulatedPortraitBuffs('aurelia', 6), {
  hp: 0, def: 0, atk: 0.28, critRate: 0.08, critDmg: 0.22
});
assert.deepEqual(getAccumulatedPortraitBuffs('kaelen', 6), {
  hp: 0.08, def: 0.08, atk: 0.16, critRate: 0.08, critDmg: 0.1
});
assert.deepEqual(getAccumulatedPortraitBuffs('maelis', 6), {
  hp: 0.26, def: 0.26, atk: 0.14, critRate: 0.04, critDmg: 0
});
const veyraTotals = getAccumulatedPortraitBuffs('veyra', 6);
assert.deepEqual({ ...veyraTotals, critDmg: Number(veyraTotals.critDmg.toFixed(2)) }, {
  hp: 0, def: 0, atk: 0.2, critRate: 0.12, critDmg: 0.34
});

console.log('limited portrait balance and descriptions ok');
