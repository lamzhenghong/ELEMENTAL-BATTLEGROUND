# Forge Layout and Armaments Design

## Goal

Make the Forge artifact and weapon interfaces clean and readable on desktop and mobile, while making every owned Armament selectable, viewable, and upgradeable.

## Design

The selected item remains the visual focus, but the focus stage becomes a compact single-column presentation instead of nesting another two-column layout inside the Forge detail grid. The outer Forge layout owns responsiveness: it stacks on compact screens and becomes a balanced visual/details split when enough width is available.

A reusable `WeaponForgePanel` will render weapon identity, current and next level, calculated stat bonus, passive description, refinement, upgrade cost, and the upgrade button. Roster uses it for the currently equipped weapon. Armaments uses it for the weapon selected from the inventory list, so all owned weapons share the exact same upgrade behavior and feedback.

The Artifact detail panel keeps its existing lock, salvage, and fusion behavior. Its header, status, set bonus, and action grids will use wrapping-safe columns and compact spacing so long artifact and character names cannot collide or produce clipped text.

## Interaction

- Armament rows are semantic buttons with a clear selected state.
- Armaments gets its own search query; Roster's compatible-weapon search remains independent.
- Selecting a weapon updates the right detail panel without equipping it.
- Upgrading from either Roster or Armaments calls the existing transaction-safe `onUpgradeWeapon` callback.
- Max-level weapons remain viewable with a disabled Maxed button.
- Existing one-weapon-per-character ownership rules remain unchanged.

## Responsive Behavior

- Desktop: balanced visual and action columns without nested column compression.
- Tablet and mobile: focus stage and details stack; controls remain full-width and touch-friendly.
- Short landscape screens: the focus stage becomes shallower, preserving vertical room for actions.
- Reduced-motion and low-graphics behavior remain supported.

## Testing

- Source contracts cover Armament selection, the shared weapon panel, and responsive artifact markup.
- Component rendering tests cover normal and max-level weapon states.
- Browser checks cover desktop, tablet, mobile landscape, Armament selection, weapon upgrade, and artifact text overflow.
- Full source tests, TypeScript lint, and the production build remain release gates.
