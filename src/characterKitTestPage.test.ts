import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const read = (path: string) => readFileSync(join(srcDir, path), 'utf8');

const mainSource = read('main.tsx');
assert.match(mainSource, /window\.location\.pathname === ['"]\/kit-test['"]/);
assert.match(mainSource, /CharacterKitTestPage/);

const pageSource = read('components/CharacterKitTestPage.tsx');
for (const label of [
  'Character',
  'Target Class',
  'Spawn Enemy',
  'Normal Attack',
  'Elemental Skill',
  'Elemental Burst',
  'Special Ultimate Test',
  'Switch Character',
  'Advance 1s',
  'Reset',
  'Force Chance Effects',
  'Enemy HP',
  'Movement Speed',
  'Outgoing Damage',
  'Active Aura',
  'Active Statuses',
  'Party Shield',
  'Active Fields',
  'Reaction Multiplier',
  'Last Reaction Source',
  'Combat Event Log'
]) {
  assert.match(pageSource, new RegExp(label));
}

assert.match(pageSource, /getCharacterKit/);
assert.match(pageSource, /applyCombatStatus/);
assert.match(pageSource, /tickCombatStatuses/);
assert.match(pageSource, /canTriggerElementalReaction/);
assert.match(pageSource, /getReactionDamageOutcome/);
assert.match(pageSource, /addMaelisShield/);
assert.match(pageSource, /addReactionField/);
assert.match(pageSource, /activateVeyraDominion/);
assert.match(pageSource, /tickPartyEffects/);

const combatSource = read('components/CombatArena.tsx');
assert.doesNotMatch(combatSource, /Force Chance Effects|forceProc/i);

const vercelSource = readFileSync(join(srcDir, '..', 'vercel.json'), 'utf8');
assert.match(vercelSource, /"source"\s*:\s*"\/kit-test"/);
assert.match(vercelSource, /"destination"\s*:\s*"\/"/);

console.log('responsive character kit test route contract ok');
