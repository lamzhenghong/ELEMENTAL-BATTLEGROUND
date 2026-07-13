import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const componentDir = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(componentDir, '..');
const projectDir = resolve(srcDir, '..');

const readJpegMetadata = (path: string) => {
  const bytes = readFileSync(path);
  assert.equal(bytes.readUInt16BE(0), 0xffd8, `${path} must be a JPEG file.`);

  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const segmentLength = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        width: bytes.readUInt16BE(offset + 7),
        height: bytes.readUInt16BE(offset + 5),
        progressive: marker === 0xc2,
      };
    }

    offset += segmentLength + 2;
  }

  assert.fail(`${path} must contain readable JPEG dimensions.`);
};

const gachaSource = readFileSync(join(componentDir, 'GachaSimulator.tsx'), 'utf8');
assert.match(gachaSource, /interface BannerArtworkLayout/);
assert.match(gachaSource, /const getBannerArtworkLayout = \(/);
for (const id of ['aurelia', 'kaelen', 'maelis', 'veyra', 'standard_banner']) {
  assert.match(gachaSource, new RegExp(`${id}:\\s*\\{`), `${id} must define explicit artwork focal positions.`);
}
assert.match(gachaSource, /type === 'weapon'/);
assert.match(gachaSource, /--banner-position-mobile/);
assert.match(gachaSource, /--banner-position-desktop/);
assert.match(gachaSource, /gacha-banner-art/);
assert.doesNotMatch(gachaSource, /backgroundPosition:\s*'center'/);

const stylesheetSource = readFileSync(join(srcDir, 'index.css'), 'utf8');
assert.match(
  stylesheetSource,
  /\.gacha-banner-art\s*\{[^}]*var\(--banner-position-mobile(?:,|\))/s,
  'Touch-first banner styling must use the mobile focal position by default.',
);
assert.match(
  stylesheetSource,
  /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/,
  'Desktop focal positioning must require fine-pointer input rather than viewport width alone.',
);
assert.match(
  stylesheetSource,
  /\.gacha-banner-art\s*\{[^}]*var\(--banner-position-desktop(?:,|\))/s,
  'Fine-pointer banner styling must use the desktop focal position.',
);

for (const filename of ['standard_banner.jpg', 'weapon_banner.jpg']) {
  const path = join(projectDir, 'assets', filename);
  assert.ok(statSync(path).size <= 350 * 1024, `${filename} must stay at or below 350 KB.`);
  const metadata = readJpegMetadata(path);
  assert.equal(metadata.width, 1600, `${filename} must be 1600 pixels wide.`);
  assert.equal(metadata.height, 900, `${filename} must be 900 pixels tall.`);
  assert.equal(metadata.progressive, true, `${filename} must use progressive JPEG encoding.`);
}

console.log('gacha banner artwork rules ok');
