import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

assert.match(appSource, /import CloudAccountModal/);
assert.match(appSource, /import CloudSaveConflictModal/);
assert.match(appSource, /import \{ useCloudAccount \}/);
assert.match(appSource, /normalizeLoadedSaveState/);
assert.match(appSource, /localSaveReady/);
assert.match(appSource, /setLocalSaveReady\(true\)/);
assert.match(appSource, /localSaveExistedAtLaunch/);
assert.match(appSource, /enteredSimulationThisSession/);
assert.match(appSource, /hasLocalProgress:\s*localSaveExistedAtLaunch\s*\|\|\s*enteredSimulationThisSession/);
assert.match(appSource, /const cloudAccount = useCloudAccount/);
assert.match(appSource, /applyCloudBundle/);
assert.match(appSource, /CLOUD ACCOUNT/);
assert.match(appSource, /ACCOUNT & CLOUD SAVE/);
assert.match(appSource, /cloudAccount\.manualSync\(\)/);
assert.match(appSource, /cloudAccount\.user[\s\S]*Sign out before erasing local progress/i);
assert.match(appSource, /CloudAccountModal/);
assert.match(appSource, /CloudSaveConflictModal/);
assert.match(appSource, /cloudAccount\.syncStatus/);

console.log('cloud account App integration contract ok');
