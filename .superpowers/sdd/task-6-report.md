# Task 6: Home Visual QA Fix

## TDD Results

Red test, run before production changes:

```text
npx tsx src/informationHierarchy.test.ts
Exit code: 1
AssertionError: the primary screen container must use four desktop columns on home and three on other screens
```

Focused verification after the two App layout changes:

```text
npx tsx src/informationHierarchy.test.ts
Exit code: 0
information hierarchy regression contract passed

npx tsx src/App.mobileMainMenuScroll.test.ts
Exit code: 0
mobile main menu scroll rules ok

npm run lint
Exit code: 0
> react-example@0.0.0 lint
> tsc --noEmit
```

## Changes

- Home uses `lg:col-span-4`; other screens retain `lg:col-span-3`.
- The desktop quest and party utility rail remains available on non-home screens and is hidden on Home.
