import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MainMenu from './components/MainMenu';
import { getUpgradedWeaponStats } from './components/InventoryManager';
import type { Weapon } from './types';

test('Forge displays percentage weapon bonuses in label-value-unit order', () => {
  const weapon: Weapon = {
    id: 'test-weapon',
    name: 'Solar Searing Blade',
    rarity: 5,
    weaponType: 'Sword',
    baseAtk: 48,
    statBonus: 'Crit Rate +10%',
    level: 5
  };

  assert.equal(getUpgradedWeaponStats(weapon).calcStatBonus, 'Crit Rate +11.2%');
});

test('the main menu displays the public v1.0.0 version', () => {
  const html = renderToStaticMarkup(React.createElement(MainMenu, {
    backgroundVideo: '/menu.mp4',
    logo: '/logo.png',
    username: null,
    email: null,
    signedIn: false,
    syncLabel: 'Local',
    bgmEnabled: true,
    onStart: () => undefined,
    onAccount: () => undefined,
    onSettings: () => undefined,
    onCredits: () => undefined,
    onExit: () => undefined,
    onToggleBgm: () => undefined
  }));

  assert.match(html, />V1\.0\.0 Live</);
  assert.doesNotMatch(html, /V1\.2\.0/);
});

test('mobile main menu styles keep the version badge visible', () => {
  const cssSource = readFileSync(new URL('./index.css', import.meta.url), 'utf8');

  assert.doesNotMatch(
    cssSource,
    /\.aether-main-menu__mini-brand span,\s*\.aether-main-menu__header-actions > span,/
  );
});

test('the Quest Log does not render a second quest ledger in the desktop sidebar', () => {
  const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

  assert.match(
    appSource,
    /\{activeScreen !== 'quest' && \(\s*<SquadronQuestLedger[\s\S]*?layout="sidebar"/
  );
});
