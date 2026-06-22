import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const testDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(testDir, 'GachaSimulator.tsx'), 'utf8');

assert.match(source, /Switch Featured Characters/);
assert.match(source, /\{devCheatsEnabled && \(\s*<button[\s\S]*Switch Featured Characters[\s\S]*<\/button>\s*\)\}/);
assert.match(source, /const nextFeaturedOffset = devFeaturedOffset \+ 1;/);
assert.match(source, /getLimitedCharacterBannerForTime\(Date\.now\(\), nextFeaturedOffset\)/);
assert.doesNotMatch(source, /<Coins className="w-3\.5 h-3\.5 text-amber-400" \/>\s*[\r\n\s]*<span className="text-\[9px\] text-slate-400 font-mono uppercase">GEMS BALANCE:<\/span>/);
assert.match(source, /<Sparkles className="w-3\.5 h-3\.5 text-sky-300" \/>\s*[\r\n\s]*<span className="text-\[9px\] text-slate-400 font-mono uppercase">GEMS BALANCE:<\/span>/);

console.log('gacha limited banner ui ok');
