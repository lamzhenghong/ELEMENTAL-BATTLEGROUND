# Progression and Equipment Integrity Implementation Plan

1. Add failing tests for cumulative portrait ownership, weapon coverage and balance values, secondary stats, artifact normalization, resonance, progression events, and expanded rewards.
2. Implement the cumulative portrait resolver; connect owned tiers and visual frames to character surfaces without a separate equip state.
3. Implement the weapon registry and secondary-stat resolver; update weapon descriptions from audited values.
4. Route roster and combat initialization through shared character build stats; connect every passive trigger to registry values.
5. Normalize artifact equipment on mutation and save load; centralize party resonance definitions and runtime values.
6. Add level-up, milestone, and ascension presentation with stat deltas, skip, reduced-motion, and low-graphics behavior.
7. Expand the reward queue and connect quest, login, shop, summon, item, currency, and progression grants without altering combat artifact drops.
8. Run the complete test suite, TypeScript, production build, and browser checks at desktop/mobile sizes.
9. Commit, push, and publish the verified game build.
