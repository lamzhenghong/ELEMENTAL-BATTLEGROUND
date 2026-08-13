import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (relativePath: string) => readFileSync(
  fileURLToPath(new URL(relativePath, import.meta.url)),
  'utf8',
);

const arena = read('./components/CombatArena.tsx');
const visuals = read('./components/combat/CombatVisuals.tsx');
const css = read('./index.css');

assert.match(arena, /data-testid="critical-health-overlay"/);
assert.match(arena, /critical-health-vignette/);
assert.match(arena, /critical-health-character/);
assert.match(arena, /getCriticalHealthBlinkAlpha/);
assert.match(arena, /getReadableDamageTextSize/);
assert.match(arena, /const count = isCrit \? 1 : 0/);
assert.match(arena, /maxAllowedParticles = isMobile \? 40 : 100/);
assert.match(css, /@keyframes critical-health-character-blink/);
assert.match(css, /@keyframes critical-health-vignette-pulse/);
assert.match(css, /prefers-reduced-motion:[\s\S]*critical-health-character[\s\S]*critical-health-vignette/);
assert.match(css, /\.damage-skin-text--ice/);
assert.match(css, /\.damage-skin-text--celestial/);
assert.match(css, /\.damage-skin-text--void/);
assert.doesNotMatch(css, /\.damage-skin-text--ice[^}]*animation:\s*[^;]*infinite/);
assert.doesNotMatch(css, /\.damage-skin-text--celestial[^}]*animation:\s*[^;]*infinite/);
assert.doesNotMatch(css, /\.damage-skin-text--void[^}]*animation:\s*[^;]*infinite/);
assert.doesNotMatch(visuals, /t\.skin === 'Void'[\s\S]{0,240}animate-ping/);

console.log('combat readability integration contract ok');
