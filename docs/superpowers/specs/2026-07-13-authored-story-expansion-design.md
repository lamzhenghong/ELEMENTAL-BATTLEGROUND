# Authored Story Expansion Design

**Date:** 2026-07-13
**Status:** Approved
**Scope:** Campaign Chapters 4-10, four limited Character Stories, story choices, memories, illustrated backgrounds, and chapter navigation

## Summary

Replace the procedural campaign content for Chapters 4-10 with authored five-stage story packs. Add bespoke three-act Character Stories for Aurelia, Kaelen, Maelis, and Veyra without making those limited characters important to the main campaign. Add lightweight choices that affect non-final encounters and dialogue but always reconverge before the fixed boss finale.

The release also adds a Memory Archive, eleven optimized illustrated backgrounds, and a horizontally scrollable chapter selector whose scrollbar remains hidden on desktop and mobile.

## Goals

- Give Chapters 4-10 distinct locations, conflicts, enemies, dialogue, and themes.
- Replace fallback Character Story text for the four limited five-star heroes.
- Make choices affect gameplay without creating permanent alternate campaign endings.
- Preserve every existing campaign and Character Story boss encounter.
- Keep all campaign Stage 5 encounters and all Character Story Act 3 encounters as bosses.
- Keep limited heroes optional and separate from main Story Mode lore.
- Reuse current combat archetypes to avoid performance and stability regressions.
- Support responsive presentation and navigation on desktop and mobile.
- Preserve compatibility with existing save files.

## Non-Goals

- Chapters 1-3 are not rewritten in this release.
- Limited heroes do not become required campaign characters or historical world figures.
- Choices do not create alternate endings, exclusive rewards, or permanent power.
- This release does not add a general-purpose visual novel scripting engine.
- Existing bosses are not replaced, renamed, or randomized.
- Character Stories continue to grant only Mora and Gems.

## Architecture

### Modular Story Packs

Use one authored data module per campaign chapter and one per limited hero. A shared index and resolver preserve the existing public story APIs where practical.

Suggested organization:

```text
src/data/story/
  types.ts
  index.ts
  bossRegistry.ts
  campaign/
    chapter4.ts
    chapter5.ts
    chapter6.ts
    chapter7.ts
    chapter8.ts
    chapter9.ts
    chapter10.ts
  characters/
    aurelia.ts
    kaelen.ts
    maelis.ts
    veyra.ts
  memories.ts
```

`storyStages.ts` remains a compatibility facade while authored content moves out of the monolithic file. Chapters 4-10 must no longer rely on the current procedural stage-name, reward, enemy, or dialogue fallback.

### Shared Definitions

The story schema should support:

- Stable story pack and stage IDs.
- Stage location and illustrated background metadata.
- Before-battle and after-battle dialogue.
- Optional two-option choices.
- Choice-dependent non-boss encounter variants.
- Choice-dependent battle modifier IDs.
- Choice-dependent follow-up dialogue.
- Memory entries unlocked by stage or act completion.
- Fixed boss identity for authored finales.
- Optional deterministic fallback boss metadata for future unconfigured finales.

Story resolution must remain pure: given a stage ID and saved choices, it returns the same stage specification every time.

## Campaign Content

All seven chapters contain five authored stages. Stages 1-4 use authored normal and elite enemy compositions. Stage 5 retains its existing boss encounter and cannot be changed by a choice. "Existing" means the boss template and runtime enemy name currently returned by `getStageSpec()` before this expansion; the surrounding stage title and dialogue do not authorize changing that identity.

Limited heroes must not appear in campaign dialogue, cutscenes, memory entries, enemy descriptions, or required lore.

### Chapter 4: Whispers of the Abyss

**Signature location:** Gloamvault, a buried tomb-city whose walls retain the final memories of fallen kingdoms.
**Theme:** Whether painful history should be preserved or silenced.
**Story:** Eldric and Marina follow the Stormborn Feather into Gloamvault and learn that the Abyss is storing grief rather than producing random corruption.

The chapter choice asks whether to rescue trapped surveyors or secure the Whisper Seal first. The decision changes a later non-boss enemy group, battle modifier, and follow-up dialogue. Both routes reconverge before Stage 5.

**Fixed Stage 5 boss:** Preserve the current Chapter 4 Stage 5 boss. "Void Overlord" remains the existing stage title.

### Chapter 5: Echoes of Eternity

**Signature location:** The Astral Reliquary, a temple outside ordinary time.
**Theme:** Identity, doubt, and accepting imperfect memories.
**Story:** Reflections imitate the party and question whether their victories came from skill or fate.

The chapter choice asks whether to trust a guiding reflection or break its mirror. The decision changes a later non-boss encounter and temporal modifier. Both routes reconverge before Stage 5.

**Fixed Stage 5 boss:** Preserve the current Chapter 5 Stage 5 boss. "Eternity Knight" remains the existing stage title.

### Chapter 6: The Frostfire Chasm

**Signature location:** Rimeforge Fault, where a glacier and magma channel share one damaged climate engine.
**Theme:** Balance requires controlled change rather than perfect stasis.
**Story:** The temperature disaster is revealed as deliberate sabotage intended to freeze the region into an unchanging state.

The chapter choice asks whether to vent the magma channel or thaw the glacial channel. The decision changes Stage 4 hazards and enemy composition. Both routes reconverge before Stage 5.

**Fixed Stage 5 boss:** Preserve the current Chapter 6 Stage 5 boss. "Frostfire Wyrm" remains the existing stage title.

### Chapter 7: Skyward Ascent

**Signature location:** Aethelwing Skyroad, a chain of collapsing bridges and storm anchors above Zephyria.
**Theme:** Immediate rescue versus long-term protection.
**Story:** Falling islands threaten a civilian settlement while the anchors holding the skyroad together begin to fail.

The chapter choice asks whether to evacuate the settlement or stabilize the storm anchors first. The decision changes the next non-boss encounter and whether a temporary support modifier is available. Both routes reconverge before Stage 5.

**Fixed Stage 5 boss:** Preserve the current Chapter 7 Stage 5 boss. "Skyward Avian" remains the existing stage title.

### Chapter 8: Heart of the Volcano

**Signature location:** Eldruin Worldforge, an ancient facility once used to bind the Elemental Orbits to the Sun Spindle.
**Theme:** Destroying dangerous power versus reclaiming it responsibly.
**Story:** The party discovers that the forge can either be shut down or used to recreate an access key required for the deeper core.

The chapter choice asks whether to disable the forge or reforge the ancient key. The decision changes a non-boss guardian encounter and environmental modifier. Both routes reconverge before Stage 5.

**Fixed Stage 5 boss:** Preserve the current Chapter 8 Stage 5 boss. "Molten Overlord" remains the existing stage title.

### Chapter 9: Dimensional Rift

**Signature location:** Paradox Verge, a fracture showing incompatible versions of Aetheria.
**Theme:** Learning from possible futures without abandoning the present.
**Story:** Alternate timelines show worlds in which different nations seized control of the Sun Spindle.

The chapter choice asks whether to anchor the present timeline or retrieve a record from a lost future. The decision changes the next non-boss encounter and dialogue. Both routes reconverge before Stage 5.

**Fixed Stage 5 boss:** Preserve the current Chapter 9 Stage 5 boss. "Chronos Monarch" remains the existing stage title.

### Chapter 10: Aetheria Reforged

**Signature location:** Prime Orbit Core beneath the Sun Spindle.
**Theme:** Inherited destiny versus chosen responsibility.
**Story:** Discoveries from earlier chapters become part of the final stabilization sequence.

The final choice asks whether to restore the original divine protocol or establish shared mortal stewardship. It changes closing dialogue and a non-boss trial modifier but not the boss, rewards, or stable campaign ending.

**Fixed Stage 5 boss:** Preserve the current Chapter 10 Stage 5 boss. "Eldric Core Prime" remains the existing stage title. Dialogue clarifies the title as a defense intelligence mirroring the chosen Catalyst, not a limited hero or separate campaign protagonist.

## Limited Character Stories

These stories are optional personal memories. They may add small details about a hero's values, work, or relationships, but they do not change world history, campaign events, national leadership, the Sun Spindle, or the ending of the main story.

Each story contains:

- Act 1: Authored normal encounter.
- Act 2: Authored elite encounter with one two-option choice.
- Act 3: The character's existing fixed boss encounter.
- One Memory Archive entry per cleared act.
- Mora and Gems as the only rewards.
- One reusable illustrated memory background.

### Aurelia: The Oath's Warmth

- **Act I, The Unlit Watch:** Aurelia investigates a failed Solaris heating relay.
- **Act II, Weight of the Oath:** Choose between obeying a noble command or protecting endangered forge workers first. The choice changes the elite encounter and dialogue.
- **Act III, Dawn Without Applause:** Preserve Aurelia's existing Act 3 boss encounter.
- **Resolution:** Duty is measured by people protected rather than ceremonies witnessed.

### Kaelen: The Uncharted Tide

- **Act I, A Blank Horizon:** Kaelen searches for a missing survey vessel through an incomplete chart.
- **Act II, The Admiral's Burden:** Choose between rescuing an isolated crew or holding a collapsing harbor line. The choice changes the elite encounter and dialogue.
- **Act III, Sounding the Deep:** Preserve Kaelen's existing Act 3 boss encounter.
- **Resolution:** Command requires trusting others rather than calculating every current alone.

### Maelis: Leaves That Forget

- **Act I, Sap and Scripture:** Maelis enters a damaged section of his living archive.
- **Act II, The Page He Cannot Keep:** Choose whether to preserve an infected memory or prune it before corruption spreads. The choice changes the elite encounter and dialogue.
- **Act III, Heartwood Farewell:** Preserve Maelis's existing Act 3 boss encounter.
- **Resolution:** Protecting history sometimes means allowing one memory to end.

### Veyra: After the Seventh Strike

- **Act I, The Seventh Mirror:** Veyra recalibrates storm mirrors damaged during her childhood disaster.
- **Act II, One Shot Too Early:** Choose between repairing the weather engine or briefly pursuing a returning abyssal signal. The choice changes the elite encounter and dialogue.
- **Act III, Eye of the Shattered Storm:** Preserve Veyra's existing Act 3 boss encounter.
- **Resolution:** Survival is not a calculation she failed to solve.

The paired heroes may receive one subtle optional resonance hint in their final memory text. This must not explain, unlock, or alter Special Ultimate mechanics or main campaign lore.

## Choice Behavior

- Every choice has exactly two concise options.
- Choices appear in the story presentation using large touch-friendly buttons.
- Choices are saved immediately under stable decision IDs.
- Replaying the decision stage lets the player replace the saved selection.
- A selection affects only declared non-boss enemy variants, battle modifiers, and dialogue.
- Choice routes always reconverge before the campaign Stage 5 or Character Story Act 3 finale.
- Choices never change currencies, item rewards, stars, unlock order, bosses, or ending access.
- Hard Mode resolves the same selected narrative branch while retaining Hard Mode scaling.

## Boss Policy

### Existing Content

- Every currently available Stage 5 boss remains the same.
- Every currently available Character Story Act 3 boss remains the same.
- Authored choices cannot replace, rename, randomize, or skip an existing boss.
- Restarting or replaying a stage cannot change its boss.

### Future Unconfigured Finales

If a future stage is marked as a boss finale but has no authored boss configuration, use a deterministic fallback boss registry:

- Seed selection from the stable stage ID.
- Select a supported boss template from the registry.
- Compose a name from curated title and subject pools.
- Return the same template and name for the same stage ID across sessions and devices.
- New boss templates and name fragments can be added without changing story resolvers.
- Once a future boss becomes authored, its explicit configuration overrides the fallback permanently.

This provides a random-feeling new boss for future additions without making a stage's identity change on replay.

## Memory Archive

Add a Memory Archive view inside Story Mode.

- Campaign Chapters 4-10 unlock memories after Stages 1, 3, and 5.
- Each limited Character Story unlocks one memory after each act.
- Total new entries: 33.
- Locked entries show title silhouettes or chapter/character source without revealing body text.
- Unlocked entries show title, source, location, and concise authored text.
- Use the existing `unlockedLoreEntries` progression array with stable keys.
- Memory entries never grant stats, items, portraits, or combat power.

## Illustrated Backgrounds

Create eleven semantically specific raster backgrounds:

- Gloamvault.
- Astral Reliquary.
- Rimeforge Fault.
- Aethelwing Skyroad.
- Eldruin Worldforge.
- Paradox Verge.
- Prime Orbit Core.
- Aurelia's Solaris relay memory.
- Kaelen's stormbound harbor memory.
- Maelis's living archive memory.
- Veyra's stormglass observatory memory.

Art requirements:

- No text, logos, UI, or character portraits baked into images.
- Consistent cinematic anime-RPG environmental art direction.
- Clear readable focal point and sufficient dark/quiet space for dialogue UI.
- Optimized modern raster format with a practical compressed size target.
- One chapter image is reused across that chapter with overlay variation.
- One character image is reused across all three acts of that story.
- Scene metadata includes desktop and mobile focal positions.
- Only the active or immediately upcoming background is preloaded.
- Existing reduced-motion and cutscene-disable settings remain respected.

## Chapter Navigation

Convert the chapter card row to a horizontal scrolling strip.

- Fixed card widths prevent Chapters 1-10 from compressing.
- Desktop supports mouse wheel, trackpad, keyboard focus scrolling, and drag/overflow behavior where practical.
- Mobile supports native touch swiping.
- The scrollbar is hidden visually but scrolling remains fully enabled.
- Selecting a chapter scrolls the selected card into view.
- Horizontal scrolling must not trap or disable normal vertical Story Mode scrolling.
- The strip exposes an accessible label and keyboard-focusable controls.

## Save Data And Migration

Extend `StoryProgress` with a defaulted choice map, for example:

```ts
storyChoices: Record<string, string>;
```

Migration behavior:

- Old saves receive an empty choice map.
- Existing completed stages, stars, hard-mode clears, Character Story clears, and lore keys remain untouched.
- Existing boss identity does not depend on the new choice map.
- Missing or invalid choice values resolve to the default non-boss branch without crashing.
- Choice changes are persisted through the existing save update path.

## Battle Integration

- Continue using existing normal, elite, and boss combat archetypes.
- Authored enemy identity comes from names, compositions, encounter modifiers, dialogue, and presentation.
- Enemy color remains visual only and does not participate in elemental reaction logic.
- Branch modifiers use the existing modifier/hazard systems where possible.
- No branch may disable normal Ultimate, Special Ultimate, mobile controls, desktop controls, weather, or boss damage handling.
- Battle completion continues through the existing Story Mode reward and progression flow.

## Error Handling

- Unknown authored stage IDs fall back safely to the existing resolver behavior.
- Missing artwork falls back to the current gradient cutscene background.
- Missing choice data resolves to the default branch.
- Missing memory data does not block progression.
- Unsupported future boss templates are excluded from registry selection.
- A malformed story pack should fail development tests rather than crash a production battle.

## Performance And Responsive Behavior

- Story data remains static TypeScript data and adds no runtime network dependency.
- Lazy-load or statically split story artwork so the initial game bundle does not load all eleven images.
- Reuse a single background per chapter or character arc.
- Avoid animated full-screen particles in story menus.
- Choice UI, archive cards, cutscenes, chapter scrolling, and stage dialogs must fit landscape and portrait mobile layouts.
- Hidden scrollbar styling must preserve native momentum scrolling.

## Testing And Acceptance Criteria

### Content Integrity

- Chapters 4-10 each resolve to five explicit authored stages.
- No Stage 4-1 through 10-5 uses procedural campaign content.
- Every stage has authored location, description, enemies, and dialogue.
- Every campaign Stage 5 remains a boss.
- Existing Stage 5 boss identity is unchanged.
- Limited hero names do not appear in main campaign modules or campaign memories.

### Character Stories

- Aurelia, Kaelen, Maelis, and Veyra each have three bespoke acts.
- Act 1 is normal, Act 2 is elite, and Act 3 retains its existing boss.
- Acts unlock sequentially.
- Rewards contain only Mora and Gems.
- No Character Story grants stats, portraits, items, upgrades, or combat bonuses.

### Choices

- Each campaign chapter has one functioning two-option choice.
- Each limited hero has one functioning Act 2 choice.
- Choices persist after reload.
- Replaying the decision stage can replace the choice.
- Branches alter only declared non-boss content and dialogue.
- Both paths reach the same fixed finale and ending.
- Hard Mode uses the saved branch without changing boss identity.

### Future Boss Fallback

- The same unconfigured future stage ID always resolves to the same generated boss and name.
- Different future stage IDs can resolve to different supported bosses and names.
- Explicit authored bosses always override fallback generation.

### UI And Art

- Chapter cards scroll horizontally on desktop and mobile.
- The scrollbar is not visible.
- Vertical Story Mode scrolling remains functional.
- Selecting a chapter reveals its card.
- All eleven backgrounds render without stretching or obscuring dialogue.
- Missing artwork falls back gracefully.
- Memory Archive accurately reflects locked and unlocked keys.

### Regression Verification

- TypeScript compilation passes.
- Automated tests pass.
- Production build passes.
- Existing Chapters 1-3 behave as before.
- Existing saves load without data loss.
- Story battles, hard mode, rewards, quests, and cutscene-disable behavior still work.
- Desktop and mobile browser checks show no clipping, blocked controls, or console errors.

## Delivery Sequence

1. Add shared story schemas, save migration, and modular resolver.
2. Author campaign packs for Chapters 4-10.
3. Author the four limited Character Story packs.
4. Add choice presentation and branch resolution.
5. Add Memory Archive and unlock handling.
6. Generate, optimize, and integrate eleven backgrounds.
7. Add hidden-scroll chapter navigation.
8. Add content-integrity, choice, boss, save, and UI tests.
9. Run full desktop/mobile verification, production build, GitHub publish, and Vercel deployment verification.
