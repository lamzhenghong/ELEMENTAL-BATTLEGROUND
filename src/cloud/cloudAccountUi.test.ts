import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const accountSource = readFileSync(new URL('../components/CloudAccountModal.tsx', import.meta.url), 'utf8');
const conflictSource = readFileSync(new URL('../components/CloudSaveConflictModal.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const copyButtonUrl = new URL('../components/CopyValueButton.tsx', import.meta.url);
const usernameSettingsUrl = new URL('../components/UsernameSettingsPanel.tsx', import.meta.url);

assert.ok(existsSync(copyButtonUrl), 'CopyValueButton component should exist');
assert.ok(existsSync(usernameSettingsUrl), 'UsernameSettingsPanel component should exist');
const copyButtonSource = readFileSync(copyButtonUrl, 'utf8');
const usernameSettingsSource = readFileSync(usernameSettingsUrl, 'utf8');

assert.match(accountSource, /createPortal/);
assert.match(accountSource, /fixed inset-0/);
assert.match(accountSource, /max-h-\[92dvh\]/);
assert.match(accountSource, /overflow-y-auto/);
assert.match(accountSource, /SIGN IN/);
assert.match(accountSource, /CREATE ACCOUNT/);
assert.match(accountSource, /FORGOT PASSWORD/);
assert.match(accountSource, /FORGOT PASSWORD\? RESET HERE/);
assert.match(accountSource, /RESET PASSWORD/);
assert.match(accountSource, /SEND RESET LINK/);
assert.match(accountSource, /NEW PASSWORD/);
assert.match(accountSource, /SAVE NEW PASSWORD/);
assert.match(accountSource, /BACK TO SIGN IN/);
assert.match(accountSource, /autoComplete="email"/);
assert.match(accountSource, /autoComplete="username"/);
assert.match(accountSource, /inputMode="text"/);
assert.match(accountSource, /pattern="\[A-Za-z0-9_\]\{3,20\}"/);
assert.match(accountSource, /onSignUp\(usernameInput, email, password, confirmation\)/);
assert.match(accountSource, />Username</);
assert.match(accountSource, />Player ID</);
assert.match(accountSource, />Email</);
assert.match(accountSource, /profileStatus === 'loading'/);
assert.match(accountSource, /profileError/);
assert.match(accountSource, /break-all/);
assert.match(accountSource, /CopyValueButton/);
assert.match(accountSource, /label="Copy username"/);
assert.match(accountSource, /label="Copy player ID"/);
assert.match(accountSource, /autoComplete=\{mode === 'sign-in' \? 'current-password' : 'new-password'\}/);
assert.match(accountSource, /autoComplete="new-password"/);
assert.match(accountSource, /disabled=\{submitting\}/);

assert.match(conflictSource, /createPortal/);
assert.match(conflictSource, /fixed inset-0/);
assert.match(conflictSource, /CLOUD SAVE CONFLICT/);
assert.match(conflictSource, /USE CLOUD SAVE/);
assert.match(conflictSource, /USE DEVICE SAVE/);
assert.match(conflictSource, /max-h-\[92dvh\]/);

assert.match(appSource, /username=\{cloudAccount\.profile\?\.username \?\? null\}/);
assert.match(appSource, /playerId=\{cloudAccount\.profile\?\.publicId \?\? null\}/);
assert.match(appSource, /profileStatus=\{cloudAccount\.profileStatus\}/);
assert.match(
  appSource,
  /CLOUD ACCOUNT<\/span>[\s\S]*cloudAccount\.profile\?\.username[\s\S]*cloudAccount\.user\?\.email/
);
assert.match(appSource, /UsernameSettingsPanel/);
assert.match(appSource, /onChangeUsername=\{cloudAccount\.changeUsername\}/);
assert.match(appSource, /mutationStatus=\{cloudAccount\.profileMutationStatus\}/);

assert.match(copyButtonSource, /navigator\.clipboard\.writeText/);
assert.match(copyButtonSource, /document\.execCommand\('copy'\)/);
assert.match(copyButtonSource, /type="button"/);
assert.match(copyButtonSource, /aria-label=\{label\}/);
assert.match(copyButtonSource, /min-h-10/);
assert.match(copyButtonSource, /COPIED/);

assert.match(usernameSettingsSource, /getUsernameChangeRemainingMs/);
assert.match(usernameSettingsSource, /getUsernameChangeAvailableAt/);
assert.match(usernameSettingsSource, /CopyValueButton/);
assert.match(usernameSettingsSource, /autoComplete="username"/);
assert.match(usernameSettingsSource, /pattern="\[A-Za-z0-9_\]\{3,20\}"/);
assert.match(usernameSettingsSource, /CHANGE USERNAME/);
assert.match(usernameSettingsSource, /24 hours/);
assert.match(usernameSettingsSource, /grid-cols-1[\s\S]*sm:grid-cols/);

console.log('cloud account responsive UI contract ok');
