import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
const obsoleteFiles = [
  'assets/menu_animation_preview.html',
  'assets/radar_preview.html',
  'assets/summon_preview.html',
  'assets/game_logo.png'
];

for (const relativePath of obsoleteFiles) {
  assert.equal(
    existsSync(join(projectRoot, relativePath)),
    false,
    `${relativePath} should not return after the verified repository cleanup`
  );
}

const packageJson = JSON.parse(
  readFileSync(join(projectRoot, 'package.json'), 'utf8')
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

for (const packageName of ['dotenv', 'express', 'autoprefixer']) {
  assert.equal(
    packageJson.dependencies?.[packageName],
    undefined,
    `${packageName} should not remain a production dependency`
  );
}

for (const packageName of ['@types/express', 'esbuild']) {
  assert.equal(
    packageJson.devDependencies?.[packageName],
    undefined,
    `${packageName} should not remain a direct development dependency`
  );
}

assert.equal(
  packageJson.dependencies?.vite,
  undefined,
  'Vite should only be declared as a development dependency'
);
assert.ok(packageJson.devDependencies?.vite, 'The development Vite dependency must remain');

const deadDeclarationChecks = [
  ['src/data/storyStages.ts', 'StoryCutsceneSpec'],
  ['src/utils/specialUltimates.ts', 'canUseSpecialUltimate'],
  ['src/components/GachaSimulator.tsx', 'getMeteorImageColor']
] as const;

for (const [relativePath, declarationName] of deadDeclarationChecks) {
  const source = readFileSync(join(projectRoot, relativePath), 'utf8');
  assert.equal(
    source.includes(declarationName),
    false,
    `${declarationName} should not return without a verified consumer`
  );
}

console.log('repository cleanup guard ok');
