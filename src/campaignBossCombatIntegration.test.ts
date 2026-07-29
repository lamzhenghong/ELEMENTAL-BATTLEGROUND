import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getStageSpec } from './data/storyStages';

const sourceRoot = join(process.cwd(), 'src');
const arenaSource = readFileSync(join(sourceRoot, 'components', 'CombatArena.tsx'), 'utf8');
const bossRendererSource = readFileSync(
  join(sourceRoot, 'components', 'combat', 'bossModelRenderer.ts'),
  'utf8',
);

assert.match(arenaSource, /createCampaignBossMechanicState/);
assert.match(arenaSource, /stepCampaignBossMechanic/);
assert.match(arenaSource, /campaignMechanicId: enemySpec\.campaignMechanicId/);
assert.match(arenaSource, /campaignMechanicState: createCampaignBossMechanicState\(\)/);

const randomBossFactory = arenaSource.match(
  /const spawnRandomBoss = [\s\S]+?\n    };\n\n    if \(storyMode/,
)?.[0] ?? '';
assert.doesNotMatch(randomBossFactory, /campaignMechanicId/);
assert.doesNotMatch(randomBossFactory, /campaignMechanicState/);

for (const characterId of ['aurelia', 'kaelen', 'maelis', 'veyra']) {
  for (const act of [1, 2, 3]) {
    const boss = getStageSpec(`char-${characterId}-${act}`).enemies
      .find((enemy) => enemy.type === 'Boss');
    assert.equal(boss?.campaignMechanicId, undefined);
  }
}

const mechanicDispatchIndex = arenaSource.indexOf('if (enemy.campaignMechanicId)');
const fireDragonIndex = arenaSource.indexOf("else if (enemy.bossType === 'fire_dragon')", mechanicDispatchIndex);
assert.ok(mechanicDispatchIndex > -1);
assert.ok(fireDragonIndex > mechanicDispatchIndex);
assert.match(arenaSource, /applyCampaignBossActions\(enemy, mechanicStep\.actions\)/);

assert.match(arenaSource, /type: 'campaign_boss_warning'/);
assert.match(arenaSource, /type: 'campaign_boss_patch'/);
assert.match(arenaSource, /hazard\.type !== 'campaign_boss_warning'/);
assert.match(arenaSource, /proj\.type === 'campaign_boss_warning'/);
assert.match(arenaSource, /proj\.type === 'campaign_boss_patch'/);
assert.match(arenaSource, /proj\.innerRadius/);
assert.match(arenaSource, /proj\.impactLabel/);
assert.doesNotMatch(bossRendererSource, /campaignBossMechanic|campaignMechanic/);

console.log('campaign boss combat integration ok');
