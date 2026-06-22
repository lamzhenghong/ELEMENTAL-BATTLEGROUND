import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = dirname(fileURLToPath(import.meta.url));
const cssSource = readFileSync(join(testDir, 'index.css'), 'utf8');

const globalHideStart = cssSource.indexOf('/* Hide every scrollbar while preserving scroll behavior. */');

assert.notEqual(globalHideStart, -1, 'global scrollbar hide rules should be present');
assert.ok(
  cssSource.indexOf('.scrollbar-custom-tabs') < globalHideStart,
  'global scrollbar hide rules should override custom scrollbar styles',
);

const globalHideBlock = cssSource.slice(globalHideStart);

assert.match(
  globalHideBlock,
  /\*\s*\{[\s\S]*scrollbar-width:\s*none\s*!important;[\s\S]*-ms-overflow-style:\s*none\s*!important;[\s\S]*\}/,
  'Firefox and legacy Edge scrollbars should be hidden globally',
);
assert.match(
  globalHideBlock,
  /\*::-webkit-scrollbar\s*\{[\s\S]*width:\s*0\s*!important;[\s\S]*height:\s*0\s*!important;[\s\S]*display:\s*none\s*!important;[\s\S]*\}/,
  'WebKit scrollbars should be hidden globally',
);
assert.doesNotMatch(
  globalHideBlock,
  /overflow(?:-[xy])?\s*:\s*hidden/,
  'global scrollbar hiding must not disable scrolling',
);

console.log('global scrollbar hide rules ok');
