# Summon Banner Art and Mobile Scaling Design

## Goal

Keep every summon-banner subject readable on desktop and touch devices, then replace the old standard-character and weapon-banner illustrations with text-free key art that matches the premium anime RPG style used by the current limited banners.

## Root Cause

`GachaSimulator` renders every banner as a CSS background with `background-size: cover` and `background-position: center`. The limited-character images are square while the visible banner panel is very wide in landscape mobile layouts. Cover scaling therefore removes much of the top and bottom of the source image; centered positioning places the visible crop below Aurelia and Kaelen's faces.

## Responsive Artwork Model

Banner artwork remains a CSS background so the existing text, probability details, pity controls, and weapon selector retain their current stacking and gradients. A single typed artwork-layout map supplies desktop and mobile focal positions for every supported banner ID.

The panel exposes those positions through CSS custom properties. Mobile styling is selected by `(hover: none), (pointer: coarse)` rather than viewport width, because landscape phones can exceed Tailwind's desktop breakpoints. Fine-pointer desktop devices retain a separately tuned position.

All character banners keep the face in the upper portion of the crop. The weapon banner keeps its weapon cluster centered vertically. Unknown future character banners receive a safe upper-center fallback instead of the old centered crop.

## Replacement Artwork

### Standard Character Banner

- Premium text-free anime RPG key art.
- Lyra Frostbloom, Zephyr Gale, Goliath Stoneguard, and Raijin Volt form the standard five-star ensemble.
- The main faces occupy the upper-right mobile-safe region.
- The left side remains calmer and darker for the existing banner title and reward UI.
- Palette combines Cryo blue, Anemo teal, Geo gold, and Electro violet around a celestial Aether gate.

### Weapon Banner

- Premium text-free anime RPG armory key art.
- Ornate sword, claymore, bow, polearm, and catalyst form a readable legendary weapon constellation.
- The weapon cluster occupies the center-right mobile-safe region.
- The left side remains darker for the existing selector copy.
- Lighting uses gold, cyan, violet, and crimson energy inside a celestial forge.

Both final assets are 1600x900 progressive JPEGs. Each file must remain at or below 350 KB to avoid increasing mobile loading cost.

## Accessibility and Performance

- Existing semantic controls and text remain unchanged.
- No extra DOM image layer, animation loop, or runtime image allocation is added.
- Background images remain lazy with the existing `GachaSimulator` chunk.
- Gradients continue to protect text contrast over artwork.
- Mobile behavior is verified at landscape phone and portrait phone viewports with touch/coarse-pointer emulation.

## Verification

- A source-level regression test requires typed per-banner layout metadata and the coarse-pointer CSS rule.
- The test parses both replacement JPEGs and enforces 1600x900 progressive encoding and the 350 KB limit.
- The complete TypeScript test suite, `npm run lint`, and `npm run build` must pass.
- Browser verification checks Aurelia, Kaelen, standard, and weapon banners on desktop and mobile, confirms focal positions, verifies no horizontal overflow, and records page or console errors.

