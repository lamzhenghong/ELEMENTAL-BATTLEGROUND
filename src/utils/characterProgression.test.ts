import assert from 'node:assert/strict';
import type { SaveState } from '../types';
import { createInitialSaveState } from '../save/gameSave';
import { createCharacterProgressionEvent, getCharacterLevelUpCost, tryLevelUpCharacter } from './characterProgression';

assert.equal(createCharacterProgressionEvent(8, 9).intensity, 'normal');
assert.equal(createCharacterProgressionEvent(9, 10).intensity, 'milestone');
assert.equal(createCharacterProgressionEvent(49, 50).intensity, 'milestone');
assert.equal(createCharacterProgressionEvent(50, 51).intensity, 'ascension');
assert.equal(createCharacterProgressionEvent(79, 80).label, 'MAX LEVEL');

assert.deepEqual(getCharacterLevelUpCost(1), { mora: 800, materials: 1, materialType: 'char_xp' });
assert.deepEqual(getCharacterLevelUpCost(50), { mora: 40000, materials: 10, materialType: 'ascension' });

const save = (mora: number, books: number, level = 1): SaveState => {
  const initial = createInitialSaveState();
  return {
    ...initial,
    mora,
    characterLevels: { marina: level },
    inventoryItems: initial.inventoryItems.map(item => item.type === 'char_xp'
      ? { ...item, count: books }
      : item),
  };
};

const insufficientMora = save(799, 2);
assert.equal(tryLevelUpCharacter(insufficientMora, 'marina'), insufficientMora);
const insufficientBooks = save(1600, 0);
assert.equal(tryLevelUpCharacter(insufficientBooks, 'marina'), insufficientBooks);

const once = tryLevelUpCharacter(save(1500, 2), 'marina');
assert.equal(once.characterLevels.marina, 2);
assert.equal(once.mora, 700);
assert.equal(once.inventoryItems[0].count, 1);
assert.equal(tryLevelUpCharacter(once, 'marina'), once, 'a second queued click must use the new level cost');

const ascended = tryLevelUpCharacter(save(40000, 0, 50), 'marina');
assert.equal(ascended.characterLevels.marina, 51);
assert.equal(ascended.mora, 0);
assert.equal(ascended.inventoryItems.find(item => item.type === 'ascension')?.count, 10);
assert.equal(ascended.inventoryItems.find(item => item.type === 'char_xp')?.count, 0);

const maxed = save(100000, 50, 80);
assert.equal(tryLevelUpCharacter(maxed, 'marina'), maxed);
const locked = { ...save(100000, 50), unlockedCharacterIds: [] };
assert.equal(tryLevelUpCharacter(locked, 'marina'), locked);

console.log('character progression presentation classification ok');
