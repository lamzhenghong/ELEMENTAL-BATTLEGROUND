import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Use an existing Playwright installation without adding a production dependency.
const requireBrowser = process.env.QUEST_COMPLETION_BROWSER_PACKAGES
  ? createRequire(path.join(process.env.QUEST_COMPLETION_BROWSER_PACKAGES, '..', 'QuestCompletion.require.cjs'))
  : createRequire(import.meta.url);
const { chromium } = requireBrowser('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const harnessId = '\0QuestCompletionHarness.tsx';
const harness = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import SquadronQuestLedger from '/src/components/SquadronQuestLedger.tsx';
import '/src/index.css';
import '/src/components/ui/MenuPolish.css';
const timers = new Set();
const setTimer = window.setTimeout.bind(window);
const clearTimer = window.clearTimeout.bind(window);
window.setTimeout = (callback, delay, ...args) => {
  const id = setTimer(() => { timers.delete(id); callback(...args); }, delay);
  if (delay >= 700 && delay <= 15000) timers.add(id);
  return id;
};
window.clearTimeout = id => { timers.delete(id); clearTimer(id); };
const makeQuest = (id, group = 'daily', completed = true) => ({
  id, name: id === 'a' ? 'Eliminate the Vanguard' : 'Squadron objective ' + id,
  desc: 'Quest description', type: 'kill_enemy', targetValue: 10,
  currentValue: completed ? 10 : 3, completed, group, rewardTokens: 120, rewardMora: 1234567,
});
function Harness() {
  const params = new URLSearchParams(location.search);
  const [state, setState] = useState({
    active: params.get('seed') === 'last' ? [makeQuest('a')] : [makeQuest('a'), makeQuest('b'), makeQuest('c', 'daily', false), makeQuest('w', 'weekly')],
    completed: params.get('seed') === 'last' ? ['a'] : [],
  });
  const [, bump] = useState(0);
  const [mounted, setMounted] = useState(true);
  window.claimCalls ??= [];
  const commit = ids => setState(previous => {
    const mode = window.claimMode ?? 'accept';
    if (mode === 'reject') return previous;
    return {
      active: mode === 'id-only' ? previous.active
        : mode === 'replenish' ? previous.active.map(q => ids.includes(q.id) ? { ...q, completed: false, currentValue: 0 } : q)
        : previous.active.filter(q => !ids.includes(q.id)),
      completed: mode === 'remove-only' ? previous.completed : [...previous.completed, ...ids],
    };
  });
  const claim = ids => { window.claimCalls.push(ids); if (window.claimMode !== 'defer') commit(ids); };
  window.questCompletionHarness = {
    bump: () => bump(value => value + 1), commit,
    snapshot: () => state,
    unmount: () => setMounted(false), timers,
  };
  return <main style={{ width: 'min(calc(100% - 24px), 920px)', margin: '12px auto' }}>
    {mounted && <SquadronQuestLedger
      layout={params.get('layout') === 'sidebar' ? 'sidebar' : 'full'}
      activeQuests={state.active}
      completedQuestIds={params.get('legacy') ? undefined : state.completed}
      onClaimQuestReward={id => claim([id])}
      onClaimAllQuestRewards={() => claim(state.active.filter(q => q.completed).map(q => q.id))}
    />}
  </main>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><Harness /></React.StrictMode>);
`;

let server;
let browser;
let origin;
before(async () => {
  server = await createServer({
    root, configFile: false, logLevel: 'error',
    optimizeDeps: { noDiscovery: true, include: ['react', 'react-dom/client', 'react/jsx-runtime', 'lucide-react', 'motion/react'] },
    plugins: [react(), tailwindcss(), {
      name: 'quest-completion-browser-harness',
      resolveId(id) { if (id === '/QuestCompletionHarness.tsx' || id === harnessId) return harnessId; },
      load(id) { if (id === harnessId) return harness; },
      async transform(source, id) {
        if (id === harnessId) return transformWithEsbuild(source, 'QuestCompletionHarness.tsx', { loader: 'tsx', jsx: 'automatic' });
      },
      configureServer(vite) {
        vite.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/__quest-completion')) return next();
          const html = await vite.transformIndexHtml(req.url, '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#020617}</style></head><body><div id="root"></div><script type="module" src="/QuestCompletionHarness.tsx"></script></body></html>');
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
        });
      },
    }],
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
  });
  await server.listen();
  origin = 'http://127.0.0.1:' + server.httpServer.address().port;
  browser = await chromium.launch({ headless: true, channel: process.env.QUEST_COMPLETION_BROWSER_CHANNEL || 'chrome' });
});
after(async () => {
  await browser?.close();
  await server?.close();
});

async function openPage(query = '', width = 1280, reducedMotion = 'no-preference') {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
  page.setDefaultTimeout(10_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/__quest-completion?' + query);
  await page.waitForFunction(() => !!window.questCompletionHarness, null, { polling: 100 });
  await page.waitForTimeout(250);
  return { page, errors };
}

async function clickClaim(page) {
  await page.locator('[data-reward-source="quest-a"]').click({ force: true });
  await page.waitForTimeout(50);
}

test('real React cards stay mounted during the confirmed hold and do not replay on rerender', async () => {
  const { page, errors } = await openPage();
  await page.evaluate(() => { window.originalCard = document.querySelector('[data-quest-id="a"]'); });
  await clickClaim(page);
  assert.equal(await page.locator('[data-quest-state="claimed"]').count(), 1);
  assert.match(await page.getByRole('status').innerText(), /Eliminate the Vanguard.*claimed/);
  assert.equal(await page.evaluate(() => window.originalCard === document.querySelector('[data-quest-id="a"]')), true);
  await page.evaluate(() => {
    window.originalStamp = document.querySelector('.quest-completion-stamp');
    window.questCompletionHarness.bump();
  });
  await page.waitForTimeout(50);
  assert.equal(await page.evaluate(() => window.originalStamp === document.querySelector('.quest-completion-stamp')), true);
  assert.equal(await page.evaluate(() => window.claimCalls.length), 1);
  await page.waitForTimeout(550);
  assert.equal(await page.locator('[data-quest-state="claimed"]').count(), 1);
  await page.waitForTimeout(500);
  assert.equal(await page.locator('[data-quest-id="a"]').count(), 0);
  assert.deepEqual(errors, []);
  await page.close();
});

test('rejection, removal-only, ID-only and legacy props never render a claimed stamp', async () => {
  for (const mode of ['reject', 'remove-only', 'id-only', 'legacy']) {
    const { page, errors } = await openPage(mode === 'legacy' ? 'legacy=1' : '');
    await page.evaluate(mode => { window.claimMode = mode; }, mode);
    await clickClaim(page);
    assert.equal(await page.locator('.quest-completion-stamp').count(), 0, mode);
    assert.equal(await page.getByRole('status').innerText(), '', mode);
    assert.equal(await page.evaluate(() => window.claimCalls.length), 1, mode);
    assert.deepEqual(errors, []);
    await page.close();
  }
});

test('Claim All calls the parent once and confirms every requested category', async () => {
  const { page, errors } = await openPage('layout=sidebar', 320);
  await page.locator('[data-reward-source="quest-claim-all"]').click({ force: true });
  await page.waitForTimeout(50);
  assert.equal(await page.locator('.quest-completion-stamp').count(), 2);
  assert.match(await page.getByRole('status').innerText(), /3 quests.*claimed/);
  assert.equal(await page.evaluate(() => window.claimCalls.length), 1);
  await page.getByRole('button', { name: /WEEKLY/ }).click({ force: true });
  await page.waitForTimeout(50);
  assert.equal(await page.locator('[data-quest-id="w"][data-quest-state="claimed"]').count(), 1);
  assert.equal(await page.getByRole('button', { name: /WEEKLY/ }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('.menu-tab-marker').count(), 1);
  assert.deepEqual(errors, []);
  await page.close();
});

test('same-ID replenishment shows a held completed instance then an unfinished fresh card', async () => {
  const { page, errors } = await openPage('seed=last');
  await page.evaluate(() => { window.claimMode = 'replenish'; });
  await clickClaim(page);
  assert.equal(await page.locator('[data-quest-id="a"]').count(), 1,
    JSON.stringify(await page.evaluate(() => ({ state: window.questCompletionHarness.snapshot(), mode: window.claimMode, errors: document.body.innerText }))));
  assert.equal(await page.locator('[data-quest-state="claimed"]').count(), 1);
  await page.locator('[data-quest-id="a"][data-quest-state="claimed"]').waitFor({ state: 'detached' });
  assert.equal(await page.locator('[data-quest-id="a"]').count(), 1);
  assert.equal(await page.locator('[data-quest-state="claimed"]').count(), 0);
  assert.equal(await page.locator('[data-reward-source="quest-a"]').count(), 0);
  assert.match(await page.locator('[data-quest-id="a"]').innerText(), /0 \/ 10/);
  assert.deepEqual(errors, []);
  await page.close();
});

test('both layouts fit narrow viewports and reduced motion disables stamp and layout animation', async () => {
  for (const [layout, width] of [['full', 320], ['full', 375], ['full', 1280], ['sidebar', 280], ['sidebar', 320]]) {
    const { page, errors } = await openPage('layout=' + layout, width, 'reduce');
    await clickClaim(page);
    assert.equal(await page.locator('.quest-completion-stamp').count(), 1);
    assert.equal(await page.locator('.quest-completion-stamp').evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, layout + ' ' + width);
    const overflow = await page.locator('.quest-completion-card').evaluateAll(cards => cards.some(card => card.scrollWidth > card.clientWidth + 1));
    assert.equal(overflow, false, layout + ' ' + width);
    assert.deepEqual(errors, []);
    if (process.env.QUEST_COMPLETION_SCREENSHOT_DIR && (width === 320 || width === 1280)) {
      await page.screenshot({ path: path.join(process.env.QUEST_COMPLETION_SCREENSHOT_DIR, 'QuestCompletion-' + layout + '-' + width + '.png'), fullPage: true });
    }
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('[data-quest-id="a"]').count(), 0);
    await page.close();
  }
});

test('unmount cancels rejected-request and completion-hold timers', async () => {
  for (const mode of ['reject', 'accept']) {
    const { page, errors } = await openPage();
    await page.evaluate(mode => { window.claimMode = mode; }, mode);
    await clickClaim(page);
    assert.ok(await page.evaluate(() => window.questCompletionHarness.timers.size > 0));
    await page.evaluate(() => window.questCompletionHarness.unmount());
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.questCompletionHarness.timers.size), 0);
    await page.waitForTimeout(1000);
    assert.deepEqual(errors, []);
    await page.close();
  }
});
