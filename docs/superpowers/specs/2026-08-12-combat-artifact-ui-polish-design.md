# Combat and Artifact UI Polish Design

## Scope

Polish four existing presentation surfaces without changing combat eligibility, artifact stats, fusion rules, or save compatibility:

- Desktop Story and Character Story Special Ultimate placement
- Roster bulk artifact unequip
- Forge artifact detail layout and artifact-slot symbols
- Character role badge density across the game

## Design

Desktop Story-style combat uses two action rows. Strike, Parry, Dash, and Skill remain together; Burst and the available Special Ultimate form a second right-aligned pair, with Special Ultimate immediately to the right of Burst. Mobile keeps its existing center-bottom Special Ultimate control.

Roster bulk unequip is an atomic App-level save update. It clears every equipped artifact ID for the selected character and removes the corresponding `equippedTo` ownership markers in one transaction. The roster exposes one disabled-aware button and one in-game confirmation message.

Forge uses the existing focus-stage and action-shell architecture. The artifact action shell receives tighter spacing, a compact identity header, stable stat/status cards, and a full-width set-bonus section. Fusion remains collapsible below Lock and Salvage. A shared `ArtifactSlotIcon` renders recognizable helmet, gauntlet, greave, and boot marks in the focus stage, artifact list, selected header, and equipped slots.

Character role badges become icon-only at every call site through the shared component. Role names remain available through `aria-label` and `title` so the visual HUD is cleaner without losing accessibility.

## Validation

Add source contracts for layout boundaries, bulk callback wiring, atomic ownership cleanup, slot-specific symbols, and icon-only role badges. Run targeted tests, the full lint/build checks, then verify desktop and mobile layouts in the local browser before publishing.
