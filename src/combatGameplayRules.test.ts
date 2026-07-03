import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getReactionDamageOutcome,
  getSpecialUltimateStatDamage,
  getStatScaledAttackDamage
} from './utils/combatDamage';
import { ENEMY_VISUAL_VARIANTS, sanitizeEnemyName } from './utils/enemyVisuals';

assert.equal(getStatScaledAttackDamage(250, 2.4), 600);
assert.ok(getStatScaledAttackDamage(500, 2.4) > getStatScaledAttackDamage(250, 2.4));

const lowSpecial = getSpecialUltimateStatDamage(200, [200, 220], 18);
const highSpecial = getSpecialUltimateStatDamage(600, [200, 220], 18);
assert.ok(highSpecial > lowSpecial * 2, 'special ultimate should strongly scale from active hero ATK');

const vaporizeLow = getReactionDamageOutcome(['Pyro'], 'Hydro', 300);
const vaporizeHigh = getReactionDamageOutcome(['Pyro'], 'Hydro', 900);
assert.equal(vaporizeLow?.reactionName, 'VAPORIZE (2x!)');
assert.equal(vaporizeHigh?.finalDamage, (vaporizeLow?.finalDamage || 0) * 3);

const bloomLow = getReactionDamageOutcome(['Dendro'], 'Hydro', 300);
const bloomHigh = getReactionDamageOutcome(['Dendro'], 'Hydro', 900);
assert.equal(bloomLow?.reactionName, 'BLOOM ERUPTION!');
assert.ok((bloomHigh?.finalDamage || 0) > (bloomLow?.finalDamage || 0) * 2, 'flat-style reactions should now scale from stat-based damage');

for (const variant of ENEMY_VISUAL_VARIANTS) {
  assert.ok(!('element' in variant), 'enemy visual variants must not carry an element identity');
  assert.doesNotMatch(variant.name, /Pyro|Hydro|Cryo|Electro|Anemo|Geo|Dendro/i);
}
assert.equal(sanitizeEnemyName('Pyro Slime'), 'Wild Slime');
assert.equal(sanitizeEnemyName('Abyss Cryo Channeler'), 'Abyss Channeler');

const combatArenaSource = readFileSync(new URL('./components/CombatArena.tsx', import.meta.url), 'utf8');
assert.match(combatArenaSource, /disableGameplayCutscenes\?: boolean/);
assert.match(combatArenaSource, /if \(disableGameplayCutscenes\)/);
assert.match(combatArenaSource, /const renderSpecialUltimateButton/);
assert.match(combatArenaSource, /storyMode \? renderSpecialUltimateButton\('desktop-story'\)/);
assert.doesNotMatch(combatArenaSource, /element:\s*(tpl|bossTpl|enemySpec)\.element/);
assert.doesNotMatch(combatArenaSource, /element:\s*enemySpec\.element/);

const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
assert.match(appSource, /Disable Gameplay Cutscenes/);
assert.match(appSource, /disableGameplayCutscenes=\{saveState\.disableGameplayCutscenes/);

console.log('combat gameplay rules ok');
