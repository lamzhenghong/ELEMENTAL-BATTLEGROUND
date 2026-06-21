import assert from 'node:assert/strict';
import { rollAetherEcho } from './aetherEcho';

const party = [
  { id: 'marina', name: 'Marina', element: 'Hydro' },
  { id: 'aurelia', name: 'Aurelia', element: 'Pyro' }
] as const;

const legendary = rollAetherEcho(party, 0.0005, 0.75);
assert.equal(legendary?.rarity, 'Legendary');
assert.equal(legendary?.damageMultiplier, 2);
assert.equal(legendary?.auraColor, '#fbbf24');
assert.equal(legendary?.notification, 'LEGENDARY ECHO AWAKENED');
assert.equal(legendary?.characterId, 'aurelia');

const rare = rollAetherEcho(party, 0.003, 0);
assert.equal(rare?.rarity, 'Rare');
assert.equal(rare?.damageMultiplier, 1.5);
assert.equal(rare?.auraColor, '#a855f7');

const common = rollAetherEcho(party, 0.01, 0);
assert.equal(common?.rarity, 'Common');
assert.equal(common?.damageMultiplier, 1);
assert.equal(common?.auraColor, '#38bdf8');

const miss = rollAetherEcho(party, 0.02, 0);
assert.equal(miss, null);

const empty = rollAetherEcho([], 0.0001, 0);
assert.equal(empty, null);

console.log('aether echo rules ok');
