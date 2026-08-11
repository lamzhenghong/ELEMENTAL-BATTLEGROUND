import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('./components/InventoryManager.tsx', import.meta.url)),
  'utf8',
);
const appSource = readFileSync(fileURLToPath(new URL('./App.tsx', import.meta.url)), 'utf8');
const cssSource = readFileSync(fileURLToPath(new URL('./index.css', import.meta.url)), 'utf8');
const weaponPanelSource = readFileSync(
  fileURLToPath(new URL('./components/WeaponForgePanel.tsx', import.meta.url)),
  'utf8',
);
const presentationSource = `${source}\n${weaponPanelSource}`;

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

const openingButtonTags = source.match(/<button\b[\s\S]*?<\/button>/g)?.map(extractOpeningTag) ?? [];

const getButton = (description: string, predicate: (openingTag: string) => boolean) => {
  const button = openingButtonTags.find(predicate);
  assert.ok(button, `${description} must be a semantic button in InventoryManager`);
  return button;
};

for (const conciseLabel of ['Forge', 'Weapon', 'Passive', 'Ascend', 'Set Bonus', 'Equipped', 'Stat Breakdown', 'Artifact Fusion']) {
  assert.match(presentationSource, new RegExp(`>\\s*${conciseLabel}\\s*<`), `Forge must expose ${conciseLabel}`);
}
assert.match(weaponPanelSource, /Base ATK/);
assert.match(weaponPanelSource, /Bonus Stat/);
assert.match(weaponPanelSource, /Upgrade to Lv\./);

for (const removedCopy of ['Ledger signature status', 'MATRIX ONLINE', 'Active combat parameters', 'Ascend Attunement Sphere', 'Attachment Registry', 'Set Bonus Matrix']) {
  assert.doesNotMatch(source, new RegExp(removedCopy, 'i'), `Forge must remove ${removedCopy}`);
}

assert.match(source, /aria-controls="forge-stat-breakdown-panel"/);
assert.match(source, /const \[showArtifactFusion, setShowArtifactFusion\] = useState\(false\)/);
assert.match(source, /aria-expanded=\{showArtifactFusion\}/);
assert.match(source, /aria-controls="artifact-fusion-panel"/);
assert.match(source, /id="artifact-fusion-panel"/);
assert.match(source, /showArtifactFusion && \(/);
assert.match(source, /Salvage \/ Delete/);
assert.match(source, /onUpgradeWeapon/);
assert.match(source, /import WeaponForgePanel from '\.\/WeaponForgePanel'/);
assert.match(source, /const \[selectedWeaponId, setSelectedWeaponId\] = useState<string \| null>/);
assert.match(source, /const \[armamentSearchQuery, setArmamentSearchQuery\] = useState\(''\)/);
assert.match(source, /placeholder="Search all armaments\.\.\."/);
assert.match(source, /onClick=\{\(\) => setSelectedWeaponId\(w\.id\)\}/);
assert.match(source, /data-armament-selected=\{isSelected \? 'true' : undefined\}/);
assert.match(source, /activeTab === 'weapons' \? \(/);
assert.match(source, /weapon=\{selectedArmamentWeapon\}/);
assert.match(
  source,
  /onUpgrade=\{\(weaponId\) => presentForgeResult\(onUpgradeWeapon\?\.\(weaponId\)\)\}/,
  'Armaments must use the existing transaction-safe weapon upgrade callback',
);
assert.match(source, /weapon=\{activeEquippedWeapon\}/);
assert.match(source, /onLevelUpCharacter/);
assert.match(source, /onFuseArtifacts/);
assert.match(source, /createArtifactFusionRequest/);
assert.match(source, /<ForgeFocusStage/);
assert.match(source, /ForgeOperationResult/);
assert.match(source, /result\.success/);
assert.match(source, /setForgeOperation/);
assert.match(source, /data-forge-layout=/);
assert.match(
  source,
  /className="space-y-6 md:contents"/,
  'the weapon selector wrapper must release the forge stage into the parent grid on desktop',
);
assert.match(
  weaponPanelSource,
  /className="forge-presentation-layout forge-weapon-panel[^"]*"[\s\S]*?data-forge-layout="weapon"/,
  'the shared weapon forge presentation must own a stable responsive layout',
);
assert.match(source, /getForgeAnimationProfile/);
assert.match(source, /clearTimeout/);
assert.match(appSource, /const handleUpgradeWeapon = \(weaponId: string\): ForgeOperationResult/);
assert.match(appSource, /const handleFuseArtifacts = \([\s\S]*?\): ForgeOperationResult =>/);
assert.match(appSource, /return \{\s*success: true,[\s\S]*?operation: 'upgrade'/);
assert.match(appSource, /return \{\s*success: true,[\s\S]*?operation: 'fusion'/);
assert.match(appSource, /lowGraphics=\{isMobile\}/);
assert.match(cssSource, /\.forge-presentation-layout/);
assert.match(cssSource, /@media \(min-width: 1280px\)/);
assert.match(cssSource, /@media \(max-height: 480px\) and \(orientation: landscape\)/);
assert.match(
  source,
  /onFuseArtifacts\?\.\(\s*fusionRequest\.consumeArtifactIds,\s*fusionRequest\.upgradedArtifact,\s*fusionRequest\.costMora,\s*fusionRequest\.costGems\s*\)/,
  'Artifact fusion must retain callback argument order when passing the typed request payload',
);

const heroHeaderStart = source.indexOf('{/* Header character profile details */}');
const heroHeaderEnd = source.indexOf('{/* Split layout: dynamic stats left, weapon selectors right */}', heroHeaderStart);
assert.notEqual(heroHeaderStart, -1, 'Forge must retain the selected hero detail header');
assert.notEqual(heroHeaderEnd, -1, 'Forge must retain the selected hero detail header boundary');
const heroHeader = source.slice(heroHeaderStart, heroHeaderEnd);

for (const requiredHeroDetail of [
  /selectedChar\.name/,
  /\{selectedChar\.rarity\}★/,
  /LEVEL \{charLevel\} \/ 80/,
  /\{selectedChar\.element\}/,
  /\{selectedChar\.weaponType\}/,
  /PORTRAIT P\{pLvl\}/
]) {
  assert.match(heroHeader, requiredHeroDetail, 'Selected hero header must retain compact name, rarity, level, element, weapon, and portrait details');
}
assert.doesNotMatch(heroHeader, /ATTUNEMENT|PROFESSIONAL/, 'Selected hero metadata must use compact terminology');

assert.match(source, />\s*Weapon\s*</, 'Forge must use the compact Weapon heading');
assert.doesNotMatch(source, /Equip Armaments Slot/, 'Forge must remove the verbose weapon heading');
assert.match(weaponPanelSource, /Refinement S\{refinement\}/, 'Forge must use the compact Refinement label');
assert.doesNotMatch(source, /Refinement Stage/, 'Forge must remove the verbose refinement label');

const fusionDetailsButton = getButton(
  'Fusion Details disclosure',
  openingTag => openingTag.includes('aria-controls="artifact-fusion-panel"'),
);
assert.match(fusionDetailsButton, /aria-expanded=\{showArtifactFusion\}/);
assert.match(fusionDetailsButton, /aria-label="Fusion Details"/);
assert.match(fusionDetailsButton, /onClick=\{\(\) => setShowArtifactFusion\(\(visible\) => !visible\)\}/);
assert.match(fusionDetailsButton, /min-h-10/);
assert.match(fusionDetailsButton, /p[xy]-\d/);
assert.match(fusionDetailsButton, /focus-visible:outline/);

const statBreakdownButton = getButton(
  'Stat Breakdown disclosure',
  openingTag => openingTag.includes('aria-controls="forge-stat-breakdown-panel"'),
);
assert.match(statBreakdownButton, /aria-expanded=\{showStatBreakdown\}/);
assert.match(statBreakdownButton, /aria-label="Stat Breakdown"/);
assert.match(statBreakdownButton, /onClick=\{\(\) => setShowStatBreakdown\(\(visible\) => !visible\)\}/);
assert.match(statBreakdownButton, /min-h-10/);
assert.match(statBreakdownButton, /p[xy]-\d/);
assert.match(statBreakdownButton, /focus-visible:outline/);

const clearWeaponSearchButton = getButton(
  'Weapon search clear control',
  openingTag => openingTag.includes("onClick={() => setWeaponSearchQuery('')}"),
);
assert.match(clearWeaponSearchButton, /type="button"/);
assert.match(clearWeaponSearchButton, /aria-label="Clear weapon search"/);
assert.match(clearWeaponSearchButton, /title="Clear weapon search"/);
assert.match(clearWeaponSearchButton, /min-h-10/);
assert.match(clearWeaponSearchButton, /min-w-10/);

console.log('forge information hierarchy contract passed');
