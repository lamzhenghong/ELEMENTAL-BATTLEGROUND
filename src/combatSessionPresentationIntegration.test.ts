import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const arena = readFileSync(new URL('./components/CombatArena.tsx', import.meta.url), 'utf8');
const rewards = readFileSync(new URL('./components/StoryRewards.tsx', import.meta.url), 'utf8');
const rogue = readFileSync(new URL('./components/RogueDungeon.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

assert.match(arena, /getCombatSessionPresentation/);
assert.match(arena, /onUpdateWaveRecord\?\.\('artifact-grind'/);
assert.match(arena, /onUpdateWaveRecord\?\.\('endless-arena'/);
assert.doesNotMatch(arena, /High Score: Wave \{highScoreWave\}/);
assert.match(
  arena,
  /pendingAction === 'restart' &&\s*\(\s*storyMode\s*\?\s*'Restart this stage from the beginning\.'\s*:\s*dungeonMode\s*\?\s*'Restart this room from the beginning\.'\s*:\s*t\('notice_restart_run', language\)/,
);
assert.match(rewards, /CLEAR TIME/);
assert.match(rewards, /BEST TIME/);
assert.match(rewards, /NEW RECORD/);
assert.match(app, /fastestClearTimes/);
assert.match(app, /highScoreArtifactWave/);
assert.match(rogue, /runStartedAt/);
assert.match(rogue, /useState<number \| null>\(\(\) => getSavedValue\('completedRunDurationSecs', null\)\)/);
assert.match(rogue, /useState<boolean>\(\(\) => getSavedValue\('completedRunIsNewRecord', false\)\)/);
assert.match(rogue, /runStartedAt,\s*completedRunDurationSecs,\s*completedRunIsNewRecord\s*\};/);
assert.match(rogue, /runStartedAt,\s*completedRunDurationSecs,\s*completedRunIsNewRecord\s*\]\);/);
assert.match(rogue, /runActive && \(!Number\.isFinite\(savedRunStartedAt\) \|\| savedRunStartedAt <= 0\)/);
assert.match(rogue, /onCompleteRun/);
assert.match(rogue, /fastestClearSecs/);
assert.match(rogue, /deepestRoom/);
assert.match(rogue, /CLEAR TIME/);
assert.match(app, /fastestRogueClearSecs/);
