import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));
const storyModeSource = readFileSync(join(srcDir, 'components', 'StoryMode.tsx'), 'utf8');

assert.match(storyModeSource, /chapterStripRef/);
assert.match(storyModeSource, /chapterCardRefs/);
assert.match(storyModeSource, /role="region"/);
assert.match(storyModeSource, /aria-label="Campaign chapters"/);
assert.match(storyModeSource, /tabIndex=\{0\}/);
assert.match(storyModeSource, /overflow-x-auto/);
assert.match(storyModeSource, /scrollbar-none/);
assert.match(storyModeSource, /overscroll-x-contain/);
assert.match(storyModeSource, /snap-x/);
assert.match(storyModeSource, /snap-mandatory/);
assert.match(storyModeSource, /w-\[250px\]/);
assert.match(storyModeSource, /sm:w-\[260px\]/);
assert.match(storyModeSource, /shrink-0/);
assert.match(storyModeSource, /snap-center/);
assert.match(storyModeSource, /<button/);
assert.match(storyModeSource, /aria-pressed=\{active\}/);
assert.match(storyModeSource, /disabled=\{!unlocked\}/);
assert.match(storyModeSource, /String\(chap\.id\)\.padStart\(2, '0'\)/);
assert.match(
  storyModeSource,
  /chapterStrip\.scrollTo\(\{\s*left:\s*targetLeft,\s*behavior:\s*'smooth'\s*\}\)/,
);
assert.doesNotMatch(storyModeSource, /scrollIntoView\(/);

const wheelHandlerStart = storyModeSource.indexOf('const handleChapterStripWheel');
assert.notEqual(wheelHandlerStart, -1);
const wheelHandlerEnd = storyModeSource.indexOf('\n  };', wheelHandlerStart);
const wheelHandler = storyModeSource.slice(wheelHandlerStart, wheelHandlerEnd);
assert.match(wheelHandler, /Math\.abs\(event\.deltaX\) > Math\.abs\(event\.deltaY\)/);
assert.match(wheelHandler, /event\.shiftKey/);
assert.match(wheelHandler, /canMove/);
assert.match(wheelHandler, /event\.preventDefault\(\)/);
assert.match(wheelHandler, /scrollLeft/);

console.log('story chapter navigation ok');
