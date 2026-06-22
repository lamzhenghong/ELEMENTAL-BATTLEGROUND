import { PlayableCharacter } from '../types';

export const DAY_MS = 86400000;

export const LIMITED_CHARACTER_IDS = ['aurelia', 'kaelen', 'maelis', 'veyra'] as const;
export type LimitedCharacterId = typeof LIMITED_CHARACTER_IDS[number];

export interface LimitedCharacterBanner {
  title: string;
  subtitle: 'LIMITED BANNER';
  desc: string;
  type: 'character';
  featured5Star: string;
  featured5StarId: LimitedCharacterId;
  featured4Stars: string[];
  tag: string;
  themeColor: string;
  gradientStyle: string;
  details: string;
}

export const isLimitedCharacterId = (id: string): id is LimitedCharacterId =>
  LIMITED_CHARACTER_IDS.includes(id as LimitedCharacterId);

export const getStandardFiveStarCharacters = (characters: PlayableCharacter[]) =>
  characters.filter(c => c.rarity === 5 && !isLimitedCharacterId(c.id));

export const LIMITED_CHARACTER_BANNERS: LimitedCharacterBanner[] = [
  {
    title: 'Solar Crucible Dawning',
    subtitle: 'LIMITED BANNER',
    desc: 'Unleash the ultimate power of solar flames! Greatly enhanced drop-rates for 5★ Aurelia Sunflare. Commands lightning fast Sword slashes.',
    type: 'character',
    featured5Star: 'Aurelia Sunflare',
    featured5StarId: 'aurelia',
    featured4Stars: ['Ignis Hearthward', 'Raijin Volt'],
    tag: 'LIMITED BANNER',
    themeColor: 'border-orange-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    gradientStyle: 'from-orange-950/70 via-[#100d1c] to-[#08070f]',
    details: '5★ Rate: 50% chance to summon Aurelia Sunflare [EVENT LIMITED]. If not, any other standard 5★ character.'
  },
  {
    title: 'Drifting Sea-Mist Tempest',
    subtitle: 'LIMITED BANNER',
    desc: 'Brave the crushing waves and chilling blizzards! Uprated chance for 5★ Kaelen Tidebound. Controls powerful field elemental catalysts.',
    type: 'character',
    featured5Star: 'Kaelen Tidebound',
    featured5StarId: 'kaelen',
    featured4Stars: ['Marina Dewdrop', 'Lyra Frostbloom'],
    tag: 'LIMITED BANNER',
    themeColor: 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    gradientStyle: 'from-cyan-950/70 via-[#0d152a] to-[#050811]',
    details: '5★ Rate: 50% chance to summon Kaelen Tidebound [EVENT LIMITED]. If not, any other standard 5★ character.'
  },
  {
    title: 'Verdant Oath of the Deepwood',
    subtitle: 'LIMITED BANNER',
    desc: 'Call forth 5★ Maelis Verdantveil, a male Dendro claymore sentinel who carves living root sigils into the battlefield.',
    type: 'character',
    featured5Star: 'Maelis Verdantveil',
    featured5StarId: 'maelis',
    featured4Stars: ['Flora Bloom', 'Varek Ironfist'],
    tag: 'LIMITED BANNER',
    themeColor: 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.18)]',
    gradientStyle: 'from-emerald-950/70 via-[#0c1a14] to-[#050f0a]',
    details: '5★ Rate: 50% chance to summon Maelis Verdantveil [EVENT LIMITED]. If not, any other standard 5★ character.'
  },
  {
    title: 'Stormglass Nocturne',
    subtitle: 'LIMITED BANNER',
    desc: 'Aim through the midnight prism with 5★ Veyra Stormglass, a female Electro archer who fractures thunder into crystal arrows.',
    type: 'character',
    featured5Star: 'Veyra Stormglass',
    featured5StarId: 'veyra',
    featured4Stars: ['Luna Spark', 'Seraphina Cloudwhisper'],
    tag: 'LIMITED BANNER',
    themeColor: 'border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.18)]',
    gradientStyle: 'from-violet-950/70 via-[#100d24] to-[#060711]',
    details: '5★ Rate: 50% chance to summon Veyra Stormglass [EVENT LIMITED]. If not, any other standard 5★ character.'
  }
];

const positiveModulo = (value: number, length: number) => ((value % length) + length) % length;

export const getLimitedRotationIndex = (timeMs: number = Date.now(), offsetDays = 0) =>
  positiveModulo(Math.floor(timeMs / DAY_MS) + offsetDays, LIMITED_CHARACTER_BANNERS.length);

export const getLimitedCharacterBannerForTime = (timeMs: number = Date.now(), offsetDays = 0) =>
  LIMITED_CHARACTER_BANNERS[getLimitedRotationIndex(timeMs, offsetDays)];
