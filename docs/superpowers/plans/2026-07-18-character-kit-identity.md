# Character Kit Identity And Role System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible roles to every character and data-driven advanced combat kits for Aurelia, Kaelen, Maelis, and Veyra across every existing combat mode.

**Architecture:** Keep `CombatArena` as the single mode integration point. Put deterministic role, reaction, status, party-effect, and kit configuration rules in pure TypeScript modules so Canvas and future Three.js/R3F visuals can consume the same state without duplicating gameplay logic.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Canvas 2D, Node test runner with `tsx`, Tailwind CSS.

## Global Constraints

- Preserve normal Burst, Special Ultimate, Aether Echo, switching, weather, boss AI, artifact, weapon, damage-skin, story, dungeon, desktop, mobile, and PWA behavior.
- M1, DoT, persistent fields, environment, reaction damage, shields, buffs, debuffs, crowd control, and switching never trigger or consume reactions.
- Only eligible direct Skill, Burst, and current Special Ultimate damage may trigger reactions.
- Bosses receive damage but reject new slow, stun, pull, and forced movement.
- Shared shields and fields survive switching, waves, normal Bursts, and Special Ultimate presentation.
- Test-only deterministic controls appear only on `/kit-test`.
- Publish the verified final `main` commit to GitHub and confirm the Vercel production deployment.

---

### Task 1: Character Roles And Central Kit Data

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/characters.ts`
- Create: `src/utils/characterRoles.ts`
- Create: `src/utils/characterKits.ts`
- Test: `src/utils/characterRoles.test.ts`
- Test: `src/utils/characterKits.test.ts`

**Interfaces:**
- Produces: `CharacterRole`, `ROLE_MODIFIERS`, `getRoleLabel`, `applyRoleStatModifiers`, `getRoleAdjustedCooldown`, `LIMITED_CHARACTER_KITS`, `getCharacterKit`.

- [ ] Write failing tests asserting all 32 character ids have the intended role, every limited id has a kit, role modifiers are idempotent calculations, Support cooldown is 0.8x, and the four polished kits expose exact values.
- [ ] Run `node --import tsx --test src/utils/characterRoles.test.ts src/utils/characterKits.test.ts` and confirm failures for missing exports/properties.
- [ ] Add `CharacterRole` and `role` fields, assign all roles in central character data, and implement pure role helpers.
- [ ] Implement typed kit definitions with effect-kind discriminants rather than name checks.
- [ ] Re-run both tests and commit `feat: add character roles and limited kit registry`.

### Task 2: Central Reaction Source Validation

**Files:**
- Create: `src/utils/reactionSources.ts`
- Modify: `src/utils/combatDamage.ts`
- Test: `src/utils/reactionSources.test.ts`

**Interfaces:**
- Produces: `CombatDamageSource`, `ReactionTriggerContext`, `DEFAULT_REACTION_ELIGIBILITY`, `createReactionContext`, `canTriggerElementalReaction`, `getReactionAmplification`.
- Consumes: `getReactionDamageOutcome` remains the existing reaction resolver.

- [ ] Write failing table-driven tests for all source types, non-damaging E/Q rejection, reaction recursion prevention, Special Ultimate eligibility, and exact 2x field amplification without overlap multiplication.
- [ ] Run the focused test and verify expected missing-module failures.
- [ ] Implement the validator and amplification helper without changing existing reaction names or base multipliers.
- [ ] Re-run focused and existing elemental-reaction tests and commit `feat: centralize elemental reaction eligibility`.

### Task 3: Enemy Status Effect Reducer

**Files:**
- Create: `src/utils/combatStatusEffects.ts`
- Test: `src/utils/combatStatusEffects.test.ts`

**Interfaces:**
- Produces: `CombatTargetClass`, `CombatStatusEffect`, `StatusApplicationResult`, `applyCombatStatus`, `tickCombatStatuses`, `getStatusMovementMultiplier`, `getStatusOutgoingDamageMultiplier`, `isTargetStunned`.

- [ ] Write failing tests for Burning refresh and six one-second ticks, reaction-ineligible tick contexts, slow refresh/floor, stun durations, strongest damage-down, boss CC immunity, and expired-effect cleanup.
- [ ] Run the focused test and verify it fails because the reducer does not exist.
- [ ] Implement immutable status application/ticking with same-source refresh and tick-event output.
- [ ] Re-run tests and commit `feat: add reusable enemy status effects`.

### Task 4: Shared Party Effects

**Files:**
- Create: `src/utils/combatPartyEffects.ts`
- Test: `src/utils/combatPartyEffects.test.ts`

**Interfaces:**
- Produces: `CombatPartyEffect`, `CombatPartyEffectState`, `createPartyEffectState`, `addMaelisShield`, `consumePartyShield`, `addReactionField`, `addWhirlpool`, `activateVeyraDominion`, `tickPartyEffects`, `clearPartyEffects`.

- [ ] Write failing tests for 1,000 shield stacking, 3,000 cap, shield damage consumption, switching survival, Special Ultimate survival, field duration, overlap cap, Veyra ATK snapshot, two-second ticks, and idempotent cleanup.
- [ ] Run the focused test and verify expected failures.
- [ ] Implement pure state transitions and event output for timed effects.
- [ ] Re-run tests and commit `feat: add shared combat party effects`.

### Task 5: CombatArena Role And Reaction Integration

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Modify: `src/utils/combatDamage.test.ts` if present, otherwise extend `src/combatGameplayRules.test.ts`

**Interfaces:**
- Consumes: role helpers and reaction contexts from Tasks 1-2.
- Produces: explicit damage contexts for M1, Skill, Burst, Special Ultimate, DoT, fields, environment, and reaction damage.

- [ ] Add failing source-contract assertions proving M1 uses `normal-attack`, Skill uses `elemental-skill`, Burst uses `elemental-burst`, and Special Ultimate uses `special-ultimate`.
- [ ] Run the focused regression test and verify it fails on current source strings.
- [ ] Apply role stat modifiers once during combat-party construction and role cooldowns during Skill casts.
- [ ] Refactor `applySkillDamage` to accept an explicit reaction context; prevent ineligible aura application and reaction recursion while preserving existing reaction effects.
- [ ] Run all combat, reaction, Echo, weather, and Special Ultimate tests and commit `refactor: route combat damage through reaction contexts`.

### Task 6: Limited Character M1 And Skill Effects

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Test: `src/limitedCharacterCombat.test.ts`

**Interfaces:**
- Consumes: kit registry, status reducer, party effects, reaction contexts.

- [ ] Write failing tests/source contracts for Aurelia 1.5x M1 and Burn, Kaelen M1/E slows, Maelis M1 damage-down and shield-only E, and Veyra M1/E stuns with boss immunity.
- [ ] Run focused tests and confirm failures for absent integration.
- [ ] Dispatch M1 and Skill behavior by kit effect `kind`; do not add character-name conditionals.
- [ ] Preserve Echo direct damage but keep Echo M1 reaction-ineligible and avoid duplicating utility effects unless explicitly configured.
- [ ] Add bounded status visuals and rate-limited `IMMUNE` feedback.
- [ ] Re-run focused and full combat tests and commit `feat: integrate limited character m1 and skills`.

### Task 7: Limited Character Burst And Persistent Effects

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Test: `src/limitedCharacterBurst.test.ts`

**Interfaces:**
- Consumes: party-effect reducer and existing normal-Q/Special-Ultimate handlers.

- [ ] Write failing tests/source contracts that preserve the current normal-Q impact function and Special Ultimate handler while requiring Aurelia explosion range, Kaelen whirlpool, Maelis field, and Veyra Dominion.
- [ ] Run focused tests and verify expected failures.
- [ ] Add limited Burst effects inside the existing normal-Q impact path without a second direct-damage call.
- [ ] Tick smooth pull, Maelis fields, Veyra M1 empowerment, and electric field events in the shared loop.
- [ ] Keep fields/shields alive across switching, waves, and Special Ultimate cutscenes; clear on run end/reset/exit/unmount.
- [ ] Add bounded Canvas field and aura visuals plus a compact shield HUD.
- [ ] Re-run normal-Q and Special Ultimate regressions and commit `feat: add limited burst fields and shared shields`.

### Task 8: Role And Kit UI

**Files:**
- Create: `src/components/CharacterRoleBadge.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/InventoryManager.tsx`
- Modify: `src/components/GDDViewer.tsx`
- Modify: `src/components/GachaSimulator.tsx`
- Modify: `src/utils/limitedBanners.ts`
- Test: `src/characterRoleUi.test.ts`

**Interfaces:**
- Consumes: `getRoleLabel`, `getCharacterKit`, and central character role fields.

- [ ] Write failing source/UI tests requiring role badges in party, forge, wiki, banner, summon splash/results, and role filtering in party/wiki.
- [ ] Run the focused test and verify it fails.
- [ ] Add a compact responsive badge and role filters without introducing another information-heavy panel.
- [ ] Replace limited-character wiki skill copy with the exact polished values and boss/reaction notes from the approved specification.
- [ ] Update featured banner copy/results to show role and identity.
- [ ] Re-run hierarchy, banner, Forge, and mobile layout tests and commit `feat: expose character roles and kit identity`.

### Task 9: Responsive Kit Test Route

**Files:**
- Create: `src/components/CharacterKitTestPage.tsx`
- Modify: `src/main.tsx`
- Create: `vercel.json`
- Test: `src/characterKitTestPage.test.ts`

**Interfaces:**
- Consumes: the same role, kit, reaction, status, and party-effect modules used by combat.

- [ ] Write a failing source contract for `/kit-test`, required controls/state readouts, deterministic proc toggle, and absence of force-proc controls from normal game files.
- [ ] Run the test and verify the route is missing.
- [ ] Add pathname routing in `main.tsx`, a Vercel rewrite for `/kit-test`, and the responsive test page.
- [ ] Implement deterministic action simulation using production reducers and a bounded event log.
- [ ] Re-run tests and build; commit `feat: add character kit test harness`.

### Task 10: Full Verification And Publication

**Files:**
- Modify only files required by findings from verification.

**Interfaces:**
- Produces: verified GitHub `main` commit and Vercel production deployment.

- [ ] Run all tests with `node --import tsx --test $(git ls-files '*.test.ts')` through the PowerShell-compatible file-list command and require zero failures.
- [ ] Run `npm run lint` and require zero TypeScript errors.
- [ ] Run `npm run build` and require a successful PWA build.
- [ ] Start the app and inspect normal gameplay plus `/kit-test` at 1440x900, 390x844, and 844x390.
- [ ] Exercise all four characters against normal, elite, and boss targets; switch with shield/fields active; test both Special Ultimate pairs with cutscenes enabled and disabled.
- [ ] Review changed files, role assignments, architecture decisions, and any unverified limitation.
- [ ] Commit verification fixes, push `main`, and confirm the exact Vercel deployment SHA is `READY` with no runtime errors.
