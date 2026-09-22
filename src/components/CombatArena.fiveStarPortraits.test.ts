import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(srcDir, 'CombatArena.tsx'), 'utf8');

assert.match(source, /from '..\/utils\/fiveStarPortraits'/);
assert.match(source, /createPortraitCombatState/);
assert.match(source, /tickPortraitCombatState/);
assert.match(source, /resolvePortraitCombatEvent/);
assert.match(source, /portraitLevel: pLvl/);
assert.match(source, /elementalDamageBonus: sharedBuild\.finalElementalDamageBonus/);
assert.match(source, /energyRecharge: sharedBuild\.finalEnergyRecharge/);
assert.match(source, /elementalMastery: sharedBuild\.finalElementalMastery/);
assert.match(source, /function applyPortraitProcs/);

for (const eventKind of [
  'aurelia-direct-hit', 'kaelen-control', 'kaelen-reaction', 'maelis-reaction',
  'veyra-dodge', 'veyra-normal-hit', 'lyra-combo-finisher', 'lyra-skill',
  'zephyr-swirl', 'zephyr-direct-or-reaction', 'goliath-shield-absorbed',
  'goliath-skill', 'raijin-normal-hit', 'raijin-skill'
]) {
  assert.match(source, new RegExp(`kind: '${eventKind}'`), `${eventKind} must be connected to live combat`);
}

assert.match(source, /finalDmg \*= \(1 \+ \(currentActiveChar\.elementalDamageBonus \|\| 0\)\)/);
assert.match(source, /portraitCombatRef\.current = createPortraitCombatState\(\)/);

console.log('five-star portraits are connected to the shared combat engine');
