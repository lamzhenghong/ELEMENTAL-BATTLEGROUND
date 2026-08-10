import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_MOBILE_CONTROL_LAYOUT,
  MOBILE_CONTROL_IDS,
  MOBILE_CONTROL_STORAGE_KEY,
  clampMobileControlLayout,
  getMobileControlLayoutErrors,
  loadMobileControlLayout,
  parseMobileControlLayout,
  persistMobileControlLayout,
  toMobileControlPixelRect,
} from './mobileControlLayout';

const metrics = {
  width: 844,
  height: 390,
  safeInsets: { top: 12, right: 16, bottom: 12, left: 16 },
};

test('defines and repairs every mobile combat control placement', () => {
  assert.deepEqual(Object.keys(DEFAULT_MOBILE_CONTROL_LAYOUT).sort(), [...MOBILE_CONTROL_IDS].sort());
  assert.deepEqual(parseMobileControlLayout(null), DEFAULT_MOBILE_CONTROL_LAYOUT);
  assert.deepEqual(parseMobileControlLayout('{bad json'), DEFAULT_MOBILE_CONTROL_LAYOUT);

  const repaired = parseMobileControlLayout(JSON.stringify({
    attack: { x: 2, y: Number.NaN },
    joystick: { x: 0.1, y: 0.75 },
  }));

  assert.deepEqual(repaired.attack, DEFAULT_MOBILE_CONTROL_LAYOUT.attack);
  assert.deepEqual(repaired.joystick, { x: 0.1, y: 0.75 });
  assert.deepEqual(repaired.skill, DEFAULT_MOBILE_CONTROL_LAYOUT.skill);
});

test('clamps controls inside mobile safe areas', () => {
  const clamped = clampMobileControlLayout({
    ...DEFAULT_MOBILE_CONTROL_LAYOUT,
    attack: { x: 1, y: 1 },
    specialUltimate: { x: 0, y: 0 },
  }, metrics);

  assert.deepEqual(getMobileControlLayoutErrors(clamped, metrics), []);

  for (const id of MOBILE_CONTROL_IDS) {
    const rect = toMobileControlPixelRect(id, clamped[id], metrics);
    assert.ok(rect.left >= metrics.safeInsets.left);
    assert.ok(rect.top >= metrics.safeInsets.top);
    assert.ok(rect.right <= metrics.width - metrics.safeInsets.right);
    assert.ok(rect.bottom <= metrics.height - metrics.safeInsets.bottom);
  }
});

test('reports excessive joystick and action overlap', () => {
  const joystickOverlap = {
    ...DEFAULT_MOBILE_CONTROL_LAYOUT,
    joystick: { x: 0.5, y: 0.5 },
    attack: { x: 0.5, y: 0.5 },
  };
  assert.ok(getMobileControlLayoutErrors(joystickOverlap, metrics).includes('joystick-overlap'));

  const actionOverlap = {
    ...DEFAULT_MOBILE_CONTROL_LAYOUT,
    attack: { x: 0.8, y: 0.5 },
    skill: { x: 0.8, y: 0.5 },
  };
  assert.ok(getMobileControlLayoutErrors(actionOverlap, metrics).includes('action-overlap'));
});

test('persists the layout and tolerates unavailable storage', () => {
  const map = new Map<string, string>();
  const storage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
  };

  persistMobileControlLayout(storage, DEFAULT_MOBILE_CONTROL_LAYOUT);
  assert.equal(map.has(MOBILE_CONTROL_STORAGE_KEY), true);
  assert.deepEqual(loadMobileControlLayout(storage), DEFAULT_MOBILE_CONTROL_LAYOUT);

  const unavailableStorage = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
  };
  assert.doesNotThrow(() => persistMobileControlLayout(unavailableStorage, DEFAULT_MOBILE_CONTROL_LAYOUT));
  assert.deepEqual(loadMobileControlLayout(unavailableStorage), DEFAULT_MOBILE_CONTROL_LAYOUT);
});
