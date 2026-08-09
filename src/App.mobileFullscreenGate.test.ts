import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const testDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(testDir, 'App.tsx'), 'utf8');
const viteConfig = readFileSync(join(testDir, '..', 'vite.config.ts'), 'utf8');

assert.match(source, /mobileFullscreenGateOpen/);
assert.match(source, /PLAY IN FULL SCREEN/);
assert.match(source, /isMobile\s*&&\s*mobileFullscreenGateOpen/);
assert.match(source, /if\s*\(\s*isMobile\s*&&\s*mobileFullscreenGateOpen\s*\)\s*{\s*return;\s*}/);
assert.match(source, /document\.documentElement\.requestFullscreen\(\)/);
assert.match(source, /screen\.orientation/);
assert.match(source, /await orientation\.lock\('landscape'\);\s*return isLandscapeViewport\(\);/);
assert.match(source, /Rotate your device to landscape/i);
assert.match(source, /URLSearchParams\(window\.location\.search\)\.has\('mobileGate'\)/);
assert.doesNotMatch(source, /PLAY IN FULL SCREEN FOR BEST EXPERIENCE/);
assert.match(viteConfig, /orientation:\s*'landscape'/);

console.log('app mobile fullscreen gate ok');
