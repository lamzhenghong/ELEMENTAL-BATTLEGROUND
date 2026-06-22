import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const testDir = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(testDir, 'App.tsx'), 'utf8');
const cssSource = readFileSync(join(testDir, 'index.css'), 'utf8');
const rootBlock = cssSource.match(/html,\s*[\r\n\s]*body,\s*[\r\n\s]*#root\s*\{[^}]*\}/)?.[0] ?? '';
const menuBlock = cssSource.match(/\.mobile-main-menu-scroll\s*\{[^}]*\}/)?.[0] ?? '';

assert.match(appSource, /mobile-main-menu-scroll/);
assert.match(menuBlock, /touch-action:\s*pan-y;/);
assert.doesNotMatch(menuBlock, /overflow-y:\s*auto;/);
assert.doesNotMatch(menuBlock, /overscroll-behavior-y:\s*contain;/);
assert.doesNotMatch(rootBlock, /touch-action:\s*none;/);
assert.doesNotMatch(rootBlock, /overscroll-behavior:\s*none;/);
assert.match(cssSource, /\.mobile-main-menu-scroll::-webkit-scrollbar\s*\{[\s\S]*display:\s*none;/);
assert.match(menuBlock, /scrollbar-width:\s*none;/);
assert.match(cssSource, /canvas\s*\{[\s\S]*touch-action:\s*none;/);

console.log('mobile main menu scroll rules ok');
