import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('./GDDViewer.tsx', import.meta.url)),
  'utf8',
);

assert.match(source, /const selectedCharacterOwned = ownedCharacterIds\.includes\(selectedChar\.id\)/);
assert.match(source, /Locked Character · Portrait effects unavailable/);
assert.match(source, /P0 Base/);
assert.match(source, /P1-P\$\{selectedPortraitLevel\} included/);
assert.match(
  source,
  /const isUnlocked = selectedCharacterOwned && currentPortraitLevel >= portLvl/,
  'locked characters must never render owned portrait tiers as active',
);
assert.match(source, /getSpecialUltimateCharacterEntry/);
assert.match(source, /Special Ultimate/i);
assert.match(source, /specialUltimateEntry\.fullDescription/);

console.log('Wiki portrait ownership display rules ok');
