import { getCampaignReward } from '../balance';
import type { StoryChapterPack } from '../types';

export const CHAPTER_5_PACK = {
  chapter: 5,
  stages: {
    '5-1': {
      id: '5-1',
      chapter: 5,
      name: 'Starlight Threshold',
      location: 'Astral Reliquary Gate',
      backgroundId: 'chapter-5',
      recommendedLevel: 55,
      difficulty: 'Normal',
      desc: 'Enter the Astral Reliquary, a temple whose star-map points to moments instead of places.',
      enemies: [
        { name: 'Stardust Echo', type: 'Normal', element: 'Anemo', level: 55 },
        { name: 'Reliquary Watcher', type: 'Normal', element: 'Geo', level: 55 },
      ],
      firstClearRewards: getCampaignReward(5, 1),
      beforeSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The door opens onto stars, but Gloamvault is still behind us.' },
        { speaker: 'Marina', element: 'Hydro', text: 'My reflection moved before I did. Time does not flow straight here.' },
        { speaker: 'Reliquary Watcher', element: 'Geo', text: 'Pilgrims enter carrying one face. Few leave with the same certainty.' },
      ],
      afterSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'That echo copied my stance, but it never understood why I held it.' },
        { speaker: 'Marina', element: 'Hydro', text: 'This map has no north. It points toward moments we have not faced.' },
      ],
      memoryUnlockIds: ['chapter-5-star-map'],
    },
    '5-2': {
      id: '5-2',
      chapter: 5,
      name: 'Mirror Pilgrims',
      location: 'Procession of Reflections',
      backgroundId: 'chapter-5',
      recommendedLevel: 57,
      difficulty: 'Normal',
      desc: 'Meet a guiding reflection that claims to remember a safe road through the Reliquary.',
      enemies: [
        { name: 'Borrowed-Face Duelist', type: 'Normal', element: 'Hydro', level: 57 },
        { name: 'Clockless Attendant', type: 'Normal', element: 'Electro', level: 57 },
      ],
      firstClearRewards: getCampaignReward(5, 2),
      beforeSlides: [
        { speaker: 'Guiding Reflection', element: 'Hydro', text: 'I remember the path you will choose. Follow, and arrive before your doubt.' },
        { speaker: 'Marina', element: 'Hydro', text: 'It has my face, but not my hesitation.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'A true guide can survive a question. A false one survives only belief.' },
      ],
      afterSlides: [
        { speaker: 'Guiding Reflection', element: 'Hydro', text: 'The Thousandfold Gallery waits. Trust me, or trust the sound of breaking glass.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Whichever path we take, we face what it knows about us.' },
      ],
      decision: {
        id: 'chapter-5-route',
        prompt: 'The reflection offers a path through the Reliquary. How do you answer?',
        options: [
          { id: 'trust-reflection', label: 'Trust the reflection', consequence: 'Gain reflected insight in the next battle.' },
          { id: 'break-mirror', label: 'Break its mirror', consequence: 'Disrupt the reflections in the next battle.' },
        ],
      },
    },
    '5-3': {
      id: '5-3',
      chapter: 5,
      name: 'Hall of Borrowed Faces',
      location: 'Thousandfold Gallery',
      backgroundId: 'chapter-5',
      recommendedLevel: 59,
      difficulty: 'Normal',
      desc: 'Confront reflections that can reproduce every victory except the choice that gave it meaning.',
      enemies: [
        { name: 'Astral Examiner', type: 'Elite', element: 'Electro', level: 59 },
        { name: 'Gentle Echo', type: 'Normal', element: 'Hydro', level: 59 },
      ],
      firstClearRewards: getCampaignReward(5, 3),
      beforeSlides: [
        { speaker: 'Guiding Reflection', element: 'Hydro', text: 'Every face here belongs to a victory you might have won by accident.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'They can copy the motion, but not the reason behind it.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Fate can repeat a gesture. It cannot choose why we make it.' },
      ],
      afterSlides: [
        { speaker: 'Guiding Reflection', element: 'Hydro', text: 'You trusted without surrendering your judgment.' },
        { speaker: 'Marina', element: 'Hydro', text: 'And your face remembered fear. That made it honest.' },
      ],
      decisionId: 'chapter-5-route',
      variants: [
        {
          optionId: 'trust-reflection',
          enemies: [
            { name: 'Astral Examiner', type: 'Elite', element: 'Electro', level: 59 },
            { name: 'Gentle Echo', type: 'Normal', element: 'Hydro', level: 59 },
          ],
          modifierId: 'trusted-reflection',
          afterSlides: [
            { speaker: 'Guiding Reflection', element: 'Hydro', text: 'You trusted without surrendering your judgment.' },
            { speaker: 'Marina', element: 'Hydro', text: 'And your face remembered fear. That made it honest.' },
          ],
        },
        {
          optionId: 'break-mirror',
          enemies: [
            { name: 'Mirror Shardling', type: 'Normal', element: 'Cryo', level: 59 },
            { name: 'Enraged Reflection', type: 'Elite', element: 'Electro', level: 59 },
          ],
          modifierId: 'broken-mirror',
          afterSlides: [
            { speaker: 'Enraged Reflection', element: 'Electro', text: 'Break one mirror, and a thousand answers bleed through the cracks.' },
            { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then we answer without a borrowed script.' },
          ],
        },
      ],
      memoryUnlockIds: ['chapter-5-borrowed-face'],
    },
    '5-4': {
      id: '5-4',
      chapter: 5,
      name: 'Clockless Dais',
      location: 'Reliquary Zenith',
      backgroundId: 'chapter-5',
      recommendedLevel: 61,
      difficulty: 'Normal',
      desc: "Reach the clockless summit where every route reveals the Eternity Knight's final trial.",
      enemies: [
        { name: 'Chronoweaver', type: 'Elite', element: 'Electro', level: 61 },
        { name: 'Stardust Adjudicator', type: 'Normal', element: 'Geo', level: 61 },
      ],
      firstClearRewards: getCampaignReward(5, 4),
      beforeSlides: [
        { speaker: 'Chronoweaver', element: 'Electro', text: 'You arrive in every possible order, yet always carrying the same question.' },
        { speaker: 'Marina', element: 'Hydro', text: 'All the reflections point upward now. The paths have joined.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Our choice changed the road, not the truth waiting here.' },
      ],
      afterSlides: [
        { speaker: 'Chronoweaver', element: 'Electro', text: 'The sanctuary opens. Bring the face you chose to keep.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Both paths led to the same vow: identity is what we renew.' },
      ],
    },
    '5-5': {
      id: '5-5',
      chapter: 5,
      name: 'Eternity Knight Boss',
      location: 'Sanctuary Outside Time',
      backgroundId: 'chapter-5',
      recommendedLevel: 63,
      difficulty: 'Boss',
      desc: 'Complete the fixed trial of the Astral Reliquary and restore the road into ordinary time.',
      enemies: [
        { name: 'Colossus of Electro', type: 'Boss', element: 'Electro', level: 63, bossType: 'thunderbird' },
      ],
      firstClearRewards: getCampaignReward(5, 5),
      beforeSlides: [
        { speaker: 'Colossus of Electro', element: 'Electro', text: "NAME THE HAND THAT WON YOUR VICTORIES: YOURS, OR FATE'S." },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'It wants certainty from people who survived without it.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Then let our imperfect memories answer together.' },
      ],
      afterSlides: [
        { speaker: 'Colossus of Electro', element: 'Electro', text: 'THE VOW ENDURES BEYOND THE WITNESS.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The Reliquary is opening a road of frost and flame.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Rimeforge Fault. Time starts again there.' },
      ],
      memoryUnlockIds: ['chapter-5-eternal-vow'],
    },
  },
  memories: [
    {
      id: 'chapter-5-star-map',
      title: 'Map Without North',
      sourceLabel: 'Chapter 5: Echoes of Eternity',
      location: 'Astral Reliquary Gate',
      category: 'campaign',
      text: 'The Reliquary map marks decisions rather than directions. Its oldest path appears only after a traveler admits they do not know where certainty lies.',
    },
    {
      id: 'chapter-5-borrowed-face',
      title: 'A Face That Remembered',
      sourceLabel: 'Chapter 5: Echoes of Eternity',
      location: 'Thousandfold Gallery',
      category: 'campaign',
      text: 'One reflection kept the fear its original tried to hide. That flaw gave it a history, and the history made its borrowed face briefly its own.',
    },
    {
      id: 'chapter-5-eternal-vow',
      title: "The Knight's Last Vow",
      sourceLabel: 'Chapter 5: Echoes of Eternity',
      location: 'Sanctuary Outside Time',
      category: 'campaign',
      text: 'The final vow promises no perfect memory and no certain fate. It asks only that each choice be made honestly, then chosen again when doubt returns.',
    },
  ],
} satisfies StoryChapterPack;
