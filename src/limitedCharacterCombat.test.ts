import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const combatSource = readFileSync(join(srcDir, 'components', 'CombatArena.tsx'), 'utf8');

assert.match(combatSource, /const applyKitStatusEffect/);
assert.match(combatSource, /const normalAttackKit = getCharacterKit/);
assert.match(combatSource, /normalAttackKit\?\.normalAttack\.damageMultiplier/);
assert.match(combatSource, /normalAttackKit\?\.normalAttack\.effects/);
assert.match(combatSource, /const skillKit = getCharacterKit/);
assert.match(combatSource, /skillKit\?\.skill\.directDamage/);
assert.match(combatSource, /kind === 'party-shield'/);
assert.match(combatSource, /partyEffectsRef\.current = addMaelisShield/);
assert.match(combatSource, /applyCombatStatus/);
assert.match(combatSource, /bossesImmune/);
assert.match(combatSource, /IMMUNE/);

console.log('limited character M1 and Skill integration ok');
