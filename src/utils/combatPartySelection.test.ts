import assert from 'node:assert/strict';
import { resolveActivePartyIndex } from './combatPartySelection';

const party = [
  { id: 'marina', currentHp: 1200 },
  { id: 'chloe', currentHp: 900 },
  { id: 'river', currentHp: 1000 },
];

assert.equal(
  resolveActivePartyIndex(party, 'chloe'),
  1,
  'a combat-party refresh must preserve the player-selected active hero',
);

assert.equal(
  resolveActivePartyIndex([party[2], party[0], party[1]], 'chloe'),
  2,
  'selection follows the same character if the party order changes',
);

assert.equal(
  resolveActivePartyIndex([
    { id: 'marina', currentHp: 1200 },
    { id: 'chloe', currentHp: 0 },
    { id: 'river', currentHp: 1000 },
  ], 'chloe'),
  0,
  'a defeated active hero falls back to the first living party member',
);

assert.equal(
  resolveActivePartyIndex([
    { id: 'marina', currentHp: 0 },
    { id: 'chloe', currentHp: 0 },
  ], 'chloe'),
  0,
  'an entirely defeated party keeps a valid zero index',
);
