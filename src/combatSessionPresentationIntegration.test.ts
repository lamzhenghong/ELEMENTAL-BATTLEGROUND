import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const arena = readFileSync(new URL('./components/CombatArena.tsx', import.meta.url), 'utf8');
const rewards = readFileSync(new URL('./components/StoryRewards.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

assert.match(arena, /getCombatSessionPresentation/);
assert.match(arena, /onUpdateWaveRecord\?\.\('artifact-grind'/);
assert.match(arena, /onUpdateWaveRecord\?\.\('endless-arena'/);
assert.doesNotMatch(arena, /High Score: Wave \{highScoreWave\}/);
assert.match(rewards, /CLEAR TIME/);
assert.match(rewards, /BEST TIME/);
assert.match(rewards, /NEW RECORD/);
assert.match(app, /fastestClearTimes/);
assert.match(app, /highScoreArtifactWave/);
