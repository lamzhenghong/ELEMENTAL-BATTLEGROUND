# Username Management Design

## Goal

Let signed-in players copy their username and public player ID, and change their username from Settings no more than once every 24 hours.

## Profile Data

- Add nullable `username_changed_at` to `public.player_profiles`.
- A null timestamp means the account has not used the rename feature and may rename immediately.
- A successful rename sets `username_changed_at` and `updated_at` to the database clock.
- The existing case-insensitive unique index remains the final authority for username ownership.

## Rename API

- Add an authenticated `change_username(candidate text)` RPC.
- Keep privileged update logic in the non-exposed `private` schema and expose a least-privilege public wrapper.
- The private function must validate `auth.uid()`, lock the caller's profile row, validate the exact username format, reject case-insensitive no-op changes, enforce the 24-hour cooldown, and translate unique-index conflicts into `username_taken`.
- Anonymous users receive no execute permission. Clients retain no direct insert, update, or delete permission on `player_profiles`.
- The RPC returns the updated profile so the UI refreshes immediately without a second request.

## Client State

- Extend `PlayerProfile` with `usernameChangedAt`.
- Extend the profile data source with `changeUsername(username)`.
- Keep client validation and availability preflight for fast feedback, while treating the RPC as authoritative against races and clock manipulation.
- Expose rename submission, success, and error state from `useCloudAccount`.
- Map structured Supabase error objects as well as native `Error` values so username conflicts and cooldown errors remain understandable.

## Settings UI

- Signed-in players see username, player ID, email, copy actions, a rename input, cooldown availability, and a submit button inside Account & Cloud Save.
- The rename button is disabled while saving, while the profile is unavailable, or during the cooldown.
- Cooldown text shows the next local date and time when renaming becomes available.
- Copy controls provide short success feedback and remain usable with keyboard, mouse, and touch.
- The Cloud Account modal also provides copy buttons beside username and player ID.

## Error Handling

- Taken username: `That username is already in use.`
- Cooldown: `You can change your username once every 24 hours.`
- Same username: `Choose a different username.`
- Invalid format continues using the existing 3-20 character rule.
- Clipboard failures display `Copy failed` without affecting account state.

## Verification

- Unit tests cover cooldown calculations, row mapping, data-source RPC calls, error formatting, and copy/UI contracts.
- Migration tests cover authentication, locking, validation, cooldown enforcement, unique-conflict handling, grants, and absence of direct update grants.
- Live Supabase checks verify first rename, case-insensitive conflict, cooldown rejection, owner-only behavior, and rollback of disposable QA rows.
- Desktop and mobile browser checks confirm readable, scrollable Settings and touch-friendly copy/rename controls.
- Full project tests, TypeScript lint, build, GitHub publication, and Vercel production verification complete the release.
