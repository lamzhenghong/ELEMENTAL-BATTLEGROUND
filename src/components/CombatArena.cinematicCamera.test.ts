import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const arenaSource = readFileSync(fileURLToPath(new URL('./CombatArena.tsx', import.meta.url)), 'utf8');
const rogueSource = readFileSync(fileURLToPath(new URL('./RogueDungeon.tsx', import.meta.url)), 'utf8');
const feedbackSource = readFileSync(fileURLToPath(new URL('./combat/DamageFeedbackManager.ts', import.meta.url)), 'utf8');

test('all cinematic combat cues route through the shared director', () => {
  assert.match(arenaSource, /triggerDash\(/);
  assert.match(arenaSource, /triggerParry\(/);
  assert.match(arenaSource, /triggerHeavyImpact\(/);
  assert.match(arenaSource, /triggerBossIntro\(/);
  assert.match(arenaSource, /triggerUltimateRecovery\(/);
});

test('camera projection stays shared by rendering, aiming, and damage feedback', () => {
  assert.match(arenaSource, /worldToScreen\(/);
  assert.match(arenaSource, /screenToWorld\(/);
  assert.match(arenaSource, /ctx\.scale\(cameraFrame\.zoom, cameraFrame\.zoom\)/);
  assert.match(feedbackSource, /\(impact\.x - cameraX\) \* zoom/);
});

test('motion intensity reaches arena, story, and rogue combat paths', () => {
  assert.match(arenaSource, /motionIntensity\?: number/);
  assert.match(rogueSource, /motionIntensity\?: number/);
  assert.match(rogueSource, /motionIntensity=\{motionIntensity\}/);
});
