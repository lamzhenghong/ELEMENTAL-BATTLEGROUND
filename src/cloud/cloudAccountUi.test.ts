import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const accountSource = readFileSync(new URL('../components/CloudAccountModal.tsx', import.meta.url), 'utf8');
const conflictSource = readFileSync(new URL('../components/CloudSaveConflictModal.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

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

console.log('cloud account responsive UI contract ok');
