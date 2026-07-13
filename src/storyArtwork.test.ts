import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StoryBackgroundId } from './data/story';

const srcDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(srcDir, '..');
const artworkDir = join(projectDir, 'assets', 'story');

const artworkManifest = [
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
}
assert.ok(totalBytes <= 2.75 * 1024 * 1024, 'The complete story artwork set must stay at or below 2.75 MB.');

const artworkModule = await import('./data/story/artwork').catch(() => undefined);
assert.ok(artworkModule, 'Story artwork metadata must exist.');

for (const [backgroundId, filename] of artworkManifest) {
  const artwork = artworkModule.getStoryArtwork(backgroundId);
  assert.ok(artwork.src.endsWith(filename), `${backgroundId} must resolve to ${filename}.`);
  assert.ok(artwork.desktopPosition.length > 0);
  assert.ok(artwork.mobilePosition.length > 0);
}

const cutsceneSource = readFileSync(join(srcDir, 'components', 'StoryCutscene.tsx'), 'utf8');
assert.match(cutsceneSource, /getStoryArtwork\(scene\.backgroundId\)/);
assert.match(cutsceneSource, /<img/);
assert.match(cutsceneSource, /objectPosition/);
assert.match(cutsceneSource, /onError=/);
assert.match(cutsceneSource, /hasArtwork/);
assert.match(cutsceneSource, /defaultBg/, 'The existing gradient must remain as an image fallback.');
assert.match(cutsceneSource, /aria-hidden="true"/);

console.log('story artwork integrity ok');
