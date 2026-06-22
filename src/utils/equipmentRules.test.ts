import assert from 'node:assert/strict';
import { assignUniqueWeaponOwner, normalizeUniqueEquippedWeapons } from './equipmentRules';

const duplicateEquipMap = {
  aurelia: 'sword_1',
  ignis: 'sword_1',
  marina: 'bow_1',
  kaelen: 'book_1',
  maelis: 'book_1'
};

assert.deepEqual(normalizeUniqueEquippedWeapons(duplicateEquipMap), {
  aurelia: 'sword_1',
  marina: 'bow_1',
  kaelen: 'book_1'
});

assert.deepEqual(assignUniqueWeaponOwner(duplicateEquipMap, 'ignis', 'sword_1'), {
  ignis: 'sword_1',
  marina: 'bow_1',
  kaelen: 'book_1'
});

assert.deepEqual(assignUniqueWeaponOwner(duplicateEquipMap, 'marina', ''), {
  aurelia: 'sword_1',
  kaelen: 'book_1'
});

console.log('equipment rules ok');
