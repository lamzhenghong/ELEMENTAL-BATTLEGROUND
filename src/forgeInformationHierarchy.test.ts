import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('./components/InventoryManager.tsx', import.meta.url)),
  'utf8',
);

for (const conciseLabel of ['>Forge<', '>Stats<', '>Weapon<', '>Passive<', '>Ascend<', 'Stat Breakdown', 'Artifact Fusion']) {
  assert.match(source, new RegExp(conciseLabel), `Forge must expose ${conciseLabel}`);
}

for (const removedCopy of ['Ledger signature status', 'MATRIX ONLINE', 'Active combat parameters', 'Ascend Attunement Sphere', 'Attachment Registry', 'Set Bonus Matrix']) {
  assert.doesNotMatch(source, new RegExp(removedCopy, 'i'), `Forge must remove ${removedCopy}`);
}

assert.match(source, /aria-controls="forge-stat-breakdown-panel"/);
assert.match(source, /aria-controls="artifact-fusion-panel"/);
assert.match(source, /Salvage \/ Delete/);
assert.match(source, /onUpgradeWeapon/);
assert.match(source, /onLevelUpCharacter/);
assert.match(source, /onFuseArtifacts/);

console.log('forge information hierarchy contract passed');
