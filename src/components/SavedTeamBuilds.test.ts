import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const ui = readFileSync(new URL('./SavedTeamBuilds.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./SavedTeamBuilds.css', import.meta.url), 'utf8');

test('build preview uses existing artwork and inspectable artifact slot icons', () => {
  assert.match(ui, /ArtifactSlotIcon/);
  assert.match(ui, /getBannerImage/);
  assert.match(ui, /aria-expanded/);
  assert.match(ui, /team-build-inspect/);
  assert.doesNotMatch(ui, /<span>Current party<\/span>/);
});
test('primary controls stay separate from scrolling equipment', () => {
  assert.match(ui, /team-build-dock/);
  assert.match(css, /\.team-build-dock\s*\{[^}]*flex-shrink:\s*0/);
  assert.match(css, /var\(--font-display/);
  assert.doesNotMatch(css, /font-family:Arial/);
  assert.match(ui, /Rename \$\{build.name\}/);
  assert.match(ui, /preview\.issues\.length/);
});
