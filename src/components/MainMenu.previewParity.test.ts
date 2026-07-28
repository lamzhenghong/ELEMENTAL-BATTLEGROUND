import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const menuSource = readFileSync(new URL('./MainMenu.tsx', import.meta.url), 'utf8');
const creditsSource = readFileSync(new URL('./MainMenuCreditsModal.tsx', import.meta.url), 'utf8');
const leaveSource = readFileSync(new URL('./MainMenuLeaveModal.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

assert.match(menuSource, /aether-main-menu__start-glint/);
assert.match(cssSource, /\.aether-main-menu__center[\s\S]*width:\s*min\(620px/);
assert.match(cssSource, /\.aether-main-menu__start::before,[\s\S]*\.aether-main-menu__start::after/);
assert.match(cssSource, /@keyframes aether-gold-sigil-open/);
assert.match(cssSource, /@keyframes aether-transition-veil/);
assert.match(appSource, /key="aether-menu-transition"/);
assert.equal(
  appSource.match(/\{menuTransitionOverlay\}/g)?.length,
  1,
  'the transition overlay must stay mounted once across menu and game screen swaps'
);
assert.equal(
  appSource.match(/return withMenuTransition\(/g)?.length,
  2,
  'both menu directions must use the same persistent transition host'
);
assert.match(appSource, /scheduleMenuTransitionStep\(completeStartSimulation,\s*620\)/);
assert.match(appSource, /scheduleMenuTransitionStep\(\(\) => setMenuTransition\(null\),\s*1550\)/);
assert.match(creditsSource, /PROJECT CREDITS/);
assert.match(creditsSource, /lamzhenghong/);
assert.match(leaveSource, /SESSION CONTROL/);
assert.match(leaveSource, /LEAVE[\s\S]*GAME\?/);

console.log('main menu preview parity ok');
