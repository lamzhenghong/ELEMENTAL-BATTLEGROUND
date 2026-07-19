# Cloud Accounts and Cross-Device Saves Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional Supabase email/password accounts and conflict-safe cross-device saves while preserving guest and offline play.

**Architecture:** Keep `App.tsx` as gameplay-state owner, place Supabase access behind a typed repository, and use pure synchronization decisions plus a React coordinator hook. Store one JSON save row per user under strict RLS and retain localStorage as the offline cache.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, `@supabase/supabase-js`, Supabase Auth/Postgres/RLS, Node test runner.

## Global Constraints

- Guest play and all existing local saves must continue working.
- Cloud synchronization must never silently overwrite ambiguous progress.
- Account and conflict UI must fit desktop and mobile viewports.
- Never expose a Supabase service-role or secret key.
- Do not make unrelated combat, economy, audio, or story changes.

---

### Task 1: Cloud Save Model and Decisions

**Files:**
- Create: `src/cloud/cloudSaveModel.ts`
- Test: `src/cloud/cloudSaveModel.test.ts`

**Interfaces:**
- Produces `CloudSaveRecord`, `CloudLocalMetadata`, `CloudSyncDecision`, `decideInitialCloudSync`, and payload guards used by the repository and coordinator.

- [ ] Write tests for upload-local, load-cloud, create-default, and conflict decisions.
- [ ] Run `node --import tsx --test src/cloud/cloudSaveModel.test.ts` and verify the tests fail because the module does not exist.
- [ ] Implement the minimal typed model and decision helpers.
- [ ] Rerun the test and verify it passes.

### Task 2: Supabase Client and Repository

**Files:**
- Create: `src/cloud/supabaseClient.ts`
- Create: `src/cloud/cloudSaveRepository.ts`
- Create: `src/cloud/cloudSaveRepository.test.ts`
- Modify: `.env.example`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes the model from Task 1.
- Produces account methods, cloud fetch/create/update operations, and configuration status.

- [ ] Write repository tests using a fake Supabase query client, including an update that returns no row on revision conflict.
- [ ] Run the focused test and confirm the expected failure.
- [ ] Install the pinned Supabase JS dependency and implement the shared client/repository.
- [ ] Add documented Vite environment names without committing real values.
- [ ] Rerun focused tests.

### Task 3: Account Coordinator

**Files:**
- Create: `src/cloud/useCloudAccount.ts`
- Create: `src/cloud/cloudLocalStorage.ts`
- Test: `src/cloud/cloudLocalStorage.test.ts`

**Interfaces:**
- Consumes repository methods and App snapshot callbacks.
- Produces session, account modal state, sync state, conflict state, sign-in/up/recovery/logout actions, manual sync, and debounced sync scheduling.

- [ ] Write failing tests for metadata persistence, stable device ID generation, malformed storage recovery, and cache writes.
- [ ] Implement storage helpers and verify their tests.
- [ ] Implement the coordinator with auth subscription cleanup, online retry, debounce cleanup, and revision-conflict handling.

### Task 4: Responsive Account UI

**Files:**
- Create: `src/components/CloudAccountModal.tsx`
- Create: `src/components/CloudSaveConflictModal.tsx`
- Create: `src/cloud/cloudAccountUi.test.ts`

**Interfaces:**
- Consumes the coordinator's state/actions.
- Produces fixed, responsive authentication and conflict overlays.

- [ ] Write source/integration assertions for sign-in, registration, recovery, loading, conflict choices, and viewport-fixed mobile layout.
- [ ] Confirm the test fails before components exist.
- [ ] Implement both components using the current game visual language and existing icon library.
- [ ] Rerun the focused test.

### Task 5: App Save Integration

**Files:**
- Modify: `src/App.tsx`
- Create: `src/cloud/cloudAccountIntegration.test.ts`

**Interfaces:**
- Consumes `useCloudAccount`, account modal, and conflict modal.
- Supplies current `SaveState`, pull history, local-save presence, remote snapshot application, and notifications.

- [ ] Write failing App integration assertions.
- [ ] Centralize save normalization so local and cloud snapshots use identical migration/repair logic.
- [ ] Wire automatic and manual cloud sync without changing gameplay update callers.
- [ ] Add Cloud Account entry points to the main menu and Settings.
- [ ] Make reset behavior explicit for signed-in players so it cannot silently erase cloud progress.
- [ ] Rerun focused and existing App tests.

### Task 6: Database Migration and Types

**Files:**
- Create: `supabase/migrations/20260719172056_create_game_saves.sql`
- Create: `src/cloud/database.types.ts`

**Interfaces:**
- Produces the RLS-protected `public.game_saves` Data API contract consumed by the repository.

- [ ] Add idempotent DDL, JSON constraints, explicit grants, and four ownership policies.
- [ ] Apply the SQL to the linked Supabase project and query `information_schema` plus `pg_policies` to verify it.
- [ ] Generate TypeScript database types from the live project and align the client.
- [ ] Run Supabase security and performance advisors and address new findings.

### Task 7: Full Verification and Publication

**Files:**
- Modify only files required by failures discovered during verification.

- [ ] Run every tracked `*.test.ts` with `node --import tsx --test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Verify the production-shaped app at desktop and mobile viewport sizes.
- [ ] Configure Supabase URL and publishable key in local/Vercel environments.
- [ ] Commit the complete change, push it to GitHub, merge/push `main`, and wait for Supabase and Vercel deployment.
- [ ] Verify the production URL, database migration, auth logs, and post-deployment runtime health.
