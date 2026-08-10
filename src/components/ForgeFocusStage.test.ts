import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ForgeFocusStage } from './ForgeFocusStage';
import type { WeaponType } from '../types';

const source = readFileSync(new URL('./ForgeFocusStage.tsx', import.meta.url), 'utf8');

assert.match(source, /data-forge-focus-stage/);
assert.match(source, /data-forge-operation/);
assert.match(source, /lowGraphics/);
assert.match(source, /reducedMotion/);
assert.match(source, /orbitingNodes/);
assert.match(source, /sourceNodes/);
assert.match(source, /aria-live="polite"/);
assert.match(source, /motion\.div/);
assert.match(source, /operation\.operation !== 'failure'/);
assert.match(source, /Math\.min\(3, profile\.orbitingNodes\)/);
assert.match(source, /operation && reducedMotion && operation\.operation !== 'failure'/);
assert.doesNotMatch(source, /setInterval|requestAnimationFrame/);

const renderWeaponFocus = (weaponType: WeaponType) => renderToStaticMarkup(createElement(ForgeFocusStage, {
  item: {
    kind: 'weapon',
    id: `rendered-${weaponType.toLowerCase()}`,
    name: `${weaponType} render sample`,
    rarity: 4,
    level: 20,
    primaryStat: 'ATK +120',
    weaponType,
  },
  lowGraphics: true,
  reducedMotion: true,
}));

const swordMarkup = renderWeaponFocus('Sword');
const polearmMarkup = renderWeaponFocus('Polearm');
const swordSvg = swordMarkup.match(/<svg[\s\S]*?<\/svg>/)?.[0];
const polearmSvg = polearmMarkup.match(/<svg[\s\S]*?<\/svg>/)?.[0];

assert.ok(swordSvg, 'Sword must render its Lucide silhouette');
assert.equal(polearmSvg, undefined, 'Polearm must not render the Sword SVG');
assert.match(polearmMarkup, /data-forge-polearm-shaft/);
assert.match(polearmMarkup, /data-forge-polearm-tip/);
assert.match(polearmMarkup, /data-forge-polearm-grip/);

console.log('forge focus stage source contracts ok');
