# Legacy Story Art and Banner Refresh Design

## Goal

Give Chapters 1-3 the same illustrated cutscene treatment as Chapters 4-10 and replace Aurelia Sunflare and Kaelen Tidebound's current banner artwork with text-free illustrations matching the visual finish of Maelis and Veyra.

## Visual Direction

- Chapter 1: Whispering Forest at dawn, luminous elemental anomalies, marsh vegetation, and an ancient ruin gate as the focal landmark.
- Chapter 2: one unstable frontier where burning plains, a frozen river, and a lightning canyon converge around an elemental tear.
- Chapter 3: a mountain sanctuary leading to monumental Aether gates, ancient machinery, and a storm-lit dragon altar.
- Aurelia: preserve her adult female Pyro sword-user identity, red-gold armor, long auburn hair, Dawn Blade, and Solaris setting. Remove all poster copy and logos.
- Kaelen: preserve his adult male Hydro catalyst-user identity, dark blue hair, navy-and-gold admiral attire, water magic, and Nautila fleet setting. Remove all incidental writing and logos.
- Both character pieces use Maelis and Veyra as finish references: premium anime RPG key art, fine material detail, cinematic depth and lighting, full-body action silhouette, square composition, no text.

## Integration

Add `chapter-1`, `chapter-2`, and `chapter-3` to `StoryBackgroundId` and the centralized artwork registry. Legacy campaign stages resolve their chapter background without converting Chapters 1-3 into authored stage packs. Existing dialogue remains unchanged.

The Story Mode pre-battle fallback and App post-battle fallback preserve `backgroundId` when they substitute legacy dialogue slides. Character-story fallback behavior is preserved as well.

The character files remain `assets/aurelia_banner.jpg` and `assets/kaelen_banner.jpg`, so all existing banner consumers update without code churn.

## Performance And Responsive Behavior

- Story environments are 1600x900 progressive JPEGs, each at or below 350 KB.
- Character banners remain 1024x1024 JPEGs and use the current filenames.
- Mobile focal positions are configured per chapter and validated in portrait viewport screenshots.
- Existing gradient fallback remains available if an image fails to load.

## Verification

- Test all 14 story artwork registry entries, file existence, per-file budget, and total bundle budget.
- Test that all Chapter 1-3 stages expose the correct background in both phases.
- Test that legacy dialogue fallback retains the resolved background ID.
- Run the full test suite, TypeScript lint, production build, and desktop/mobile visual checks.

