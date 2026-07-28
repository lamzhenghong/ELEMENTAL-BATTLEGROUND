import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sourceRoot = join(process.cwd(), 'src');
const arenaSource = readFileSync(join(sourceRoot, 'components', 'CombatArena.tsx'), 'utf8');
const wikiSource = readFileSync(join(sourceRoot, 'components', 'GDDViewer.tsx'), 'utf8');
const appSource = readFileSync(join(sourceRoot, 'App.tsx'), 'utf8');
const rogueSource = readFileSync(join(sourceRoot, 'components', 'RogueDungeon.tsx'), 'utf8');

assert.match(arenaSource, /applyEnemyArchetype\(\{/);
assert.equal((arenaSource.match(/applyEnemyArchetype\(\{/g) ?? []).length, 4);
assert.match(arenaSource, /shouldSpawnRelicCarrier\(\)/);
assert.equal((arenaSource.match(/shouldSpawnRelicCarrier\(\)/g) ?? []).length, 1);
assert.match(arenaSource, /list\.push\(applyRelicCarrierArchetype\(\{/);
assert.match(arenaSource, /enemy\.type !== 'Boss' && enemy\.archetypeId/);
assert.match(arenaSource, /drawEnemyArchetypeEnemy\(ctx, enemy, now, isMobile\)/);
assert.match(arenaSource, /if \(storyMode && storyStageId\)/);
assert.match(arenaSource, /else if \(dungeonMode && dungeonRoomType\)/);
assert.match(arenaSource, /const isGrindBossWave = isArtifactGrindMode/);
assert.match(appSource, /storyMode=\{true\}/);
assert.match(appSource, /storyBattleConfig\.isCharStory/);
assert.match(rogueSource, /dungeonMode=\{true\}/);

const bossFactorySource = arenaSource.match(
  /const spawnRandomBoss = [\s\S]+?\n    };\n\n    if \(storyMode/
)?.[0] ?? '';
assert.doesNotMatch(bossFactorySource, /applyEnemyArchetype/);

assert.match(
  wikiSource,
  /\['lore', 'nations', 'characters', 'weapons', 'artifacts', 'enemies', 'systems', 'tutorial'\]/
);
assert.match(wikiSource, /activeTab === 'enemies'/);
assert.match(wikiSource, /ENEMY_ARCHETYPE_DEFINITIONS\.map/);
assert.match(wikiSource, /Boss enemies keep their existing boss mechanics and visuals/);

console.log('enemy archetype combat and index integration ok');
