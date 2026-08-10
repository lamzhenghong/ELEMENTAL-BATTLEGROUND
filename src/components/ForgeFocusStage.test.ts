import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./ForgeFocusStage.tsx', import.meta.url), 'utf8');

assert.match(source, /data-forge-focus-stage/);
assert.match(source, /data-forge-operation/);
assert.match(source, /lowGraphics/);
assert.match(source, /reducedMotion/);
assert.match(source, /orbitingNodes/);
assert.match(source, /sourceNodes/);
assert.match(source, /aria-live="polite"/);
assert.match(source, /motion\.div/);
assert.match(source, /operation\.operation !== 'failure'/);
assert.match(source, /Math\.min\(3, profile\.orbitingNodes\)/);
assert.match(source, /operation && reducedMotion && operation\.operation !== 'failure'/);
assert.doesNotMatch(source, /setInterval|requestAnimationFrame/);

console.log('forge focus stage source contracts ok');
