import { ElementType } from '../types';

export interface StoryStageReward {
  gems: number;
  mora: number;
  charXp: number; // count of Hero's Wit
  ascensionMaterialCount?: number;
  specialItem?: string;
}

export interface StoryEnemySpec {
  name: string;
  type: 'Normal' | 'Elite' | 'Boss';
  element: ElementType;
  level: number;
  bossType?: 'fire_dragon' | 'ice_golem' | 'thunderbird';
}

export interface StoryStageSpec {
  id: string; // e.g. "1-1"
  chapter: number;
  name: string;
  recommendedLevel: number;
  difficulty: 'Normal' | 'Hard' | 'Boss';
  desc: string;
  enemies: StoryEnemySpec[];
  firstClearRewards: StoryStageReward;
}

export interface StoryDialogueLine {
  speaker: string;
  text: string;
  element?: ElementType;
  portraitSide?: 'left' | 'right';
  effect?: 'fade-in' | 'shake' | 'flash';
}

export interface StoryCutsceneSpec {
  background: string; // Tailwind bg-gradient details or theme
  slides: StoryDialogueLine[];
}

export const STORY_CHAPTERS = [
  { id: 1, title: 'The Awakening', desc: 'The starting step of the hero. Journey into the Whispering Forest to investigate active elemental anomalies.' },
  { id: 2, title: 'Elemental Crisis', desc: 'Unstable dimensional tears are erupting across the elements. Secure the burning plains and frozen rivers.' },
  { id: 3, title: 'Ancient Aetheria', desc: 'Step inside the long-forgotten ruins of old gods and face the legendary dragons that guard the Aether gates.' },
  { id: 4, title: 'Whispers of the Abyss', desc: 'Descend into the Abyssal depths where the shadows of ancient kings dwell. Unravel their cryptic prophecies.' },
  { id: 5, title: 'Echoes of Eternity', desc: 'Fulfill the stardust summons test in a temple outside time. Face reflections of legendary warriors.' },
  { id: 6, title: 'The Frostfire Chasm', desc: 'Navigate a volcanic canyon where elemental lava meets permanent glaciers. Resolve the temperature chaos.' },
  { id: 7, title: 'Skyward Ascent', desc: 'Climb the towering spires of the cloud kingdom. Battle the avian guardians that dwell above the clouds.' },
  { id: 8, title: 'Heart of the Volcano', desc: 'Intrude into the active core of Mount Eldruin. Defeat the molten lords before they boil the world.' },
  { id: 9, title: 'Dimensional Rift', desc: 'The space-time matrix is breaking down! Navigate chaotic rifts featuring elemental elements combined.' },
  { id: 10, title: 'Aetheria Reforged', desc: 'The ultimate battle to stabilize the core of the element matrix. Face the original creators in final trials.' }
];

export const STORY_STAGES: Record<string, StoryStageSpec> = {
  // CHAPTER 1
  '1-1': {
    id: '1-1', chapter: 1, name: 'Forest Entrance', recommendedLevel: 1, difficulty: 'Normal',
    desc: 'Brave the outskirts of Whispering Forest where slimes have begun attacking wandering merchant convoys.',
    enemies: [
      { name: 'Dendro Slime', type: 'Normal', element: 'Dendro', level: 1 },
      { name: 'Pyro Slime', type: 'Normal', element: 'Pyro', level: 1 },
      { name: 'Hydro Slime', type: 'Normal', element: 'Hydro', level: 1 }
    ],
    firstClearRewards: { gems: 50, mora: 2000, charXp: 2 }
  },
  '1-2': {
    id: '1-2', chapter: 1, name: 'Slime Ambush', recommendedLevel: 3, difficulty: 'Normal',
    desc: 'Trapped in a dense marsh! Clear a path through waves of elemental slimes blocking the road.',
    enemies: [
      { name: 'Hydro Slime', type: 'Normal', element: 'Hydro', level: 3 },
      { name: 'Electro Slime', type: 'Normal', element: 'Electro', level: 3 },
      { name: 'Cryo Slime', type: 'Normal', element: 'Cryo', level: 3 },
      { name: 'Anemo Slime', type: 'Normal', element: 'Anemo', level: 3 }
    ],
    firstClearRewards: { gems: 50, mora: 2500, charXp: 2 }
  },
  '1-3': {
    id: '1-3', chapter: 1, name: 'Forgotten Ruins', recommendedLevel: 5, difficulty: 'Normal',
    desc: 'Enter the stone gates of ancient ruins. An ancient Abyss guard sentinel stands blocking the inner chamber.',
    enemies: [
      { name: 'Geo Slime', type: 'Normal', element: 'Geo', level: 5 },
      { name: 'Abyss Obsidian Berserker', type: 'Elite', element: 'Geo', level: 5 }
    ],
    firstClearRewards: { gems: 60, mora: 3000, charXp: 3 }
  },
  '1-4': {
    id: '1-4', chapter: 1, name: 'Elite Guardian', recommendedLevel: 8, difficulty: 'Normal',
    desc: 'Defeat the dual elemental guards that stabilize the core ruins energy matrix.',
    enemies: [
      { name: 'Abyss Cryo Channeler', type: 'Elite', element: 'Cryo', level: 8 },
      { name: 'Epoch Ruin Guard', type: 'Elite', element: 'Geo', level: 8 }
    ],
    firstClearRewards: { gems: 65, mora: 3500, charXp: 3 }
  },
  '1-5': {
    id: '1-5', chapter: 1, name: 'Ruins Core Boss', recommendedLevel: 10, difficulty: 'Boss',
    desc: 'The central energy core is guarded by a massive Calamity Pyro Dragon. Defeat it to cleanse Chapter 1!',
    enemies: [
      { name: 'Calamity Pyro Dragon', type: 'Boss', element: 'Pyro', level: 10, bossType: 'fire_dragon' }
    ],
    firstClearRewards: { gems: 150, mora: 10000, charXp: 5, ascensionMaterialCount: 3, specialItem: 'Ruins Obsidian Core' }
  },

  // CHAPTER 2
  '2-1': {
    id: '2-1', chapter: 2, name: 'Burning Plains', recommendedLevel: 12, difficulty: 'Normal',
    desc: 'The heat rises. Investigate the scorched valley overflowing with Pyro energy.',
    enemies: [
      { name: 'Pyro Slime', type: 'Normal', element: 'Pyro', level: 12 },
      { name: 'Abyss Obsidian Berserker', type: 'Elite', element: 'Geo', level: 12 }
    ],
    firstClearRewards: { gems: 60, mora: 4000, charXp: 3 }
  },
  '2-2': {
    id: '2-2', chapter: 2, name: 'Frozen River', recommendedLevel: 14, difficulty: 'Normal',
    desc: 'Cross the frozen waters where Cryo forces have locked the shipping lanes.',
    enemies: [
      { name: 'Cryo Slime', type: 'Normal', element: 'Cryo', level: 14 },
      { name: 'Abyss Cryo Channeler', type: 'Elite', element: 'Cryo', level: 14 }
    ],
    firstClearRewards: { gems: 60, mora: 4500, charXp: 3 }
  },
  '2-3': {
    id: '2-3', chapter: 2, name: 'Thunder Valley', recommendedLevel: 16, difficulty: 'Normal',
    desc: 'High-voltage lightning strikes this canyon. Clear the magnetic anomalies.',
    enemies: [
      { name: 'Electro Slime', type: 'Normal', element: 'Electro', level: 16 },
      { name: 'Epoch Ruin Guard', type: 'Elite', element: 'Cryo', level: 16 }
    ],
    firstClearRewards: { gems: 65, mora: 5000, charXp: 4 }
  },
  '2-4': {
    id: '2-4', chapter: 2, name: 'Elemental Trial', recommendedLevel: 18, difficulty: 'Normal',
    desc: 'Combine reactions to destroy a wave of mixed elemental guardians.',
    enemies: [
      { name: 'Pyro Slime', type: 'Normal', element: 'Pyro', level: 18 },
      { name: 'Hydro Slime', type: 'Normal', element: 'Hydro', level: 18 },
      { name: 'Abyss Cryo Channeler', type: 'Elite', element: 'Cryo', level: 18 }
    ],
    firstClearRewards: { gems: 70, mora: 5500, charXp: 4 }
  },
  '2-5': {
    id: '2-5', chapter: 2, name: 'Elemental Overlord Boss', recommendedLevel: 20, difficulty: 'Boss',
    desc: 'Vanquish the Glacial Frost Golem that rules the elemental nexus.',
    enemies: [
      { name: 'Glacial Frost Golem', type: 'Boss', element: 'Cryo', level: 20, bossType: 'ice_golem' }
    ],
    firstClearRewards: { gems: 200, mora: 15000, charXp: 6, ascensionMaterialCount: 4, specialItem: 'Absolute Zero Lens' }
  },

  // CHAPTER 3
  '3-1': {
    id: '3-1', chapter: 3, name: 'Lost Sanctuary', recommendedLevel: 22, difficulty: 'Normal',
    desc: 'Discover a sacred shrine hidden inside Aetheria mountain ranges.',
    enemies: [
      { name: 'Anemo Slime', type: 'Normal', element: 'Anemo', level: 22 },
      { name: 'Geo Slime', type: 'Normal', element: 'Geo', level: 22 }
    ],
    firstClearRewards: { gems: 70, mora: 6000, charXp: 4 }
  },
  '3-2': {
    id: '3-2', chapter: 3, name: 'Corrupted Forest', recommendedLevel: 25, difficulty: 'Normal',
    desc: 'Cleanse the corrupted root node where Dendro slimes have gone berserk.',
    enemies: [
      { name: 'Dendro Slime', type: 'Normal', element: 'Dendro', level: 25 },
      { name: 'Abyss Obsidian Berserker', type: 'Elite', element: 'Geo', level: 25 }
    ],
    firstClearRewards: { gems: 75, mora: 6500, charXp: 4 }
  },
  '3-3': {
    id: '3-3', chapter: 3, name: 'Ancient Temple', recommendedLevel: 28, difficulty: 'Normal',
    desc: 'Ascend the temple steps. Watch out for ancient guard machinery.',
    enemies: [
      { name: 'Epoch Ruin Guard', type: 'Elite', element: 'Geo', level: 28 },
      { name: 'Abyss Cryo Channeler', type: 'Elite', element: 'Cryo', level: 28 }
    ],
    firstClearRewards: { gems: 80, mora: 7000, charXp: 5 }
  },
  '3-4': {
    id: '3-4', chapter: 3, name: 'Guardian Chamber', recommendedLevel: 30, difficulty: 'Normal',
    desc: 'Battle the dual temple Sentinels before accessing the dragon altar.',
    enemies: [
      { name: 'Abyss Obsidian Berserker', type: 'Elite', element: 'Geo', level: 30 },
      { name: 'Epoch Ruin Guard', type: 'Elite', element: 'Cryo', level: 30 }
    ],
    firstClearRewards: { gems: 85, mora: 8000, charXp: 5 }
  },
  '3-5': {
    id: '3-5', chapter: 3, name: 'Ancient Dragon Boss', recommendedLevel: 35, difficulty: 'Boss',
    desc: 'Awaken and defeat the Tempest Thunderbird dragon guarding the Gates of Aetheria!',
    enemies: [
      { name: 'Tempest Thunderbird', type: 'Boss', element: 'Electro', level: 35, bossType: 'thunderbird' }
    ],
    firstClearRewards: { gems: 250, mora: 20000, charXp: 8, ascensionMaterialCount: 5, specialItem: 'Stormborn Feather' }
  }
};

// Procedural generation helper for chapters 4 to 10
export const getStageSpec = (stageId: string): StoryStageSpec => {
  if (STORY_STAGES[stageId]) return STORY_STAGES[stageId];
  
  // Parse stageId like "4-3"
  const [chapStr, stageStr] = stageId.split('-');
  const chapter = parseInt(chapStr) || 1;
  const stage = parseInt(stageStr) || 1;

  const chapMeta = STORY_CHAPTERS.find(c => c.id === chapter);
  const chapTitle = chapMeta ? chapMeta.title : `Chapter ${chapter}`;

  const recommendedLevel = 35 + (chapter - 3) * 10 + (stage - 1) * 2;
  const difficulty = stage === 5 ? 'Boss' : 'Normal';

  // Procedural names
  const stageNames: Record<number, string[]> = {
    4: ['Shadow Outpost', 'Wailing Ruins', 'Gate of Whispers', 'Obsidian Altar', 'Void Overlord Boss'],
    5: ['Starlight Gate', 'Astral Nexus', 'Aura Chambers', 'Cosmic Pillar', 'Eternity Knight Boss'],
    6: ['Sulfur Grotto', 'Ice-Fire Stream', 'Ashen Spires', 'Steam Vaults', 'Frostfire Wyrm Boss'],
    7: ['Wind Spire', 'Skyroad Bridges', 'Gale Sanctuary', 'Zephyr Pillars', 'Skyward Avian Boss'],
    8: ['Magma Chambers', 'Volcano Roots', 'Obsidian Forge', 'Crucible Gates', 'Molten Overlord Boss'],
    9: ['Rift Boundary', 'Glitch Nexus', 'Paradox Fields', 'Unstable Reactor', 'Chronos Monarch Boss'],
    10: ['Reforged Bastion', 'Trial of Pyro', 'Trial of Cryo', 'Ascendant Pillar', 'Eldric Core Prime Boss']
  };

  const name = (stageNames[chapter] && stageNames[chapter][stage - 1]) || `Stage ${stageId}`;

  // Procedural rewards
  const firstClearRewards: StoryStageReward = difficulty === 'Boss' 
    ? { 
        gems: 100 + chapter * 50, 
        mora: 10000 + chapter * 3000, 
        charXp: 5 + Math.floor(chapter / 2),
        ascensionMaterialCount: 3 + Math.floor(chapter / 3),
        specialItem: `Aetheric Essence Cap ${chapter}`
      }
    : { 
        gems: 50 + chapter * 10, 
        mora: 3000 + chapter * 1000 + stage * 200, 
        charXp: 2 + Math.floor(chapter / 4)
      };

  // Procedural enemies
  const elements: ElementType[] = ['Pyro', 'Hydro', 'Cryo', 'Electro', 'Anemo', 'Geo', 'Dendro'];
  const baseElement = elements[(chapter + stage) % elements.length];
  const secondElement = elements[(chapter * 2 + stage) % elements.length];

  const enemies: StoryEnemySpec[] = [];
  if (difficulty === 'Boss') {
    const bossTypes: ('fire_dragon' | 'ice_golem' | 'thunderbird')[] = ['fire_dragon', 'ice_golem', 'thunderbird'];
    const bType = bossTypes[chapter % bossTypes.length];
    enemies.push({
      name: `Colossus of ${baseElement}`,
      type: 'Boss',
      element: baseElement,
      level: recommendedLevel,
      bossType: bType
    });
  } else {
    enemies.push({ name: `${baseElement} Spore Slime`, type: 'Normal', element: baseElement, level: recommendedLevel });
    enemies.push({ name: `${secondElement} Shock Slime`, type: 'Normal', element: secondElement, level: recommendedLevel });
    if (stage >= 3) {
      enemies.push({ name: `Vanguard Elite ${stageId}`, type: 'Elite', element: baseElement, level: recommendedLevel });
    }
  }

  return {
    id: stageId,
    chapter,
    name,
    recommendedLevel,
    difficulty,
    desc: `Enter the challenges of ${chapTitle} in stage ${stageId}. Stabilize the surrounding elemental forces.`,
    enemies,
    firstClearRewards
  };
};

// Visual Novel Script Dialogues Database
export const STORY_DIALOGUES: Record<string, { before?: StoryDialogueLine[], after?: StoryDialogueLine[] }> = {
  '1-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Hmm, the Whispering Forest feels unusually heavy today. The wind itself seems perturbed.' },
      { speaker: 'Marina', element: 'Hydro', text: 'You feel it too, Eldric? My waters are bubbling with erratic frequencies. Look ahead!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Slimes! They are blockading the merchant caravan routes. Draw your weapons, let\'s cleanse this road!' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'Whew, that was a warm-up. But did you notice how unstable their elemental cores were?' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Indeed. Something deeper in the ruins is radiating a strange magnetic force. We must investigate further.' }
    ]
  },
  '1-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'The ruins start here. Eldric, these obsidian stones are ancient... predating the Dawning Core Client.' },
      { speaker: 'Guardian Sentry', element: 'Geo', text: 'HALT. MORTALS. INTRUSION DETECTED. PREPARE FOR SCANNING AND PURGATION.', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'A sentinel guard! It\'s completely corrupted by raw Geo crystals. Take cover!' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The sentinel has powered down. It was buffering a warning... "The Ruins Core is breached."' },
      { speaker: 'Marina', element: 'Hydro', text: 'We are close. The elemental heat signature is skyrocketing. Be ready for anything.' }
    ]
  },
  '1-5': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Look at the center! The elemental nexus is burning!' },
      { speaker: 'Marina', element: 'Hydro', text: 'No, that\'s... a massive dragon! It\'s absorbing the core obsidian stones!', effect: 'flash' },
      { speaker: 'Calamity Pyro Dragon', element: 'Pyro', text: 'ROOOAAAR! INSECTS OF LIGHT, YOU SHALL BURN IN THE CRUCIBLE OF REBORN FLAMES!', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'It\'s fully active! Marina, trigger elemental swirl reactions on my mark! Engage!' }
    ],
    after: [
      { speaker: 'Calamity Pyro Dragon', element: 'Pyro', text: 'Gurgle... The stardust... has not... forgotten...', effect: 'flash' },
      { speaker: 'Marina', element: 'Hydro', text: 'It\'s disintegrating! The obsidian core is stabilizing. Look, a core fragment left behind!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'This obsidian core... contains coordinates pointing towards the Burning Plains. The Elemental Crisis has just begun.' }
    ]
  },

  // Chapter completions visual novel dialogues
  'chapter-1-clear': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Chapter 1: "The Awakening" completed.' },
      { speaker: 'Aetheria Oracle', element: 'Anemo', text: 'Brave combatants. You have stabilized the Whispering Forest. But the elemental tears are spreading. Chapter 2 awaits.' }
    ]
  },
  'chapter-2-clear': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Chapter 2: "Elemental Crisis" resolved.' },
      { speaker: 'Aetheria Oracle', element: 'Anemo', text: 'The elemental overlords have fallen. Yet, the gate of Ancient Aetheria is vibrating. Ancient dragons awaken.' }
    ]
  },
  'chapter-3-clear': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Chapter 3: "Ancient Aetheria" completed.' },
      { speaker: 'Aetheria Oracle', element: 'Anemo', text: 'The gates are stabilized! The elements have returned to their proper orbit. You have written a new legend.' }
    ]
  }
};

// Dialogue generator for other stages
export const getStageDialogue = (stageId: string): { before?: StoryDialogueLine[], after?: StoryDialogueLine[] } => {
  if (STORY_DIALOGUES[stageId]) return STORY_DIALOGUES[stageId];

  const spec = getStageSpec(stageId);
  const [chapStr, stageStr] = stageId.split('-');
  const chapter = parseInt(chapStr);
  const stage = parseInt(stageStr);

  return {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: `We have entered Stage ${stageId}: ${spec.name}. The recommended combat level is ${spec.recommendedLevel}.` },
      { speaker: 'Marina', element: 'Hydro', text: `Let\'s deploy our best characters and defeat the elements guarding this spot!` }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: `That was a success! The local energy fluctuations have stabilized.` },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: `Indeed. Let\'s proceed further on our path.` }
    ]
  };
};

// Character Story VN scripts
export const CHARACTER_STORIES_SCRIPTS: Record<string, Record<string, { before: StoryDialogueLine[], after: StoryDialogueLine[] }>> = {
  'marina': {
    '1': {
      before: [
        { speaker: 'Marina', element: 'Hydro', text: 'Welcome to the sea cliffs. This is where I first learned to harness the hydro elements.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'It\'s peaceful, Marina. But why do you look so worried?' },
        { speaker: 'Marina', element: 'Hydro', text: 'The tides... they are receding. A wave of slimes is trying to boil the water. Help me defend this shore!' }
      ],
      after: [
        { speaker: 'Marina', element: 'Hydro', text: 'Thank you, Eldric. The tides are returning to their natural flow.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Your control over Hydro is outstanding. Your portrait profile is shining with a newly found resolve!' }
      ]
    },
    '2': {
      before: [
        { speaker: 'Marina', element: 'Hydro', text: 'Act II: The Deep Swell. I must face the Glacial Frost Golem to test if my water can pierce absolute zero.' }
      ],
      after: [
        { speaker: 'Marina', element: 'Hydro', text: 'I did it! The frost didn\'t freeze my droplets. My Hydro energy has ascended!' }
      ]
    },
    '3': {
      before: [
        { speaker: 'Marina', element: 'Hydro', text: 'Act III: Sovereign of Tides. A final skirmish against the Tempest Thunderbird. The skies meet the deep ocean!' }
      ],
      after: [
        { speaker: 'Marina', element: 'Hydro', text: 'The ocean has accepted my call. I am now the sovereign of tides!' }
      ]
    }
  }
};

export const getCharacterStoryScript = (charId: string, act: number): { before: StoryDialogueLine[], after: StoryDialogueLine[] } => {
  if (CHARACTER_STORIES_SCRIPTS[charId] && CHARACTER_STORIES_SCRIPTS[charId][act.toString()]) {
    return CHARACTER_STORIES_SCRIPTS[charId][act.toString()];
  }
  
  // Fallback procedural dialogue
  const charName = charId.toUpperCase();
  return {
    before: [
      { speaker: charName, text: `This is my Story Act ${act}. I need to conquer this elemental trial to prove my strength!` },
      { speaker: 'Aetheria Oracle', text: `Begin the trial, prove your dedication.` }
    ],
    after: [
      { speaker: charName, text: `The trial is complete! My powers have expanded. Thank you for guiding me!` },
      { speaker: 'System', text: `Completed Character Story Act ${act} successfully! Portrait upgraded.` }
    ]
  };
};
