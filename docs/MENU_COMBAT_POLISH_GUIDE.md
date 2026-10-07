# Menu and Combat Polish Guide

## What Changed and How to See It

These are presentation upgrades. There are no new modes, rewards, stats, currencies,
save fields, unlock requirements, or combat damage multipliers.

| Upgrade | Where | Trigger and Behavior |
| --- | --- | --- |
| A. Elemental menu materials | Story Campaign, Forge, God Lore Wiki, Celestial Summons | Open the section. Stonework, brushed metal, celestial inscriptions, or sparse astral marks appear at the panel edges. Existing layouts and artwork remain. |
| B. Physical button feedback | Main Menu and noncombat dashboard menus | Press an enabled button for a small depression, edge highlight, and quieter click. Changing a section or supported sub-tab moves its active underline. Existing duplicate click handlers are sound-throttled. |
| C. Timed attack telegraphs | Shared CombatArena renderer used by Arena, Grind, Story, Character Stories, and Rogue battles | Wait for a supported enemy, boss, or weather attack. The pale-gold border advances using the real simulation countdown and closes at impact. The cyan shield means the attack uses the existing parry handler. |
| H. Wiki mechanic demonstrations | God Lore Wiki > Enemies; Switch to Boss for bosses | Scroll a diagram into view to start its short counterplay sequence. Pause/play and replay controls work by click, keyboard, or tap. Reduced-motion users get manually stepped diagrams. All 8 archetypes and 45 registered boss entries have a diagram. |
| J. Quest completion presentation | Quest Log and the existing dashboard quest ledger | Claim a completed quest, or use Claim All. Only an accepted claim with an authoritative completion record produces the Claimed stamp, roughly 900 ms hold, and removal/reflow. Rewards do not wait for the animation. |
| K. Section ambient effects | Forge, Summons, Wiki | Open the section: small metal glints, constellation traces, or drifting inscriptions animate near its edge. They pause when their decoration leaves the viewport, the document is hidden, or the section is paused. Mobile simplifies the decoration. |
| L. Honest save feedback | Main Menu header and dashboard near the player profile/currencies | Progress writes update the icon automatically. Tap/click to inspect the actual local/cloud state and open Account & Cloud. Failed storage writes remain warnings until a successful authoritative retry. |

## Combat Details

- Generic enemy warnings use the actual 60-unit radial hit area. The old visual-only
  line/50-unit circle mismatch is removed without altering hit detection.
- The generic border follows the visible timer window from 60 to impact at 115,
  not the later attack timer reset at 120.
- Artillery, Mimic, meteor, lightning, and authored campaign countdown warnings
  read their own existing remaining/max timers.
- Stalker uses its captured 18-frame Elite or 24-frame Normal back-attack windup,
  with the actual 105-unit strike radius.
- Weather lightning reads its existing 50-frame warning. Annular attacks preserve
  their safe center and show progress on both borders.
- Counter cues are based on the damage route, not guessed from attack names.
  Current supported timed warnings, including weather, use the parry handler.
  The renderer supports an evade symbol for direct-damage routes, but does not
  relabel an actually parryable attack as unblockable.
- Borders, culling, and symbols do not alter attack timing, damage, i-frames,
  AI, character switching, or existing combat controls.

## Save and Reward Integrity

- Save serialization and keys are unchanged; no migration is needed.
- The tracker reports success only after JSON serialization and setItem succeed.
- A successful pull-history write cannot hide a game-save failure.
- Play-time-only writes derived from an older stored snapshot cannot clear a
  failed authoritative progress write.
- Cloud labels consume the existing cloud coordinator's state. No fake sync timer
  or fabricated cloud confirmation is introduced.
- Cloud success additionally requires the latest progress fingerprint to match
  the acknowledged upload, including while the existing autosave debounce waits.
- Quest claim callbacks, currencies, completion logic, and reward-flight system
  are reused unchanged. Rejected claims do not announce or stamp completion.

## Performance and Accessibility

- Ambient and diagram animations are CSS/SVG based with visibility gating; no
  additional combat particle system, full-screen postprocess, or per-frame React
  animation state has been added.
- Telegraph geometry is reused in the combat loop and offscreen footprints are
  culled. Symbols remain readable in screen pixels at different camera zooms.
- New observers, listeners, and timers are disconnected/cleared on unmount.
- New diagram and coarse-touch save controls have 44-pixel targets.
- New controls have accessible labels, selected/pressed state, visible focus,
  and reduced-motion treatment. Save popovers focus their action without scrolling
  and dismiss with Escape/outside click; Escape restores the trigger focus.
- Reward announcements describe accepted claims rather than button requests.

## Verification

- TypeScript check (`npm run lint`) and production build pass.
- Final existing-plus-new Node suite: 250 passed, 0 failed, 2 optional browser
  tests skipped. Optional external-Playwright browser
  suites are skipped in the default run when their module path is not provided.
- Desktop production-preview checks: Forge upgrade, reload persistence, single
  quest claim, batch claim totals, rejected-storage warning, and retry recovery.
- Real archive checks: 8 enemy diagrams, 45 boss diagrams, existing model previews,
  pause/replay, manual reduced-motion steps, and no broken loaded images.
- Responsive checks: 320x568, 360x800, 390x844, 768x1024, 1024x768, and 1366x768;
  no horizontal overflow observed in the inspected archive views.
- Mobile entry path checked with mobileGate and coarse-touch emulation at 844x390:
  Forge/Wiki/Summons, 44-pixel controls, save popover bounds, and offscreen pause.
- Real Canvas2D helper checked at progress 0, 0.5, and 1: completed borders, distinct
  counter symbols, restored context alpha, and unchanged annulus-center pixels.
- Live Endless battle exercised skill/parry, wave progression, defeat, and exit.
  This is not a claim that every attack of every boss was manually played.
- No unexpected JavaScript exceptions or failed requests were observed in the
  inspected production-preview flow. The intentionally injected storage failure
  produces the expected console error.

## Limitations

- Browser resizing/touch emulation is not physical Android/iOS or controller QA.
- Authenticated cloud round trips were not performed using the player's account.
- Boss diagrams show selected real attacks, not an entire encounter or a guaranteed
  safe zone when multiple hazards overlap.
- No physical-device FPS benchmark was run. Existing large-bundle build warning
  remains; this pass does not promise zero FPS impact on all devices.
- The pre-existing PWA service-worker update can reload the page on activation.

## Files

Modified: `src/App.tsx`, `src/main.tsx`, `src/cloud/cloudLocalStorage.ts`,
`src/cloud/useCloudAccount.ts`,
`src/components/CombatArena.tsx`, `GDDViewer.tsx`, `InventoryManager.tsx`,
`MainMenu.tsx`, `SquadronQuestLedger.tsx`, `StoryMode.tsx`,
`src/components/wiki/EnemyArchiveTab.tsx`, `src/utils/audio.ts`, and
`src/forgePartyLayout.test.ts`.

Created: `src/components/ui/{MenuSurface.tsx,MenuPolish.css,SlidingTabMarker.tsx,
SaveStatusIndicator.tsx}`, `src/save/localSaveFeedback{.ts,.test.ts}`,
`src/cloud/cloudSyncStatus{.ts,.test.ts}`,
`src/utils/menuPresentation{.ts,.test.ts}`,
`src/components/QuestCompletion{.ts,.css,.test.ts,.browser.test.mjs}`,
`src/components/QuestCompletionPresentation.tsx`,
`src/components/combat/combatTelegraphs{.ts,.test.ts}`,
`src/components/combat/CombatTelegraphRenderer{.ts,.test.ts,.browser.test.ts}`,
`src/components/wiki/mechanicDemonstrations{.ts,.test.ts}`,
`src/components/wiki/MechanicDemonstration{.tsx,.css,.test.ts,.browser.test.ts}`,
and this guide.

Existing `GAME_QA_REVIEW.md` and `qa-evidence/` are unrelated player files and
are deliberately excluded from the commit.
