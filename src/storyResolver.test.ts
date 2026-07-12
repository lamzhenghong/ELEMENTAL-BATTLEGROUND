import assert from 'node:assert/strict';
import { getStageSpec, getStoryModifier } from './data/story';

assert.equal(getStageSpec('4-1').name, 'Gloamvault Descent');
assert.equal(getStageSpec('6-1').name, 'Rimeforge Threshold');
assert.equal(getStageSpec('9-1').name, 'Paradox Shore');
const futureStage = getStageSpec('11-1');
assert.equal(futureStage.id, '11-1');
assert.deepEqual(getStageSpec('11-1'), futureStage);
assert.equal(getStoryModifier('1-1'), undefined);
console.log('story resolver foundation ok');
