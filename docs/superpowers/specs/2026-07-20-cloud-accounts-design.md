# Cloud Accounts and Cross-Device Saves Design

## Goal

Add optional Supabase email/password accounts and reliable cross-device cloud saves without removing guest play or the existing local save system.

## Product Contract

- Players may continue as guests with local-only progress.
- The main menu and Settings expose Cloud Account controls.
- Registration supports email confirmation; login supports email/password; password recovery supports choosing a new password; logout returns the player to guest/local mode.
- A remembered Supabase session reconnects and synchronizes automatically on future launches.
- Cloud synchronization covers the persistent `SaveState` and summon history. Device-specific volume, fullscreen, FPS, and in-progress combat state remain local.
- The existing `aetheria_rpg_save_v3` data remains the offline cache and migration source.
- No synchronization decision may silently destroy ambiguous local progress.

## Architecture

The React client uses one shared Supabase client initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. A focused cloud-save repository owns database reads and writes, while pure decision helpers determine whether login should upload local data, download cloud data, or ask the player to resolve a conflict.

`App.tsx` remains the owner of gameplay state. The cloud account hook receives snapshots from `App`, applies a remote snapshot through callbacks, and schedules debounced uploads after normal local saves. This avoids changing the game's many existing state update call sites.

## Database

`public.game_saves` contains one row per authenticated user:

- `user_id uuid` primary key referencing `auth.users(id)` with cascade delete
- `save_data jsonb` containing the persistent `SaveState`
- `pull_history jsonb` containing at most 100 summon records
- `save_version integer` for future migrations
- `revision bigint` for optimistic concurrency
- `updated_at timestamptz` for player-facing sync status
- `last_device_id text` for conflict diagnostics

The public table has RLS enabled. Separate SELECT, INSERT, UPDATE, and DELETE policies require `(select auth.uid()) = user_id`; anonymous access is revoked. UPDATE includes both `USING` and `WITH CHECK`. Authenticated Data API grants are explicit.

## Synchronization Rules

Each browser keeps `aetheria_cloud_meta_v1` with `userId`, `revision`, `updatedAt`, and a stable device ID.

1. No cloud row and a local save exists: create the cloud row from the local save.
2. No cloud row and no local save exists: create a cloud row from the default game state.
3. Cloud row exists and this device has no local save: download cloud data.
4. Cloud row exists and local metadata matches the account/revision: refresh from cloud, then continue autosaving.
5. Cloud row and unrelated or legacy local progress both exist: show a conflict modal with Cloud Save and Device Save choices.
6. An upload whose expected revision no longer matches updates zero rows and becomes a conflict instead of overwriting another device.
7. Offline/network failures retain local progress and retry after the browser returns online.

Cloud Save replaces the local cache with the remote snapshot. Device Save uploads the current local snapshot only after an explicit player choice.

## User Interface

The main menu receives a compact Cloud Account button beneath Start Simulation. Settings receives an Account and Cloud Save panel showing email, sync state, last sync time, manual synchronization, and logout.

The account modal is a responsive fixed overlay with Sign In and Create Account tabs, password recovery, inline validation, disabled loading states, and readable errors. The conflict modal is also fixed to the viewport and cannot render outside mobile screens.

## Failure Handling

- Missing Supabase configuration keeps the game playable as a guest and reports that cloud services are unavailable.
- Auth and database errors use concise in-game messages; passwords are never logged or persisted by the game.
- Email-confirmation signups explain that the player must check their inbox.
- Reset links switch the modal into New Password mode through Supabase's `PASSWORD_RECOVERY` auth event.
- Sign-out flushes a pending save first when online, then clears account metadata without deleting the local cache.

## Security Boundary

RLS prevents players from reading or editing other players' saves. It does not make a fully client-side economy authoritative: a player can still alter their own browser state before upload. Server-authoritative summons, currencies, purchases, and rewards are a separate gameplay-backend project and are not required for cross-device saves.

Only the publishable key is bundled into the Vite client. No service-role or secret key is stored in the repository or Vercel client variables.

## Verification

- Unit tests cover sync decisions, payload validation, revision conflicts, local metadata, and auth error formatting.
- Integration/source tests cover App wiring and responsive account/conflict UI.
- Database verification checks columns, grants, constraints, and all RLS policies.
- Run all tracked Node tests, `npm run lint`, and `npm run build`.
- Verify guest launch, registration UI, mobile layout, production HTTP health, Supabase advisors, and deployment status.

