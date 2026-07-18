import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const combatSource = readFileSync(join(srcDir, 'components', 'CombatArena.tsx'), 'utf8');

assert.match(combatSource, /const resolveUltimateImpact/);
assert.match(combatSource, /const burstKit = getCharacterKit/);
assert.match(combatSource, /applyKitStatusEffect\(enemy, effect, currentActiveChar\.id, 'burst', currentActiveChar\.atk\)/);
assert.match(combatSource, /partyEffectsRef\.current = addWhirlpool/);
assert.match(combatSource, /partyEffectsRef\.current = addReactionField/);
assert.match(combatSource, /partyEffectsRef\.current = activateVeyraDominion/);
assert.match(combatSource, /tickCombatStatuses/);
assert.match(combatSource, /tickPartyEffects/);
assert.match(combatSource, /consumePartyShield/);
assert.match(combatSource, /clearPartyEffects/);
assert.match(combatSource, /effect\.kind === 'reaction-field'/);
assert.match(combatSource, /effect\.kind === 'whirlpool'/);
assert.match(combatSource, /effect\.kind === 'electric-field'/);
assert.match(combatSource, /enemy\.isFrozen = Math\.round\(200 \* fieldModifiers\.crowdControlDurationMultiplier\)/);
assert.match(combatSource, /data-testid="desktop-party-strip"/);
assert.match(combatSource, /grid-cols-2 sm:grid-cols-4/);
assert.doesNotMatch(combatSource, /max-w-\[85px\]/);

console.log('limited character Burst and persistent effects integration ok');
