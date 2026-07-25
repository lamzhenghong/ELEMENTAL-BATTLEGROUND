import assert from 'node:assert/strict';
import test from 'node:test';
import {
  INITIAL_SAVE_STATE,
  createInitialSaveState,
  formatPlayTime,
  normalizeLoadedSaveState,
} from './gameSave';

test('creates an isolated clone of every mutable starter collection', () => {
  const first = createInitialSaveState();
  const second = createInitialSaveState();

  first.mora = 1;
  first.inventoryWeapons[0].level = 50;
  first.inventoryItems[0].count = 0;
  first.partyIds.push('ignis');
  first.stats.totalPulls = 99;
  first.storyProgress?.completedStages.push('1-1');

  assert.equal(second.mora, 30_000);
  assert.equal(second.inventoryWeapons[0].level, 1);
  assert.equal(second.inventoryItems[0].count, 35);
  assert.deepEqual(second.partyIds, ['marina']);
  assert.equal(second.stats.totalPulls, 0);
  assert.deepEqual(second.storyProgress?.completedStages, []);
  assert.notEqual(first, INITIAL_SAVE_STATE);
});

test('preserves the current starter save schema and defaults', () => {
  const save = createInitialSaveState();

  assert.equal(save.aetherGems, 1_600);
  assert.equal(save.playerLevel, 1);
  assert.equal(save.disableGameplayCutscenes, false);
  assert.deepEqual(save.unlockedCharacterIds, ['marina']);
  assert.equal(save.characterEquippedWeapon.marina, 'start_w_3');
  assert.equal(save.inventoryWeapons.length, 5);
  assert.equal(save.inventoryItems.find(item => item.id === 'wit_exp')?.rarity, 3);
  assert.equal(save.inventoryItems.find(item => item.id === 'ore_exp')?.rarity, 4);
  assert.equal(
    save.inventoryItems.find(item => item.id === 'ore_exp')?.desc,
    'Drops from clearing rooms in Rogue Ruins — higher rooms grant more. Required to advance characters from Lv.50 to Lv.80.',
  );
  assert.equal(save.activeUiTheme, 'Blue');
  assert.equal(save.storyProgress?.currentStage, '1-1');
});

test('migrates removed damage skins and locked themes safely', () => {
  const normalized = normalizeLoadedSaveState({
    playerLevel: 19,
    unlockedDamageSkins: ['Flame', 'Ice', 'Electro', 'Void', 'Dragon', 'Ice'],
    activeDamageSkin: 'Dragon',
    activeUiTheme: 'Void',
  });

  assert.deepEqual(normalized.unlockedDamageSkins, ['Default', 'Ice', 'Void']);
  assert.equal(normalized.activeDamageSkin, 'Default');
  assert.equal(normalized.activeUiTheme, 'Blue');
});

test('restores only unlocked party members and falls back to Marina', () => {
  const restored = normalizeLoadedSaveState({
    unlockedCharacterIds: ['marina', 'aurelia'],
    partyIds: ['aurelia', 'locked-character', 'marina'],
  });
  const fallback = normalizeLoadedSaveState({
    unlockedCharacterIds: ['marina'],
    partyIds: ['locked-character'],
  });

  assert.deepEqual(restored.partyIds, ['aurelia', 'marina']);
  assert.deepEqual(fallback.partyIds, ['marina']);
});

test('normalizes duplicate weapon ownership while preserving the first owner', () => {
  const normalized = normalizeLoadedSaveState({
    characterEquippedWeapon: {
      marina: 'shared_weapon',
      aurelia: 'shared_weapon',
      kaelen: 'unique_weapon',
    },
  });

  assert.deepEqual(normalized.characterEquippedWeapon, {
    marina: 'shared_weapon',
    kaelen: 'unique_weapon',
  });
});

test('normalizes legacy story progress without discarding completion', () => {
  const normalized = normalizeLoadedSaveState({
    storyProgress: {
      currentChapter: 4,
      currentStage: '4-3',
      completedStages: ['4-1', '4-2'],
      starRatings: { '4-1': 3 },
      unlockedLoreEntries: [],
      completedCharacterStoryActs: {},
      hardModeUnlockedChapters: [],
      hardModeCompletedStages: [],
      storyChoices: {},
    },
  });

  assert.equal(normalized.storyProgress?.currentChapter, 4);
  assert.deepEqual(normalized.storyProgress?.completedStages, ['4-1', '4-2']);
  assert.deepEqual(normalized.storyProgress?.starRatings, { '4-1': 3 });
});

test('formats play time with the existing hour, minute, and second display', () => {
  assert.equal(formatPlayTime(), '0s');
  assert.equal(formatPlayTime(59), '59s');
  assert.equal(formatPlayTime(61), '1m 1s');
  assert.equal(formatPlayTime(3_661), '1h 1m 1s');
});
