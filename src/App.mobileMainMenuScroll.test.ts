import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const testDir = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(testDir, 'App.tsx'), 'utf8');
const menuSource = readFileSync(join(testDir, 'components', 'MainMenu.tsx'), 'utf8');
const cssSource = readFileSync(join(testDir, 'index.css'), 'utf8');
const rootBlock = cssSource.match(/html,\s*[\r\n\s]*body,\s*[\r\n\s]*#root\s*\{[^}]*\}/)?.[0] ?? '';
const mobileMenuBlock = cssSource.match(
  /@media \(max-width:\s*700px\)\s*\{[\s\S]*?\.aether-main-menu\s*\{[^}]*\}/,
)?.[0] ?? '';

assert.match(appSource, /<MainMenu/);
assert.match(menuSource, /className="aether-main-menu"/);
assert.match(mobileMenuBlock, /overflow-y:\s*auto;/);
assert.doesNotMatch(rootBlock, /touch-action:\s*none;/);
assert.doesNotMatch(rootBlock, /overscroll-behavior:\s*none;/);
assert.match(cssSource, /\.aether-main-menu::-webkit-scrollbar\s*\{[\s\S]*?display:\s*none;/);
assert.match(mobileMenuBlock, /scrollbar-width:\s*none;/);
assert.match(cssSource, /canvas\s*\{[\s\S]*touch-action:\s*none;/);

console.log('mobile main menu scroll rules ok');
