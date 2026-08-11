import assert from 'node:assert/strict';
import test from 'node:test';
import { CombatHapticManager, HAPTIC_PRESETS, type HapticPreset } from './haptics';

test('haptic presets expose only the five requested combat actions', () => {
  assert.deepEqual(Object.keys(HAPTIC_PRESETS).sort(), [
    'FINAL_HIT',
    'M1_CRITICAL',
    'M1_HIT',
    'PARRY',
    'ULTIMATE_IMPACT',
  ] satisfies HapticPreset[]);
});

test('disabled haptics do not vibrate and stop clears active vibration', () => {
  const calls: Array<number | number[]> = [];
  const manager = new CombatHapticManager({ now: () => 100, vibrate: pattern => { calls.push(pattern); return true; } });
  manager.setEnabled(false);

  assert.equal(manager.trigger('M1_HIT'), false);
  assert.deepEqual(calls, [0]);
  manager.stop();
  assert.deepEqual(calls, [0, 0]);
});

test('rapid M1 pulses merge while a stronger action overrides them', () => {
  let now = 100;
  const calls: Array<number | number[]> = [];
  const manager = new CombatHapticManager({ now: () => now, vibrate: pattern => { calls.push(pattern); return true; } });

  assert.equal(manager.trigger('M1_HIT'), true);
  now = 125;
  assert.equal(manager.trigger('M1_HIT'), false);
  now = 130;
  assert.equal(manager.trigger('PARRY'), true);
  assert.deepEqual(calls, [HAPTIC_PRESETS.M1_HIT.pattern, 0, HAPTIC_PRESETS.PARRY.pattern]);
});

test('weaker hits cannot interrupt ultimate haptics and later hits resume normally', () => {
  let now = 100;
  const calls: Array<number | number[]> = [];
  const manager = new CombatHapticManager({ now: () => now, vibrate: pattern => { calls.push(pattern); return true; } });

  assert.equal(manager.trigger('ULTIMATE_IMPACT'), true);
  now = 140;
  assert.equal(manager.trigger('M1_CRITICAL'), false);
  now = 500;
  assert.equal(manager.trigger('FINAL_HIT'), true);
  assert.deepEqual(calls, [HAPTIC_PRESETS.ULTIMATE_IMPACT.pattern, HAPTIC_PRESETS.FINAL_HIT.pattern]);
});
