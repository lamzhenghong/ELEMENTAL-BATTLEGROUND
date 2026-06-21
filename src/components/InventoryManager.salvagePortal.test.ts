import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const testDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(testDir, 'InventoryManager.tsx'), 'utf8');

assert.match(source, /import\s+\{\s*createPortal\s*\}\s+from\s+['"]react-dom['"]/);
assert.match(source, /createPortal\(\s*salvageConfirmModal\s*,\s*document\.body\s*\)/);
assert.match(source, /z-\[9999\]/);

console.log('inventory salvage modal portal ok');
