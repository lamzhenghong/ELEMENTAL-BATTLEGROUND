import { ElementType } from '../types';

export const COMBO_TIMEOUT_FRAMES = 180;
export const COMBO_MILESTONES = [10, 25, 50, 100] as const;

export type ComboMilestone = {
  hits: typeof COMBO_MILESTONES[number];
  label: string;
  color: string;
  shake: number;
};

const COMBO_MILESTONE_DETAILS: Record<typeof COMBO_MILESTONES[number], ComboMilestone> = {
  10: { hits: 10, label: '10 HIT COMBO', color: '#38bdf8', shake: 0 },
  25: { hits: 25, label: '25 HIT COMBO', color: '#a78bfa', shake: 0 },
  50: { hits: 50, label: '50 HIT COMBO', color: '#c084fc', shake: 10 },
  100: { hits: 100, label: '100 HIT COMBO', color: '#fbbf24', shake: 18 }
};

export const getComboMilestone = (hits: number): ComboMilestone | null => {
  return COMBO_MILESTONE_DETAILS[hits as typeof COMBO_MILESTONES[number]] || null;
};

export const shouldResetCombo = (framesSinceDamage: number) => framesSinceDamage >= COMBO_TIMEOUT_FRAMES;

export type BossPhaseEvent = {
  key: string;
  threshold: number;
  label: string;
  color: string;
  shake: number;
};

export const BOSS_PHASE_THRESHOLDS: readonly BossPhaseEvent[] = [
  { key: '75', threshold: 0.75, label: 'BOSS ARMOR CRACKING', color: '#fbbf24', shake: 5 },
  { key: '50', threshold: 0.50, label: 'BOSS PHASE II', color: '#fb923c', shake: 10 },
  { key: '25', threshold: 0.25, label: 'FINAL PHASE', color: '#ef4444', shake: 14 },
  { key: '10', threshold: 0.10, label: 'FINAL STAND', color: '#f43f5e', shake: 18 }
];

export const getBossPhaseEvents = (hpPct: number, seenKeys: Set<string>) => {
  const events: BossPhaseEvent[] = [];
  BOSS_PHASE_THRESHOLDS.forEach(event => {
    if (hpPct <= event.threshold && !seenKeys.has(event.key)) {
      seenKeys.add(event.key);
      events.push(event);
    }
  });
  return events;
};

export const NORMAL_WEATHER_ROTATION = ['Sunny', 'Rain', 'Thunderstorm', 'Snow'] as const;
export type NormalWeather = typeof NORMAL_WEATHER_ROTATION[number];
export type RareWeather = 'Eclipse' | 'Aurora' | 'Meteor Shower' | 'Blossom Wind' | 'Blood Moon';
export type CombatWeather = NormalWeather | RareWeather;
export type WeatherRarity = 'Normal' | 'Rare' | 'Legendary';

export type WeatherDefinition = {
  id: RareWeather;
  title: string;
  subtitle: string;
  color: string;
};

export const RARE_WEATHER_DEFINITIONS: readonly WeatherDefinition[] = [
  { id: 'Eclipse', title: 'ECLIPSE', subtitle: 'Ultimate Damage +20%', color: '#a855f7' },
  { id: 'Aurora', title: 'AURORA', subtitle: 'Ultimate Energy +50%', color: '#22d3ee' },
  { id: 'Meteor Shower', title: 'METEOR SHOWER', subtitle: 'Meteor hazards active', color: '#fb923c' },
  { id: 'Blossom Wind', title: 'BLOSSOM WIND', subtitle: 'Faster movement and dodges', color: '#f9a8d4' },
  { id: 'Blood Moon', title: 'BLOOD MOON', subtitle: 'Enemies stronger, rewards increased', color: '#ef4444' }
];

const NORMAL_WEATHER_COPY: Record<NormalWeather, { title: string; subtitle: string; color: string }> = {
  Sunny: { title: 'SUNNY', subtitle: 'Pyro Damage +10%', color: '#fb923c' },
  Rain: { title: 'RAIN', subtitle: 'Hydro Damage +10%', color: '#38bdf8' },
  Thunderstorm: { title: 'THUNDERSTORM', subtitle: 'Lightning hazards active', color: '#a855f7' },
  Snow: { title: 'SNOW', subtitle: 'Rapid stamina drain', color: '#67e8f9' }
};

export const isNormalWeather = (weather: CombatWeather): weather is NormalWeather => {
  return (NORMAL_WEATHER_ROTATION as readonly string[]).includes(weather);
};

export const getWeatherAnnouncement = (weather: CombatWeather, rarity: WeatherRarity) => {
  if (isNormalWeather(weather)) {
    return {
      title: NORMAL_WEATHER_COPY[weather].title,
      subtitle: NORMAL_WEATHER_COPY[weather].subtitle,
      color: NORMAL_WEATHER_COPY[weather].color,
      rarity
    };
  }

  const definition = RARE_WEATHER_DEFINITIONS.find(item => item.id === weather) || RARE_WEATHER_DEFINITIONS[0];
  return {
    title: `${rarity === 'Legendary' ? 'LEGENDARY WEATHER' : 'RARE WEATHER'}: ${definition.title}`,
    subtitle: definition.subtitle,
    color: definition.color,
    rarity
  };
};

export const getNextNormalWeather = (current: NormalWeather) => {
  const idx = NORMAL_WEATHER_ROTATION.indexOf(current);
  return NORMAL_WEATHER_ROTATION[(idx + 1) % NORMAL_WEATHER_ROTATION.length];
};

export const rollNextWeather = (
  currentNormalWeather: NormalWeather,
  random: () => number = Math.random
): { weather: CombatWeather; replacedNormalWeather: NormalWeather; rarity: WeatherRarity } => {
  const replacedNormalWeather = getNextNormalWeather(currentNormalWeather);
  const roll = random();

  if (roll < 0.005) {
    const rareIndex = Math.floor(random() * RARE_WEATHER_DEFINITIONS.length);
    return {
      weather: RARE_WEATHER_DEFINITIONS[rareIndex].id,
      replacedNormalWeather,
      rarity: 'Legendary'
    };
  }

  if (roll < 0.05) {
    const rareIndex = Math.floor(random() * RARE_WEATHER_DEFINITIONS.length);
    return {
      weather: RARE_WEATHER_DEFINITIONS[rareIndex].id,
      replacedNormalWeather,
      rarity: 'Rare'
    };
  }

  return { weather: replacedNormalWeather, replacedNormalWeather, rarity: 'Normal' };
};

export const getWeatherDamageMultiplier = (
  weather: CombatWeather,
  source: 'basic' | 'skill' | 'ultimate',
  element?: ElementType
) => {
  if (weather === 'Sunny' && element === 'Pyro') return 1.1;
  if (weather === 'Rain' && element === 'Hydro') return 1.1;
  if (weather === 'Eclipse' && source === 'ultimate') return 1.2;
  return 1;
};

export const getWeatherEnergyMultiplier = (weather: CombatWeather) => {
  return weather === 'Aurora' ? 1.5 : 1;
};

export const getWeatherHealingMultiplier = (weather: CombatWeather) => {
  return weather === 'Aurora' ? 1.2 : 1;
};

export const getWeatherRewardMultiplier = (weather: CombatWeather) => {
  return weather === 'Blood Moon' ? 1.2 : 1;
};

export const getWeatherIncomingDamageMultiplier = (weather: CombatWeather) => {
  return weather === 'Blood Moon' ? 1.2 : 1;
};

export const getWeatherMoveSpeedMultiplier = (weather: CombatWeather) => {
  return weather === 'Blossom Wind' ? 1.12 : 1;
};

export const getWeatherDodgeCooldownMultiplier = (weather: CombatWeather) => {
  return weather === 'Blossom Wind' ? 0.7 : 1;
};

export const getWeatherEnemySpeedMultiplier = (weather: CombatWeather) => {
  if (weather === 'Eclipse') return 1.08;
  if (weather === 'Blood Moon') return 1.08;
  return 1;
};
