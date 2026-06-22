import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const testDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(testDir, 'InventoryManager.tsx'), 'utf8');

assert.match(source, /import\s+\{\s*createPortal\s*\}\s+from\s+['"]react-dom['"]/);
assert.match(source, /createPortal\(\s*salvageConfirmModal\s*,\s*document\.body\s*\)/);
assert.match(source, /z-\[9999\]/);
assert.match(source, /<p className="font-mono text-\[11px\] font-bold uppercase leading-snug text-slate-100 drop-shadow-\[0_1px_2px_rgba\(0,0,0,0\.75\)\] sm:text-xs">/);
assert.doesNotMatch(source, /<p className="font-mono text-\[10px\] uppercase leading-relaxed text-slate-350 sm:text-\[10\.5px\]">/);

console.log('inventory salvage modal portal ok');
