# Action-First Forge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Forge into a compact, action-first RPG workshop while preserving all existing progression and inventory behavior.

**Architecture:** Keep the existing `InventoryManager` data flow and callbacks intact. Reorganize its presentation through compact summaries and semantic disclosures, backed by a source-level regression contract that protects labels, controls, and removed decorative copy.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Node assert source contracts, Vite.

## Global Constraints

- Preserve every economy, balance, progression, save-data, equipment, artifact, and fusion rule.
- Keep desktop and mobile controls responsive with no horizontal overflow.
- Keep hidden-scrollbar scrolling behavior and the viewport-fixed salvage modal.
- Keep developer tools available only when `devCheatsEnabled` is true.
- Do not add new artwork or unrelated Forge features.

---

### Task 1: Forge Information Hierarchy Contract

**Files:**
- Create: `src/forgeInformationHierarchy.test.ts`
- Test: `src/forgeInformationHierarchy.test.ts`

**Interfaces:**
- Consumes: `src/components/InventoryManager.tsx` as UTF-8 source.
- Produces: regression assertions for concise labels, disclosures, retained actions, and removed decorative copy.

- [ ] **Step 1: Write the failing source contract**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('./components/InventoryManager.tsx', import.meta.url)),
  'utf8',
);

for (const conciseLabel of ['>Forge<', '>Stats<', '>Weapon<', '>Passive<', '>Ascend<', 'Stat Breakdown', 'Artifact Fusion']) {
  assert.match(source, new RegExp(conciseLabel), `Forge must expose ${conciseLabel}`);
}

for (const removedCopy of ['Ledger signature status', 'MATRIX ONLINE', 'Active combat parameters', 'Ascend Attunement Sphere', 'Attachment Registry', 'Set Bonus Matrix']) {
  assert.doesNotMatch(source, new RegExp(removedCopy, 'i'), `Forge must remove ${removedCopy}`);
}

assert.match(source, /aria-controls="forge-stat-breakdown-panel"/);
assert.match(source, /aria-controls="artifact-fusion-panel"/);
assert.match(source, /Salvage \/ Delete/);
assert.match(source, /onUpgradeWeapon/);
assert.match(source, /onLevelUpCharacter/);
assert.match(source, /onFuseArtifacts/);

console.log('forge information hierarchy contract passed');
```

- [ ] **Step 2: Run the contract and verify it fails**

Run: `npx tsx src/forgeInformationHierarchy.test.ts`

Expected: FAIL because the current Forge still contains verbose terminology and lacks the new disclosures.

- [ ] **Step 3: Commit the failing contract**

```bash
git add src/forgeInformationHierarchy.test.ts
git commit -m "test: define action-first forge hierarchy"
```

### Task 2: Shared Shell And Compact Hero Stats

**Files:**
- Modify: `src/components/InventoryManager.tsx:120-190`
- Modify: `src/components/InventoryManager.tsx:500-1025`
- Modify: `src/components/InventoryManager.tsx:1250-1410`
- Test: `src/forgeInformationHierarchy.test.ts`

**Interfaces:**
- Consumes: existing `activeTab`, filters, selected hero, computed stats, and Forge callbacks.
- Produces: `showStatBreakdown` state and `forge-stat-breakdown-panel` disclosure.

- [ ] **Step 1: Add disclosure state**

```ts
const [showStatBreakdown, setShowStatBreakdown] = useState(false);
```

- [ ] **Step 2: Simplify the shared Forge shell**

Rename the page heading to `Forge`, keep currency balances and tab controls, and delete the decorative ledger-status card. Preserve Filters and Forge Notes semantics.

- [ ] **Step 3: Replace the verbose stat list with a compact grid**

```tsx
<section aria-labelledby="forge-stats-title" className="rounded-xl border border-white/10 bg-black/40 p-4">
  <h4 id="forge-stats-title">Stats</h4>
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {[
      ['ATK', finalAtk],
      ['HP', finalHp],
      ['DEF', finalDef],
      ['CRIT', `${finalCritRate.toFixed(1)}%`],
      ['CRIT DMG', `${finalCritDmg.toFixed(1)}%`],
      ['Cooldown', `-${finalCdReduction.toFixed(0)}%`],
    ].map(([label, value]) => <div key={label}>{label}<strong>{value}</strong></div>)}
  </div>
</section>
```

- [ ] **Step 4: Put formulas behind Stat Breakdown**

Add a semantic button with `aria-expanded={showStatBreakdown}`, `aria-controls="forge-stat-breakdown-panel"`, and a conditionally rendered panel containing the existing ATK, HP, DEF, CRIT, CRIT DMG, and cooldown formulas.

- [ ] **Step 5: Run the focused contracts**

Run: `npx tsx src/forgeInformationHierarchy.test.ts`

Run: `npx tsx src/informationHierarchy.test.ts`

Expected: both PASS after the shared shell and disclosure requirements are met.

- [ ] **Step 6: Commit**

```bash
git add src/components/InventoryManager.tsx src/forgeInformationHierarchy.test.ts
git commit -m "feat: streamline forge hero workspace"
```

### Task 3: Weapon, Ascension, And Artifact Actions

**Files:**
- Modify: `src/components/InventoryManager.tsx:1080-1805`
- Test: `src/forgeInformationHierarchy.test.ts`

**Interfaces:**
- Consumes: existing weapon, ascension, artifact, set, lock, salvage, and fusion logic.
- Produces: `showArtifactFusion` state and `artifact-fusion-panel` disclosure without changing callback arguments.

- [ ] **Step 1: Use concise RPG labels**

Use `Weapon`, `Passive`, `Upgrade`, `Ascend`, `Set Bonus`, and `Equipped`. Keep all underlying values and costs unchanged.

- [ ] **Step 2: Compact Ascension into cost chips and one primary action**

Show current/next level, Mora cost, material cost, remaining material count, and the existing Ascend action. Move the level-band explanation into Forge Notes.

- [ ] **Step 3: Compact artifact status and set bonus**

Show main stat and equipped state as two small summary cells. Rename `Set Bonus Matrix` to `Set Bonus`, retaining both 2-piece and 4-piece descriptions.

- [ ] **Step 4: Collapse Artifact Fusion**

Add `showArtifactFusion` state. Keep a one-line fusion readiness summary visible, then place copy count, costs, blocker reason, and Fuse action in a semantic `artifact-fusion-panel` disclosure.

- [ ] **Step 5: Preserve destructive and progression actions**

Confirm the source still calls `onLockArtifact`, `setSalvageConfirmArtifactId`, `onFuseArtifacts`, `onUpgradeWeapon`, and `onLevelUpCharacter` with their existing arguments.

- [ ] **Step 6: Run focused and foundation contracts**

Run: `npx tsx src/forgeInformationHierarchy.test.ts`

Run: `npx tsx src/components/InventoryManager.salvagePortal.test.ts`

Run: `npx tsx src/foundationIntegrity.test.ts`

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/InventoryManager.tsx src/forgeInformationHierarchy.test.ts
git commit -m "feat: simplify forge upgrade actions"
```

### Task 4: Full Verification And Responsive QA

**Files:**
- Modify only if verification reveals a Forge-specific regression.

**Interfaces:**
- Consumes: completed Forge implementation.
- Produces: verified desktop/mobile release candidate.

- [ ] **Step 1: Run every source contract**

Run every `src/**/*.test.ts` file with `npx tsx`.

Expected: all test files PASS.

- [ ] **Step 2: Run static and production verification**

Run: `npm run lint`

Run: `npm run build`

Expected: both exit 0.

- [ ] **Step 3: Browser-check desktop**

At 1440 by 900, verify all four Forge tabs, Filters, Stat Breakdown, Artifact Fusion, weapon selection, Ascend, lock, and salvage controls. Confirm no horizontal overflow or page errors.

- [ ] **Step 4: Browser-check mobile**

At 390 by 844 and 844 by 390, verify the same controls stack correctly, scroll normally with hidden scrollbars, and keep the salvage modal centered in the viewport.

- [ ] **Step 5: Final commit**

```bash
git add src/components/InventoryManager.tsx src/forgeInformationHierarchy.test.ts
git commit -m "fix: polish responsive forge hierarchy"
```
