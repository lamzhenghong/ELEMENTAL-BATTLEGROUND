# Forge Layout and Armaments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver clean responsive Artifact and weapon-upgrade layouts and make every owned Armament selectable, viewable, and upgradeable.

**Architecture:** Extract the duplicated weapon presentation into a focused `WeaponForgePanel` and let `InventoryManager` own selection and transactions. Simplify `ForgeFocusStage` and its CSS so the outer responsive grid, rather than a nested grid, controls layout.

**Tech Stack:** React, TypeScript, Tailwind CSS, Motion, Lucide, Vite

## Global Constraints

- Preserve existing artifact lock, salvage, fusion, equipment ownership, currency, and upgrade behavior.
- Work on desktop, tablet, and mobile landscape without horizontal overflow.
- Preserve low-graphics and reduced-motion behavior.
- Do not change BGM, game content, or unrelated systems.

---

### Task 1: Shared Weapon Forge Panel

**Files:**
- Create: `src/components/WeaponForgePanel.tsx`
- Create: `src/components/WeaponForgePanel.test.ts`
- Modify: `src/components/InventoryManager.tsx`

**Interfaces:**
- Consumes: `Weapon`, `ForgeOperationEvent`, `ForgeOperationResult`, `onUpgradeWeapon`, `lowGraphics`.
- Produces: `WeaponForgePanel` with `weapon`, `operation`, `operationVersion`, `lowGraphics`, and `onUpgrade` props.

- [ ] **Step 1: Write the failing component contract**

Assert that the component renders weapon identity, level progression, stat bonus, passive, refinement, cost, and an accessible upgrade button using the real weapon stat calculator.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx tsx src/components/WeaponForgePanel.test.ts`

Expected: FAIL because `WeaponForgePanel.tsx` does not exist.

- [ ] **Step 3: Implement the shared panel**

Build the panel around `ForgeFocusStage` and `getUpgradedWeaponStats`, with a full-width upgrade action and a disabled max-level state.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx tsx src/components/WeaponForgePanel.test.ts`

Expected: PASS.

### Task 2: Armament Selection and Upgrade Flow

**Files:**
- Modify: `src/components/InventoryManager.tsx`
- Modify: `src/forgeInformationHierarchy.test.ts`

**Interfaces:**
- Consumes: `WeaponForgePanel`, `inventoryWeapons`, and existing `presentForgeResult`.
- Produces: independent `selectedWeaponId` and `armamentSearchQuery` state plus selectable weapon rows.

- [ ] **Step 1: Write the failing Armaments contracts**

Require a selected weapon state, Armament search field, selected row marker, an Armaments detail branch, and `WeaponForgePanel` wired to `presentForgeResult(onUpgradeWeapon?.(...))`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx tsx src/forgeInformationHierarchy.test.ts`

Expected: FAIL because Armaments currently has no detail or upgrade flow.

- [ ] **Step 3: Implement selection and shared rendering**

Make every filtered weapon row selectable, keep a valid selection as inventory changes, and render `WeaponForgePanel` for both Armaments and the Roster-equipped weapon.

- [ ] **Step 4: Run targeted tests**

Run: `npx tsx src/forgeInformationHierarchy.test.ts && npx tsx src/components/WeaponForgePanel.test.ts`

Expected: PASS.

### Task 3: Responsive Artifact and Focus Layout

**Files:**
- Modify: `src/components/ForgeFocusStage.tsx`
- Modify: `src/components/ForgeFocusStage.test.ts`
- Modify: `src/components/InventoryManager.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: existing Forge visual and animation event types.
- Produces: one-column focus stage and wrapping-safe Artifact detail/actions.

- [ ] **Step 1: Write failing responsive contracts**

Require a single-column focus stage, responsive Forge columns beginning at `1024px`, wrapping-safe artifact status, and a two-button action grid that stacks on narrow screens.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx tsx src/components/ForgeFocusStage.test.ts && npx tsx src/forgeInformationHierarchy.test.ts`

Expected: FAIL against the old nested grid and artifact flex actions.

- [ ] **Step 3: Implement the responsive cleanup**

Center the focus silhouette and compact item metadata, update the Forge CSS breakpoints and sizing, and harden Artifact cards and actions against long text.

- [ ] **Step 4: Verify and publish**

Run the targeted tests, full source test sweep, `npm run lint`, `npm run build`, desktop/mobile browser checks, then commit, merge to `main`, push GitHub, and verify Vercel `READY`.
