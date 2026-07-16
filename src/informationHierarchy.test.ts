import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = fileURLToPath(new URL('.', import.meta.url));
const readSource = (relativePath: string) => readFileSync(join(srcDir, relativePath), 'utf8');

const appSource = readSource('App.tsx');
const gachaSource = readSource('components/GachaSimulator.tsx');
const inventorySource = readSource('components/InventoryManager.tsx');
const storySource = readSource('components/StoryMode.tsx');
const combatSource = readSource('components/CombatArena.tsx');

assert.match(
  appSource,
  /useState<[^>]*'home'[^>]*>/,
  'active-screen state must include the home screen',
);
assert.match(
  appSource,
  /const handleStartSimulation[\s\S]*?setActiveScreen\('home'\)/,
  'starting the simulation must select the home screen',
);
assert.match(
  appSource,
  /activeScreen === 'home'[\s\S]*?<GameHome\b/,
  'the home screen must render GameHome',
);

const wikiNavigation = appSource.match(/id="dash_screen_wiki"[\s\S]*?\/button>/)?.[0] || '';
assert.match(wikiNavigation, /setActiveScreen\('wiki'\)/, 'Wiki navigation must use the gameplay screen navigation path');

const disclosureLabels = [
  'Banner Details',
  'Filters',
  'Loadout Details',
  'Forge Notes',
  'Combat Controls',
];
for (const label of disclosureLabels) {
  const source = [appSource, gachaSource, inventorySource, storySource, combatSource].join('\n');
  assert.match(
    source,
    new RegExp(`aria-expanded={[^}]+}[\\s\\S]{0,500}(?:aria-label="${label}"|title="${label}"|>${label}<)`),
    `dense panel ${label} must expose an aria-expanded control with an accessible name`,
  );
}

console.log('information hierarchy regression contract failed as expected: home and disclosure semantics are not implemented');
