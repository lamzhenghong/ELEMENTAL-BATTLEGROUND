import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const arena = readFileSync(new URL('../CombatArena.tsx', import.meta.url), 'utf8');
const visuals = readFileSync(new URL('./CombatVisuals.tsx', import.meta.url), 'utf8');
const settings = readFileSync(new URL('../InGameSettingsModal.tsx', import.meta.url), 'utf8');
const mainSettings = readFileSync(new URL('../MainMenuSettingsModal.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');

test('arena emits pooled hit feedback and clears it with combat lifecycle', () => {
  assert.match(arena, /DamageFeedbackManager/);
  assert.match(arena, /spawnImpact/);
  assert.match(arena, /spawnFinalHit/);
  assert.match(arena, /drawEnemyDamageVisualState/);
  assert.match(arena, /damageFeedbackRef\.current\.clear\(\)/);
  assert.match(arena, /playFinalHit/);
});

test('damage numbers receive deterministic motion and element critical identity', () => {
  assert.match(visuals, /t\.motion/);
  assert.match(visuals, /CriticalHitStyle/);
  assert.doesNotMatch(visuals, /Math\.random/);
});

test('haptic preference is available in both settings surfaces and persisted by App', () => {
  assert.match(settings, /hapticsEnabled/);
  assert.match(mainSettings, /hapticsEnabled/);
  assert.match(app, /aetheria_pref_haptics/);
  assert.match(app, /hapticsEnabled=\{hapticsEnabled\}/);
  assert.match(arena, /HapticManager\.stop\(\)/);
});
