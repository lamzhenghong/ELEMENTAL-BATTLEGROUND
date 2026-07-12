import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLAYABLE_CHARACTERS } from './data/characters';
import { ELEMENTAL_REACTIONS } from './data/elementalReactions';
import { CHARACTER_PORTRAIT_BUFFS, getPortraitInfoList } from './utils/portraits';
import { getReactionDamageOutcome } from './utils/combatDamage';

const srcDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(srcDir, '..');

const textExtensions = new Set(['.ts', '.tsx', '.css', '.md', '.html', '.json']);
const mojibakePattern = /\u00c3|\u00c2|\u00e2\u0080|\u00f0\u009f|\ufffd/;

const collectTextFiles = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const path = join(dir, entry.name);
  if (entry.isDirectory()) return collectTextFiles(path);
  return textExtensions.has(extname(entry.name)) ? [path] : [];
});

for (const file of [
  ...collectTextFiles(srcDir),
  join(projectDir, 'README.md'),
  join(projectDir, 'task.md'),
  join(projectDir, 'vite.config.ts'),
  join(projectDir, 'index.html')
]) {
  assert.doesNotMatch(readFileSync(file, 'utf8'), mojibakePattern, `${file} contains corrupted Unicode text`);
}

for (const character of PLAYABLE_CHARACTERS) {
  assert.equal(
    CHARACTER_PORTRAIT_BUFFS[character.id]?.length,
    6,
    `${character.name} must have six portrait buff levels`,
  );
  const portraitInfo = getPortraitInfoList(character.element, character.id);
  assert.equal(portraitInfo.length, 6, `${character.name} must have six portrait descriptions`);
  assert.ok(portraitInfo.every(info => info.name && info.desc), `${character.name} portrait descriptions must be complete`);
}

const reactionCases = [
  { id: 'vaporize', active: ['Pyro'], incoming: 'Hydro' },
  { id: 'frozen', active: ['Hydro'], incoming: 'Cryo' },
  { id: 'bloom-eruption', active: ['Dendro'], incoming: 'Hydro' },
  { id: 'hyperbloom-quasar', active: ['Dendro'], incoming: 'Electro' },
  { id: 'overloaded', active: ['Pyro'], incoming: 'Electro' },
  { id: 'melt', active: ['Cryo'], incoming: 'Pyro' },
  { id: 'electro-charged', active: ['Hydro'], incoming: 'Electro' },
  { id: 'superconduct', active: ['Cryo'], incoming: 'Electro' },
  { id: 'burning', active: ['Dendro'], incoming: 'Pyro' },
  { id: 'crystallize', active: ['Pyro'], incoming: 'Geo' },
  { id: 'swirl-splash', active: ['Pyro'], incoming: 'Anemo' },
] as const;

for (const testCase of reactionCases) {
  const definition = ELEMENTAL_REACTIONS.find(reaction => reaction.id === testCase.id) as (typeof ELEMENTAL_REACTIONS)[number] & {
    damageMultiplier?: number;
  };
  assert.ok(definition, `${testCase.id} must exist in the shared reaction catalog`);
  assert.equal(typeof definition.damageMultiplier, 'number', `${testCase.id} must define its combat multiplier`);

  const outcome = getReactionDamageOutcome(testCase.active, testCase.incoming, 1_000);
  assert.equal(outcome?.finalDamage, Math.round(1_000 * definition.damageMultiplier!));
  const displayedMultiplier = Number(definition.multiplier.match(/([\d.]+)x/i)?.[1]);
  assert.equal(displayedMultiplier, definition.damageMultiplier);
}

const appSource = readFileSync(join(srcDir, 'App.tsx'), 'utf8');
const viteConfigSource = readFileSync(join(projectDir, 'vite.config.ts'), 'utf8');
for (const component of ['GDDViewer', 'GachaSimulator', 'CombatArena', 'InventoryManager', 'RogueDungeon', 'StoryMode']) {
  assert.match(appSource, new RegExp(`const\\s+${component}\\s*=\\s*React\\.lazy`), `${component} should be split from the initial bundle`);
}
assert.match(viteConfigSource, /manualChunks/, 'third-party libraries should be split from the main application chunk');

const importedAssetPattern = /from\s+['"]([^'"]+\.(?:png|jpe?g|webp))['"]/g;
const importedAssets = new Set<string>();
for (const file of collectTextFiles(srcDir).filter(file => ['.ts', '.tsx'].includes(extname(file)))) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(importedAssetPattern)) {
    const assetPath = resolve(dirname(file), match[1]);
    if (existsSync(assetPath)) importedAssets.add(assetPath);
  }
}

const importedAssetBytes = [...importedAssets].reduce((sum, file) => sum + statSync(file).size, 0);
assert.ok(importedAssetBytes < 8 * 1024 * 1024, `imported image assets should stay below 8 MB, got ${Math.round(importedAssetBytes / 1024 / 1024 * 100) / 100} MB`);

console.log('foundation integrity rules ok');
