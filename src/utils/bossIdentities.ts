import { PLAYABLE_CHARACTERS } from '../data/characters';
import type { CharacterRole, ElementType, WeaponType } from '../types';

export type BossMechanicProfile = 'fire_dragon' | 'ice_golem' | 'thunderbird';
export type BossIdentityCategory = 'campaign' | 'world' | 'trial';
export type BossVisualKind =
  | 'calamity-dragon'
  | 'frost-golem'
  | 'tempest-bird'
  | 'void-overlord'
  | 'eternity-knight'
  | 'frostfire-wyrm'
  | 'skyward-avian'
  | 'molten-overlord'
  | 'chronos-monarch'
  | 'core-prime'
  | 'world-drake'
  | 'world-golem'
  | 'world-bird'
  | 'trial';

export interface BossIdentity {
  id: string;
  name: string;
  category: BossIdentityCategory;
  source: string;
  element: ElementType;
  color: string;
  secondaryColor: string;
  visualKind: BossVisualKind;
  mechanicProfile: BossMechanicProfile;
  skillName: string;
  mechanic: string;
  counter: string;
  seed: number;
  weaponType?: WeaponType;
  role?: CharacterRole;
  rarity?: 3 | 4 | 5;
  motif?: string;
}

interface MechanicCopy {
  skillName: string;
  mechanic: string;
  counter: string;
}

export const BOSS_MECHANIC_PROFILES: Readonly<Record<BossMechanicProfile, MechanicCopy>> = {
  fire_dragon: {
    skillName: 'Calamity Pattern',
    mechanic: 'Launches aimed fireballs. Phase II ignites persistent arena patches, and Phase III calls delayed meteors onto the player.',
    counter: 'Keep moving, leave burning zones immediately, and dash out of every meteor marker before it closes.'
  },
  ice_golem: {
    skillName: 'Glacial Pattern',
    mechanic: 'Fires a three-shard spread. Phase II creates slowing blizzard fields, and Phase III surrounds itself with a damaging Frozen Tomb aura.',
    counter: 'Sidestep the shard fan, avoid pale ice fields, and fight outside the final close-range aura.'
  },
  thunderbird: {
    skillName: 'Tempest Pattern',
    mechanic: 'Marks the player for lightning strikes. Phase II forms a three-point lightning wall, and Phase III calls rapid repeated bolts.',
    counter: 'Move as soon as a marker appears, preserve Dash for grouped warnings, and never stand still during the final phase.'
  }
};

const ELEMENT_COLORS: Record<ElementType, { primary: string; secondary: string; hue: number }> = {
  Pyro: { primary: '#ff4d35', secondary: '#ffb21c', hue: 8 },
  Hydro: { primary: '#22b8ff', secondary: '#7de6ff', hue: 199 },
  Cryo: { primary: '#75e6ff', secondary: '#e4fbff', hue: 190 },
  Electro: { primary: '#ad67ff', secondary: '#f080ff', hue: 270 },
  Anemo: { primary: '#48e2c2', secondary: '#b8fff0', hue: 164 },
  Geo: { primary: '#f4bb32', secondary: '#fff0a0', hue: 43 },
  Dendro: { primary: '#50d768', secondary: '#c6ff7b', hue: 130 }
};

const hashString = (value: string) => {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const getProfileForElement = (element: ElementType): BossMechanicProfile => {
  if (element === 'Cryo' || element === 'Hydro') return 'ice_golem';
  if (element === 'Electro' || element === 'Anemo') return 'thunderbird';
  return 'fire_dragon';
};

const withMechanic = (
  identity: Omit<BossIdentity, 'skillName' | 'mechanic' | 'counter' | 'seed'> & {
    skillName?: string;
    mechanic?: string;
    counter?: string;
  }
): BossIdentity => {
  const profile = BOSS_MECHANIC_PROFILES[identity.mechanicProfile];
  return {
    ...identity,
    skillName: identity.skillName ?? profile.skillName,
    mechanic: identity.mechanic ?? profile.mechanic,
    counter: identity.counter ?? profile.counter,
    seed: hashString(identity.id)
  };
};

const CAMPAIGN_BOSS_IDENTITIES: readonly BossIdentity[] = [
  withMechanic({
    id: 'campaign-calamity-pyro-dragon',
    name: 'Calamity Pyro Dragon',
    category: 'campaign',
    source: 'Chapter 1 - Ruins Core Boss',
    element: 'Pyro',
    color: '#ff3b21',
    secondaryColor: '#ffc22e',
    visualKind: 'calamity-dragon',
    mechanicProfile: 'fire_dragon',
    skillName: 'Ruins Core Calamity'
  }),
  withMechanic({
    id: 'campaign-glacial-frost-golem',
    name: 'Glacial Frost Golem',
    category: 'campaign',
    source: 'Chapter 2 - Elemental Overlord Boss',
    element: 'Cryo',
    color: '#63dcff',
    secondaryColor: '#f0fdff',
    visualKind: 'frost-golem',
    mechanicProfile: 'ice_golem',
    skillName: 'Absolute Zero Lens'
  }),
  withMechanic({
    id: 'campaign-tempest-thunderbird',
    name: 'Tempest Thunderbird',
    category: 'campaign',
    source: 'Chapter 3 - Ancient Dragon Boss',
    element: 'Electro',
    color: '#a858ff',
    secondaryColor: '#f2a2ff',
    visualKind: 'tempest-bird',
    mechanicProfile: 'thunderbird',
    skillName: 'Summit Storm Matrix'
  }),
  withMechanic({
    id: 'campaign-void-overlord',
    name: 'Colossus of Cryo',
    category: 'campaign',
    source: 'Chapter 4 - Void Overlord Boss',
    element: 'Cryo',
    color: '#6d45d8',
    secondaryColor: '#fa57c6',
    visualKind: 'void-overlord',
    mechanicProfile: 'ice_golem',
    skillName: 'Black-Ice Eclipse'
  }),
  withMechanic({
    id: 'campaign-eternity-knight',
    name: 'Colossus of Electro',
    category: 'campaign',
    source: 'Chapter 5 - Eternity Knight Boss',
    element: 'Electro',
    color: '#8f5bff',
    secondaryColor: '#ffd65a',
    visualKind: 'eternity-knight',
    mechanicProfile: 'thunderbird',
    skillName: 'Eternal Clockwall'
  }),
  withMechanic({
    id: 'campaign-frostfire-wyrm',
    name: 'Colossus of Anemo',
    category: 'campaign',
    source: 'Chapter 6 - Frostfire Wyrm Boss',
    element: 'Anemo',
    color: '#32d8c4',
    secondaryColor: '#ff7048',
    visualKind: 'frostfire-wyrm',
    mechanicProfile: 'fire_dragon',
    skillName: 'Frostfire Convergence'
  }),
  withMechanic({
    id: 'campaign-skyward-avian',
    name: 'Colossus of Geo',
    category: 'campaign',
    source: 'Chapter 7 - Skyward Avian Boss',
    element: 'Geo',
    color: '#e4aa27',
    secondaryColor: '#fff2a8',
    visualKind: 'skyward-avian',
    mechanicProfile: 'ice_golem',
    skillName: 'Crownwind Anchor'
  }),
  withMechanic({
    id: 'campaign-molten-overlord',
    name: 'Colossus of Dendro',
    category: 'campaign',
    source: 'Chapter 8 - Molten Overlord Boss',
    element: 'Dendro',
    color: '#35c95c',
    secondaryColor: '#ff963c',
    visualKind: 'molten-overlord',
    mechanicProfile: 'thunderbird',
    skillName: 'Worldforge Root'
  }),
  withMechanic({
    id: 'campaign-chronos-monarch',
    name: 'Colossus of Pyro',
    category: 'campaign',
    source: 'Chapter 9 - Chronos Monarch Boss',
    element: 'Pyro',
    color: '#e84b32',
    secondaryColor: '#ffe071',
    visualKind: 'chronos-monarch',
    mechanicProfile: 'fire_dragon',
    skillName: 'One Perfect Second'
  }),
  withMechanic({
    id: 'campaign-eldric-core-prime',
    name: 'Colossus of Hydro',
    category: 'campaign',
    source: 'Chapter 10 - Eldric Core Prime Boss',
    element: 'Hydro',
    color: '#19a9eb',
    secondaryColor: '#f3feff',
    visualKind: 'core-prime',
    mechanicProfile: 'ice_golem',
    skillName: 'Prime Orbit Collapse'
  })
];

const WORLD_BOSS_IDENTITIES: readonly BossIdentity[] = [
  withMechanic({
    id: 'world-calamity-drake',
    name: 'Calamity Drake',
    category: 'world',
    source: 'Combat Arena / Artifact Grind / Rogue Ruins',
    element: 'Pyro',
    color: '#dc2626',
    secondaryColor: '#fb923c',
    visualKind: 'world-drake',
    mechanicProfile: 'fire_dragon'
  }),
  withMechanic({
    id: 'world-glacial-golem',
    name: 'Glacial Golem',
    category: 'world',
    source: 'Combat Arena / Artifact Grind / Rogue Ruins',
    element: 'Cryo',
    color: '#06b6d4',
    secondaryColor: '#bae6fd',
    visualKind: 'world-golem',
    mechanicProfile: 'ice_golem'
  }),
  withMechanic({
    id: 'world-tempest-thunderbird',
    name: 'Tempest Thunderbird',
    category: 'world',
    source: 'Combat Arena / Artifact Grind / Rogue Ruins',
    element: 'Electro',
    color: '#a855f7',
    secondaryColor: '#e879f9',
    visualKind: 'world-bird',
    mechanicProfile: 'thunderbird'
  })
];

const TRIAL_MOTIFS: Readonly<Record<string, string>> = {
  aurelia: 'solar-crown',
  ignis: 'anvil',
  kaelen: 'fleet',
  maelis: 'heartwood',
  veyra: 'prism',
  marina: 'compass',
  lyra: 'frostbloom',
  varek: 'ironfist',
  zephyr: 'gale',
  seraphina: 'skyhalo',
  goliath: 'bastion',
  tessa: 'geode',
  raijin: 'thunder-spear',
  luna: 'moon-coil',
  verdant: 'thorn',
  flora: 'mushroom',
  valerie: 'crimson',
  nero: 'leviathan',
  cynthia: 'shadowfrost',
  aero: 'storm',
  kira: 'coins',
  sylvia: 'roots',
  arthur: 'novice',
  chloe: 'satchel',
  hans: 'pickaxe',
  stella: 'ribbons',
  brock: 'quarry',
  tesla: 'coil',
  ivy: 'bower',
  skip: 'boltwood',
  dusty: 'dunes',
  river: 'torrent'
};

const CHARACTER_TRIAL_BOSS_IDENTITIES: readonly BossIdentity[] = PLAYABLE_CHARACTERS.map(
  (character, index) => {
    const palette = ELEMENT_COLORS[character.element];
    const profile = getProfileForElement(character.element);
    const hue = (palette.hue + index * 7 + Math.floor(index / 7) * 3) % 360;
    const lightness = 52 + (index % 5) * 2;
    const secondaryHue = (hue + 28 + (index % 3) * 9) % 360;
    return withMechanic({
      id: `trial-${character.id}`,
      name: `${character.name} Trial Boss`,
      category: 'trial',
      source: 'Character Story Act 3',
      element: character.element,
      color: `hsl(${hue} 88% ${lightness}%)`,
      secondaryColor: `hsl(${secondaryHue} 92% ${Math.min(78, lightness + 16)}%)`,
      visualKind: 'trial',
      mechanicProfile: profile,
      skillName: `${character.title} Trial`,
      weaponType: character.weaponType,
      role: character.role,
      rarity: character.rarity,
      motif: TRIAL_MOTIFS[character.id] ?? character.id
    });
  }
);

export const BOSS_IDENTITIES: readonly BossIdentity[] = [
  ...CAMPAIGN_BOSS_IDENTITIES,
  ...WORLD_BOSS_IDENTITIES,
  ...CHARACTER_TRIAL_BOSS_IDENTITIES
];

const BOSS_BY_ID = new Map(BOSS_IDENTITIES.map(identity => [identity.id, identity]));

const normalizeBossName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const BOSS_BY_NAME = new Map<string, BossIdentity>();
for (const identity of BOSS_IDENTITIES) {
  const key = normalizeBossName(identity.name);
  if (!BOSS_BY_NAME.has(key)) BOSS_BY_NAME.set(key, identity);
}

const WORLD_BOSS_BY_PROFILE: Record<BossMechanicProfile, BossIdentity> = {
  fire_dragon: WORLD_BOSS_IDENTITIES[0],
  ice_golem: WORLD_BOSS_IDENTITIES[1],
  thunderbird: WORLD_BOSS_IDENTITIES[2]
};

export const getBossIdentityById = (id: string | undefined) =>
  id ? BOSS_BY_ID.get(id) : undefined;

export const getBossIdentityForEnemy = (
  name: string,
  bossType: BossMechanicProfile = 'fire_dragon'
) => BOSS_BY_NAME.get(normalizeBossName(name)) ?? WORLD_BOSS_BY_PROFILE[bossType];

export const getWorldBossIdentityForProfile = (bossType: BossMechanicProfile) =>
  WORLD_BOSS_BY_PROFILE[bossType];

export const getBossIdentityGroups = () => ({
  campaign: CAMPAIGN_BOSS_IDENTITIES,
  world: WORLD_BOSS_IDENTITIES,
  trial: CHARACTER_TRIAL_BOSS_IDENTITIES
});
