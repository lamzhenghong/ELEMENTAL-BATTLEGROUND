import assert from 'node:assert/strict';
import { createDefaultStoryProgress, normalizeStoryProgress } from './data/story/progress';

assert.deepEqual(createDefaultStoryProgress().storyChoices, {});
const migrated = normalizeStoryProgress({
  currentChapter: 4,
  currentStage: '4-2',
  completedStages: ['4-1'],
} as never);
assert.deepEqual(migrated.storyChoices, {});
assert.deepEqual(migrated.completedStages, ['4-1']);
assert.equal(migrated.currentStage, '4-2');

const preserved = normalizeStoryProgress({
  ...createDefaultStoryProgress(),
  storyChoices: { 'chapter-4-route': 'rescue-surveyors' },
});
assert.equal(preserved.storyChoices['chapter-4-route'], 'rescue-surveyors');
console.log('story progress migration ok');
