import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCriticalHealthBlinkAlpha,
  getReadableDamageTextSize,
  isCriticalPlayerHealth,
} from './combatReadability';

test('critical health begins only for living characters below ten percent HP', () => {
  assert.equal(isCriticalPlayerHealth(9, 100), true);
  assert.equal(isCriticalPlayerHealth(9.99, 100), true);
  assert.equal(isCriticalPlayerHealth(10, 100), false);
  assert.equal(isCriticalPlayerHealth(0, 100), false);
  assert.equal(isCriticalPlayerHealth(20, 0), false);
});

test('critical health blink remains bounded and disappears outside critical health', () => {
  const samples = [0, 250, 500, 750].map(now => getCriticalHealthBlinkAlpha(5, 100, now));
  assert.ok(samples.every(alpha => alpha >= 0.52 && alpha <= 1));
  assert.ok(new Set(samples).size > 1, 'critical health should visibly pulse');
  assert.equal(getCriticalHealthBlinkAlpha(10, 100, 250), 1);
  assert.equal(getCriticalHealthBlinkAlpha(0, 100, 250), 1);
});

test('normal damage text has a readable minimum while dots stay compact', () => {
  assert.equal(getReadableDamageTextSize(14, { isCrit: false, isDot: false }), 18);
  assert.equal(getReadableDamageTextSize(20, { isCrit: false, isDot: false }), 20);
  assert.equal(getReadableDamageTextSize(14, { isCrit: true, isDot: false }), 20);
  assert.equal(getReadableDamageTextSize(18, { isCrit: false, isDot: true }), 11);
});
