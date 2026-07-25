import { INITIAL_50_QUESTS } from '../data/quests';
import { createDefaultStoryProgress, normalizeStoryProgress } from '../data/story/progress';
import type { SaveState } from '../types';
import { normalizeUniqueEquippedWeapons } from '../utils/equipmentRules';
import { normalizeUiTheme } from '../utils/uiThemes';

export const INITIAL_SAVE_STATE: SaveState = {
  mora: 30000,
  aetherGems: 1600,
  playerLevel: 1,
  playerExp: 0,
  playerExpMax: 100,
  specialUltimateUnlockNotified: false,
  disableGameplayCutscenes: false,
  inventoryWeapons: [
    { id: 'start_w_1', name: 'Dull Blade (Sword)', rarity: 3, weaponType: 'Sword', baseAtk: 18, statBonus: 'ATK +3%', level: 1 },
    { id: 'start_w_2', name: 'Iron Point (Claymore)', rarity: 3, weaponType: 'Claymore', baseAtk: 24, statBonus: 'Physical DMG +4%', level: 1 },
    { id: 'start_w_3', name: 'Hunter Bow (Bow)', rarity: 3, weaponType: 'Bow', baseAtk: 15, statBonus: 'Crit Rate +2%', level: 1 },
    { id: 'start_w_4', name: 'Apprentice Scroll (Catalyst)', rarity: 3, weaponType: 'Catalyst', baseAtk: 16, statBonus: 'Energy Recharge +3%', level: 1 },
    { id: 'start_w_5', name: 'Beginner Pole (Polearm)', rarity: 3, weaponType: 'Polearm', baseAtk: 20, statBonus: 'Physical DMG +2%', level: 1 },
  ],
  inventoryItems: [
    { id: 'wit_exp', name: "Hero's Wit (Character XP Boost)", count: 35, type: 'char_xp', rarity: 3, desc: 'Earned by clearing waves in Combat Arena, defeating enemies, and completing quests. Used to level up characters from Lv.1 to Lv.50.' },
    { id: 'ore_exp', name: 'Myconid Spore Catalyst', count: 20, type: 'ascension', rarity: 4, desc: 'Drops from clearing rooms in Rogue Ruins — higher rooms grant more. Required to advance characters from Lv.50 to Lv.80.' },
  ],
  characterLevels: {
    marina: 1,
  },
  characterPortraits: {
    marina: 0,
  },
  characterHp: {
    marina: 975,
  },
  characterEquippedWeapon: {
    marina: 'start_w_3',
  },
  inventoryArtifacts: [],
  characterEquippedArtifacts: {},
  partyIds: ['marina'],
  unlockedCharacterIds: ['marina'],
  activeQuests: INITIAL_50_QUESTS,
  completedQuestIds: [],
  loginRewardClaimedDays: [],
  unlockedDamageSkins: ['Default'],
  activeDamageSkin: 'Default',
  activeUiTheme: 'Blue',
  lastShopRefreshHour: 0,
  purchasedShopItemIds: [],
  unlockedDaysCount: 1,
  nextRewardUnlockTime: 0,
  lastLoginDateStr: '',
  gachaPity5Star: 0,
  gachaPity4Star: 0,
  bannerPity5Star: {
    char_banner_1: 0,
    char_banner_2: 0,
    weapon_banner_1: 0,
    weapon_banner_2: 0,
  },
  bannerPity4Star: {
    char_banner_1: 0,
    char_banner_2: 0,
    weapon_banner_1: 0,
    weapon_banner_2: 0,
  },
  bannerGuaranteed5Star: {
    char_banner_1: false,
    char_banner_2: false,
    weapon_banner_1: false,
    weapon_banner_2: false,
  },
  stats: {
    totalPulls: 0,
    totalEnemiesDefeated: 0,
    totalBossesDefeated: 0,
    perfectDodges: 0,
    successfulParries: 0,
    reactionsTriggered: 0,
    highScoreWave: 1,
    highScorePoints: 0,
    playTime: 0,
    totalMoraEarned: 30000,
    totalGemsEarned: 1600,
    highScoreRogueRoom: 0,
    longestLoginStreak: 1,
    currentLoginStreak: 1,
  },
  storyProgress: createDefaultStoryProgress(),
};

export const createInitialSaveState = (): SaveState =>
  JSON.parse(JSON.stringify(INITIAL_SAVE_STATE)) as SaveState;

export const normalizeLoadedSaveState = (parsed: Partial<SaveState>): SaveState => {
  const defaultState = createInitialSaveState();
  const merged: SaveState = {
    ...defaultState,
    ...parsed,
    bannerPity5Star: { ...defaultState.bannerPity5Star, ...(parsed.bannerPity5Star || {}) },
    bannerPity4Star: { ...defaultState.bannerPity4Star, ...(parsed.bannerPity4Star || {}) },
    bannerGuaranteed5Star: { ...defaultState.bannerGuaranteed5Star, ...(parsed.bannerGuaranteed5Star || {}) },
    stats: { ...defaultState.stats, ...(parsed.stats || {}) },
    characterLevels: { ...defaultState.characterLevels, ...(parsed.characterLevels || {}) },
    characterPortraits: { ...defaultState.characterPortraits, ...(parsed.characterPortraits || {}) },
    characterHp: { ...defaultState.characterHp, ...(parsed.characterHp || {}) },
    characterEquippedWeapon: { ...defaultState.characterEquippedWeapon, ...(parsed.characterEquippedWeapon || {}) },
    inventoryArtifacts: parsed.inventoryArtifacts || [],
    characterEquippedArtifacts: parsed.characterEquippedArtifacts || {},
    storyProgress: normalizeStoryProgress(parsed.storyProgress),
  };

  merged.inventoryItems = (merged.inventoryItems || []).map(item => {
    if (item.type === 'char_xp' || item.id === 'wit_exp') return { ...item, rarity: 3 };
    if (item.type === 'ascension' || item.id === 'ore_exp') return { ...item, rarity: 4 };
    return item;
  });

  if (!merged.bannerPity5Star?.char_banner_1 && merged.gachaPity5Star) {
    merged.bannerPity5Star = {
      char_banner_1: merged.gachaPity5Star,
      char_banner_2: merged.gachaPity5Star,
      weapon_banner_1: 0,
      weapon_banner_2: 0,
    };
  }
  if (!merged.bannerPity4Star?.char_banner_1 && merged.gachaPity4Star) {
    merged.bannerPity4Star = {
      char_banner_1: merged.gachaPity4Star,
      char_banner_2: merged.gachaPity4Star,
      weapon_banner_1: 0,
      weapon_banner_2: 0,
    };
  }

  if (!merged.activeQuests || merged.activeQuests.length < 30) {
    const completedIds = merged.completedQuestIds || [];
    merged.activeQuests = INITIAL_50_QUESTS.filter(quest => !completedIds.includes(quest.id));
  } else {
    merged.activeQuests = merged.activeQuests.map(quest => {
      const template = INITIAL_50_QUESTS.find(candidate => candidate.id === quest.id);
      return template
        ? {
            ...template,
            currentValue: quest.currentValue ?? 0,
            completed: quest.completed ?? false,
          }
        : quest;
    });
  }

  merged.loginRewardClaimedDays = merged.loginRewardClaimedDays || [];
  const validSkins = ['Default', 'Ice', 'Void', 'Celestial'];
  const savedSkins = Array.isArray(merged.unlockedDamageSkins) ? merged.unlockedDamageSkins : ['Default'];
  merged.unlockedDamageSkins = Array.from(new Set(['Default', ...savedSkins.filter(skin => validSkins.includes(skin))]));
  if (!merged.activeDamageSkin || !validSkins.includes(merged.activeDamageSkin)) {
    merged.activeDamageSkin = 'Default';
  }

  const loadedPartyIds = Array.isArray(parsed.partyIds) ? parsed.partyIds : defaultState.partyIds;
  merged.partyIds = loadedPartyIds
    .filter(characterId => merged.unlockedCharacterIds.includes(characterId))
    .slice(0, 4);
  if (merged.partyIds.length === 0) {
    merged.partyIds = defaultState.partyIds.filter(characterId => merged.unlockedCharacterIds.includes(characterId));
  }

  merged.characterEquippedWeapon = normalizeUniqueEquippedWeapons(merged.characterEquippedWeapon || {});
  merged.activeUiTheme = normalizeUiTheme(merged.activeUiTheme, merged.playerLevel || 1);
  merged.lastShopRefreshHour ??= 0;
  merged.purchasedShopItemIds ||= [];
  merged.unlockedDaysCount ??= 1;
  merged.nextRewardUnlockTime ??= 0;
  merged.lastLoginDateStr ??= '';
  merged.stats.longestLoginStreak ??= 1;
  merged.stats.currentLoginStreak ??= 1;
  return merged;
};

export const formatPlayTime = (seconds: number = 0) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};
