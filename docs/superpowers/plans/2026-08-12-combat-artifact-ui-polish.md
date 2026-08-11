# Combat and Artifact UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up Story combat actions, roster artifact management, Forge artifact presentation, and role badges without changing gameplay rules.

**Architecture:** Keep eligibility and artifact calculations untouched. Add one App-owned bulk artifact transaction, one reusable artifact-slot icon component, and presentation-only layout changes in existing shared components.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React, Node test contracts, Vite.

## Global Constraints

- Preserve Special Ultimate level, party, gauge, and cooldown rules.
- Preserve artifact stats, set bonuses, fusion rules, and existing saves.
- Keep mobile combat controls unchanged and maintain responsive Forge layouts.
- Role names remain accessible even though only role icons are visible.

---

### Task 1: Regression Contracts

**Files:**
- Modify: `src/combatSessionPresentationIntegration.test.ts`
- Modify: `src/forgeInformationHierarchy.test.ts`
- Modify: `src/characterRoleUi.test.ts`

**Interfaces:**
- Consumes: existing source-contract test style
- Produces: failing contracts for the requested UI and state boundaries

- [ ] Add assertions for the Story action-row structure and mobile Special Ultimate preservation.
- [ ] Add assertions for the bulk unequip callback, one App save transaction, and reusable slot icons.
- [ ] Add assertions that role labels are accessible but not rendered as visible text.
- [ ] Run the focused tests and confirm the new assertions fail before production edits.

### Task 2: Shared Artifact Slot Icons

**Files:**
- Create: `src/components/artifacts/ArtifactSlotIcon.tsx`
- Modify: `src/components/ForgeFocusStage.tsx`
- Modify: `src/components/InventoryManager.tsx`
- Modify: `src/utils/forgePresentation.ts`

**Interfaces:**
- Consumes: `ArtifactSlot`
- Produces: `ArtifactSlotIcon({ slot, className, strokeWidth })`

- [ ] Implement distinct helmet, gauntlet, greave, and boot symbols.
- [ ] Replace letter abbreviations and the full-body leg silhouette in Forge/roster artifact surfaces.
- [ ] Keep compact and large icon sizing responsive.

### Task 3: Bulk Artifact Unequip

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/InventoryManager.tsx`

**Interfaces:**
- Produces: `onUnequipAllArtifacts(charId: string): void`

- [ ] Add an atomic App handler that clears all selected-character artifact slots and ownership markers.
- [ ] Wire a disabled-aware `Unequip All Artifacts` roster button beside Auto-Equip.
- [ ] Close any open slot selector and show one in-game success/info message.

### Task 4: Combat and Role Presentation

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/components/CharacterRoleBadge.tsx`

**Interfaces:**
- Consumes: existing `renderSpecialUltimateButton` and role metadata
- Produces: desktop Story two-row action layout and icon-only role badges

- [ ] Keep Strike/Parry/Dash/Skill in the primary action row.
- [ ] Put Burst and available Special Ultimate in a right-aligned second row with Special Ultimate to Burst's right.
- [ ] Leave mobile Special Ultimate placement unchanged.
- [ ] Render only the role icon while retaining role `aria-label` and tooltip.

### Task 5: Forge Artifact Layout

**Files:**
- Modify: `src/components/InventoryManager.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: existing focus and action shells
- Produces: stable artifact detail grid on desktop, tablet, and mobile

- [ ] Tighten header/stat/set/action spacing and prevent text overflow.
- [ ] Keep Lock and Salvage side by side when space permits and stacked on narrow screens.
- [ ] Keep Fusion collapsible below the primary actions.
- [ ] Add container-based responsive rules without changing artifact data.

### Task 6: Verification and Release

**Files:**
- Verify all modified production and test files

- [ ] Run focused tests.
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Verify Story combat and Forge/roster layouts in desktop and mobile browser viewports.
- [ ] Commit only task files, push `main`, and verify the Vercel production deployment is Ready.
