# Summon Banner Art and Mobile Scaling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make summon-banner faces and weapons remain visible on touch devices and replace the standard and weapon banner art with optimized premium illustrations.

**Architecture:** Keep the existing CSS-background banner renderer and add a typed per-banner focal-position map. Pass mobile and desktop positions through CSS custom properties, with input-capability media queries selecting the correct crop. Replace the two imported JPEGs in place so no persistence or gacha logic changes.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS 4, Vite 6, Node assertion tests, progressive JPEG assets.

## Global Constraints

- Existing summon odds, pity, rotation, currency, and weapon-selection behavior must not change.
- Desktop and mobile controls must remain functional.
- Mobile landscape devices must use the mobile focal position even when their CSS width exceeds 1024px.
- `standard_banner.jpg` and `weapon_banner.jpg` must be 1600x900 progressive JPEGs no larger than 350 KB each.
- Artwork must contain no embedded UI text, logos, or watermarks.

---

### Task 1: Banner Artwork Regression Contract

**Files:**
- Create: `src/components/GachaSimulator.bannerArtwork.test.ts`
- Inspect: `src/components/GachaSimulator.tsx`
- Inspect: `src/index.css`

**Interfaces:**
- Consumes: `GachaSimulator.tsx`, `index.css`, `assets/standard_banner.jpg`, and `assets/weapon_banner.jpg`.
- Produces: a test contract for `BannerArtworkLayout`, `getBannerArtworkLayout(...)`, `.gacha-banner-art`, the coarse-pointer media query, and final JPEG properties.

- [ ] **Step 1: Write the failing test**

Add assertions that the source contains a typed layout resolver, all six known artwork IDs, CSS custom properties for desktop/mobile focal positions, and a coarse-pointer media query. Parse JPEG SOF markers to assert progressive 1600x900 output and check each replacement asset is no larger than 358,400 bytes.

- [ ] **Step 2: Run the test to verify RED**

Run: `npx tsx src/components/GachaSimulator.bannerArtwork.test.ts`

Expected: FAIL because the layout resolver, CSS class, and replacement 1600x900 assets do not exist yet.

### Task 2: Replacement Banner Artwork

**Files:**
- Replace: `assets/standard_banner.jpg`
- Replace: `assets/weapon_banner.jpg`

**Interfaces:**
- Consumes: the Maelis/Veyra limited-banner visual language and the standard five-star roster.
- Produces: two 1600x900 progressive JPEGs referenced by the existing imports.

- [ ] **Step 1: Generate the standard-character key art**

Use built-in image generation with a wide, text-free ensemble prompt. Keep the standard heroes and their faces in the upper-right safe region and reserve dark negative space on the left.

- [ ] **Step 2: Generate the weapon key art**

Use built-in image generation with a wide, text-free celestial armory prompt. Keep the legendary weapon cluster center-right and reserve dark negative space on the left.

- [ ] **Step 3: Normalize and optimize**

Crop or resize each selected output to 1600x900, encode as progressive JPEG, and tune quality until each file is no larger than 350 KB without visible banding or facial damage.

### Task 3: Responsive Focal Positioning

**Files:**
- Modify: `src/components/GachaSimulator.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `BannerArtworkLayout` and `getBannerArtworkLayout(featured5StarId, type)` returning `{ desktopPosition, mobilePosition }`.
- Consumes: the returned values as `--banner-position-desktop` and `--banner-position-mobile` CSS variables on `.gacha-banner-art`.

- [ ] **Step 1: Add the typed focal-position resolver**

Define explicit positions for `aurelia`, `kaelen`, `maelis`, `veyra`, `standard_banner`, and the weapon type. Use an upper-center character fallback and centered weapon fallback.

- [ ] **Step 2: Connect the renderer**

Replace hardcoded `backgroundPosition: 'center'` with the CSS custom properties and add the `gacha-banner-art` class. Preserve `background-size: cover` and prevent repeats.

- [ ] **Step 3: Add capability-based responsive CSS**

Use the mobile custom property by default and within coarse/no-hover media. Use the desktop custom property only under `(hover: hover) and (pointer: fine)`.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run: `npx tsx src/components/GachaSimulator.bannerArtwork.test.ts`

Expected: `gacha banner artwork rules ok`.

### Task 4: Full Verification and Publication

**Files:**
- Verify: all `src/**/*.test.ts`
- Verify: production output in `dist/`

**Interfaces:**
- Produces: a verified GitHub commit and READY Vercel production deployment.

- [ ] **Step 1: Run every TypeScript test file**

Run each `src/**/*.test.ts` with `npx tsx`; expected result is all files passing.

- [ ] **Step 2: Run compiler and production build**

Run: `npm run lint`

Run: `npm run build`

Expected: both commands exit 0.

- [ ] **Step 3: Browser verification**

Verify all banner tabs at 1440x900, 844x390 touch landscape, and 390x844 touch portrait. Confirm hero faces or weapon focal objects are visible, the UI does not overflow horizontally, and no page errors occur.

- [ ] **Step 4: Commit and publish**

Commit the focused changes, push `main`, wait for the matching Vercel deployment to report `READY`, scan runtime errors, and repeat a production mobile smoke test.

