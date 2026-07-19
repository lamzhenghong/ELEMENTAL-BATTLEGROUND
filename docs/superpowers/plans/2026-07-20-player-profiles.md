# Player Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Supabase account a unique username and generated player ID, then surface that identity in account creation and signed-in cloud UI on desktop and mobile.

**Architecture:** Supabase Auth remains the authentication source, while a new one-to-one `player_profiles` table stores public identity. A database trigger creates profiles transactionally from validated signup metadata, a boolean-only RPC supports friendly username availability checks, and a small typed client adapter keeps profile queries separate from cloud-save synchronization.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Supabase Auth/Postgres/RLS, `@supabase/supabase-js`, Node test runner.

## Global Constraints

- Usernames are required, 3-20 ASCII letters, numbers, or underscores, and unique without regard to letter case.
- PostgreSQL generates immutable globally unique player IDs in `AETH-XXXXXXXXXXXX` format.
- One Auth user owns exactly one profile; one normalized email remains one Supabase Auth account.
- The browser uses only the existing publishable key and may read only the signed-in user's profile.
- Existing Auth users receive a backfilled profile.
- Username editing and friends are not part of this release.
- All UI must remain usable on desktop and mobile.
- Run the complete test, lint, build, live Supabase, GitHub, and Vercel verification flow before completion.

---

### Task 1: Database Identity Contract

**Files:**
- Create: `supabase/migrations/<generated>_create_player_profiles.sql`
- Create: `src/cloud/playerProfileMigration.test.ts`
- Modify: `src/cloud/database.types.ts`

**Interfaces:**
- Produces table row `{ user_id, username, public_id, created_at, updated_at }`.
- Produces RPC `is_username_available(candidate text) -> boolean`.
- Produces signup metadata contract `raw_user_meta_data.username`.

- [ ] **Step 1: Create the migration file with the Supabase CLI**

Run `npx supabase migration new create_player_profiles` and use only the generated filename.

- [ ] **Step 2: Write the failing migration contract test**

Assert that the migration defines the one-to-one Auth foreign key, case-insensitive username index, username and player-ID checks, backfill, signup trigger, explicit grants, RLS owner policy, and boolean-only availability RPC with default `PUBLIC` execution revoked.

- [ ] **Step 3: Run the contract test and verify RED**

Run `node --import tsx --test src/cloud/playerProfileMigration.test.ts` and expect failure because the generated migration is empty.

- [ ] **Step 4: Implement the migration and generated database types**

Create `public.player_profiles`, indexes, validation checks, existing-user backfill, an internal signup trigger function with an empty search path, owner-only RLS, explicit grants, and the exact-candidate availability RPC. Add matching `Database` table and function types.

- [ ] **Step 5: Run the contract test and verify GREEN**

Run `node --import tsx --test src/cloud/playerProfileMigration.test.ts` and expect all assertions to pass.

### Task 2: Username Domain And Supabase Adapter

**Files:**
- Create: `src/cloud/playerProfile.ts`
- Create: `src/cloud/playerProfile.test.ts`
- Create: `src/cloud/supabasePlayerProfileDataSource.ts`
- Create: `src/cloud/supabasePlayerProfileDataSource.test.ts`
- Modify: `src/cloud/cloudAuthValidation.ts`
- Modify: `src/cloud/cloudAuthValidation.test.ts`

**Interfaces:**
- Produces `normalizeUsername(username: string): string`.
- Produces `validateUsername(username: string): string | null`.
- Produces `PlayerProfile` and `PlayerProfileDataSource`.
- Produces `createSupabasePlayerProfileDataSource(client)` with `fetch(userId)` and `isUsernameAvailable(username)`.

- [ ] **Step 1: Write failing domain and adapter tests**

Cover trimming, accepted characters, 3/20 boundaries, rejection messages, row-to-profile mapping, missing-row behavior, and RPC argument/result mapping.

- [ ] **Step 2: Run focused tests and verify RED**

Run `node --import tsx --test src/cloud/playerProfile.test.ts src/cloud/supabasePlayerProfileDataSource.test.ts src/cloud/cloudAuthValidation.test.ts` and expect missing-module or missing-export failures.

- [ ] **Step 3: Implement the minimal domain and adapter code**

Normalize with `trim()`, validate with `/^[A-Za-z0-9_]{3,20}$/`, map snake-case database rows to camel-case profile values, and return clear fetch/RPC failures without exposing unrelated rows.

- [ ] **Step 4: Run focused tests and verify GREEN**

Repeat the focused command and expect all tests to pass.

### Task 3: Profile-Aware Cloud Account Hook

**Files:**
- Modify: `src/cloud/useCloudAccount.ts`
- Modify: `src/cloud/cloudAccountIntegration.test.ts`
- Modify: `src/cloud/cloudAccountCoordinator.test.ts`

**Interfaces:**
- Changes `submitSignUp` to `(username, email, password, confirmation) => Promise<void>`.
- Exposes `profile`, `profileStatus`, and `profileError` from `useCloudAccount`.
- Sends `options.data.username` to Supabase Auth only after availability succeeds.

- [ ] **Step 1: Write failing account-flow contract tests**

Assert username validation precedes signup, exact availability is checked, normalized username is placed in Auth metadata, duplicate username has a specific message, signup confirmation is neutral for duplicate-email obfuscation, profile loads after session resolution, and sign-out clears profile state.

- [ ] **Step 2: Run focused tests and verify RED**

Run `node --import tsx --test src/cloud/cloudAccountIntegration.test.ts src/cloud/cloudAccountCoordinator.test.ts` and expect missing profile/signup behavior assertions to fail.

- [ ] **Step 3: Implement profile lifecycle and signup flow**

Create one profile data source, fetch only the active user's row, guard async state against stale sessions, clear profile data on sign-out, preflight username availability, and attach normalized username metadata to `auth.signUp`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Repeat the focused command and expect all account-flow assertions to pass.

### Task 4: Responsive Account Identity UI

**Files:**
- Modify: `src/components/CloudAccountModal.tsx`
- Modify: `src/App.tsx`
- Modify: `src/cloud/cloudAccountUi.test.ts`

**Interfaces:**
- Adds modal props `username`, `playerId`, and `profileStatus`.
- Changes `onSignUp` to accept username first.
- Main-menu card displays username before email with independent blocks and visible vertical spacing.

- [ ] **Step 1: Write failing UI contract tests**

Assert the signup username field appears before email, signed-in account UI labels Username/Player ID/Email, main-menu account copy renders username before email, and responsive classes prevent horizontal overflow.

- [ ] **Step 2: Run the UI test and verify RED**

Run `node --import tsx --test src/cloud/cloudAccountUi.test.ts` and expect missing username/player-ID UI assertions to fail.

- [ ] **Step 3: Implement the account form and identity presentation**

Add a username field with mobile-friendly text input attributes, pass it to signup, show profile loading/error states without inventing identity, and render the username, player ID, and email in compact wrapping cards on desktop and mobile.

- [ ] **Step 4: Run the UI test and verify GREEN**

Repeat the UI command and expect all assertions to pass.

### Task 5: Live Validation, Regression QA, And Publication

**Files:**
- Modify only files required by defects discovered during verification.

**Interfaces:**
- Consumes the migration, RPC, client adapter, hook, and UI from Tasks 1-4.
- Produces a live verified Supabase release and deployed `main` commit.

- [ ] **Step 1: Run the complete local suite**

Run `$tests = @(rg --files -g '*.test.ts'); node --import tsx --test $tests`, `npm run lint`, and `npm run build`; repair any failures and rerun until clean.

- [ ] **Step 2: Review frontend code and browser behavior**

Apply the React best-practices checklist, launch the Vite server, and verify signup plus signed-in account layouts at desktop and mobile viewport sizes without overflow.

- [ ] **Step 3: Apply and test the Supabase migration**

Apply the committed migration once, run database security/performance advisors, and use temporary accounts to verify normal signup, case-insensitive duplicate rejection, valid generated IDs, duplicate-email non-creation, exact availability responses, profile ownership isolation, and cascade cleanup.

- [ ] **Step 4: Commit and publish**

Commit the implementation on `codex/player-profiles`, push it, merge the verified branch into `main`, and push `main` to GitHub.

- [ ] **Step 5: Verify Vercel production**

Wait for the production deployment tied to the new `main` commit, confirm READY state and HTTP 200, and inspect runtime errors before reporting completion.
