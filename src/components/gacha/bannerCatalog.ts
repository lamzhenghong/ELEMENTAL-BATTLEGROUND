export interface BannerArtworkLayout {
  desktopPosition: string;
  mobilePosition: string;
}

export interface BannerDetails {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  type: 'character' | 'weapon';
  featured5Star: string;
  featured5StarId: string;
  featured4Stars: string[];
  tag: string;
  themeColor: string;
  gradientStyle: string;
  details: string;
}

const bannerImages = {
  aurelia: new URL('../../../assets/aurelia_banner.jpg', import.meta.url).href,
  kaelen: new URL('../../../assets/kaelen_banner.jpg', import.meta.url).href,
  maelis: new URL('../../../assets/maelis_banner.jpg', import.meta.url).href,
  veyra: new URL('../../../assets/veyra_banner.jpg', import.meta.url).href,
  standard_banner: new URL('../../../assets/standard_banner.jpg', import.meta.url).href,
  weapon: new URL('../../../assets/weapon_banner.jpg', import.meta.url).href
} as const;

export const getBannerImage = (featured5StarId: string, type: 'character' | 'weapon') => {
  if (type === 'weapon') return bannerImages.weapon;
  return bannerImages[featured5StarId as keyof Omit<typeof bannerImages, 'weapon'>]
    ?? bannerImages.aurelia;
};

const BANNER_ARTWORK_LAYOUTS: Record<string, BannerArtworkLayout> = {
  aurelia: { desktopPosition: 'center 26%', mobilePosition: '66% 16%' },
  kaelen: { desktopPosition: 'center 26%', mobilePosition: '66% 16%' },
  maelis: { desktopPosition: 'center 24%', mobilePosition: '66% 16%' },
  veyra: { desktopPosition: 'center 28%', mobilePosition: '66% 14%' },
  standard_banner: { desktopPosition: '58% 30%', mobilePosition: '68% 25%' },
  weapon: { desktopPosition: '60% 40%', mobilePosition: '66% 38%' }
};

export const getBannerArtworkLayout = (
  featured5StarId: string,
  type: 'character' | 'weapon'
): BannerArtworkLayout => {
  if (type === 'weapon') return BANNER_ARTWORK_LAYOUTS.weapon;
  return BANNER_ARTWORK_LAYOUTS[featured5StarId] ?? {
    desktopPosition: 'center 24%',
    mobilePosition: '66% 18%'
  };
};

export const getBannerGradient = (featured5StarId: string, type: 'character' | 'weapon') => {
  if (type === 'weapon') {
    return 'linear-gradient(to right, rgba(15, 10, 15, 0.95) 0%, rgba(15, 10, 15, 0.7) 55%, rgba(15, 10, 15, 0.2) 100%)';
  }
  if (featured5StarId === 'aurelia') {
    return 'linear-gradient(to right, rgba(16, 10, 10, 0.95) 0%, rgba(16, 10, 10, 0.7) 55%, rgba(16, 10, 10, 0.2) 100%)';
  }
  if (featured5StarId === 'kaelen') {
    return 'linear-gradient(to right, rgba(10, 16, 28, 0.95) 0%, rgba(10, 16, 28, 0.7) 55%, rgba(10, 16, 28, 0.2) 100%)';
  }
  if (featured5StarId === 'maelis') {
    return 'linear-gradient(to right, rgba(5, 20, 13, 0.96) 0%, rgba(5, 20, 13, 0.72) 55%, rgba(5, 20, 13, 0.24) 100%)';
  }
  if (featured5StarId === 'veyra') {
    return 'linear-gradient(to right, rgba(12, 8, 28, 0.96) 0%, rgba(12, 8, 28, 0.72) 55%, rgba(12, 8, 28, 0.24) 100%)';
  }
  if (featured5StarId === 'standard_banner') {
    return 'linear-gradient(to right, rgba(15, 12, 28, 0.95) 0%, rgba(15, 12, 28, 0.7) 55%, rgba(15, 12, 28, 0.2) 100%)';
  }
  return 'linear-gradient(to right, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.75) 55%, rgba(11, 15, 25, 0.3) 100%)';
};

export const BASE_BANNERS: BannerDetails[] = [
  {
    id: 'char_banner_1',
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
    details: '5★ Rate: 50% chance to summon Aurelia Sunflare [EVENT LIMITED]. If not, any other random 5★ champion.'
  },
  {
    id: 'char_banner_2',
    title: 'Wanderlust Invocation',
    subtitle: 'STANDARD BANNER',
    desc: 'Summon standard characters with standard rates. A random 5★ champion is guaranteed on every 5★ drop. Includes Lyra, Zephyr, Goliath, and Raijin.',
    type: 'character',
    featured5Star: 'Lyra Frostbloom',
    featured5StarId: 'standard_banner',
    featured4Stars: ['Ignis Hearthward', 'Marina Dewdrop', 'Lyra Frostbloom', 'Raijin Volt', 'Tessa Shardweaver', 'Varek Ironfist'],
    tag: 'STANDARD BANNER',
    themeColor: 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    gradientStyle: 'from-indigo-950/70 via-[#0d1020] to-[#05060f]',
    details: '5★ Rate: 100% chance to summon a random standard 5★ character. Excludes limited event characters.'
  },
  {
    id: 'weapon_banner_1',
    title: 'Epitome Invocation: Custom Armory',
    subtitle: 'LEGENDARY WEAPON INVOCATION',
    desc: 'Forge your armaments with absolute accuracy! Select your desired 5★ Legendary Weapon and obtain it with a 100% guarantee on your next 5★ pull!',
    type: 'weapon',
    featured5Star: 'Solar Searing Blade (Sword)',
    featured5StarId: 'w_solar_searing',
    featured4Stars: ['Favonius Greatsword', 'Sacrificial Sword'],
    tag: '5★ Custom Weapon Selector',
    themeColor: 'border-rose-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    gradientStyle: 'from-rose-950/60 via-[#1c0d12] to-[#0f0709]',
    details: 'Guaranteed selected 5★ target weapon on roll. Select your weapon below.'
  }
];
