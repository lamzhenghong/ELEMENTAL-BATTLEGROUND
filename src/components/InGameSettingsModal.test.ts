import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const appSource = readFileSync(
  fileURLToPath(new URL('../App.tsx', import.meta.url)),
  'utf8'
);
const settingsSource = readFileSync(
  fileURLToPath(new URL('./InGameSettingsModal.tsx', import.meta.url)),
  'utf8'
);
const mainMenuSettingsSource = readFileSync(
  fileURLToPath(new URL('./MainMenuSettingsModal.tsx', import.meta.url)),
  'utf8'
);
const statsSource = readFileSync(
  fileURLToPath(new URL('./PlayerStatsModal.tsx', import.meta.url)),
  'utf8'
);

assert.match(appSource, /<InGameSettingsModal/, 'App should render the extracted in-game settings modal');
assert.match(appSource, /<PlayerStatsModal/, 'App should render the extracted player stats modal');
assert.match(settingsSource, /UI_THEME_UNLOCK_LEVEL/, 'Settings should retain UI theme unlock messaging');
assert.match(settingsSource, /UsernameSettingsPanel/, 'Settings should retain cloud profile controls');
assert.match(settingsSource, /SYNC NOW/, 'Settings should retain manual cloud synchronization');
assert.match(settingsSource, /Disable Gameplay Cutscenes/, 'Settings should retain the cutscene preference');
assert.match(settingsSource, /Motion Intensity/, 'In-game settings should expose cinematic camera intensity');
assert.match(mainMenuSettingsSource, /Motion Intensity/, 'Main-menu settings should expose cinematic camera intensity');
assert.match(appSource, /aetheria_pref_motion_intensity/, 'App should persist cinematic camera intensity');
assert.doesNotMatch(settingsSource, /localStorage/, 'Settings persistence should remain owned by App');
assert.match(statsSource, /stats\.map/, 'Player stats should render from App-owned telemetry data');

console.log('in-game settings extraction source contract ok');
