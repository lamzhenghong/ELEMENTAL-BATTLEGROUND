import assert from 'node:assert/strict';
import test from 'node:test';
import { createLocalSaveTracker, getSaveIndicatorPresentation } from './localSaveFeedback';

test('local feedback reports saved only after a real successful storage write', () => {
  const tracker = createLocalSaveTracker();
  const states: string[] = [];
  const unsubscribe = tracker.subscribe(() => states.push(tracker.getSnapshot().status));
  let written = '';
  tracker.write({ setItem: (_key, value) => { written = value; } }, 'save', { mora: 15 });
  assert.equal(written, '{"mora":15}');
  assert.deepEqual(states, ['saving', 'saved']);
  assert.equal(tracker.getSnapshot().revision, 1);
  unsubscribe();
  tracker.write({ setItem: () => {} }, 'save', {});
  assert.equal(states.length, 2, 'unsubscribed UI receives no further updates');
});

test('failed writes remain visible until the failed key itself succeeds', () => {
  const tracker = createLocalSaveTracker();
  assert.throws(() => tracker.write({ setItem: () => { throw new Error('quota'); } }, 'save', {}), /quota/);
  assert.equal(tracker.getSnapshot().status, 'error');
  tracker.write({ setItem: () => {} }, 'history', []);
  assert.equal(tracker.getSnapshot().status, 'error');
  tracker.write({ setItem: () => {} }, 'save', {});
  assert.equal(tracker.getSnapshot().status, 'saved');
});

test('serialization failures never show saved or overwrite stored progress', () => {
  const tracker = createLocalSaveTracker();
  let calls = 0;
  const circular: { self?: unknown } = {};
  circular.self = circular;
  assert.throws(() => tracker.write({ setItem: () => { calls++; } }, 'save', circular));
  assert.equal(calls, 0);
  assert.equal(tracker.getSnapshot().status, 'error');
});

test('play-time writes of an older stored snapshot cannot hide a progress failure', () => {
  const tracker = createLocalSaveTracker();
  assert.throws(() => tracker.write({ setItem: () => { throw new Error('quota'); } }, 'save', { mora: 20 }));
  tracker.write({ setItem: () => {} }, 'save', { mora: 10, playTime: 30 }, { acknowledgesProgress: false });
  assert.equal(tracker.getSnapshot().status, 'error');
  tracker.write({ setItem: () => {} }, 'save', { mora: 20, playTime: 31 });
  assert.equal(tracker.getSnapshot().status, 'saved');
});

test('indicator separates local persistence from cloud status and initial readiness', () => {
  assert.equal(getSaveIndicatorPresentation('idle', 'guest', false).label, 'Loading save');
  assert.equal(getSaveIndicatorPresentation('idle', 'guest', true).label, 'Local autosave ready');
  assert.equal(getSaveIndicatorPresentation('saved', 'guest', true).label, 'Saved on device');
  assert.equal(getSaveIndicatorPresentation('saved', 'saving', true).label, 'Syncing cloud save');
  assert.equal(getSaveIndicatorPresentation('saved', 'offline', true).label, 'Cloud offline');
  assert.equal(getSaveIndicatorPresentation('saved', 'error', true).tone, 'warning');
  assert.equal(getSaveIndicatorPresentation('saved', 'conflict', true).label, 'Choose save version');
  assert.equal(getSaveIndicatorPresentation('error', 'synced', true).label, 'Device save failed');
  assert.equal(getSaveIndicatorPresentation('saved', 'synced', true).label, 'Cloud synced');
});
