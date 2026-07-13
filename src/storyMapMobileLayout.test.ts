import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const storyMapSource = readFileSync(join(srcDir, 'components', 'StoryMap.tsx'), 'utf8');

assert.match(storyMapSource, /idx === 0 \? 'max\(12%, 78px\)'/);
assert.match(storyMapSource, /idx === 4 \? 'min\(88%, calc\(100% - 62px\)\)'/);
assert.match(storyMapSource, /style=\{\{ left: nodeLeft, top: pos\.top \}\}/);

console.log('story map mobile layout ok');
