import assert from 'node:assert/strict';
import test from 'node:test';
import { getMenuPresentation, isMenuClickTarget, shouldPlayMenuClick } from './menuPresentation';

test('menus retain unique restrained materials and ambient identity', () => {
  assert.deepEqual(getMenuPresentation('story'), { material: 'stone', ambient: 'none' });
  assert.deepEqual(getMenuPresentation('inventory'), { material: 'metal', ambient: 'forge' });
  assert.deepEqual(getMenuPresentation('wiki'), { material: 'ink', ambient: 'wiki' });
  assert.deepEqual(getMenuPresentation('wish'), { material: 'astral', ambient: 'summons' });
  assert.equal(getMenuPresentation('arena').ambient, 'none');
  assert.equal(getMenuPresentation('dungeon').material, 'none');
});

test('click feedback ignores disabled controls and deduplicates existing click handlers', () => {
  assert.equal(isMenuClickTarget(true, false, null), true);
  assert.equal(isMenuClickTarget(false, false, null), false);
  assert.equal(isMenuClickTarget(true, true, null), false);
  assert.equal(isMenuClickTarget(true, false, 'true'), false);
  assert.equal(shouldPlayMenuClick(100, 90), false);
  assert.equal(shouldPlayMenuClick(160, 90), true);
});
