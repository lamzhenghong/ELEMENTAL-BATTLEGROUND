import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'App.tsx'), 'utf8');

assert.match(
  source,
  /const \[devCheatsEnabled, setDevCheatsEnabled\] = useState<boolean>\(false\);/,
  'Developer cheats must start disabled for every fresh game session.',
);

assert.doesNotMatch(
  source,
  /aetheria_pref_dev_cheats/,
  'Developer cheats must not be restored from or persisted to local storage.',
);
