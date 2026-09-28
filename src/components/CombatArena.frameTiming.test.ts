import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getElapsedCombatFrames } from '../utils/enemyArchetypeCombat';

const source = readFileSync(new URL('./CombatArena.tsx', import.meta.url), 'utf8');

test('combat frame step preserves one second of motion at common refresh rates', () => {
  for (const fps of [30, 60, 120]) {
    const frames = Array.from({ length: fps }, () => getElapsedCombatFrames(1000 / fps));
    assert.ok(Math.abs(frames.reduce((sum, frame) => sum + frame, 0) - 60) < 0.001);
  }
});

test('movement, stamina, cooldowns, hazards and enemy timing use elapsed frames', () => {
  assert.match(source, /const elapsedFrames = getElapsedCombatFrames\(delta, combatSpeed\)/);
  assert.match(source, /const frameSeconds = elapsedFrames \/ 60/);
  assert.match(source, /currentSpeed \* elapsedFrames/);
  assert.match(source, /const baseDrain = \(15 \/ 60\) \* elapsedFrames/);
  assert.match(source, /setCombatParty\(pList => tickCombatPartyTimers\(pList, elapsedFrames\)\)/);
  assert.match(source, /proj\.timer -= elapsedFrames/);
  assert.match(source, /enemy\.attackCooldown -= elapsedFrames/);
  assert.match(source, /enemy\.telegraphTimer \+= elapsedFrames/);
});

test('environmental parry never reflects damage into a missing enemy', () => {
  assert.match(source, /if \(enemy\?\.hp > 0\) \{\s*applySkillDamage\(enemy, reflect/);
});
