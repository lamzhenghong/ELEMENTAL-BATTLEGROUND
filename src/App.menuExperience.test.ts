import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

assert.match(source, /useReducer\(reduceAetherTransition/);
assert.match(source, /navigateWithTransition/);
assert.match(source, /runWithTransition/);
assert.match(source, /kind:\s*'title'/);
assert.match(source, /runWithTransition\('arena'/);
assert.match(source, /runWithTransition\('story'/);
assert.match(source, /const storyBattleOutcomeHandledRef = useRef\(false\)/);
assert.match(source, /if \(storyBattleOutcomeHandledRef\.current\) return/);
assert.equal(
  source.match(/handleExitStoryBattle\(\(\) =>/g)?.length,
  3,
  'defeat, character-story victory, and campaign victory UI must each use one covered exit callback',
);
assert.match(
  source,
  /const characterStoryScene = storyBattleConfig\.charId && storyBattleConfig\.act[\s\S]*?handleExitStoryBattle\(\(\) => \{[\s\S]*?characterStoryScene\?\.slides/,
  'character-story victory must schedule its covered exit even when no optional scene can be resolved',
);
assert.doesNotMatch(source, /handleExitStoryBattle\(\);\s*if \(!victory\)/);
assert.equal(
  source.match(/requestId !== transitionRequestIdRef\.current/g)?.length,
  3,
  'every scheduled transition phase must ignore a stale request',
);
assert.equal(source.match(/<AetherCoreTransition/g)?.length, 1);
assert.equal(
  source.match(/return withTransitionHost\(/g)?.length,
  4,
  'mobile gate, terminated, menu, and game states must all render through the shared host',
);
assert.doesNotMatch(source, /const \[menuTransition,/);
assert.match(source, /Welcome back,/);
assert.match(source, /handleReturnToMenu/);
assert.doesNotMatch(source, /Returned to main menu/i);
assert.doesNotMatch(source, /Auto-Save Frequency/);

console.log('menu transition experience ok');
