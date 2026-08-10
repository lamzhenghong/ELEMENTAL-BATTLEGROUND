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
assert.match(appSource, /navigateWithTransition/);
assert.match(appSource, /<AetherCoreTransition/);
assert.equal(appSource.match(/<AetherCoreTransition/g)?.length, 1);
assert.doesNotMatch(appSource, /const \[menuTransition,/);
assert.doesNotMatch(appSource, /setActiveScreen\('story'\); AetheriaAudioEngine\.playClick/);
assert.match(cssSource, /--aether-transition-color/);
assert.match(cssSource, /#050815/);
assert.match(cssSource, /\.aether-transition\s*\{[\s\S]*?z-index:\s*100000/);
assert.match(
  cssSource,
  /\[data-phase="covering"\] \.aether-transition__sigil,\s*\.aether-transition\[data-phase="covered"\] \.aether-transition__sigil/,
);
assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(creditsSource, /PROJECT CREDITS/);
assert.match(creditsSource, /lamzhenghong/);
assert.match(leaveSource, /SESSION CONTROL/);
assert.match(leaveSource, /LEAVE[\s\S]*GAME\?/);

console.log('main menu preview parity ok');
