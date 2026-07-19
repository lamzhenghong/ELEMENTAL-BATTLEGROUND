import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./useCloudAccount.ts', import.meta.url), 'utf8');

assert.match(source, /onAuthStateChange/);
assert.match(source, /PASSWORD_RECOVERY/);
assert.match(source, /signUp\(/);
assert.match(source, /signInWithPassword/);
assert.match(source, /resetPasswordForEmail/);
assert.match(source, /updateUser\(\{\s*password/);
assert.match(source, /AUTOSAVE_DELAY_MS\s*=\s*3000/);
assert.match(source, /SAFETY_SYNC_INTERVAL_MS\s*=\s*30000/);
assert.match(source, /addEventListener\(['"]online['"]/);
assert.match(source, /removeEventListener\(['"]online['"]/);
assert.match(source, /clearTimeout/);
assert.match(source, /clearInterval/);
assert.match(source, /CloudRevisionConflictError/);
assert.match(source, /decideInitialCloudSync/);
assert.match(source, /hasLocalProgress/);
assert.doesNotMatch(source, /hasLocalGameSave\(window\.localStorage\)/);

console.log('cloud account coordinator lifecycle contract ok');
