import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';

// Optional browser QA: point this at an installed playwright/index.mjs.
const playwrightModule = process.env.COMBAT_TELEGRAPH_PLAYWRIGHT_MODULE;
const outputDirectory = process.env.COMBAT_TELEGRAPH_QA_OUTPUT;

test('real Canvas2D borders, symbols, culling and safe centers at desktop and mobile sizes', {
  skip: !playwrightModule,
}, async () => {
  const { chromium } = await import(pathToFileURL(playwrightModule!).href);
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
  let browser: any;
  try {
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/telegraph-renderer-test`;
    browser = await chromium.launch({ headless: true, channel: process.env.COMBAT_TELEGRAPH_BROWSER_CHANNEL });
    if (outputDirectory) await mkdir(outputDirectory, { recursive: true });

    for (const mobile of [false, true]) {
      const width = mobile ? 390 : 1024;
      const page = await browser.newPage({ viewport: { width, height: mobile ? 844 : 768 } });
      const errors: string[] = [];
      page.on('pageerror', (error: Error) => errors.push(error.message));
      await page.route('**/telegraph-renderer-test', (route: any) => route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html><head><title>Combat Telegraph Renderer QA</title></head>'
          + '<body style="margin:0;background:#17201f"><canvas></canvas></body></html>',
      }));
      await page.goto(url);

      for (const progress of [0, 0.5, 1]) {
        const result = await page.evaluate(async ({ mobile, width, progress }: {
          mobile: boolean; width: number; progress: number;
        }) => {
          const rendererUrl = '/src/components/combat/CombatTelegraphRenderer.ts';
          const helperUrl = '/src/components/combat/combatTelegraphs.ts';
          const { drawCombatTelegraph } = await import(rendererUrl);
          const { getCountdownTelegraphProgress, getStalkerTelegraphProgress, getWarningCounterCue } = await import(helperUrl);
          const canvas = document.querySelector('canvas')!;
          canvas.width = width;
          canvas.height = 660;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#17201f';
          ctx.fillRect(0, 0, width, 660);
          const zoom = mobile ? 0.75 : 1;
          const view = { left: 0, top: 0, right: width / zoom, bottom: 660 / zoom, zoom };
          const normalized = getCountdownTelegraphProgress(50 * (1 - progress), 50);
          const circle = { x: 100 / zoom, y: 120 / zoom, radius: 60, cueOffsetY: 60 + 20 / zoom };
          const ring = { x: (width - 100) / zoom, y: 120 / zoom, radius: 75, innerRadius: 35 };
          const line = { x: 100 / zoom, y: 315 / zoom, radius: 60, telegraphType: 'line', cueOffsetY: 60 + 20 / zoom };
          const stalker = { x: (width - 100) / zoom, y: 315 / zoom, radius: 105, cueOffsetY: 105 + 20 / zoom };
          const weather = { x: 100 / zoom, y: 550 / zoom, radius: 45, color: '#c084fc' };
          const evade = { x: (width - 100) / zoom, y: 550 / zoom, radius: 45 };
          ctx.save();
          ctx.scale(zoom, zoom);
          drawCombatTelegraph(ctx, circle, normalized, getWarningCounterCue('generic_enemy', 'player-hit'), view, mobile);
          drawCombatTelegraph(ctx, ring, normalized, getWarningCounterCue('campaign_boss_warning', 'player-hit'), view, mobile);
          drawCombatTelegraph(ctx, line, normalized, 'parry', view, mobile);
          drawCombatTelegraph(ctx, stalker, getStalkerTelegraphProgress(18 * (1 - progress), 18, progress === 1),
            getWarningCounterCue('stalker_strike', 'player-hit'), view, mobile);
          drawCombatTelegraph(ctx, weather, normalized, getWarningCounterCue('weather_lightning', 'player-hit'), view, mobile);
          drawCombatTelegraph(ctx, evade, normalized, getWarningCounterCue('meteor_warning', 'direct-damage'), view, mobile);
          ctx.restore();
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('Circle', 65, 38);
          ctx.fillText('Campaign Annulus', width - 174, 38);
          ctx.fillText('Generic Line (Radial Hit)', 26, 220);
          ctx.fillText('Stalker', width - 126, 220);
          ctx.fillText('Weather (Parryable)', 26, 615);
          ctx.fillText('Direct Route Fixture', width - 181, 615);

          const pixels = [
            [100, 120 - 60 * zoom],
            [100 - 60 * zoom, 120],
            [width - 100, 120],
            [100, 315 - 60 * zoom],
            [100 - 60 * zoom, 315],
          ].map(point => Array.from(ctx.getImageData(Math.round(point[0]), Math.round(point[1]), 1, 1).data));
          const before = ctx.getImageData(0, 0, width, 660).data;
          drawCombatTelegraph(ctx, { x: -200, y: 100, radius: 45 }, normalized, 'parry', view, mobile);
          const after = ctx.getImageData(0, 0, width, 660).data;
          return {
            progress: normalized,
            circleTop: pixels[0],
            circleLeft: pixels[1],
            ringCenter: pixels[2],
            lineTop: pixels[3],
            lineBottom: pixels[4],
            offscreenUnchanged: before.every((value, index) => value === after[index]),
            alpha: ctx.globalAlpha,
          };
        }, { mobile, width, progress });

        const gold = [255, 243, 176];
        assert.equal(result.progress, progress);
        assert.deepEqual(result.ringCenter, [23, 32, 31, 255], 'annular safe center remains clear');
        assert.equal(result.offscreenUnchanged, true);
        assert.equal(result.alpha, 1, 'renderer restores canvas state');
        if (progress > 0) {
          assert.deepEqual(result.circleTop.slice(0, 3), gold);
          assert.deepEqual(result.lineTop.slice(0, 3), gold);
        } else {
          assert.notDeepEqual(result.circleTop.slice(0, 3), gold);
        }
        if (progress === 0.5) {
          assert.notDeepEqual(result.circleLeft.slice(0, 3), gold);
          assert.notDeepEqual(result.lineBottom.slice(0, 3), gold);
        }
        if (progress === 1) {
          assert.deepEqual(result.circleLeft.slice(0, 3), gold);
          assert.deepEqual(result.lineBottom.slice(0, 3), gold);
        }
        if (outputDirectory && progress > 0) {
          await page.screenshot({ path: join(outputDirectory,
            `${mobile ? 'mobile' : 'desktop'}-${progress === 1 ? 'impact' : 'half'}.png`) });
        }
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser?.close();
    await server.close();
  }
});
