# Username Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add copyable player identity fields and a secure, once-per-24-hours username change flow in Settings.

**Architecture:** Supabase owns username uniqueness, profile ownership, and cooldown enforcement through a restricted RPC. The React hook performs fast client validation and exposes mutation state, while focused UI components render copy and rename controls on desktop and mobile.

**Tech Stack:** PostgreSQL/Supabase Auth and RPC, React 19, TypeScript, Tailwind CSS, Node test runner with tsx.

## Global Constraints

- Username format remains 3-20 ASCII letters, numbers, or underscores.
- Username uniqueness remains case-insensitive.
- Renames are limited to one successful change per 24 hours.
- Direct client updates to `player_profiles` remain forbidden.
- Controls must be keyboard, mouse, and touch accessible.
- Existing cloud saves and authentication flows must remain unchanged.

---

### Task 1: Cooldown Domain Rules

**Files:**
- Modify: `src/cloud/playerProfile.test.ts`
- Modify: `src/cloud/playerProfile.ts`

**Interfaces:**
- Produces: `USERNAME_CHANGE_COOLDOWN_MS`, `getUsernameChangeAvailableAt(profile)`, `getUsernameChangeRemainingMs(profile, now)`.

- [ ] Add failing assertions for nullable `username_changed_at`, immediate first rename, active cooldown, and expired cooldown.
- [ ] Run `node --import tsx --test src/cloud/playerProfile.test.ts` and confirm the missing API fails.
- [ ] Add the timestamp field, row mapping, and pure cooldown helpers.
- [ ] Rerun the focused test and confirm it passes.

### Task 2: Secure Supabase Rename RPC

**Files:**
- Create: `supabase/migrations/20260719224945_add_username_change_cooldown.sql`
- Create: `src/cloud/usernameChangeMigration.test.ts`
- Modify: `src/cloud/database.types.ts`

**Interfaces:**
- Produces: authenticated RPC `change_username(candidate text)` returning the updated `player_profiles` row.

- [ ] Add a failing migration contract test for the timestamp column, `auth.uid()` ownership check, `FOR UPDATE` lock, 24-hour interval, validation, unique-conflict translation, grants, and no direct table update grant.
- [ ] Run the focused migration test and confirm the empty generated migration fails.
- [ ] Implement a private `SECURITY DEFINER` worker with `search_path = ''` plus a public invoker wrapper granted only to `authenticated`.
- [ ] Update generated-style database types and rerun the focused test.

### Task 3: Profile Data Source and Error Mapping

**Files:**
- Modify: `src/cloud/supabasePlayerProfileDataSource.test.ts`
- Modify: `src/cloud/supabasePlayerProfileDataSource.ts`
- Modify: `src/cloud/cloudAuthValidation.test.ts`
- Modify: `src/cloud/cloudAuthValidation.ts`

**Interfaces:**
- Produces: `PlayerProfileDataSource.changeUsername(username)` and readable taken/cooldown/no-op messages.

- [ ] Add failing tests for the rename RPC call, returned row mapping, and structured PostgREST error objects.
- [ ] Run both focused tests and confirm they fail for missing behavior.
- [ ] Implement the data-source method and safe error-message extraction.
- [ ] Rerun both focused tests and confirm they pass.

### Task 4: Cloud Account Rename State

**Files:**
- Modify: `src/cloud/cloudAccountCoordinator.test.ts`
- Modify: `src/cloud/useCloudAccount.ts`

**Interfaces:**
- Produces: `changeUsername`, `profileMutationStatus`, `profileMutationMessage`, and `profileMutationError`.

- [ ] Add a failing source contract for validation, availability preflight, cooldown guard, RPC call, and immediate profile refresh.
- [ ] Run the focused test and confirm failure.
- [ ] Implement the mutation callback and reset mutation state on session changes/signout.
- [ ] Rerun the focused test and confirm it passes.

### Task 5: Responsive Copy and Settings UI

**Files:**
- Create: `src/components/CopyValueButton.tsx`
- Create: `src/components/UsernameSettingsPanel.tsx`
- Modify: `src/components/CloudAccountModal.tsx`
- Modify: `src/App.tsx`
- Modify: `src/cloud/cloudAccountUi.test.ts`

**Interfaces:**
- Consumes: player profile, cooldown helpers, and cloud-account mutation state.
- Produces: copy actions in Cloud Account and a Settings rename form.

- [ ] Add failing UI contracts for semantic copy buttons, clipboard fallback, player ID display, rename input, cooldown copy, and responsive sizing.
- [ ] Run the focused UI test and confirm failure.
- [ ] Implement reusable copy feedback and the focused Settings panel.
- [ ] Wire both signed-in surfaces and rerun the focused UI test.

### Task 6: Live QA and Publication

**Files:**
- Verify all files above.

- [ ] Run all tracked `*.test.ts` files, `npm run lint`, `npm run build`, and `git diff --check`.
- [ ] Apply the migration to Supabase, align its local filename with remote migration history if needed, and regenerate/compare database types.
- [ ] Use disposable profiles to verify successful rename, case-insensitive conflict, cooldown rejection, and anonymous rejection; clean up all QA rows.
- [ ] Run Supabase security and performance advisors.
- [ ] Verify Settings and Cloud Account in desktop and Android landscape browser sessions with no horizontal overflow or console errors.
- [ ] Commit, push the feature branch, fast-forward `main`, push production, and confirm the matching Vercel deployment is `READY`, HTTP 200, and free of runtime errors.
