# Visual-First Information Hierarchy Design

## Objective

Make Elemental Battleground feel like a visual-first RPG while preserving its existing lore, mechanics, progression, statistics, and reference material. Gameplay actions must appear before explanations; deeper information remains available on demand.

## Approved Direction

The user supplied the design brief and explicitly asked implementation to begin. Three approaches were considered:

1. Copy-only reduction: fastest, but it permanently removes useful worldbuilding and does not solve structural competition.
2. Progressive disclosure in the existing UI: preserves content, minimizes behavioral risk, and creates a clear gameplay-first hierarchy.
3. Full navigation and component rewrite: offers the largest visual change but carries unnecessary regression risk across a mature game.

Approach 2 is selected, with one targeted navigation improvement from approach 3: a dedicated gameplay home screen.

## Navigation

Starting the simulation opens a new gameplay home screen instead of the Wiki/GDD. The home screen presents the primary player loop in this order:

- Continue Story
- Combat Arena
- Rogue Ruins
- Party Setup
- Celestial Summons
- Forge and Ascension
- Quest Log

Locked modes remain visible and route through the existing lock alerts. The Wiki remains fully available, but it moves to the end of the navigation as optional reference content. Existing screen IDs and navigation behavior remain intact where possible.

## Gameplay Home

The home screen uses the existing main-menu artwork as a full-width visual background. It contains:

- One dominant Continue Story action.
- Compact mode cards with icons and short labels.
- Current party portraits or abbreviated party status.
- A compact quest-ready indicator.
- No long lore paragraphs or design-document copy.

The screen must fit naturally on desktop and remain vertically scrollable on mobile without horizontal overflow.

## Summons

Banner art, featured character or weapon, pity progress, and summon controls remain immediately visible. Probability explanations and banner rules move behind a Banner Details control that is collapsed by default. Rates and history remain modal actions. Weapon targeting remains visible because it is required for the active banner decision.

## Forge

Forge tabs, selected item, upgrade actions, and currencies stay visible. Filters become a collapsed-by-default panel with a clear filter count/state indicator. Long explanatory footer copy moves behind Forge Notes. Existing artifact fusion, salvage, equipment, and developer controls remain unchanged.

## Party Setup

The party roster and search remain central. Element, weapon, and rarity filters move behind a collapsed Filters control. Active resonance names remain visible as compact badges; detailed artifact effects, reference sheets, reaction references, and damage-skin configuration move behind Loadout Details. Search and Unequip All remain directly accessible.

## Story

Campaign artwork, chapter selection, stage map, portraits, and choices remain primary. Character Story act cards use compact encounter labels such as Normal, Elite, and Boss plus Mora/Gems reward indicators. Longer explanatory wording is removed from the first layer, while authored dialogue and memories remain unchanged.

## Combat HUD

The persistent desktop Diagnostics Matrix is collapsed by default into a small Controls button. Opening it shows the existing hotkeys. Mobile controls remain unchanged. Boss bars, weather, combo counters, rewards, alerts, and combat mechanics are untouched.

## Accessibility And State

- Every disclosure control is a semantic button with `aria-expanded` and `aria-controls`.
- Expanded panels use stable IDs.
- Disclosure state is local UI state and does not modify saves.
- Gameplay-relevant choices remain visible before confirmation.
- Existing keyboard and mobile controls remain unchanged.

## Performance

The pass reuses existing assets, icons, states, and components. It does not add new animation libraries, video, canvas work, or large images. Motion is limited to the existing `motion` transitions and lightweight CSS.

## Verification

- Regression test proves the simulation enters the gameplay home, not Wiki.
- Regression test proves each dense screen has a collapsed disclosure control.
- Existing tests remain green.
- TypeScript and production build pass.
- Desktop, mobile portrait, and mobile landscape screenshots confirm no clipping or overflow.
- Existing gameplay routes, lock alerts, summon actions, forge actions, story progression, and combat controls remain operable.

