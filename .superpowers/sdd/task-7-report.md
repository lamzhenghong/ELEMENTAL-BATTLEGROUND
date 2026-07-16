# Task 7 Final Review Fixes

## Scope

- Home now receives the number of completed active quests whose rewards are ready to claim, rather than claimed quest history.
- The Home badge uses the `readyQuestCount` presentation name and says `N rewards ready`.
- Forge derives an active hidden-filter count for each non-Augments tab, shows it on the Filters button, and exposes the count through `forge-filter-status`.
- Augments does not render the Filters button or its filter panel. Collapsing a filter panel does not change any filter state.

## TDD Evidence

### Red

Command:

```powershell
npx tsx src\informationHierarchy.test.ts
```

Result: exit code 1. The new contract failed as expected with `AssertionError [ERR_ASSERTION]: App must pass the number of reward-ready active quests to GameHome`.

### Green

Command:

```powershell
npx tsx src\informationHierarchy.test.ts
```

Result: exit code 0; output: `information hierarchy regression contract passed`.

## Final Verification

```powershell
npx tsx src\informationHierarchy.test.ts
```

Result: exit code 0; output: `information hierarchy regression contract passed`.

```powershell
npx tsx src\forgePartyLayout.test.ts
```

Result: exit code 0; output: `forge cleanup and party search layout ok`.

```powershell
npx tsx src\foundationIntegrity.test.ts
```

Result: exit code 0; output: `foundation integrity rules ok`.

```powershell
npm run lint
```

Result: exit code 0. `tsc --noEmit` completed without diagnostics.

`git diff --check` also completed with exit code 0 before commit.
