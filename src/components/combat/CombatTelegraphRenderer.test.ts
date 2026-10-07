import assert from 'node:assert/strict';
import test from 'node:test';
import * as renderer from './CombatTelegraphRenderer';

const view = { left: 0, top: 0, right: 400, bottom: 300, zoom: 1 };

// Capture the renderer's Canvas2D output, without replacing its geometry logic.
const captureCanvas = () => {
  const calls: Array<{ name: string; args: unknown[] }> = [];
  const ctx = new Proxy({}, {
    get: (_target, name: string) => (...args: unknown[]) => { calls.push({ name, args }); },
    set: (_target, name: string, value: unknown) => {
      calls.push({ name: `set:${name}`, args: [value] });
      return true;
    },
  }) as CanvasRenderingContext2D;
  return { ctx, calls };
};

test('circle progress follows the border and closes only at impact', () => {
  assert.equal(typeof renderer.drawCombatTelegraph, 'function');
  const half = captureCanvas();
  renderer.drawCombatTelegraph(half.ctx, { x: 100, y: 100, radius: 45 }, 0.5, null, view, false);
  const arcs = half.calls.filter(call => call.name === 'arc');
  assert.deepEqual(arcs.at(-1)?.args, [0, 0, 45, -Math.PI / 2, Math.PI / 2]);
  const full = captureCanvas();
  renderer.drawCombatTelegraph(full.ctx, { x: 100, y: 100, radius: 45 }, 1, 'parry', view, false);
  assert.deepEqual(full.calls.filter(call => call.name === 'arc').at(-1)?.args,
    [0, 0, 45, -Math.PI / 2, 3 * Math.PI / 2]);
});

test('generic line and circle types both warn about the actual 60-radius radial hit', () => {
  assert.equal(typeof renderer.drawCombatTelegraph, 'function');
  const circle = captureCanvas();
  const line = captureCanvas();
  const lineEnemy = { x: 100, y: 100, radius: 60, telegraphType: 'line' as const };
  renderer.drawCombatTelegraph(circle.ctx, { x: 100, y: 100, radius: 60 }, 0.5, null, view, false);
  renderer.drawCombatTelegraph(line.ctx, lineEnemy, 0.5, null, view, false);
  assert.deepEqual(line.calls, circle.calls);
  assert.deepEqual(line.calls.filter(call => call.name === 'arc').at(-1)?.args,
    [0, 0, 60, -Math.PI / 2, Math.PI / 2]);
});

test('annular warnings keep their safe center clear and advance both borders', () => {
  assert.equal(typeof renderer.drawCombatTelegraph, 'function');
  const canvas = captureCanvas();
  renderer.drawCombatTelegraph(canvas.ctx, { x: 100, y: 100, radius: 90, innerRadius: 45 }, 0.5, null, view, false);
  assert.ok(canvas.calls.some(call => call.name === 'fill' && call.args[0] === 'evenodd'));
  assert.deepEqual(canvas.calls.filter(call => call.name === 'arc').slice(-2).map(call => call.args), [
    [0, 0, 90, -Math.PI / 2, Math.PI / 2],
    [0, 0, 45, -Math.PI / 2, Math.PI / 2],
  ]);
});

test('offscreen warnings are culled, but intersecting footprints remain visible', () => {
  assert.equal(typeof renderer.drawCombatTelegraph, 'function');
  const offscreen = captureCanvas();
  renderer.drawCombatTelegraph(offscreen.ctx, { x: -100, y: 100, radius: 45 }, 0.5, 'parry', view, true);
  assert.equal(offscreen.calls.length, 0);
  const partial = captureCanvas();
  renderer.drawCombatTelegraph(partial.ctx, { x: -20, y: 100, radius: 45 }, 0.5, 'parry', view, true);
  assert.ok(partial.calls.some(call => call.name === 'stroke'));
  assert.equal(partial.calls.some(call => call.name === 'scale'), false, 'do not pin an offscreen symbol to the screen edge');
});

test('parry and evade symbols have distinct paths and remain screen-sized on mobile zoom', () => {
  assert.equal(typeof renderer.drawCombatTelegraph, 'function');
  const shield = captureCanvas();
  const evade = captureCanvas();
  const zoomed = { ...view, zoom: 0.75 };
  const shape = { x: 100, y: 100, radius: 45 };
  renderer.drawCombatTelegraph(shield.ctx, shape, 0.5, 'parry', zoomed, true);
  renderer.drawCombatTelegraph(evade.ctx, shape, 0.5, 'evade', zoomed, true);
  assert.notDeepEqual(shield.calls.filter(call => call.name === 'lineTo'), evade.calls.filter(call => call.name === 'lineTo'));
  assert.ok(shield.calls.some(call => call.name === 'scale' && call.args[0] === 1 / 0.75));
  assert.ok(shield.calls.some(call => call.name === 'arc' && call.args[2] === 15));
});
