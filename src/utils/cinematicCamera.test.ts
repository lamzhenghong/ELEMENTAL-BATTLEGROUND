import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CinematicCameraDirector,
  getBossFramingRadius,
  screenToWorld,
  worldToScreen,
  type CameraUpdateInput,
} from './cinematicCamera';

const BASE_INPUT: CameraUpdateInput = {
  playerX: 600,
  playerY: 400,
  viewportWidth: 1000,
  viewportHeight: 600,
  worldWidth: 1600,
  worldHeight: 1000,
  motionIntensity: 100,
};

test('neutral camera centers the player without changing field of view', () => {
  const director = new CinematicCameraDirector();
  const frame = director.update(16, BASE_INPUT);

  assert.equal(frame.zoom, 1);
  assert.equal(frame.centerX, 600);
  assert.equal(frame.centerY, 400);
  assert.equal(frame.left, 100);
  assert.equal(frame.top, 100);
});

test('dash widens the field briefly and then returns smoothly', () => {
  const director = new CinematicCameraDirector();
  director.triggerDash(1, 0);

  const expanded = director.update(100, BASE_INPUT);
  assert.ok(expanded.zoom < 0.99 && expanded.zoom >= 0.95);
  assert.ok(expanded.centerX > BASE_INPUT.playerX);

  let recovered = expanded;
  for (let elapsed = 0; elapsed < 900; elapsed += 50) {
    recovered = director.update(50, BASE_INPUT);
  }
  assert.ok(Math.abs(recovered.zoom - 1) < 0.002);
  assert.ok(Math.abs(recovered.centerX - BASE_INPUT.playerX) < 0.5);
});

test('successful parry pushes toward the attacker midpoint', () => {
  const director = new CinematicCameraDirector();
  director.triggerParry(760, 400);
  const frame = director.update(120, BASE_INPUT);

  assert.ok(frame.zoom > 1.015);
  assert.ok(frame.centerX > BASE_INPUT.playerX);
  assert.ok(frame.centerX < 760);
});

test('heavy impact recoils opposite its attack direction', () => {
  const director = new CinematicCameraDirector();
  director.triggerHeavyImpact(1, 0, 1.4);
  const frame = director.update(80, BASE_INPUT);

  assert.ok(frame.zoom > 1);
  assert.ok(frame.centerX < BASE_INPUT.playerX);
});

test('boss framing zooms farther out for a larger boss', () => {
  const small = new CinematicCameraDirector();
  small.triggerBossIntro(900, 420, 35);
  const smallFrame = small.update(240, BASE_INPUT);

  const large = new CinematicCameraDirector();
  large.triggerBossIntro(900, 420, 95);
  const largeFrame = large.update(240, BASE_INPUT);

  assert.ok(largeFrame.zoom < smallFrame.zoom);
  assert.ok(largeFrame.centerX > BASE_INPUT.playerX + 150);
  assert.ok(Math.abs(largeFrame.centerY - 420) < 20);
});

test('boss framing accounts for wide and large silhouettes', () => {
  assert.ok(getBossFramingRadius(60, 'calamity-dragon') > getBossFramingRadius(60, 'trial'));
  assert.ok(getBossFramingRadius(60, 'frost-golem') > getBossFramingRadius(60, 'trial'));
});

test('ultimate recovery settles back to neutral instead of snapping', () => {
  const director = new CinematicCameraDirector();
  director.triggerUltimateRecovery(600, 400);
  const firstFrame = director.update(40, BASE_INPUT);
  assert.ok(firstFrame.zoom > 1 && firstFrame.zoom < 1.03);

  let recovered = firstFrame;
  for (let elapsed = 0; elapsed < 1200; elapsed += 50) {
    recovered = director.update(50, BASE_INPUT);
  }
  assert.ok(Math.abs(recovered.zoom - 1) < 0.001);
});

test('zero motion intensity always produces the neutral camera', () => {
  const director = new CinematicCameraDirector();
  director.triggerBossIntro(900, 420, 95);
  const frame = director.update(240, { ...BASE_INPUT, motionIntensity: 0 });

  assert.equal(frame.zoom, 1);
  assert.equal(frame.centerX, BASE_INPUT.playerX);
  assert.equal(frame.centerY, BASE_INPUT.playerY);
});

test('camera frame clamps to world bounds and projections round trip', () => {
  const director = new CinematicCameraDirector();
  const frame = director.update(16, { ...BASE_INPUT, playerX: 20, playerY: 20 });

  assert.equal(frame.left, 0);
  assert.equal(frame.top, 0);

  const screenPoint = worldToScreen({ x: 320, y: 240 }, frame);
  const worldPoint = screenToWorld(screenPoint, frame);
  assert.ok(Math.abs(worldPoint.x - 320) < 0.0001);
  assert.ok(Math.abs(worldPoint.y - 240) < 0.0001);
});
