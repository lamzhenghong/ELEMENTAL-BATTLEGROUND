import assert from 'node:assert/strict';
import test from 'node:test';
import * as telegraphs from './combatTelegraphs';

test('countdown borders advance linearly and finish at the actual impact, not before', () => {
  assert.equal(typeof telegraphs.getCountdownTelegraphProgress, 'function');
  for (const duration of [18, 24, 35, 40, 45, 48, 50, 58, 60, 62]) {
    assert.equal(telegraphs.getCountdownTelegraphProgress(duration, duration), 0);
    assert.equal(telegraphs.getCountdownTelegraphProgress(duration / 2, duration), 0.5);
    assert.ok(telegraphs.getCountdownTelegraphProgress(0.001, duration) < 1);
    assert.equal(telegraphs.getCountdownTelegraphProgress(0, duration), 1);
    assert.equal(telegraphs.getCountdownTelegraphProgress(-3, duration), 1);
  }
});

test('generic borders cover the visible 60-to-115 window, not the 120-frame reset', () => {
  assert.equal(typeof telegraphs.getGenericTelegraphProgress, 'function');
  assert.equal(telegraphs.getGenericTelegraphProgress(60, true, 59), null);
  assert.equal(telegraphs.getGenericTelegraphProgress(61, true, 60), 1 / 55);
  assert.equal(telegraphs.getGenericTelegraphProgress(87.5, true, 87), 0.5);
  assert.ok(telegraphs.getGenericTelegraphProgress(114.999, true, 114)! < 1);
  assert.equal(telegraphs.getGenericTelegraphProgress(115, true, 114), 1);
  assert.equal(telegraphs.getGenericTelegraphProgress(116, true, 113), 1);
  assert.equal(telegraphs.getGenericTelegraphProgress(116, true, 115), null);
  assert.equal(telegraphs.getGenericTelegraphProgress(0, true, 119), null);
});

test('disabled, stunned and dead enemy gates do not create generic cues from stale timers', () => {
  assert.equal(typeof telegraphs.getGenericTelegraphProgress, 'function');
  assert.equal(telegraphs.getGenericTelegraphProgress(108, false, 107), null);
  assert.equal(telegraphs.getGenericTelegraphProgress(115, false, 114), null);
});

test('progress uses remaining simulation time even when a frame skips across impact', () => {
  assert.equal(typeof telegraphs.getCountdownTelegraphProgress, 'function');
  const samples = [50, 37.5, 22, 0.5, -2.5].map(remaining =>
    telegraphs.getCountdownTelegraphProgress(remaining, 50));
  assert.deepEqual(samples, [0, 0.25, 0.56, 0.99, 1]);
});

test('malformed durations and timers never produce invalid canvas paths', () => {
  assert.equal(typeof telegraphs.getCountdownTelegraphProgress, 'function');
  for (const duration of [undefined, 0, -10, NaN, Infinity]) {
    assert.equal(telegraphs.getCountdownTelegraphProgress(10, duration), 0);
  }
  assert.equal(telegraphs.getCountdownTelegraphProgress(NaN, 50), 0);
  assert.equal(telegraphs.getCountdownTelegraphProgress(70, 50), 0);
});

test('Stalker uses its captured initial strike duration and shows completion only on impact', () => {
  assert.equal(typeof telegraphs.getStalkerTelegraphProgress, 'function');
  for (const duration of [18, 24, 33]) {
    assert.equal(telegraphs.getStalkerTelegraphProgress(duration, duration, false), 0);
    assert.equal(telegraphs.getStalkerTelegraphProgress(duration / 2, duration, false), 0.5);
    assert.equal(telegraphs.getStalkerTelegraphProgress(0, duration, true), 1);
    assert.equal(telegraphs.getStalkerTelegraphProgress(0, duration, false), null);
  }
});

test('counter symbols reflect the actual damage route, including environmental parries', () => {
  assert.equal(typeof telegraphs.getWarningCounterCue, 'function');
  for (const type of [
    'generic_enemy', 'stalker_strike', 'meteor_warning', 'lightning_strike_warning',
    'archetype_artillery_warning', 'archetype_mimic_warning',
    'campaign_boss_warning', 'weather_lightning',
  ]) {
    assert.equal(telegraphs.getWarningCounterCue(type, 'player-hit'), 'parry');
    assert.equal(telegraphs.getWarningCounterCue(type, 'direct-damage'), 'evade');
  }
  assert.equal(telegraphs.getWarningCounterCue('fire_patch', 'player-hit'), null);
  assert.equal(telegraphs.getWarningCounterCue('campaign_boss_patch', 'player-hit'), null);
  assert.equal(telegraphs.getWarningCounterCue('fireball', 'player-hit'), null);
});
