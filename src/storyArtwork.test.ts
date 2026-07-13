import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StoryBackgroundId } from './data/story';

const srcDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(srcDir, '..');
const artworkDir = join(projectDir, 'assets', 'story');

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

const artworkManifest = [
  ['chapter-1', 'chapter-1-whispering-ruins.jpg'],
  ['chapter-2', 'chapter-2-elemental-frontier.jpg'],
  ['chapter-3', 'chapter-3-aether-gates.jpg'],
  ['chapter-4', 'chapter-4-gloamvault.jpg'],
  ['chapter-5', 'chapter-5-astral-reliquary.jpg'],
  ['chapter-6', 'chapter-6-rimeforge-fault.jpg'],
  ['chapter-7', 'chapter-7-aethelwing-skyroad.jpg'],
  ['chapter-8', 'chapter-8-eldruin-worldforge.jpg'],
  ['chapter-9', 'chapter-9-paradox-verge.jpg'],
  ['chapter-10', 'chapter-10-prime-orbit-core.jpg'],
  ['aurelia-memory', 'aurelia-solaris-relay.jpg'],
  ['kaelen-memory', 'kaelen-stormbound-harbor.jpg'],
  ['maelis-memory', 'maelis-living-archive.jpg'],
  ['veyra-memory', 'veyra-stormglass-observatory.jpg'],
] as const satisfies readonly (readonly [StoryBackgroundId, string])[];

for (const [, filename] of artworkManifest) {
  assert.ok(existsSync(join(artworkDir, filename)), `${filename} must exist.`);
}

const artworkFiles = artworkManifest.map(([, filename]) => join(artworkDir, filename));
const totalBytes = artworkFiles.reduce((sum, path) => sum + statSync(path).size, 0);
for (const path of artworkFiles) {
  assert.ok(statSync(path).size <= 350 * 1024, `${path} must stay at or below 350 KB.`);
  const metadata = readJpegMetadata(path);
  assert.equal(metadata.width, 1600, `${path} must stay 1600 pixels wide.`);
  assert.equal(metadata.height, 900, `${path} must stay 900 pixels tall.`);
  assert.equal(metadata.progressive, true, `${path} must use progressive JPEG encoding.`);
}
assert.ok(totalBytes <= 3.5 * 1024 * 1024, 'The complete story artwork set must stay at or below 3.5 MB.');

const artworkModule = await import('./data/story/artwork').catch(() => undefined);
assert.ok(artworkModule, 'Story artwork metadata must exist.');

for (const [backgroundId, filename] of artworkManifest) {
  const artwork = artworkModule.getStoryArtwork(backgroundId);
  assert.ok(artwork.src.endsWith(filename), `${backgroundId} must resolve to ${filename}.`);
  assert.ok(artwork.desktopPosition.length > 0);
  assert.ok(artwork.mobilePosition.length > 0);
}

const storyModule = await import('./data/story');
for (const chapter of [1, 2, 3] as const) {
  for (const stage of [1, 2, 3, 4, 5] as const) {
    for (const phase of ['before', 'after'] as const) {
      assert.equal(
        storyModule.getStoryScene(`${chapter}-${stage}`, phase).backgroundId,
        `chapter-${chapter}`,
        `Chapter ${chapter} stage ${stage} ${phase} scene must use its illustrated environment.`,
      );
    }
  }
}

const cutsceneSource = readFileSync(join(srcDir, 'components', 'StoryCutscene.tsx'), 'utf8');
assert.match(cutsceneSource, /getStoryArtwork\(scene\.backgroundId\)/);
assert.match(cutsceneSource, /<img/);
assert.match(cutsceneSource, /story-cutscene-artwork/);
assert.match(cutsceneSource, /--story-mobile-position/);
assert.doesNotMatch(
  cutsceneSource,
  /style=\{\{\s*objectPosition:/,
  'An inline objectPosition must not override the responsive desktop artwork position.',
);
assert.match(cutsceneSource, /onError=/);
assert.match(cutsceneSource, /hasArtwork/);
assert.match(cutsceneSource, /defaultBg/, 'The existing gradient must remain as an image fallback.');
assert.match(cutsceneSource, /aria-hidden="true"/);

const stylesheetSource = readFileSync(join(srcDir, 'index.css'), 'utf8');
assert.match(stylesheetSource, /\.story-cutscene-artwork\s*\{[^}]*var\(--story-mobile-position\)/s);
assert.match(
  stylesheetSource,
  /@media\s*\(min-width:\s*768px\)\s*and\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/,
  'Desktop artwork positioning must require a desktop-like fine pointer, not width alone.',
);
assert.match(stylesheetSource, /\.story-cutscene-artwork\s*\{[^}]*var\(--story-desktop-position\)/s);

const storyModeSource = readFileSync(join(srcDir, 'components', 'StoryMode.tsx'), 'utf8');
assert.ok(
  [...storyModeSource.matchAll(/backgroundId:\s*authoredScene\.backgroundId/g)].length >= 2,
  'Pre-battle campaign and character-story dialogue fallbacks must preserve backgroundId.',
);

const appSource = readFileSync(join(srcDir, 'App.tsx'), 'utf8');
assert.ok(
  [...appSource.matchAll(/backgroundId:\s*authoredScene\.backgroundId/g)].length >= 2,
  'Post-battle campaign and character-story dialogue fallbacks must preserve backgroundId.',
);

console.log('story artwork integrity ok');
