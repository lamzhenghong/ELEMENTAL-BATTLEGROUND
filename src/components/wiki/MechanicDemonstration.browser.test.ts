import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { createServer } from 'vite';
import { BOSS_IDENTITIES } from '../../utils/bossIdentities';

// Optional browser QA uses an installed Playwright module, without a new game dependency.
const playwrightModule = process.env.WIKI_MECHANIC_PLAYWRIGHT_MODULE;
const outputDirectory = process.env.WIKI_MECHANIC_QA_OUTPUT;

test('real archive diagrams preserve models, fit mobile, and respect playback and visibility', {
  skip: !playwrightModule,
}, async () => {
  const { chromium } = await import(pathToFileURL(playwrightModule!).href);
  const server = await createServer({ server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  let browser: any;
  try {
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/wiki-mechanics-test`;
    browser = await chromium.launch({ headless: true, channel: process.env.WIKI_MECHANIC_BROWSER_CHANNEL });
    if (outputDirectory) await mkdir(outputDirectory, { recursive: true });

    for (const mobile of [false, true]) {
      const page = await browser.newPage({ viewport: { width: mobile ? 390 : 1366, height: mobile ? 844 : 900 } });
      page.setDefaultTimeout(60000);
      const errors: string[] = [];
      page.on('pageerror', (error: Error) => errors.push(error.message));
      page.on('console', (message: any) => {
        const text = message.text();
        // Edge can block Vite's unused dev websocket on this routed localhost fixture.
        const devTransport = /^(WebSocket connection to.*(?:ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS|ERR_UNSAFE_PORT)|\[vite\] failed to connect to websocket)/s.test(text);
        if (message.type() === 'error' && !devTransport) errors.push(text);
      });
      await page.route('**/wiki-mechanics-test', async (route: any) => route.fulfill({
        contentType: 'text/html',
        body: await server.transformIndexHtml('/wiki-mechanics-test', `<!doctype html><html><head><title>Wiki Mechanics QA</title></head>
          <body style="margin:0;background:#020617;color:#e2e8f0"><div id="fixture" style="max-width:1280px;margin:auto;padding:16px;height:100dvh;overflow-y:auto;box-sizing:border-box"></div>
          <script type="module">
            import React from 'react';
            import { createRoot } from 'react-dom/client';
            import EnemyArchiveTab from '/src/components/wiki/EnemyArchiveTab.tsx';
            import MenuSurface from '/src/components/ui/MenuSurface.tsx';
            import '/src/index.css';
            import '/src/components/ui/MenuPolish.css';
            createRoot(document.getElementById('fixture')).render(React.createElement(MenuSurface,
              { screen: 'wiki', paused: false, lowGraphics: false }, React.createElement(EnemyArchiveTab)));
          </script></body></html>`),
      }));
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const demos = page.locator('.wiki-mechanic-demo');
      await demos.first().waitFor();
      assert.equal(await demos.count(), 8);
      assert.equal(await page.locator('canvas').count(), 8, 'existing full model previews remain mounted');
      await page.waitForFunction(() => document.querySelector('.wiki-mechanic-demo')?.getAttribute('data-running') === 'true');

      const first = demos.first();
      await first.getByRole('button', { name: 'Pause Bulwark demonstration', exact: true }).click();
      const before = await first.locator('.wiki-demo-actor').first().evaluate((node: Element) => getComputedStyle(node).transform);
      await page.waitForTimeout(450);
      const after = await first.locator('.wiki-demo-actor').first().evaluate((node: Element) => getComputedStyle(node).transform);
      assert.equal(after, before, 'pause freezes the diagram');
      assert.equal(await first.getAttribute('data-running'), 'false');
      assert.equal(await first.locator('.wiki-demo-motion').first().evaluate((node: Element) => getComputedStyle(node).animationPlayState), 'paused');
      await first.getByRole('button', { name: 'Replay Bulwark demonstration', exact: true }).click();
      assert.equal(await first.getAttribute('data-running'), 'true');
      const restarted = await first.locator('.wiki-demo-actor').first().evaluate((node: Element) => node.getAnimations()[0].currentTime);
      assert.ok(Number(restarted) < 500, 'replay starts a fresh sequence');

      // A tall desktop viewport can contain both rows; use a clipped scroll surface to guarantee exit.
      await page.locator('#fixture').evaluate((node: HTMLElement) => { node.style.height = '240px'; });
      await demos.last().scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('.wiki-mechanic-demo')?.getAttribute('data-running') === 'false');
      assert.equal(await first.locator('.wiki-demo-motion').first().evaluate((node: Element) => getComputedStyle(node).animationPlayState), 'paused');
      await page.locator('#fixture').evaluate((node: HTMLElement) => { node.style.height = '100dvh'; });
      await first.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('.wiki-mechanic-demo')?.getAttribute('data-running') === 'true');

      // Headless browsers do not consistently hide background tabs; exercise the real visibility listener.
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForFunction(() => document.querySelector('.wiki-mechanic-demo')?.getAttribute('data-running') === 'false');
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForFunction(() => document.querySelector('.wiki-mechanic-demo')?.getAttribute('data-running') === 'true');

      const fit = await page.evaluate(() => {
        const diagrams = Array.from(document.querySelectorAll('.wiki-mechanic-demo'));
        return {
          pageFits: document.documentElement.scrollWidth <= innerWidth,
          textFits: diagrams.every(node => Array.from(node.querySelectorAll('.wiki-demo-heading, .wiki-demo-caption, .wiki-demo-steps'))
            .every(child => child.scrollWidth <= child.clientWidth)),
          controlsFit: diagrams.every(node => Array.from(node.querySelectorAll('button'))
            .every(child => child.getBoundingClientRect().width >= 44 && child.getBoundingClientRect().height >= 44)),
        };
      });
      assert.deepEqual(fit, { pageFits: true, textFits: true, controlsFit: true });
      if (outputDirectory) await page.screenshot({ path: join(outputDirectory, `${mobile ? 'mobile' : 'desktop'}-enemies.png`), fullPage: true });

      await page.getByRole('button', { name: 'Switch to Boss', exact: true }).click();
      assert.equal(await demos.count(), BOSS_IDENTITIES.length);
      assert.equal(await page.locator('canvas').count(), BOSS_IDENTITIES.length);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await demos.first().scrollIntoViewIfNeeded();
      await demos.first().getByRole('button', { name: /Next step/ }).waitFor();
      assert.equal(await demos.first().getAttribute('data-running'), 'false');
      assert.equal(await demos.first().locator('.wiki-demo-motion').first().evaluate((node: Element) => node.getAnimations().length), 0);
      await demos.first().getByRole('button', { name: /Replay/ }).click();
      assert.equal(await demos.first().getAttribute('data-step'), '0');
      await demos.first().getByRole('button', { name: /Next step/ }).click();
      assert.equal(await demos.first().getAttribute('data-step'), '1');
      assert.equal(await demos.first().getAttribute('data-running'), 'false');
      assert.ok(await demos.first().locator('.wiki-demo-steps > span').nth(1).evaluate((node: Element) => getComputedStyle(node).opacity === '1'));
      const bossFits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      assert.ok(bossFits, 'boss diagram layout fits viewport');
      if (outputDirectory) await page.screenshot({ path: join(outputDirectory, `${mobile ? 'mobile' : 'desktop'}-bosses-reduced.png`), fullPage: true });
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser?.close();
    await server.close();
  }
});
