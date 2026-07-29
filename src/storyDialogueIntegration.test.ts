import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sourceRoot = join(process.cwd(), 'src');
const appSource = readFileSync(join(sourceRoot, 'App.tsx'), 'utf8');
const storyModeSource = readFileSync(join(sourceRoot, 'components', 'StoryMode.tsx'), 'utf8');

assert.match(
  appSource,
  /playerUsername=\{cloudAccount\.profile\?\.username \?\? null\}/,
  'App must pass the cloud username into Story Campaign',
);
assert.match(
  storyModeSource,
  /personalizeCampaignScene\(sourceScene, playerUsername\)/,
  'Campaign pre-battle scenes must use the current player name',
);
assert.match(
  appSource,
  /personalizeCampaignScene\(sourceScene, cloudAccount\.profile\?\.username\)/,
  'Campaign victory scenes must use the current player name',
);

const characterStoryHandler = storyModeSource.match(
  /const handlePlayCharStoryAct = [\s\S]+?\n  const handleCutsceneChoice/,
)?.[0] ?? '';
assert.doesNotMatch(
  characterStoryHandler,
  /personalizeCampaignScene/,
  'Character Story scripts must keep their authored character identities',
);

const characterVictoryBranch = appSource.match(
  /if \(isCharStory\) \{[\s\S]+?\n      return;\n    \}/,
)?.[0] ?? '';
assert.doesNotMatch(
  characterVictoryBranch,
  /personalizeCampaignScene/,
  'Character Story victory scripts must not use campaign personalization',
);

console.log('story dialogue integration ok');
