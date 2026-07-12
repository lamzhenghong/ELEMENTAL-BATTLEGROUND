import { getCampaignReward } from '../balance';
import type { StoryChapterPack } from '../types';

export const CHAPTER_9_PACK = {
  chapter: 9,
  stages: {
    '9-1': {
      id: '9-1',
      chapter: 9,
      name: 'Paradox Shore',
      location: 'Paradox Verge',
      backgroundId: 'chapter-9',
      recommendedLevel: 95,
      difficulty: 'Normal',
      desc: 'Cross the rift from Mount Eldruin and find a second horizon rising over an impossible shore.',
      enemies: [
        { name: 'Rift Mimic', type: 'Normal', element: 'Hydro', level: 95 },
        { name: 'Paradox Shade', type: 'Normal', element: 'Electro', level: 95 },
      ],
      firstClearRewards: getCampaignReward(9, 1),
      beforeSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The rift opened above a mountain, yet we have landed beside a sea beneath another sun.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The tide reaches us twice. One wave is here; the other remembers arriving tomorrow.' },
        { speaker: 'Chronist Lio', element: 'Electro', text: 'Then you still belong to one history. Hold fast before the verge offers you another.' },
      ],
      afterSlides: [
        { speaker: 'Chronist Lio', element: 'Electro', text: 'The false shore is receding. Keep the image of your own sun while we climb.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Ahead, the horizon divides around a city that no map remembers.' },
      ],
      memoryUnlockIds: ['chapter-9-other-sun'],
    },
    '9-2': {
      id: '9-2',
      chapter: 9,
      name: 'Forked Horizon',
      location: 'Forked Horizon',
      backgroundId: 'chapter-9',
      recommendedLevel: 97,
      difficulty: 'Normal',
      desc: 'Choose how to preserve a path when the present and a surviving future demand the same horizon.',
      enemies: [
        { name: 'Unwritten Citizen', type: 'Normal', element: 'Anemo', level: 97 },
        { name: 'Looping Pursuer', type: 'Normal', element: 'Electro', level: 97 },
      ],
      firstClearRewards: getCampaignReward(9, 2),
      beforeSlides: [
        { speaker: 'Chronist Lio', element: 'Electro', text: 'One path anchors the present. The other recovers a record sent back by those who survived this fracture.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The anchor gives us firm ground. The record may show what waits inside the unwritten city.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'We preserve one truth without declaring the other disposable.' },
      ],
      afterSlides: [
        { speaker: 'Chronist Lio', element: 'Electro', text: 'The chosen horizon holds. The Unwritten Capital has opened its eastern gate.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then we enter before the fork closes behind us.' },
      ],
      decision: {
        id: 'chapter-9-route',
        prompt: 'Two histories share one failing horizon. Which path do you preserve?',
        options: [
          { id: 'anchor-present', label: 'Anchor the present', consequence: 'Slow the city defenders with a stable approach.' },
          { id: 'recover-future-record', label: 'Recover the future record', consequence: 'Use future tactics to reduce defender endurance.' },
        ],
      },
    },
    '9-3': {
      id: '9-3',
      chapter: 9,
      name: 'City That Never Was',
      location: 'Unwritten Capital',
      backgroundId: 'chapter-9',
      recommendedLevel: 99,
      difficulty: 'Normal',
      desc: 'Enter a capital erased before its founding and recover the refusal that kept its people from vanishing.',
      enemies: [
        { name: 'Glitch Sentinel', type: 'Elite', element: 'Electro', level: 99 },
        { name: 'Looping Pursuer', type: 'Normal', element: 'Anemo', level: 99 },
      ],
      firstClearRewards: getCampaignReward(9, 3),
      beforeSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'Every doorway leads to a home that history removed, but the lamps are still being tended.' },
        { speaker: 'Chronist Lio', element: 'Electro', text: 'The citizens wrote their refusal beneath the central bell. The sentinels keep the bell from ringing.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then we give the city one sound no erased history can deny.' },
      ],
      afterSlides: [
        { speaker: 'Chronist Lio', element: 'Electro', text: 'The anchored streets broke the sentinel loop. The bell inscription is clear.' },
        { speaker: 'Marina', element: 'Hydro', text: 'It says: We were possible, and possibility is enough to leave a witness.' },
      ],
      decisionId: 'chapter-9-route',
      variants: [
        {
          optionId: 'anchor-present',
          enemies: [
            { name: 'Glitch Sentinel', type: 'Elite', element: 'Electro', level: 99 },
            { name: 'Looping Pursuer', type: 'Normal', element: 'Anemo', level: 99 },
          ],
          modifierId: 'present-anchored',
          afterSlides: [
            { speaker: 'Chronist Lio', element: 'Electro', text: 'The anchored streets broke the sentinel loop. The bell inscription is clear.' },
            { speaker: 'Marina', element: 'Hydro', text: 'It says: We were possible, and possibility is enough to leave a witness.' },
          ],
        },
        {
          optionId: 'recover-future-record',
          enemies: [
            { name: 'Timeline Bailiff', type: 'Elite', element: 'Geo', level: 99 },
            { name: 'Paradox Shade', type: 'Normal', element: 'Electro', level: 99 },
          ],
          modifierId: 'future-record',
          afterSlides: [
            { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The future record predicted the bailiff patrol and preserved the bell inscription.' },
            { speaker: 'Chronist Lio', element: 'Electro', text: 'The city refused oblivion. That refusal survived every version of this hour.' },
          ],
        },
      ],
      memoryUnlockIds: ['chapter-9-unwritten-city'],
    },
    '9-4': {
      id: '9-4',
      chapter: 9,
      name: 'Last Stable Second',
      location: 'Last Stable Second',
      backgroundId: 'chapter-9',
      recommendedLevel: 101,
      difficulty: 'Normal',
      desc: 'Join both histories at the final stable second and release time from the monarch clock.',
      enemies: [
        { name: 'Glitch Sentinel', type: 'Elite', element: 'Electro', level: 101 },
        { name: 'Timeline Bailiff', type: 'Elite', element: 'Geo', level: 101 },
      ],
      firstClearRewards: getCampaignReward(9, 4),
      beforeSlides: [
        { speaker: 'Chronist Lio', element: 'Electro', text: 'Every route reaches this second. Beyond it, the monarch forces all futures to repeat one coronation.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The present anchor and future record agree on one thing: time must be allowed to continue.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Break the clock hands. We are not here to choose a perfect ending.' },
      ],
      afterSlides: [
        { speaker: 'Chronist Lio', element: 'Electro', text: 'The final second is moving. The clockface can no longer turn tomorrow into a throne.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Its crown chamber is open, and something made of living fire is waiting there.' },
      ],
    },
    '9-5': {
      id: '9-5',
      chapter: 9,
      name: 'Chronos Monarch Boss',
      location: "Monarch's Clockface",
      backgroundId: 'chapter-9',
      recommendedLevel: 103,
      difficulty: 'Boss',
      desc: 'Defeat the fixed guardian that would crown one instant and condemn every future to repeat it.',
      enemies: [
        { name: 'Colossus of Pyro', type: 'Boss', element: 'Pyro', level: 103, bossType: 'fire_dragon' },
      ],
      firstClearRewards: getCampaignReward(9, 5),
      beforeSlides: [
        { speaker: 'Colossus of Pyro', element: 'Pyro', text: 'ONE PERFECT SECOND. ONE ETERNAL CROWN.' },
        { speaker: 'Chronist Lio', element: 'Electro', text: 'It burns every future that does not return to this throne.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Time chooses forward. No crown gets to choose for it.' },
      ],
      afterSlides: [
        { speaker: 'Chronist Lio', element: 'Electro', text: 'The clock has no monarch. Every hand is moving toward a future of its own.' },
        { speaker: 'Marina', element: 'Hydro', text: 'One path leads beyond the rift, into the prime orbit that first ordered Aetheria.' },
      ],
      memoryUnlockIds: ['chapter-9-forward-time'],
    },
  },
  memories: [
    {
      id: 'chapter-9-other-sun',
      title: 'Under Another Sun',
      sourceLabel: 'Chapter 9: Dimensional Rift',
      location: 'Paradox Verge',
      category: 'campaign',
      text: 'The Paradox Verge remembers countless skies. Travelers remain themselves by naming the sun that warmed them before they crossed the shore.',
    },
    {
      id: 'chapter-9-unwritten-city',
      title: 'The City That Refused',
      sourceLabel: 'Chapter 9: Dimensional Rift',
      location: 'Unwritten Capital',
      category: 'campaign',
      text: 'The Unwritten Capital left no empire and claimed no destiny. Its people asked only that possibility itself be remembered as a kind of life.',
    },
    {
      id: 'chapter-9-forward-time',
      title: 'Time Chooses Forward',
      sourceLabel: 'Chapter 9: Dimensional Rift',
      location: "Monarch's Clockface",
      category: 'campaign',
      text: 'When the monarch clock stopped repeating, its hands moved in different rhythms. None ruled the others, yet all of them carried the hour forward.',
    },
  ],
} satisfies StoryChapterPack;
