import { getCampaignReward } from '../balance';
import type { StoryChapterPack } from '../types';

export const CHAPTER_4_PACK = {
  chapter: 4,
  stages: {
    '4-1': {
      id: '4-1',
      chapter: 4,
      name: 'Gloamvault Descent',
      location: 'The Last-Lamp Stair',
      backgroundId: 'chapter-4',
      recommendedLevel: 45,
      difficulty: 'Normal',
      desc: 'Follow the Stormborn Feather into Gloamvault, where tomb-lamps preserve the voices of fallen kingdoms.',
      enemies: [
        { name: 'Gloom Wisp', type: 'Normal', element: 'Anemo', level: 45 },
        { name: 'Ossuary Prowler', type: 'Normal', element: 'Geo', level: 45 },
      ],
      firstClearRewards: getCampaignReward(4, 1),
      beforeSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The Stormborn Feather lost its wind at this stair. Even the air is holding its breath.' },
        { speaker: 'Marina', element: 'Hydro', text: 'These lamps burn without oil. Each flame carries a voice.' },
        { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: 'Gloamvault remembers what kingdoms begged the earth to keep.' },
      ],
      afterSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'The wisps are gone, but their voices remain inside the walls.' },
        { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: 'Then you listened instead of blaming the dark. Follow the last lamp.' },
      ],
      memoryUnlockIds: ['chapter-4-last-lamp'],
    },
    '4-2': {
      id: '4-2',
      chapter: 4,
      name: 'Hall of Last Voices',
      location: 'Surveyor Gallery',
      backgroundId: 'chapter-4',
      recommendedLevel: 47,
      difficulty: 'Normal',
      desc: 'Reach the trapped surveyors while a failing seal releases the tomb-city voices into the gallery.',
      enemies: [
        { name: 'Whisperbound Scout', type: 'Normal', element: 'Electro', level: 47 },
        { name: 'Hollow Sentry', type: 'Normal', element: 'Geo', level: 47 },
      ],
      firstClearRewards: getCampaignReward(4, 2),
      beforeSlides: [
        { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: 'Seven surveyors are trapped below. Above them, the Whisper Seal is splitting.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The flood of voices will bury their calls if we wait.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'We choose what comes first, then finish both.' },
      ],
      afterSlides: [
        { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: 'The Sealed Procession lies ahead. Your other duty waits beyond it.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: "The tracks and the seal's pulse lead to the same door." },
      ],
      decision: {
        id: 'chapter-4-route',
        prompt: 'The seal is failing while the surveyors call from below. What comes first?',
        options: [
          { id: 'rescue-surveyors', label: 'Rescue the surveyors', consequence: 'Gain local guidance in the next battle.' },
          { id: 'secure-whisper-seal', label: 'Secure the Whisper Seal', consequence: 'Weaken the shades in the next battle.' },
        ],
      },
    },
    '4-3': {
      id: '4-3',
      chapter: 4,
      name: 'Gallery of Broken Oaths',
      location: 'The Sealed Procession',
      backgroundId: 'chapter-4',
      recommendedLevel: 49,
      difficulty: 'Normal',
      desc: 'Cross a procession of abandoned vows and learn why Gloamvault gathers the sorrow of the dead.',
      enemies: [
        { name: 'Sable Pursuer', type: 'Normal', element: 'Anemo', level: 49 },
        { name: 'Oathless Guard', type: 'Normal', element: 'Geo', level: 49 },
      ],
      firstClearRewards: getCampaignReward(4, 3),
      beforeSlides: [
        { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: 'Every figure in this procession died carrying a promise it could not fulfill.' },
        { speaker: 'Marina', element: 'Hydro', text: "These shades are wrapped in other people's sorrow." },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Grief has a shape here. We can clear a path without erasing it.' },
      ],
      afterSlides: [
        { speaker: 'Surveyor Ilyan', element: 'Geo', text: 'You pulled us from the dark. We know which carved oaths are traps.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Then guide us. Gloamvault keeps grief; it does not create it.' },
      ],
      decisionId: 'chapter-4-route',
      variants: [
        {
          optionId: 'rescue-surveyors',
          enemies: [
            { name: 'Sable Pursuer', type: 'Normal', element: 'Anemo', level: 49 },
            { name: 'Oathless Guard', type: 'Normal', element: 'Geo', level: 49 },
          ],
          modifierId: 'surveyors-guidance',
          afterSlides: [
            { speaker: 'Surveyor Ilyan', element: 'Geo', text: 'You pulled us from the dark. We know which carved oaths are traps.' },
            { speaker: 'Marina', element: 'Hydro', text: 'Then guide us. Gloamvault keeps grief; it does not create it.' },
          ],
        },
        {
          optionId: 'secure-whisper-seal',
          enemies: [
            { name: 'Grief Echo', type: 'Normal', element: 'Hydro', level: 49 },
            { name: 'Crownless Retainer', type: 'Normal', element: 'Cryo', level: 49 },
          ],
          modifierId: 'whisper-sealed',
          afterSlides: [
            { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: 'The seal holds. The freed whispers are settling into the walls.' },
            { speaker: 'Eldric Thorne', element: 'Anemo', text: 'So the vault stores grief. Someone taught us to mistake the archive for the wound.' },
          ],
        },
      ],
      memoryUnlockIds: ['chapter-4-seven-names'],
    },
    '4-4': {
      id: '4-4',
      chapter: 4,
      name: 'Crownless Altar',
      location: 'Throne Without a King',
      backgroundId: 'chapter-4',
      recommendedLevel: 51,
      difficulty: 'Normal',
      desc: 'Defeat the altar guard and recover the crown inscription that binds every route through Gloamvault.',
      enemies: [
        { name: 'Sable Oathguard', type: 'Elite', element: 'Geo', level: 51 },
        { name: 'Hollow Retainer', type: 'Normal', element: 'Cryo', level: 51 },
      ],
      firstClearRewards: getCampaignReward(4, 4),
      beforeSlides: [
        { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: 'No king sits here. The throne was left empty so sorrow could never command the living.' },
        { speaker: 'Hollow Retainer', element: 'Cryo', text: 'No crown. No witness. No release.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then we will be the witnesses, not the rulers.' },
      ],
      afterSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'Seven names, one vow. Every road through the vault ends at this inscription.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Carry sorrow; do not crown it. That is what the guardian protects.' },
      ],
    },
    '4-5': {
      id: '4-5',
      chapter: 4,
      name: 'Void Overlord Boss',
      location: 'Heart of Gloamvault',
      backgroundId: 'chapter-4',
      recommendedLevel: 53,
      difficulty: 'Boss',
      desc: "Defeat Gloamvault's fixed guardian without destroying the memories held in its frozen heart.",
      enemies: [
        { name: 'Colossus of Cryo', type: 'Boss', element: 'Cryo', level: 53, bossType: 'ice_golem' },
      ],
      firstClearRewards: getCampaignReward(4, 5),
      beforeSlides: [
        { speaker: 'Colossus of Cryo', element: 'Cryo', text: 'NO KING PASSES. NO GRIEF LEAVES.' },
        { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: "It is not Gloamvault's ruler. It is the lock on every memory below." },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then we break the lock, not the memories.' },
      ],
      afterSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'The first whisper was a farewell, not a curse.' },
        { speaker: 'Tomb-Keeper Neris', element: 'Geo', text: 'And where its last word fades, the path to the Astral Reliquary opens.' },
      ],
      memoryUnlockIds: ['chapter-4-first-whisper'],
    },
  },
  memories: [
    {
      id: 'chapter-4-last-lamp',
      title: 'The Last Lamp',
      sourceLabel: 'Chapter 4: Whispers of the Abyss',
      location: 'The Last-Lamp Stair',
      category: 'campaign',
      text: 'The final lamp of Gloamvault burns with no fuel. Its keepers believed a memory remained alive while someone was willing to carry its light.',
    },
    {
      id: 'chapter-4-seven-names',
      title: 'Seal of Seven Names',
      sourceLabel: 'Chapter 4: Whispers of the Abyss',
      location: 'The Sealed Procession',
      category: 'campaign',
      text: 'Seven lost kingdoms signed the seal together. None claimed innocence; each asked only that its grief be remembered without becoming another crown.',
    },
    {
      id: 'chapter-4-first-whisper',
      title: 'The First Whisper',
      sourceLabel: 'Chapter 4: Whispers of the Abyss',
      location: 'Heart of Gloamvault',
      category: 'campaign',
      text: 'The oldest voice in the tomb-city says: We built no prison for grief. We built a lantern, so those after us would know where the wound began.',
    },
  ],
} satisfies StoryChapterPack;
