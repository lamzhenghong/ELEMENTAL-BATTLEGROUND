# Task 3 Report: Summon And Forge Disclosure

## Scope

- Added the Banner Details disclosure and viewport-fixed, scrollable Rates and History overlays in `src/components/GachaSimulator.tsx`.
- Added Forge Filters and Forge Notes disclosures in `src/components/InventoryManager.tsx`.
- Kept summon, forge, currency, inventory, history, and developer-action mechanics unchanged.

## TDD Evidence

1. Before production edits, `npx tsx src/informationHierarchy.test.ts` failed as expected at `Banner Details source must include its aria-controls target panel`.
2. After the minimal disclosure implementation, the same contract advanced past Banner Details, Forge Filters, and Forge Notes, then failed at the out-of-scope `Combat Controls source must include its aria-controls target panel` assertion in `src/components/CombatArena.tsx`.

## Verification

- `npx tsx src/informationHierarchy.test.ts`: blocked only by the unrelated Combat Controls assertion described above.
- `npx tsx src/components/GachaSimulator.bannerArtwork.test.ts`: passed (`gacha banner artwork rules ok`).
- `npx tsx src/components/GachaSimulator.limitedBannerUi.test.ts`: passed (`gacha limited banner ui ok`).
- `npx tsx src/forgePartyLayout.test.ts`: passed (`forge cleanup and party search layout ok`).
- `npx tsx src/components/InventoryManager.salvagePortal.test.ts`: passed (`inventory salvage modal portal ok`).
- `npm run lint`: passed (`tsc --noEmit`).
- `git diff --check`: passed.

## Self Review

- Banner artwork, title, summary, timer, pity widgets, weapon target selection, Rates, History, and summon controls remain visible while only the Probability Up-Rates block is conditional.
- Rates and History now use fixed viewport overlays with constrained, vertically scrollable dialog content for short screens.
- The Forge Filters panel preserves existing filter state when collapsed; artifact search and the developer legendary-artifact action remain outside the panel and visible on the Artifacts tab.
- Forge Notes contains the unchanged Ultimate metrics text. No pull-rate, pity, guarantee, currency, duplicate, salvage, fusion, equipment, or resource-action logic changed.
