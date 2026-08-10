import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

assert.match(source, /useReducer\(reduceAetherTransition/);
assert.match(source, /navigateWithTransition/);
assert.match(source, /runWithTransition/);
assert.match(source, /kind:\s*'title'/);
assert.match(source, /runWithTransition\('arena'/);
assert.match(source, /runWithTransition\('story'/);
assert.equal(
  source.match(/requestId !== transitionRequestIdRef\.current/g)?.length,
  3,
  'every scheduled transition phase must ignore a stale request',
);
assert.equal(source.match(/<AetherCoreTransition/g)?.length, 1);
assert.doesNotMatch(source, /const \[menuTransition,/);
assert.match(source, /Welcome back,/);
assert.match(source, /handleReturnToMenu/);
assert.doesNotMatch(source, /Returned to main menu/i);
assert.doesNotMatch(source, /Auto-Save Frequency/);

console.log('menu transition experience ok');
