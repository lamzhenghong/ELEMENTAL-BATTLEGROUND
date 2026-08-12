import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (relativePath: string) => readFileSync(
  fileURLToPath(new URL(relativePath, import.meta.url)),
  'utf8',
);

const arena = read('./components/CombatArena.tsx');
const css = read('./index.css');

assert.match(arena, /data-testid="critical-health-overlay"/);
assert.match(arena, /critical-health-vignette/);
assert.match(arena, /critical-health-character/);
assert.match(arena, /getCriticalHealthBlinkAlpha/);
assert.match(arena, /getReadableDamageTextSize/);
assert.match(css, /@keyframes critical-health-character-blink/);
assert.match(css, /@keyframes critical-health-vignette-pulse/);
assert.match(css, /prefers-reduced-motion:[\s\S]*critical-health-character[\s\S]*critical-health-vignette/);

console.log('combat readability integration contract ok');
