import assert from 'node:assert/strict';
import { createCharacterProgressionEvent } from './characterProgression';

assert.equal(createCharacterProgressionEvent(8, 9).intensity, 'normal');
assert.equal(createCharacterProgressionEvent(9, 10).intensity, 'milestone');
assert.equal(createCharacterProgressionEvent(49, 50).intensity, 'milestone');
assert.equal(createCharacterProgressionEvent(50, 51).intensity, 'ascension');
assert.equal(createCharacterProgressionEvent(79, 80).label, 'MAX LEVEL');

console.log('character progression presentation classification ok');
