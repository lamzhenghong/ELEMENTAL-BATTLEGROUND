import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const projectDir = join(srcDir, '..');
const bgmDir = join(projectDir, 'assets', 'bgm');
const assetsDir = join(projectDir, 'assets');

const bgmFiles = readdirSync(bgmDir)
  .filter((file) => file.toLowerCase().endsWith('.mp3'))
  .sort();
const bgmSource = readFileSync(join(srcDir, 'utils', 'bgm.ts'), 'utf8');
const specialUltimateBgmSource = readFileSync(join(srcDir, 'utils', 'specialUltimateBgm.ts'), 'utf8');
const fileBackedBgmSources = `${bgmSource}\n${specialUltimateBgmSource}`;

assert.equal(bgmFiles.length, 14, 'the game must keep 13 context tracks and one Special Ultimate track');
for (const file of bgmFiles) {
  assert.match(
    fileBackedBgmSources,
    new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    `a file-backed audio player must still reference ${file}`
  );
}

const totalBgmBytes = bgmFiles.reduce(
  (total, file) => total + statSync(join(bgmDir, file)).size,
  0
);
assert.ok(
  totalBgmBytes < 52 * 1024 * 1024,
  `optimized BGM bundle must stay below 52 MiB, received ${(totalBgmBytes / 1024 / 1024).toFixed(2)} MiB`
);

const activeMenuVideo = join(assetsDir, 'main_menu_bg.mp4');
assert.ok(statSync(activeMenuVideo).size < 4.5 * 1024 * 1024, 'main menu video must remain web-sized');

for (const unusedAsset of [
  'kling_20260717_VIDEO_A_10_secon_5739_0.mp4',
  'PixVerse_V6_Transition_540P_A_10second_seamles.mp4'
]) {
  assert.equal(existsSync(join(assetsDir, unusedAsset)), false, `${unusedAsset} must not ship unused`);
}

assert.equal(
  existsSync(join(projectDir, 'scratch', 'loop_video.py')),
  false,
  'the one-off video conversion script must not ship'
);

console.log('media optimization and reference contract ok');
