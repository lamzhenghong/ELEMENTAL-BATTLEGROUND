import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  BGM_TRACK_URLS,
  BgmPlayer,
  getCombatBgmTrack,
  getScreenBgmTrack,
  resolveBgmTrack,
  type BgmAudioLike,
  type BgmTrackId
} from './bgm';

assert.equal(Object.keys(BGM_TRACK_URLS).length, 10);
assert.equal(new Set(Object.values(BGM_TRACK_URLS)).size, 10);
for (const url of Object.values(BGM_TRACK_URLS)) {
  assert.match(url, /\.mp3(?:$|\?)/i);
  assert.equal(existsSync(fileURLToPath(url)), true, `${url} must exist`);
}

assert.equal(getScreenBgmTrack('menu'), 'main-menu');
for (const screen of ['home', 'party', 'quest', 'shop']) {
  assert.equal(getScreenBgmTrack(screen), 'home-hub');
}
assert.equal(getScreenBgmTrack('story'), 'story-map');
assert.equal(getScreenBgmTrack('arena'), 'combat-arena');
assert.equal(getScreenBgmTrack('dungeon'), 'rogue-exploration');
for (const screen of ['wish', 'inventory', 'wiki', 'unknown']) {
  assert.equal(getScreenBgmTrack(screen), null);
}

assert.equal(getCombatBgmTrack({ storyMode: true, dungeonMode: false, artifactGrindMode: true }), 'story-battle');
assert.equal(getCombatBgmTrack({ storyMode: false, dungeonMode: true, artifactGrindMode: true }), 'rogue-battle');
assert.equal(getCombatBgmTrack({ storyMode: false, dungeonMode: false, artifactGrindMode: true }), 'artifact-grind');
assert.equal(getCombatBgmTrack({ storyMode: false, dungeonMode: false, artifactGrindMode: false }), 'combat-arena');
assert.equal(resolveBgmTrack('story-battle', true), 'boss-battle');
assert.equal(resolveBgmTrack('story-battle', false), 'story-battle');
assert.equal(resolveBgmTrack(null, false), null);

class FakeAudio implements BgmAudioLike {
  src = '';
  currentTime = 0;
  loop = false;
  preload = '';
  volume = 0;
  muted = false;
  paused = true;
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
const player = new BgmPlayer({
  audioFactory: () => {
    audioInstances++;
    return fakeAudio;
  },
  fadeOutMs: 0,
  fadeInMs: 0
});

player.setBaseTrack('combat-arena');
player.start();
assert.equal(player.getCurrentTrack(), 'combat-arena');
assert.equal(fakeAudio.src, BGM_TRACK_URLS['combat-arena']);

player.setBossFightActive(true);
assert.equal(player.getCurrentTrack(), 'boss-battle');
assert.equal(fakeAudio.src, BGM_TRACK_URLS['boss-battle']);

player.setBaseTrack('artifact-grind');
assert.equal(player.getCurrentTrack(), 'boss-battle', 'base track changes must not interrupt a boss');
player.setBossFightActive(false);
assert.equal(player.getCurrentTrack(), 'artifact-grind', 'boss clear must restore the latest base mode');

const rapidTracks: BgmTrackId[] = ['home-hub', 'story-map', 'character-stories-memories', 'story-battle'];
rapidTracks.forEach(track => player.setBaseTrack(track));
assert.equal(player.getCurrentTrack(), 'story-battle');
assert.equal(audioInstances, 1, 'all BGM contexts must reuse one audio element');

player.stop();
assert.equal(fakeAudio.paused, true);

console.log('file-backed BGM routing and single-player rules ok');
