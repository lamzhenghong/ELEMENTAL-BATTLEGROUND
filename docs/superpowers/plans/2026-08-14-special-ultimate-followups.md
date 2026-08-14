# Special Ultimate Follow-up Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Eternal Vapor and Worldstorm Genesis distinct, interactive follow-up mechanics after a 500% active-character ATK opener.

**Architecture:** A pure TypeScript state machine generates bounded combat events. CombatArena activates the state, registers direct hits, advances timers, applies queued events, and renders low-cost indicators.

**Tech Stack:** React 19, TypeScript, Vite, canvas combat rendering, Node test runner through `tsx`.

## Global Constraints

- Keep the names Eternal Vapor and Worldstorm Genesis.
- Preserve unlock, party, gauge, cooldown, cutscene, BGM, mobile, desktop, and all-mode behavior.
- Opening damage is active-character ATK multiplied by 5.
- Follow-up events cannot recursively trigger themselves.
- Keep boss control immunity and explicit damage caps.

---

### Task 1: Define combo configuration

**Files:**
- Modify: `src/utils/specialUltimates.ts`
- Modify: `src/utils/specialUltimates.test.ts`

- [ ] Change both combo damage multipliers to `5` and add typed follow-up identifiers.
- [ ] Run `npx tsx src/utils/specialUltimates.test.ts` and verify the configuration contract.

### Task 2: Build the follow-up state machine

**Files:**
- Create: `src/utils/specialUltimateEffects.ts`
- Create: `src/utils/specialUltimateEffects.test.ts`

- [ ] Write failing tests for five-stack Vapor detonation, boss vulnerability, five-target network selection, capped echoes, throttle, roots, boss strikes, and expiry.
- [ ] Implement activation, direct-hit registration, ticking, multiplier lookup, and reset as pure functions.
- [ ] Run `npx tsx src/utils/specialUltimateEffects.test.ts` until all behavior passes.

### Task 3: Integrate combat behavior and VFX

**Files:**
- Modify: `src/components/CombatArena.tsx`
- Create: `src/components/CombatArena.specialUltimateEffects.test.ts`

- [ ] Write a failing source contract for the active-character 500% opener and shared follow-up pipeline.
- [ ] Activate the selected state after the opening hit, register only direct hits, and queue generated damage.
- [ ] Tick effects only while combat advances; apply roots, pulls, boss vulnerability, echoes, and strikes.
- [ ] Draw restrained Vapor marks and at most five Living Storm links.
- [ ] Reset effect state and queued events at every combat lifecycle boundary.

### Task 4: Verify and publish

**Files:**
- Verify all modified and created files.

- [ ] Run focused Special Ultimate tests.
- [ ] Run all repository test files, `npm run lint`, and `npm run build`.
- [ ] Smoke-test desktop and mobile landscape layouts with browser console inspection.
- [ ] Commit, push `main`, deploy the exact commit to Vercel production, and verify the canonical bundle.

