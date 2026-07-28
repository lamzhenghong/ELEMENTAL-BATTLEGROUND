import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  SPECIAL_ULTIMATE_BGM_URL,
  SPECIAL_ULTIMATE_FADE_IN_MS,
  SPECIAL_ULTIMATE_FADE_OUT_MS,
  SpecialUltimateBgmPlayer,
  type SpecialUltimateAudioLike
} from './specialUltimateBgm';

assert.match(SPECIAL_ULTIMATE_BGM_URL, /SPECIAL%20ULTIMATE%20BGM\.mp3(?:$|\?)/i);
assert.equal(existsSync(fileURLToPath(SPECIAL_ULTIMATE_BGM_URL)), true);
assert.ok(SPECIAL_ULTIMATE_FADE_IN_MS >= 250);
assert.ok(SPECIAL_ULTIMATE_FADE_OUT_MS >= 500);

class FakeAudio implements SpecialUltimateAudioLike {
  src = '';
  currentTime = 12;
  loop = true;
  preload = '';
  volume = 0;
  muted = false;
  paused = true;
  playsInline = false;
  playCalls = 0;
  pauseCalls = 0;
  loadCalls = 0;

  play() {
    this.paused = false;
    this.playCalls++;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.pauseCalls++;
  }

  load() {
    this.loadCalls++;
  }
}

let audioInstances = 0;
const fakeAudio = new FakeAudio();
const player = new SpecialUltimateBgmPlayer({
  audioFactory: () => {
    audioInstances++;
    return fakeAudio;
  },
  fadeInMs: 0,
  fadeOutMs: 0,
  mobile: false
});

player.preload();
assert.equal(audioInstances, 1);
assert.equal(fakeAudio.src, SPECIAL_ULTIMATE_BGM_URL);
assert.equal(fakeAudio.preload, 'auto');
assert.equal(fakeAudio.loop, false);
assert.equal(fakeAudio.playsInline, true);
assert.equal(fakeAudio.loadCalls, 1);

player.setVolume(0.8);
player.play();
assert.equal(fakeAudio.currentTime, 0);
assert.equal(fakeAudio.playCalls, 1);
assert.ok(fakeAudio.volume > 0);

player.play();
assert.equal(audioInstances, 1, 'every activation must reuse the same audio element');
assert.equal(fakeAudio.playCalls, 2);

let stopped = false;
player.stop(() => {
  stopped = true;
});
assert.equal(fakeAudio.paused, true);
assert.equal(fakeAudio.currentTime, 0);
assert.equal(stopped, true);

player.setMuted(true);
assert.equal(fakeAudio.muted, true);

console.log('file-backed special ultimate BGM rules ok');
