# Task 5: Combat Controls Disclosure

## Implementation

- Added local `showDesktopControls` state with a default value of `false`.
- Added a compact desktop-only `Combat Controls` button using the existing `HelpCircle` icon.
- Added `aria-expanded` and `aria-controls="combat-controls-panel"` to the button.
- Added `id="combat-controls-panel"` to the existing Diagnostics Matrix container.
- Made the Diagnostics Matrix render only while `showDesktopControls` is true.
- Preserved the existing hotkey labels, combat handlers, keyboard input, mobile controls, and panel `pointer-events-none` behavior.
- No dependencies or unrelated files were changed.

## TDD Results

### Red: pre-edit verification

Command:

```text
npx tsx src/informationHierarchy.test.ts
```

Result: failed as expected before implementation.

Failure: `Combat Controls source must include its aria-controls target panel` at `src/informationHierarchy.test.ts:103`.

### Green: focused verification

| Command | Result |
| --- | --- |
| `npx tsx src/informationHierarchy.test.ts` | Passed: `information hierarchy regression contract passed` |
| `npx tsx src/combatGameplayRules.test.ts` | Passed: `combat gameplay rules ok` |
| `npx tsx src/utils/combatPolish.test.ts` | Passed: `combat polish rules ok` |
| `npm run lint` | Passed: `tsc --noEmit` exited 0 |
| `git diff --check` | Passed with no whitespace errors |

## Self-review

- The button is rendered only inside the existing `!isMobile` branch and remains hidden below the `md` breakpoint.
- The panel is closed by default, opens and closes from the button, and exposes the required semantic relationship.
- The button is the only interactive element added; the panel remains `pointer-events-none`, so battlefield input outside the button bounds is not intercepted.
- Existing Diagnostics Matrix labels remain unchanged: movement, mouse target, attack, dodge, parry, skill, burst, special ultimate, and hero switching.
- No boss HUD, minimap, party HUD, combo counter, weather, ultimate, rewards, pause, joystick, or mobile control code was altered.
- No combat handler or keyboard/mobile input handler was altered.

## Concerns

- Desktop visibility follows the component's existing `isMobile` user-agent check and `md` breakpoint convention. This preserves the established mobile behavior while keeping the disclosure desktop-only.
