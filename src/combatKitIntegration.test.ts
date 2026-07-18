import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const combatSource = readFileSync(join(srcDir, 'components', 'CombatArena.tsx'), 'utf8');

assert.match(combatSource, /from '..\/utils\/characterRoles'/);
assert.match(combatSource, /from '..\/utils\/characterKits'/);
assert.match(combatSource, /from '..\/utils\/reactionSources'/);
assert.match(combatSource, /from '..\/utils\/combatStatusEffects'/);
assert.match(combatSource, /from '..\/utils\/combatPartyEffects'/);

assert.match(combatSource, /applyRoleStatModifiers/);
assert.match(combatSource, /createReactionContext\('normal-attack'/);
assert.match(combatSource, /createReactionContext\('elemental-skill'/);
assert.match(combatSource, /createReactionContext\('elemental-burst'/);
assert.match(combatSource, /createReactionContext\('special-ultimate'/);
assert.match(combatSource, /canTriggerElementalReaction/);
assert.doesNotMatch(combatSource, /source !== 'basic'/);

console.log('combat kit integration contract ok');
