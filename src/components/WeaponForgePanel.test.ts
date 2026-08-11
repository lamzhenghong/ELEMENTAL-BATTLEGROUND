import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WeaponForgePanel } from './WeaponForgePanel';
import type { Weapon } from '../types';

const weapon: Weapon = {
  id: 'weapon-test-bow',
  name: 'Solar Wind Bow',
  rarity: 5,
  weaponType: 'Bow',
  baseAtk: 248,
  statBonus: 'Crit Dmg +12%',
  level: 25,
};

const renderPanel = (currentWeapon: Weapon) => renderToStaticMarkup(createElement(WeaponForgePanel, {
  weapon: currentWeapon,
  lowGraphics: true,
  operationVersion: 0,
  onUpgrade: () => false,
}));

const markup = renderPanel(weapon);

assert.match(markup, /data-weapon-forge-panel="weapon-test-bow"/);
assert.match(markup, /data-forge-layout="weapon"/);
assert.match(markup, /Solar Wind Bow/);
assert.match(markup, /Level 25/);
assert.match(markup, /Level 26/);
assert.match(markup, /5,000 Mora/);
assert.match(markup, /Passive/);
assert.match(markup, /Refinement/);
assert.match(markup, /S6/);
assert.match(markup, /Upgrade to Lv\. 26/);
assert.match(markup, /aria-label="Upgrade Solar Wind Bow to level 26"/);

const maxedMarkup = renderPanel({ ...weapon, level: 50 });
assert.match(maxedMarkup, /Max Level/);
assert.match(maxedMarkup, /aria-label="Solar Wind Bow is at maximum level"/);
assert.match(maxedMarkup, /disabled=""/);

console.log('weapon forge panel rendering ok');
