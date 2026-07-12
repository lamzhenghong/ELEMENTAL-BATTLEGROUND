import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = dirname(fileURLToPath(import.meta.url));
const campaignDir = join(testDir, 'data', 'story', 'campaign');
const campaignSources = readdirSync(campaignDir)
  .filter((fileName) => fileName.endsWith('.ts'))
  .map((fileName) => readFileSync(join(campaignDir, fileName), 'utf8'))
  .join('\n');
const chapterFacadeSource = readFileSync(join(testDir, 'data', 'storyStages.ts'), 'utf8');
const worldSource = readFileSync(join(testDir, 'data', 'world.ts'), 'utf8');

const forbiddenSources = [
  ['campaign modules', campaignSources],
  ['Chapters 1-3 compatibility facade', chapterFacadeSource],
  ['world lore', worldSource],
] as const;
const limitedStoryNames = [
  'Aurelia',
  'Aurelia Sunflare',
  'Kaelen',
  'Kaelen Tidebound',
  'Maelis',
  'Maelis Verdantveil',
  'Veyra',
  'Veyra Stormglass',
];

for (const [sourceLabel, source] of forbiddenSources) {
  for (const limitedName of limitedStoryNames) {
    assert.doesNotMatch(
      source,
      new RegExp(`\\b${limitedName.replace(' ', '\\s+')}\\b`, 'i'),
      `${limitedName} must not appear in ${sourceLabel}.`,
    );
  }
}

console.log('story mode limited lore rules ok');
