import assert from 'node:assert/strict';
import {
  BOSS_PHASE_THRESHOLDS,
  COMBO_MILESTONES,
  NORMAL_WEATHER_ROTATION,
  RARE_WEATHER_DEFINITIONS,
  getBossPhaseEvents,
  getComboMilestone,
  getWeatherDamageMultiplier,
  getWeatherEnergyMultiplier,
  getWeatherRewardMultiplier,
  rollNextWeather,
  shouldResetCombo
} from './combatPolish';

assert.deepEqual(COMBO_MILESTONES, [10, 25, 50, 100]);
assert.equal(getComboMilestone(9), null);
assert.equal(getComboMilestone(10)?.label, '10 HIT COMBO');
assert.equal(getComboMilestone(50)?.shake, 10);
assert.equal(shouldResetCombo(179), false);
assert.equal(shouldResetCombo(180), true);

const seenBossKeys = new Set<string>();
const phase75 = getBossPhaseEvents(0.74, seenBossKeys);
assert.equal(phase75.length, 1);
assert.equal(phase75[0].label, 'BOSS ARMOR CRACKING');
assert.equal(getBossPhaseEvents(0.70, seenBossKeys).length, 0);
assert.equal(getBossPhaseEvents(0.49, seenBossKeys)[0].label, 'BOSS PHASE II');
assert.equal(getBossPhaseEvents(0.24, seenBossKeys)[0].label, 'FINAL PHASE');
assert.equal(getBossPhaseEvents(0.09, seenBossKeys)[0].label, 'FINAL STAND');
assert.equal(BOSS_PHASE_THRESHOLDS.length, 4);

assert.deepEqual(NORMAL_WEATHER_ROTATION, ['Sunny', 'Rain', 'Thunderstorm', 'Snow']);
assert.equal(RARE_WEATHER_DEFINITIONS.length, 5);
assert.equal(rollNextWeather('Sunny', () => 0.99).weather, 'Rain');
assert.equal(rollNextWeather('Rain', () => 0.049).rarity, 'Rare');
assert.equal(rollNextWeather('Thunderstorm', () => 0.001).rarity, 'Legendary');

assert.equal(getWeatherDamageMultiplier('Eclipse', 'ultimate'), 1.2);
assert.equal(getWeatherDamageMultiplier('Sunny', 'skill', 'Pyro'), 1.1);
assert.equal(getWeatherEnergyMultiplier('Aurora'), 1.5);
assert.equal(getWeatherRewardMultiplier('Blood Moon'), 1.2);

console.log('combat polish rules ok');
