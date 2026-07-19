import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const accountSource = readFileSync(new URL('../components/CloudAccountModal.tsx', import.meta.url), 'utf8');
const conflictSource = readFileSync(new URL('../components/CloudSaveConflictModal.tsx', import.meta.url), 'utf8');

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
assert.match(accountSource, /autoComplete=\{mode === 'sign-in' \? 'current-password' : 'new-password'\}/);
assert.match(accountSource, /autoComplete="new-password"/);
assert.match(accountSource, /disabled=\{submitting\}/);

assert.match(conflictSource, /createPortal/);
assert.match(conflictSource, /fixed inset-0/);
assert.match(conflictSource, /CLOUD SAVE CONFLICT/);
assert.match(conflictSource, /USE CLOUD SAVE/);
assert.match(conflictSource, /USE DEVICE SAVE/);
assert.match(conflictSource, /max-h-\[92dvh\]/);

console.log('cloud account responsive UI contract ok');
