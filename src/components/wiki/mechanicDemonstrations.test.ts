import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BOSS_IDENTITIES, getBossIdentityById } from '../../utils/bossIdentities';
import { ENEMY_ARCHETYPE_IDS } from '../../utils/enemyArchetypes';
import { canAnimateMechanicDemo, getBossMechanicDemo, getEnemyMechanicDemo } from './mechanicDemonstrations';

test('every archetype receives its own counterplay sequence, not a generic attack', () => {
  const families = [
    'shield-break', 'support-priority', 'ground-marker', 'beam-interrupt',
    'skill-copy', 'summon-priority', 'back-attack', 'escape-chase',
  ];
  ENEMY_ARCHETYPE_IDS.forEach((id, index) => {
    const demo = getEnemyMechanicDemo(id);
    assert.ok(demo, `missing demo for ${id}`);
    assert.equal(demo.family, families[index]);
    assert.equal(demo.steps.length, 3);
    assert.ok(demo.counterplay.length > 0);
    assert.ok(demo.actors.some(actor => actor.kind === 'player'));
  });
});

test('Mimic counterplay requires a new weaker Skill, not swapping alone', () => {
  const demo = getEnemyMechanicDemo('mimic');
  assert.ok(demo);
  assert.match(demo.counterplay, /weaker Skill/);
  assert.match(demo.counterplay, /swap alone does not/);
  assert.ok(demo.effects.some(effect => effect.kind === 'warning'));
});

test('defeating a Summoner stops new summons but does not erase existing Wisps', () => {
  const demo = getEnemyMechanicDemo('summoner');
  assert.ok(demo);
  const wisps = demo.actors.filter(actor => actor.kind === 'wisp');
  assert.equal(wisps.length, 2);
  assert.ok(wisps.every(wisp => wisp.visible[2]));
  assert.match(demo.counterplay, /existing Wisps/);
});

test('Siphon teaches damage interruption and current-energy drain, not a fixed energy cost', () => {
  const demo = getEnemyMechanicDemo('siphon');
  assert.ok(demo);
  assert.match(demo.counterplay, /5% of current/);
  assert.match(demo.counterplay, /five seconds/);
  assert.match(demo.counterplay, /Damage/);
  assert.deepEqual(demo.effects.find(effect => effect.id === 'beam')?.visible, [true, true, false]);
});

test('all boss entries map to a campaign mechanic or their actual shared combat profile', () => {
  for (const identity of BOSS_IDENTITIES) {
    const demo = getBossMechanicDemo(identity);
    assert.ok(demo, `missing boss demo for ${identity.id}`);
    assert.equal(demo.sourceId, identity.campaignMechanicId ?? identity.mechanicProfile);
    assert.equal(demo.steps.length, 3);
    assert.match(demo.scope, /one attack/i);
  }
  assert.equal(getBossMechanicDemo(getBossIdentityById('world-calamity-drake')!).family, 'aimed-projectile');
  assert.equal(getBossMechanicDemo(getBossIdentityById('world-glacial-golem')!).family, 'projectile-fan');
  assert.equal(getBossMechanicDemo(getBossIdentityById('world-tempest-thunderbird')!).family, 'ground-marker');
});

test('campaign IDs override legacy profiles and preserve implemented ring geometry', () => {
  const silence = getBossMechanicDemo(getBossIdentityById('campaign-void-overlord')!);
  assert.ok(silence);
  assert.equal(silence.family, 'annular-warning');
  assert.equal(silence.phase, 2);
  assert.equal(silence.effects.length, 1);
  assert.equal(silence.effects[0].radius, 145 * 0.22);
  assert.equal(silence.effects[0].innerRadius, 82 * 0.22);
  assert.doesNotMatch(silence.counterplay, /one escape gap|safe zone/i);

  const orbit = getBossMechanicDemo(getBossIdentityById('campaign-eldric-core-prime')!);
  assert.ok(orbit);
  assert.equal(orbit.effects[0].radius, 180 * 0.22);
  assert.equal(orbit.effects[0].innerRadius, 112 * 0.22);
});

test('campaign demos select real warning patterns without invented wedges or arena-wide safe areas', () => {
  const cases = [
    ['campaign-eternity-knight', 'cross-warning', 6],
    ['campaign-frostfire-wyrm', 'meteor-fan', 5],
    ['campaign-skyward-avian', 'anchor-gap', 6],
    ['campaign-molten-overlord', 'eruption-chain', 5],
    ['campaign-chronos-monarch', 'recorded-positions', 3],
  ] as const;
  for (const [id, family, count] of cases) {
    const demo = getBossMechanicDemo(getBossIdentityById(id)!);
    assert.ok(demo);
    assert.equal(demo.family, family);
    assert.equal(demo.effects.length, count);
    assert.ok(demo.effects.every(effect => ['warning', 'projectile'].includes(effect.kind)));
  }
  const anchors = getBossMechanicDemo(getBossIdentityById('campaign-skyward-avian')!);
  assert.equal(anchors.phase, 3, 'only final anchor formation has an omitted marker');
  assert.match(anchors.counterplay, /toward the boss/);
});

test('counterplay paths clear the selected campaign impact circles, not just their centers', () => {
  const ids = [
    'campaign-void-overlord', 'campaign-eternity-knight', 'campaign-frostfire-wyrm',
    'campaign-skyward-avian', 'campaign-molten-overlord', 'campaign-chronos-monarch',
    'campaign-eldric-core-prime',
  ];
  for (const id of ids) {
    const demo = getBossMechanicDemo(getBossIdentityById(id)!);
    assert.ok(demo);
    const player = demo.actors.find(actor => actor.kind === 'player');
    assert.ok(player);
    const final = player.route[2];
    for (const effect of demo.effects.filter(effect => effect.kind === 'warning')) {
      assert.ok(Math.hypot(final.x - effect.at.x, final.y - effect.at.y) > effect.radius + 5,
        `${id} response still overlaps ${effect.id}`);
    }
  }
});

test('animation requires visibility and respects pause, hidden tabs, and reduced motion', () => {
  const active = { inView: true, pageVisible: true, paused: false, reducedMotion: false };
  assert.equal(canAnimateMechanicDemo(active), true);
  assert.equal(canAnimateMechanicDemo({ ...active, inView: false }), false);
  assert.equal(canAnimateMechanicDemo({ ...active, pageVisible: false }), false);
  assert.equal(canAnimateMechanicDemo({ ...active, paused: true }), false);
  assert.equal(canAnimateMechanicDemo({ ...active, reducedMotion: true }), false);
});

test('all demo actors and warning areas fit the fixed responsive viewBox', () => {
  const demos = [...ENEMY_ARCHETYPE_IDS.map(getEnemyMechanicDemo), ...BOSS_IDENTITIES.map(getBossMechanicDemo)];
  for (const demo of demos) {
    for (const actor of demo.actors) {
      for (const at of actor.route) {
        assert.ok(at.x >= 9 && at.x <= 247 && at.y >= 9 && at.y <= 119, `${demo.sourceId}: actor clipped`);
      }
    }
    for (const effect of demo.effects.filter(effect => effect.kind === 'warning' || effect.kind === 'shield')) {
      assert.ok(effect.at.x - effect.radius >= 0 && effect.at.x + effect.radius <= 256);
      assert.ok(effect.at.y - effect.radius >= 0 && effect.at.y + effect.radius <= 128);
    }
  }
});

test('Channeler healing label remains separate from the ally label', () => {
  const demo = getEnemyMechanicDemo('channeler');
  const ally = demo.actors.find(actor => actor.id === 'ally');
  const heal = demo.effects.find(effect => effect.id === 'heal-label');
  assert.ok(ally && heal);
  assert.ok(Math.abs(heal.at.y - (ally.route[0].y + 20)) >= 12, 'support labels overlap');
});
