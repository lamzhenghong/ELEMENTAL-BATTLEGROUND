# Visual-First Information Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the game's information hierarchy so primary gameplay is visual and immediate while all detailed lore, rules, filters, and statistics remain available on demand.

**Architecture:** Add a focused `GameHome` screen and keep existing gameplay screens intact. Introduce local disclosure state inside the screens that own dense secondary information, using semantic buttons and stable panel IDs. No save schema or combat/gacha/progression logic changes are required.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS 4, Motion, Lucide React, Vite 6.

## Global Constraints

- Preserve all existing lore, mechanics, progression, statistics, and rewards.
- Work on desktop, mobile portrait, and mobile landscape.
- Keep existing desktop and mobile combat controls unchanged.
- Do not add dependencies or heavyweight visual effects.
- Keep Wiki, rates, histories, reference sheets, and detailed statistics reachable.
- Continue hiding scrollbars without disabling scrolling.

---

### Task 1: Information Hierarchy Regression Contract

**Files:**
- Create: `src/informationHierarchy.test.ts`

**Interfaces:**
- Consumes: source files for `App`, `GachaSimulator`, `InventoryManager`, `StoryMode`, and `CombatArena`.
- Produces: a source-level regression contract for navigation and disclosure semantics.

- [ ] **Step 1: Write the failing test**

Create a TypeScript test that asserts `home` exists in the active-screen union, `handleStartSimulation` selects it, `GameHome` renders, Wiki navigation follows gameplay navigation, and dense panels expose `aria-expanded` controls named Banner Details, Filters, Loadout Details, Forge Notes, and Combat Controls.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx src/informationHierarchy.test.ts`

Expected: FAIL because the home screen and disclosure controls do not yet exist.

- [ ] **Step 3: Keep the failing output as the implementation contract**

Do not weaken assertions while implementing. Update only if the production interface uses an equivalent accessible label documented in the design.

### Task 2: Gameplay Home And Navigation

**Files:**
- Create: `src/components/GameHome.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `SaveState`, lock flags, existing `setActiveScreen`, quest count, party IDs, and character data.
- Produces: `GameHomeProps` with `onNavigate(screen)`, lock-aware action callbacks, party summary, and quest-ready count.

- [ ] **Step 1: Add the `GameHome` visual action screen**

Build a semantic section containing one dominant Story button and compact cards for Arena, Rogue, Party, Summons, Forge, and Quests. Use existing icons and `main_menu_bg.jpg`; keep copy to one short line per action.

- [ ] **Step 2: Add `home` to the active-screen union**

Change `handleStartSimulation` to `setActiveScreen('home')`, lazy-load `GameHome`, and render it inside the existing screen transition container.

- [ ] **Step 3: Reorder navigation**

Add `dash_screen_home` first, retain gameplay destinations next, and move `dash_screen_wiki` to the final optional-reference position.

- [ ] **Step 4: Run the hierarchy test**

Run: `npx tsx src/informationHierarchy.test.ts`

Expected: navigation assertions pass; remaining disclosure assertions still fail.

### Task 3: Summon And Forge Disclosure

**Files:**
- Modify: `src/components/GachaSimulator.tsx`
- Modify: `src/components/InventoryManager.tsx`

**Interfaces:**
- Produces: local `showBannerDetails`, `showInventoryFilters`, and `showForgeNotes` states with semantic disclosure buttons.

- [ ] **Step 1: Collapse banner probability details**

Keep title, short banner description, pity, weapon target, and summon actions visible. Move the probability up-rate block behind `Banner Details` with `aria-controls="banner-details-panel"`.

- [ ] **Step 2: Collapse forge filters**

Keep the active search available where it is essential. Wrap rarity, element, slot, and set filter groups in `forge-filter-panel`, toggled by a Filters button that reflects active filters.

- [ ] **Step 3: Collapse the forge footer explanation**

Replace the permanent Ultimate metrics paragraph with a `Forge Notes` disclosure.

- [ ] **Step 4: Run focused tests**

Run: `npx tsx src/informationHierarchy.test.ts`

Expected: summon and forge assertions pass.

### Task 4: Party And Story Hierarchy

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/StoryMode.tsx`

**Interfaces:**
- Produces: `showPartyFilters` and `showPartyLoadoutDetails` local states; compact Character Story act metadata.

- [ ] **Step 1: Collapse party filters**

Add a Filters button above the existing element, weapon, and rarity controls. Keep the search field and roster visible.

- [ ] **Step 2: Separate resonance summary from details**

Show active resonance names as compact badges. Put artifact set effects, reference sheets, reaction reference access, and damage-skin selection inside `party-loadout-details-panel` controlled by `Loadout Details`.

- [ ] **Step 3: Compact Character Story act cards**

Replace repeated explanatory paragraphs with encounter-type labels and Mora/Gems reward chips. Preserve act locking and authored dialogue.

- [ ] **Step 4: Run focused and story tests**

Run: `npx tsx src/informationHierarchy.test.ts`

Run: `npx tsx src/characterStoryRules.test.ts`

Expected: both pass.

### Task 5: Combat Controls Disclosure

**Files:**
- Modify: `src/components/CombatArena.tsx`

**Interfaces:**
- Produces: `showDesktopControls` local state and `combat-controls-panel`.

- [ ] **Step 1: Add the desktop controls toggle**

Render a compact Controls button at the existing top-left diagnostics position on desktop only. Give it `aria-expanded` and `aria-controls="combat-controls-panel"`.

- [ ] **Step 2: Gate the existing Diagnostics Matrix**

Render the unchanged hotkey list only while expanded. Do not change mobile controls or any combat input handler.

- [ ] **Step 3: Run combat tests**

Run: `npx tsx src/informationHierarchy.test.ts`

Run: `npx tsx src/combatGameplayRules.test.ts`

Expected: both pass.

### Task 6: Full Verification And Publication

**Files:**
- Review all modified TSX and CSS files.

**Interfaces:**
- Produces: verified production build and deployed `main` commit.

- [ ] **Step 1: Run React best-practices review**

Check semantic controls, hook placement, stable keys, local state ownership, image alt text, and mobile overflow. Fix only issues introduced by this pass.

- [ ] **Step 2: Run all tests**

Run every `src/**/*.test.ts` with `npx tsx` and require all files to pass.

- [ ] **Step 3: Run static verification**

Run: `npm run lint`

Run: `npm run build`

Run: `git diff --check`

Expected: all commands exit 0.

- [ ] **Step 4: Run browser QA**

Verify the home, summons, forge, party, story, and combat controls at 1440x900, 844x390, and 390x844. Require zero page errors and zero horizontal overflow.

- [ ] **Step 5: Publish**

Commit the implementation, push `main`, wait for the matching Vercel production deployment to reach READY, run a live desktop/mobile smoke test, and confirm no recent runtime errors.

