import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const arena = readFileSync(new URL('./components/CombatArena.tsx', import.meta.url), 'utf8');
const rewards = readFileSync(new URL('./components/StoryRewards.tsx', import.meta.url), 'utf8');
const rogue = readFileSync(new URL('./components/RogueDungeon.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const storyStage = readFileSync(new URL('./components/StoryStage.tsx', import.meta.url), 'utf8');

assert.match(arena, /getCombatSessionPresentation/);
assert.match(arena, /mode: 'story-campaign', stageId: storyStageId, bestClearSecs: storyBestClearSecs, isHardMode/);
assert.doesNotMatch(
  arena,
  /\{\/\* Highscore indicator badges \*\/\}\s*\{!isMobile &&/,
  'mode-aware records must remain visible on mobile',
);
assert.match(arena, /data-testid="story-combat-action-rows"/);
assert.match(arena, /data-testid="story-burst-special-row"/);
assert.match(
  arena,
  /data-testid="story-burst-special-row"[\s\S]*?triggerUltimate\(\)[\s\S]*?renderSpecialUltimateButton\('desktop-story'\)/,
  'Story Burst and Special Ultimate must share a second row with Special Ultimate after Burst',
);
assert.match(arena, /renderSpecialUltimateButton\('mobile'\)/, 'mobile Special Ultimate placement must remain available');
assert.match(arena, /combatState\.isArtifactGrindMode\s*\?\s*'artifact-grind'\s*:\s*'endless-arena'/);
assert.equal(arena.match(/onUpdateWaveRecord\?\.\(/g)?.length, 1, 'one synchronized wave-record path');
assert.match(arena, /loopStateRef\.current\.currentWave = waveNum/);
assert.match(arena, /battleStartTimeRef\.current = Date\.now\(\)/);
assert.doesNotMatch(arena, /Dynamic automatic wave advancement check/);
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
assert.match(storyStage, /bestClearSecs/);
assert.match(storyStage, /BEST TIME/);
assert.match(storyStage, /formatCombatDuration/);
assert.match(rogue, /runStartedAt/);
assert.match(rogue, /useState<number \| null>\(\(\) => getSavedValue\('completedRunDurationSecs', null\)\)/);
assert.match(rogue, /useState<boolean>\(\(\) => getSavedValue\('completedRunIsNewRecord', false\)\)/);
assert.match(rogue, /runStartedAt,\s*completedRunDurationSecs,\s*completedRunIsNewRecord\s*\};/);
assert.match(rogue, /runStartedAt,\s*completedRunDurationSecs,\s*completedRunIsNewRecord\s*\]\);/);
assert.match(rogue, /const MIN_PLAUSIBLE_RUN_STARTED_AT = 1_000_000_000_000/);
assert.match(rogue, /value >= MIN_PLAUSIBLE_RUN_STARTED_AT/);
assert.match(rogue, /value <= Date\.now\(\)/);
assert.match(rogue, /isPlausibleRunStartedAt\(savedRunStartedAt\)\s*\?\s*savedRunStartedAt\s*:\s*runActive\s*\?\s*Date\.now\(\)\s*:\s*0/);
assert.match(rogue, /onCompleteRun/);
assert.match(rogue, /fastestClearSecs/);
assert.match(rogue, /deepestRoom/);
assert.match(rogue, /CLEAR TIME/);
assert.match(app, /fastestRogueClearSecs/);
