import assert from 'node:assert/strict';
import {
  UI_THEME_UNLOCK_LEVEL,
  getAvailableUiThemes,
  isUiThemeUnlocked,
  normalizeUiTheme
} from './uiThemes';

assert.equal(UI_THEME_UNLOCK_LEVEL, 20);

assert.deepEqual(
  getAvailableUiThemes(1).map(theme => theme.id),
  ['Blue']
);

assert.deepEqual(
  getAvailableUiThemes(20).map(theme => theme.id),
  ['Blue', 'Crimson', 'Emerald', 'Gold', 'Void']
);

assert.equal(isUiThemeUnlocked('Crimson', 19), false);
assert.equal(isUiThemeUnlocked('Crimson', 20), true);
assert.equal(isUiThemeUnlocked('Blue', 1), true);

assert.equal(normalizeUiTheme('Void', 20), 'Void');
assert.equal(normalizeUiTheme('Void', 19), 'Blue');
assert.equal(normalizeUiTheme('Unknown', 80), 'Blue');
assert.equal(normalizeUiTheme(undefined, 80), 'Blue');

console.log('ui theme rules ok');
