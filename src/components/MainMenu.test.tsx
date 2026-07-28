import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const mainMenuUrl = new URL('./MainMenu.tsx', import.meta.url);

assert.ok(existsSync(mainMenuUrl), 'MainMenu component should exist');

const source = readFileSync(mainMenuUrl, 'utf8');

assert.match(source, /Dawning Core/);
assert.match(source, /ELEMENTAL[\s\S]*BATTLEGROUND/);
assert.match(source, /START GAME/);
assert.match(source, /CLOUD ACCOUNT/);
assert.match(source, /Settings/);
assert.match(source, /Credits/);
assert.match(source, /Exit/);
assert.match(source, /BGM/);
assert.doesNotMatch(source, /PLAY IN FULL SCREEN FOR BEST EXPERIENCE/);
assert.doesNotMatch(source, /toggleFullscreen|Maximize2|Minimize2/);

console.log('main menu presentation ok');
