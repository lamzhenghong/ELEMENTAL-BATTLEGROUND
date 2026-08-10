import assert from 'node:assert/strict';
import { createDefaultStoryProgress, normalizeStoryProgress } from './data/story/progress';

assert.deepEqual(createDefaultStoryProgress().storyChoices, {});
assert.deepEqual(createDefaultStoryProgress().fastestClearTimes, {});
const migrated = normalizeStoryProgress({
  currentChapter: 4,
  currentStage: '4-3',
  completedStages: ['4-1', '4-2'],
} as never);
assert.equal(migrated.storyChoices['chapter-4-route'], 'rescue-surveyors');
assert.deepEqual(migrated.completedStages, ['4-1', '4-2']);
assert.ok(migrated.unlockedLoreEntries.includes('chapter-4-last-lamp'));
assert.equal(migrated.currentStage, '4-3');

const migratedCharacterActs = normalizeStoryProgress({
  completedCharacterStoryActs: { aurelia: 3 },
} as never);
assert.equal(migratedCharacterActs.storyChoices['aurelia-act-2-route'], 'protect-workers');
assert.deepEqual(
  migratedCharacterActs.unlockedLoreEntries.filter((id) => id.startsWith('aurelia-')).sort(),
  [
    'aurelia-oaths-smallest-line',
    'aurelia-warmth-before-glory',
    'aurelia-watch-without-witnesses',
  ].sort(),
);

const preserved = normalizeStoryProgress({
  ...createDefaultStoryProgress(),
  storyChoices: { 'chapter-4-route': 'rescue-surveyors' },
});
assert.equal(preserved.storyChoices['chapter-4-route'], 'rescue-surveyors');

const preservedAlternate = normalizeStoryProgress({
  ...createDefaultStoryProgress(),
  completedStages: ['4-1', '4-2'],
  storyChoices: { 'chapter-4-route': 'secure-whisper-seal' },
});
assert.equal(preservedAlternate.storyChoices['chapter-4-route'], 'secure-whisper-seal');

const timed = normalizeStoryProgress({
  fastestClearTimes: {
    '4-3': 73,
    'char-aurelia-2': 54,
    broken: -4,
    infinite: Number.POSITIVE_INFINITY,
  },
} as never);
assert.deepEqual(timed.fastestClearTimes, { '4-3': 73, 'char-aurelia-2': 54 });
console.log('story progress migration ok');
