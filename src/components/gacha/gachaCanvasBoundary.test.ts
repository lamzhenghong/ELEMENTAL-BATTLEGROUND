import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const animationUrl = new URL('./GachaCanvasAnimation.tsx', import.meta.url);
const scannerUrl = new URL('./GachaRadarScanner.tsx', import.meta.url);

assert.equal(
  existsSync(fileURLToPath(animationUrl)),
  true,
  'GachaCanvasAnimation must live in its own module.',
);
assert.equal(
  existsSync(fileURLToPath(scannerUrl)),
  true,
  'GachaRadarScanner must live in its own module.',
);

const [animationModule, scannerModule] = await Promise.all([
  import(animationUrl.href),
  import(scannerUrl.href),
]);

assert.equal(typeof animationModule.default, 'function', 'GachaCanvasAnimation must be the default export.');
assert.equal(typeof scannerModule.default, 'function', 'GachaRadarScanner must be the default export.');

const simulatorSource = readFileSync(new URL('../GachaSimulator.tsx', import.meta.url), 'utf8');
assert.match(
  simulatorSource,
  /import GachaCanvasAnimation from ['"]\.\/gacha\/GachaCanvasAnimation['"];/,
);
assert.match(
  simulatorSource,
  /import GachaRadarScanner from ['"]\.\/gacha\/GachaRadarScanner['"];/,
);
assert.doesNotMatch(simulatorSource, /function GachaCanvasAnimation\s*\(/);
assert.doesNotMatch(simulatorSource, /function GachaRadarScanner\s*\(/);

console.log('gacha canvas module boundary ok');
