import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

assert.match(source, /menuTransition/);
assert.match(source, /Welcome back,/);
assert.match(source, /handleReturnToMenu/);
assert.doesNotMatch(source, /Returned to main menu/i);
assert.doesNotMatch(source, /Auto-Save Frequency/);

console.log('menu transition experience ok');
