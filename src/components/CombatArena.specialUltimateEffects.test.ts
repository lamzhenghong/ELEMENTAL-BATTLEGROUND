import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const arenaSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/CombatArena.tsx'), 'utf8');

test('Special Ultimate opener uses active character ATK at the configured 500 percent', () => {
  assert.match(arenaSource, /getStatScaledAttackDamage\(currentActiveChar\.atk,\s*combo\.damageMultiplier\)/s);
  assert.doesNotMatch(arenaSource, /getSpecialUltimateStatDamage\(/);
  assert.match(arenaSource, /applySkillDamage\(enemy, specialDamage, combo\.damageElement, specialUltimateReactionContext, true, false\)/);
});

test('CombatArena routes both approved follow-ups through the shared effect engine', () => {
  for (const symbol of [
    'activateBoilingPoint',
    'activateLivingStormNetwork',
    'registerSpecialUltimateDirectHit',
    'tickSpecialUltimateEffects',
    'getSpecialUltimateDamageMultiplier',
    'clearSpecialUltimateEffects',
  ]) {
    assert.match(arenaSource, new RegExp(`\\b${symbol}\\b`));
  }
  assert.match(arenaSource, /combo\.followup === 'boiling-point'/);
  assert.match(arenaSource, /combo\.followup === 'living-storm-network'/);
  assert.match(arenaSource, /id: 'special-ultimate:living-storm-root',[\s\S]*?type: 'root'/);
  assert.doesNotMatch(arenaSource, /if \(usesActiveAttackerModifiers\) \{\s*finalDmg \*= getSpecialUltimateDamageMultiplier/);
  assert.match(arenaSource, /finalDmg = Math\.round\(Math\.min\(finalDmg, maxFinalDamage \?\? Number\.POSITIVE_INFINITY\)\)/);
  assert.match(arenaSource, /event\.maxFinalDamage/);
});

test('Special Ultimate effects reset with shared combat lifecycle state', () => {
  assert.match(arenaSource, /specialUltimateEffectsRef\.current = clearSpecialUltimateEffects\(/);
  assert.match(arenaSource, /specialUltimateDamageEventsRef\.current = \[\]/);
});
