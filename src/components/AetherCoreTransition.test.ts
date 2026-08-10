import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./AetherCoreTransition.tsx', import.meta.url), 'utf8');

assert.match(source, /aria-live="polite"/);
assert.match(source, /aether-transition__core/);
assert.match(source, /aether-transition__sigil/);
assert.match(source, /Array\.from\(\{ length: lowGraphics \? 3 : 7 \}/);
assert.match(source, /prefersReducedMotion|reducedMotion/);
assert.match(source, /data-low-graphics=\{lowGraphics \? 'true' : 'false'\}/);
assert.match(source, /addEventListener\('keydown', blockKeyboardInput, true\)/);
assert.match(source, /removeEventListener\('keydown', blockKeyboardInput, true\)/);

console.log('aether core transition source contracts ok');
