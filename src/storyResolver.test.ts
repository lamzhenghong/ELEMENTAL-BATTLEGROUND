import assert from 'node:assert/strict';
import { getStageSpec, getStoryModifier } from './data/story';

assert.throws(() => getStageSpec('4-1'), /authored story stage/i);
assert.equal(getStoryModifier('1-1'), undefined);
console.log('story resolver foundation ok');
