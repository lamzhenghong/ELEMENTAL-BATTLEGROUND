import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(join(srcDir, path), 'utf8');

const appSource = read('App.tsx');
const storySource = read('components/StoryMode.tsx');
const arenaSource = read('components/CombatArena.tsx');
const rogueSource = read('components/RogueDungeon.tsx');
const audioSource = read('utils/audio.ts');

assert.match(appSource, /changeBgmForScreen\(activeScreen\)/);
assert.match(appSource, /setBgmContext\('story-battle'\)/);
assert.match(storySource, /setBgmContext\(activeTab === 'campaign'\s*\? 'story-map'\s*:\s*'character-stories-memories'\)/);
assert.match(arenaSource, /getCombatBgmTrack/);
assert.match(arenaSource, /setBgmContext\(combatBgmTrack\)/);
assert.match(rogueSource, /setBgmContext\('rogue-exploration'\)/);
assert.match(audioSource, /AetheriaBgmPlayer/);
assert.match(audioSource, /setBossFightActive\(active/);

for (const source of [arenaSource, audioSource]) {
  assert.doesNotMatch(source, /updateWeatherBgm/);
}

console.log('BGM screen and combat integration contract ok');
