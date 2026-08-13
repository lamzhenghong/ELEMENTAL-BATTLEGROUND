import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const arenaPath = path.resolve(process.cwd(), 'src/components/CombatArena.tsx');
const arenaSource = fs.readFileSync(arenaPath, 'utf8');

test('enemy deaths never spawn shield cores in shared combat modes', () => {
  const deathHookStart = arenaSource.indexOf('// Death hook checking');
  const heroWitStart = arenaSource.indexOf("// Hero's Wit drop", deathHookStart);

  assert.notEqual(deathHookStart, -1, 'expected the shared enemy death hook');
  assert.notEqual(heroWitStart, -1, 'expected the next enemy-death reward boundary');

  const enemyDeathRewards = arenaSource.slice(deathHookStart, heroWitStart);
  assert.doesNotMatch(enemyDeathRewards, /new CrystalShard\s*\(/);
  assert.doesNotMatch(enemyDeathRewards, /shield shards? on enemy death/i);
});

test('Geo Crystallize remains the only combat shard source', () => {
  const shardSpawns = arenaSource.match(/new CrystalShard\s*\(/g) ?? [];

  assert.equal(shardSpawns.length, 1);
  assert.match(arenaSource, /Geo \+ any Element = Crystallize drops/);
});
