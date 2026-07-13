import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getMemoryUnlockIds } from './data/story';

const memoryModule = await import('./data/story/memories').catch(() => undefined);
assert.ok(memoryModule, 'The shared story memory catalog must exist.');

const {
  ALL_STORY_MEMORIES,
  LEGACY_CAMPAIGN_CHRONICLES,
  STORY_MEMORIES,
  mergeUnlockedStoryMemories,
} = memoryModule;

assert.equal(STORY_MEMORIES.length, 33, 'The authored archive must contain exactly 33 new memories.');
assert.equal(STORY_MEMORIES.filter(({ category }) => category === 'campaign').length, 21);
assert.equal(STORY_MEMORIES.filter(({ category }) => category === 'character').length, 12);
assert.equal(LEGACY_CAMPAIGN_CHRONICLES.length, 3, 'The original three campaign chronicles stay separate.');
assert.equal(ALL_STORY_MEMORIES.length, 36);
assert.equal(new Set(ALL_STORY_MEMORIES.map(({ id }) => id)).size, ALL_STORY_MEMORIES.length);

for (const memory of STORY_MEMORIES) {
  assert.ok(memory.title.trim().length > 0);
  assert.ok(memory.sourceLabel.trim().length > 0);
  assert.ok(memory.location.trim().length > 0);
  assert.ok(memory.text.trim().length >= 80);
  assert.doesNotMatch(
    `${memory.title} ${memory.text}`,
    /stat reward|portrait reward|combat bonus|permanent power|character upgrade/i,
    `${memory.id} must remain lore-only.`,
  );
}

const campaignUnlockStages = Array.from({ length: 7 }, (_, chapterOffset) => {
  const chapter = chapterOffset + 4;
  return [1, 3, 5].map((stage) => `${chapter}-${stage}`);
}).flat();
const characterUnlockStages = ['aurelia', 'kaelen', 'maelis', 'veyra']
  .flatMap((characterId) => [1, 2, 3].map((act) => `char-${characterId}-${act}`));
const allUnlockStages = [...campaignUnlockStages, ...characterUnlockStages];

assert.deepEqual(
  allUnlockStages.flatMap(getMemoryUnlockIds).sort(),
  STORY_MEMORIES.map(({ id }) => id).sort(),
  'Every new memory must have exactly one declared stage unlock source.',
);

const firstUnlock = mergeUnlockedStoryMemories(['legacy-entry'], '4-1');
assert.deepEqual(firstUnlock, ['legacy-entry', 'chapter-4-last-lamp']);
assert.deepEqual(
  mergeUnlockedStoryMemories(firstUnlock, '4-1'),
  firstUnlock,
  'Replaying a stage must not duplicate its memory key.',
);
assert.deepEqual(
  mergeUnlockedStoryMemories([], 'char-aurelia-2'),
  ['aurelia-oaths-smallest-line'],
);

const srcDir = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath: string) => {
  const path = join(srcDir, relativePath);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
};

const storyModeSource = readSource('components/StoryMode.tsx');
const archiveSource = readSource('components/StoryMemoryArchive.tsx');
const appSource = readSource('App.tsx');
const gddSource = readSource('components/GDDViewer.tsx');

assert.match(storyModeSource, /Memory Archive/, 'Story Mode must expose the archive as a primary tab.');
assert.match(storyModeSource, /<StoryMemoryArchive/, 'Story Mode must render the shared archive component.');
assert.match(archiveSource, /grid-cols-1/, 'Archive entries must stack on narrow screens.');
assert.match(archiveSource, /md:grid-cols-2/, 'Archive entries must use two columns when space allows.');
assert.match(archiveSource, /Campaign Memories/);
assert.match(archiveSource, /Character Memories/);
assert.match(appSource, /mergeUnlockedStoryMemories\(nextUnlockedLoreEntries, stageId\)/);
assert.match(gddSource, /ALL_STORY_MEMORIES/, 'The GDD chronicle view must use the shared memory source.');
assert.doesNotMatch(gddSource, /unlockedLoreEntries\.includes\('chapter-1-clear'\)/);

console.log('story memory archive ok');
