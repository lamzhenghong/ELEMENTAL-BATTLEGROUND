# Action-First Forge Design

## Goal

Make Forge and Ascension feel like an RPG workshop instead of a reference page. Preserve every existing gameplay rule while reducing permanently visible copy and placing secondary explanations behind intentional details controls.

## Core Interaction

Each tab follows the same loop:

1. Select a hero or item.
2. Read its important state at a glance.
3. See the next improvement and its cost.
4. Equip, upgrade, ascend, fuse, lock, or salvage.

Desktop retains the inventory-and-detail split. Mobile stacks the inventory above the selected detail and keeps primary actions large and touch-friendly.

## Shared Shell

- Rename the page heading to `Forge`.
- Keep Mora, Gems, tabs, search, filters, and developer tools available.
- Remove the decorative `Ledger Signature Status / MATRIX ONLINE` panel.
- Use familiar RPG labels rather than fictional system terminology.
- Keep existing notifications, confirmation modals, filtering, scrolling, and persistence behavior.

## Hero And Armament Detail

- Show hero name, element, weapon class, rarity, level, and portrait level compactly.
- Present ATK, HP, DEF, CRIT Rate, CRIT DMG, and cooldown reduction as a compact stat grid.
- Place calculation formulas in a collapsed `Stat Breakdown` panel.
- Keep compatible weapon selection, current weapon, passive, enhancement level, and upgrade cost.
- Shorten headings to `Weapon`, `Passive`, `Upgrade`, and `Ascend`.
- Show Ascension costs as compact Mora and material chips next to the primary Ascend action.
- Preserve equipped artifact slots, set indicators, equipment ownership, and one-weapon-per-character rules.

## Artifact Detail

- Lead with artifact name, rarity, slot, main stat, set, and equipped hero.
- Present 2-piece and 4-piece bonuses compactly under `Set Bonus`.
- Use concise Lock/Unlock and Salvage actions with accessible labels.
- Replace the permanently expanded fusion explanation with a compact summary and an `Artifact Fusion` disclosure.
- Inside the fusion disclosure, retain matching-copy count, Mora/Gem costs, eligibility reason, and Fuse action.

## Augments

- Keep the current augment inventory and functionality unchanged.
- Use the shared compact tabs and avoid showing empty filter controls.

## Progressive Disclosure

Always visible:

- Selection, rarity, level, important stats, equipped state, cost, and primary action.

On demand:

- Stat formulas, slot rules, complete set descriptions, fusion requirements, and Forge notes.

## Responsive And Accessibility Requirements

- No horizontal overflow at phone, tablet, or desktop widths.
- Touch targets remain at least 40 pixels where practical.
- Disclosures expose `aria-expanded` and `aria-controls`.
- Icon-only controls retain accessible labels and tooltips.
- Hidden scrollbars do not remove scrolling.
- Existing salvage modal remains fixed to the viewport.

## Non-Goals

- No economy, balance, progression, save-data, equipment, artifact, or fusion rule changes.
- No new artwork is required.
- No unrelated Forge feature additions.

## Verification

- Add a source regression contract for the new labels, disclosures, retained actions, and removed decorative copy.
- Run all TypeScript contracts, TypeScript lint, and production build.
- Browser-check Heroes, Weapons, Artifacts, and Augments at desktop and mobile widths.
- Confirm upgrade, equip, fusion, filter, lock, and salvage controls remain present and responsive.
