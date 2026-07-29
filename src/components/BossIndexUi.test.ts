import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('./GDDViewer.tsx', import.meta.url)),
  'utf8'
);

assert.match(source, /Switch to Boss/, 'Enemies should provide a Boss view switch');
assert.match(source, /<BossModelPreview/, 'Boss cards should show their live combat model');
assert.match(source, /identity\.mechanic/, 'Boss cards should explain mechanics');
assert.match(source, /identity\.counter/, 'Boss cards should explain counters');
assert.doesNotMatch(
  source,
  /Boss enemies keep their existing boss mechanics and visuals/,
  'The old boss notice should be replaced by the interactive switch'
);

console.log('boss index UI source contract ok');
