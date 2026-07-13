# Legacy Story Art and Banner Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add illustrated Chapter 1-3 cutscene environments and refresh Aurelia and Kaelen's banner art in the established limited-character style.

**Architecture:** Extend the existing typed story artwork registry instead of creating a second image path. Resolve a chapter background for legacy campaign stages and preserve that metadata when legacy dialogue slides are used. Replace hero banner assets in place so all current consumers update automatically.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Node assertions, built-in image generation, Pillow JPEG optimization.

## Global Constraints

- Preserve all existing Chapter 1-3 dialogue, encounters, rewards, and boss stages.
- Preserve Aurelia and Kaelen's canonical identities, elements, weapons, and names.
- Match Maelis and Veyra's text-free premium anime RPG banner style.
- Keep desktop and mobile layouts responsive and maintain image fallbacks.
- Keep every story environment at or below 350 KB.

---

### Task 1: Story Artwork Contract

**Files:**
- Modify: `src/storyArtwork.test.ts`
- Modify: `src/data/story/types.ts`
- Modify: `src/data/story/artwork.ts`
- Modify: `src/data/story/index.ts`

**Interfaces:**
- Produces: `getStoryScene(stageId, phase).backgroundId` for every Chapter 1-3 campaign stage.

- [ ] Add Chapter 1-3 manifest entries and scene assertions to `src/storyArtwork.test.ts`.
- [ ] Run `npx tsx src/storyArtwork.test.ts` and confirm it fails because the assets and IDs are absent.
- [ ] Add the three background IDs, registry records, and legacy chapter resolver.
- [ ] Run `npx tsx src/storyArtwork.test.ts` and confirm it passes after the generated assets are installed.

### Task 2: Legacy Dialogue Background Preservation

**Files:**
- Modify: `src/storyArtwork.test.ts`
- Modify: `src/components/StoryMode.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: optional `StoryScene.backgroundId` from `getStoryScene`.
- Produces: fallback `StoryScene` values containing both legacy slides and the resolved background ID.

- [ ] Add source assertions proving pre- and post-battle fallback objects retain `authoredScene.backgroundId`.
- [ ] Run `npx tsx src/storyArtwork.test.ts` and confirm the fallback assertions fail.
- [ ] Preserve `backgroundId` in the campaign and character fallback objects.
- [ ] Re-run the artwork test and TypeScript lint.

### Task 3: Generate And Install Artwork

**Files:**
- Create: `assets/story/chapter-1-whispering-ruins.jpg`
- Create: `assets/story/chapter-2-elemental-frontier.jpg`
- Create: `assets/story/chapter-3-aether-gates.jpg`
- Replace: `assets/aurelia_banner.jpg`
- Replace: `assets/kaelen_banner.jpg`

**Interfaces:**
- Consumes: Maelis/Veyra banners as style references and current Aurelia/Kaelen banners as identity references.
- Produces: three 1600x900 chapter JPEGs and two 1024x1024 banner JPEGs.

- [ ] Generate each environment as text-free cinematic anime RPG environment art.
- [ ] Generate each hero banner using current identity and Maelis/Veyra finish references.
- [ ] Inspect all outputs for subject accuracy, unwanted text, composition, and mobile-safe focal points.
- [ ] Resize and optimize the selected images to their required dimensions and budgets.

### Task 4: Full Verification And Publish

**Files:**
- Verify: all changed files and generated assets.

**Interfaces:**
- Produces: verified GitHub main commit and matching Vercel production deployment.

- [ ] Run all `src/*.test.ts` and `src/components/*.test.ts` scripts.
- [ ] Run `npm run lint` and `npm run build`.
- [ ] Capture desktop and mobile screenshots of legacy story cutscenes and the two limited banners.
- [ ] Commit, push `main`, wait for Vercel, and verify the production deployment commit and runtime logs.

