import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = fileURLToPath(new URL('.', import.meta.url));
const readSource = (relativePath: string) => readFileSync(join(srcDir, relativePath), 'utf8');

const appSource = readSource('App.tsx');
const gachaSource = readSource('components/GachaSimulator.tsx');
const inventorySource = readSource('components/InventoryManager.tsx');
const combatSource = readSource('components/CombatArena.tsx');

const extractBracedBlock = (source: string, marker: string) => {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `source must contain ${marker}`);
  const openBraceIndex = source.indexOf('{', markerIndex);
  assert.notEqual(openBraceIndex, -1, `${marker} must open a braced block`);

  let depth = 0;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openBraceIndex, index + 1);
  }

  throw new Error(`${marker} has an unterminated braced block`);
};

const activeScreenDeclaration = appSource.match(
  /const \[activeScreen, setActiveScreen\] = useState<([^>]+)>\('menu'\);/,
);
assert.ok(activeScreenDeclaration, 'App must declare the active-screen state from the menu default');
assert.match(activeScreenDeclaration[1], /'home'/, 'active-screen state must include the home screen');

const startSimulationBody = extractBracedBlock(appSource, 'const handleStartSimulation = () =>');
assert.match(startSimulationBody, /setActiveScreen\('home'\)/, 'starting the simulation must select the home screen');

assert.match(
  appSource,
  /\{activeScreen === 'home' && \(\s*<GameHome\b/,
  'the active home render branch must render GameHome',
);

const wikiIdIndex = appSource.indexOf('id="dash_screen_wiki"');
assert.notEqual(wikiIdIndex, -1, 'App must expose the Wiki navigation button');
const wikiButtonStart = appSource.lastIndexOf('<button', wikiIdIndex);
const wikiButtonEnd = appSource.indexOf('</button>', wikiIdIndex);
assert.ok(wikiButtonStart !== -1 && wikiButtonEnd !== -1, 'Wiki navigation id must belong to a complete button block');
const wikiNavigation = appSource.slice(wikiButtonStart, wikiButtonEnd + '</button>'.length);
assert.match(wikiNavigation, /onClick=\{[\s\S]*?setActiveScreen\('wiki'\)[\s\S]*?\}/, 'Wiki navigation must use the gameplay screen navigation path');

const disclosureContracts: Record<string, { source: string; label: string; controls: string }> = {
  'Banner Details': { source: gachaSource, label: 'Banner Details', controls: 'banner-details-panel' },
  'Forge Filters': { source: inventorySource, label: 'Filters', controls: 'forge-filter-panel' },
  'Party Filters': { source: appSource, label: 'Filters', controls: 'party-filter-panel' },
  'Loadout Details': { source: appSource, label: 'Loadout Details', controls: 'party-loadout-details-panel' },
  'Forge Notes': { source: inventorySource, label: 'Forge Notes', controls: 'forge-notes-panel' },
  'Combat Controls': { source: combatSource, label: 'Combat Controls', controls: 'combat-controls-panel' },
};

for (const [name, { source, label, controls }] of Object.entries(disclosureContracts)) {
  assert.match(source, new RegExp(`id="${controls}"`), `${name} source must include its aria-controls target panel`);

  const disclosureButton = source
    .match(/<button\b[\s\S]*?<\/button>/g)
    ?.find(button => (
      /\baria-expanded\s*=/.test(button)
      && button.includes(`aria-controls="${controls}"`)
      && button.includes(`aria-label="${label}"`)
    ));

  assert.ok(
    disclosureButton,
    `${name} must be a semantic button with aria-expanded, aria-controls="${controls}", and aria-label="${label}" in its intended source`,
  );
}

console.log('information hierarchy regression contract passed');
