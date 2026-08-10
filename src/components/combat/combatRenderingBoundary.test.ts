import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const visualsUrl = new URL('./CombatVisuals.tsx', import.meta.url);
const canvasEffectsUrl = new URL('./canvasEffects.ts', import.meta.url);

assert.equal(
  existsSync(fileURLToPath(visualsUrl)),
  true,
  'CombatVisuals must contain the DOM combat rendering component.',
);
assert.equal(
  existsSync(fileURLToPath(canvasEffectsUrl)),
  true,
  'Canvas combat effects must live in their own module.',
);

const [visualsModule, canvasEffectsModule] = await Promise.all([
  import(visualsUrl.href),
  import(canvasEffectsUrl.href),
]);

assert.equal(
  typeof visualsModule.FloatingDamageTextDOM,
  'function',
  'CombatVisuals must export FloatingDamageTextDOM.',
);
assert.equal(typeof canvasEffectsModule.CombatParticle, 'function');
assert.equal(typeof canvasEffectsModule.FloatingDamageText, 'function');
assert.equal(typeof canvasEffectsModule.CrystalShard, 'function');
assert.equal(Array.isArray(canvasEffectsModule.BOSS_TEMPLATES), true);
assert.equal(typeof canvasEffectsModule.WORLD_WIDTH, 'number');
assert.equal(typeof canvasEffectsModule.WORLD_HEIGHT, 'number');

const arenaSource = readFileSync(new URL('../CombatArena.tsx', import.meta.url), 'utf8');
assert.match(
  arenaSource,
  /import\s*\{[^}]*\bFloatingDamageTextDOM\b[^}]*\}\s*from ['"]\.\/combat\/CombatVisuals['"];/,
);
assert.match(
  arenaSource,
  /from ['"]\.\/combat\/canvasEffects['"];/,
);
assert.doesNotMatch(arenaSource, /function FloatingDamageTextDOM\s*\(/);
assert.doesNotMatch(arenaSource, /class CombatParticle\s*\{/);
assert.doesNotMatch(arenaSource, /class FloatingDamageText\s*\{/);
assert.doesNotMatch(arenaSource, /class CrystalShard\s*\{/);
assert.doesNotMatch(arenaSource, /const BOSS_TEMPLATES\s*=/);
assert.doesNotMatch(arenaSource, /const WORLD_WIDTH\s*=/);
assert.doesNotMatch(arenaSource, /const WORLD_HEIGHT\s*=/);

console.log('combat rendering module boundary ok');
