import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = fileURLToPath(new URL('.', import.meta.url));
const readSource = (relativePath: string) => readFileSync(join(srcDir, relativePath), 'utf8');

const appSource = readSource('App.tsx');
const gachaSource = readSource('components/GachaSimulator.tsx');
const gameHomeSource = readSource('components/GameHome.tsx');
const inventorySource = readSource('components/InventoryManager.tsx');
const storySource = readSource('components/StoryMode.tsx');
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

const extractOpeningTag = (buttonBlock: string) => {
  let braceDepth = 0;
  let quote: '"' | "'" | '`' | null = null;

  for (let index = 0; index < buttonBlock.length; index += 1) {
    const character = buttonBlock[index];
    const previousCharacter = buttonBlock[index - 1];

    if (quote) {
      if (character === quote && previousCharacter !== '\\') quote = null;
      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === '{') braceDepth += 1;
    if (character === '}') braceDepth -= 1;
    if (character === '>' && braceDepth === 0) return buttonBlock.slice(0, index + 1);
  }

  throw new Error('button block has an unterminated opening tag');
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

assert.match(
  appSource,
  /<GameHome\b[\s\S]*?readyQuestCount=\{saveState\.activeQuests\.filter\(quest => quest\.completed\)\.length\}/,
  'App must pass the number of reward-ready active quests to GameHome',
);

assert.match(
  gameHomeSource,
  /readyQuestCount:\s*number/,
  'GameHome must name its reward-ready quest presentation prop readyQuestCount',
);
assert.doesNotMatch(
  gameHomeSource,
  /completedQuestCount/,
  'GameHome must not describe reward-ready quests as completed quest history',
);
assert.match(
  gameHomeSource,
  /\{readyQuestCount\}\s+(?:rewards ready|ready to claim)/,
  'GameHome must describe the badge as rewards ready to claim',
);

assert.match(
  appSource,
  /activeScreen === 'home'\s*\?\s*'lg:col-span-4'\s*:\s*'lg:col-span-3'/,
  'the primary screen container must use four desktop columns on home and three on other screens',
);

assert.match(
  appSource,
  /!isMobile\s*&&\s*activeScreen !== 'home'/,
  'the desktop utility rail must be guarded off while home is active',
);

const characterStoryActs = storySource.match(/const acts = \[([\s\S]*?)\n\s*\];/);
assert.ok(characterStoryActs, 'Character Story acts configuration must be present');
for (const encounterType of ['Normal', 'Elite', 'Boss']) {
  assert.match(
    characterStoryActs[1],
    new RegExp(`encounterType\\s*:\\s*['"]${encounterType}['"]`),
    `Character Story acts must define the ${encounterType} encounter type`,
  );
}
const characterStoryActsBlock = extractBracedBlock(storySource, 'acts.map((act) => {');
assert.match(characterStoryActsBlock, /\{act\.encounterType\}/, 'Character Story JSX must render act.encounterType');
assert.match(characterStoryActsBlock, />[^<]*Mora[^<]*</, 'Character Story must show a compact visible Mora label or chip');
assert.match(characterStoryActsBlock, />[^<]*Gems[^<]*</, 'Character Story must show a compact visible Gems label or chip');

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
    ?.map(extractOpeningTag)
    .find(openingTag => (
      /\baria-expanded\s*=/.test(openingTag)
      && openingTag.includes(`aria-controls="${controls}"`)
      && openingTag.includes(`aria-label="${label}"`)
    ));

  assert.ok(
    disclosureButton,
    `${name} must be a semantic button with aria-expanded, aria-controls="${controls}", and aria-label="${label}" in its intended source`,
  );
}

assert.match(
  inventorySource,
  /const activeForgeFilterCount = \(\(\) => \{[\s\S]*?case 'artifacts':[\s\S]*?artSlotFilter[\s\S]*?artSetFilter[\s\S]*?artRarityFilter[\s\S]*?case 'characters':[\s\S]*?rarityFilter[\s\S]*?elementFilter[\s\S]*?case 'weapons':[\s\S]*?rarityFilter[\s\S]*?case 'items':[\s\S]*?return 0/,
  'Forge must derive active filter counts from the hidden filters for each tab',
);

const forgeFiltersButton = inventorySource
  .match(/<button\b[\s\S]*?<\/button>/g)
  ?.map(extractOpeningTag)
  .find(openingTag => (
    openingTag.includes('aria-label="Filters"')
    && openingTag.includes('aria-controls="forge-filter-panel"')
  ));

assert.ok(forgeFiltersButton, 'Forge must retain its semantic Filters button');
assert.match(
  forgeFiltersButton,
  /aria-describedby="forge-filter-status"/,
  'Forge Filters must describe the active hidden filter state',
);
assert.match(
  inventorySource,
  /id="forge-filter-status"[^>]*>[\s\S]*?activeForgeFilterCount === 0[\s\S]*?No active filters[\s\S]*?\$\{activeForgeFilterCount\} active filters/,
  'Forge must expose a status description for zero and non-zero active filters',
);
assert.match(
  inventorySource,
  /\{activeForgeFilterCount > 0 && \([\s\S]*?\{activeForgeFilterCount\}/,
  'Forge Filters must visibly show the active filter count when filters are collapsed',
);
assert.match(
  inventorySource,
  /\{activeTab !== 'items' && \([\s\S]*?aria-label="Filters"[\s\S]*?id="forge-filter-panel"/,
  'Forge must hide the Filters button and filter panel on the Augments tab',
);

console.log('information hierarchy regression contract passed');
