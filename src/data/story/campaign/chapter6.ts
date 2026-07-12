import { getCampaignReward } from '../balance';
import type { StoryChapterPack } from '../types';

export const CHAPTER_6_PACK = {
  chapter: 6,
  stages: {
    '6-1': {
      id: '6-1',
      chapter: 6,
      name: 'Rimeforge Threshold',
      location: 'Rimeforge Gate',
      backgroundId: 'chapter-6',
      recommendedLevel: 65,
      difficulty: 'Normal',
      desc: 'Enter the fault where glacier and magma were forced into a single failing climate works.',
      enemies: [
        { name: 'Steam Wretch', type: 'Normal', element: 'Pyro', level: 65 },
        { name: 'Rime Crawler', type: 'Normal', element: 'Cryo', level: 65 },
      ],
      firstClearRewards: getCampaignReward(6, 1),
      beforeSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The gate is rimed over, yet every hinge glows red. This climate was built, not born.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The gauges are fighting each other. Heat rises whenever the glacier shifts.' },
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'Then the old balance has failed. Help me reach the first gauge.' },
      ],
      afterSlides: [
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'The gauge records two commands: freeze forever and burn without pause.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Neither side can yield while the commands remain coupled.' },
      ],
      memoryUnlockIds: ['chapter-6-first-gauge'],
    },
    '6-2': {
      id: '6-2',
      chapter: 6,
      name: 'Split Current Works',
      location: 'Broken Climate Works',
      backgroundId: 'chapter-6',
      recommendedLevel: 67,
      difficulty: 'Normal',
      desc: 'Choose how to relieve the divided works before its pressure tears open the chasm.',
      enemies: [
        { name: 'Pressure Keeper', type: 'Normal', element: 'Hydro', level: 67 },
        { name: 'Meltwater Stalker', type: 'Normal', element: 'Cryo', level: 67 },
      ],
      firstClearRewards: getCampaignReward(6, 2),
      beforeSlides: [
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'The magma vents can release the pressure, but the glacier channels may crack.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Thawing the channels opens another route, though the heat will stay trapped.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'We choose one release, cross quickly, and repair the engine beyond.' },
      ],
      afterSlides: [
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'The White-Steam Causeway is open. The other current is already resisting us.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'A changed road is still a road. Lead on.' },
      ],
      decision: {
        id: 'chapter-6-route',
        prompt: 'The divided works cannot hold both currents. Which pressure do you release?',
        options: [
          { id: 'vent-magma', label: 'Vent the magma', consequence: 'Reduce enemy endurance on the causeway.' },
          { id: 'thaw-glacier', label: 'Thaw the glacier', consequence: 'Slow the causeway defenders.' },
        ],
      },
    },
    '6-3': {
      id: '6-3',
      chapter: 6,
      name: 'Vaporworks Crossing',
      location: 'White-Steam Causeway',
      backgroundId: 'chapter-6',
      recommendedLevel: 69,
      difficulty: 'Normal',
      desc: 'Cross the vaporworks and recover the order that locked Rimeforge into permanent winter.',
      enemies: [
        { name: 'Tempered Sentinel', type: 'Elite', element: 'Pyro', level: 69 },
        { name: 'Pressure Keeper', type: 'Normal', element: 'Hydro', level: 69 },
      ],
      firstClearRewards: getCampaignReward(6, 3),
      beforeSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'Steam hides the broken spans, but the pressure rhythm marks each safe step.' },
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'A sealed order is lodged in the central valve. The guards will defend it.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then we clear the crossing and read why this place stopped changing.' },
      ],
      afterSlides: [
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'Vented pressure softened the sentinel. The order is ours.' },
        { speaker: 'Marina', element: 'Hydro', text: 'It commands perfect winter, signed after the first thaw succeeded.' },
      ],
      decisionId: 'chapter-6-route',
      variants: [
        {
          optionId: 'vent-magma',
          enemies: [
            { name: 'Tempered Sentinel', type: 'Elite', element: 'Pyro', level: 69 },
            { name: 'Pressure Keeper', type: 'Normal', element: 'Hydro', level: 69 },
          ],
          modifierId: 'magma-vented',
          afterSlides: [
            { speaker: 'Faultwright Sera', element: 'Pyro', text: 'Vented pressure softened the sentinel. The order is ours.' },
            { speaker: 'Marina', element: 'Hydro', text: 'It commands perfect winter, signed after the first thaw succeeded.' },
          ],
        },
        {
          optionId: 'thaw-glacier',
          enemies: [
            { name: 'Fault Engineer', type: 'Elite', element: 'Cryo', level: 69 },
            { name: 'Meltwater Stalker', type: 'Normal', element: 'Cryo', level: 69 },
          ],
          modifierId: 'glacier-thawed',
          afterSlides: [
            { speaker: 'Faultwright Sera', element: 'Pyro', text: 'The thaw exposed an engineer frozen beside the order it obeyed.' },
            { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Perfect winter was fear disguised as permanence.' },
          ],
        },
      ],
      memoryUnlockIds: ['chapter-6-sabotage-order'],
    },
    '6-4': {
      id: '6-4',
      chapter: 6,
      name: 'Engine of Two Seasons',
      location: 'Twin-Season Engine',
      backgroundId: 'chapter-6',
      recommendedLevel: 71,
      difficulty: 'Normal',
      desc: 'Restore motion to the engine where both routes join before the faultheart caldera.',
      enemies: [
        { name: 'Tempered Sentinel', type: 'Elite', element: 'Pyro', level: 71 },
        { name: 'Fault Engineer', type: 'Elite', element: 'Cryo', level: 71 },
      ],
      firstClearRewards: getCampaignReward(6, 4),
      beforeSlides: [
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'Both currents meet here. The engine failed when its keepers tried to hold one season forever.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The route changed our approach, not the repair waiting at its center.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Set heat and frost in motion. Balance must be allowed to move.' },
      ],
      afterSlides: [
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'The engine turns. Faultheart Caldera is no longer sealed.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Something inside is drawing breath through every vent.' },
      ],
    },
    '6-5': {
      id: '6-5',
      chapter: 6,
      name: 'Frostfire Wyrm Boss',
      location: 'Faultheart Caldera',
      backgroundId: 'chapter-6',
      recommendedLevel: 73,
      difficulty: 'Boss',
      desc: 'Defeat the fixed guardian feeding on both seasons and release Rimeforge from permanent imbalance.',
      enemies: [
        { name: 'Colossus of Anemo', type: 'Boss', element: 'Anemo', level: 73, bossType: 'fire_dragon' },
      ],
      firstClearRewards: getCampaignReward(6, 5),
      beforeSlides: [
        { speaker: 'Colossus of Anemo', element: 'Anemo', text: 'ONE SEASON MUST CONSUME THE OTHER.' },
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'It keeps the currents divided so it can breathe between them.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then we end the false choice and free both seasons.' },
      ],
      afterSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'Meltwater and warm wind are crossing without tearing the fault.' },
        { speaker: 'Faultwright Sera', element: 'Pyro', text: 'The first gauge moves again. Beyond the caldera, the sky anchors are falling.' },
      ],
      memoryUnlockIds: ['chapter-6-changing-balance'],
    },
  },
  memories: [
    {
      id: 'chapter-6-first-gauge',
      title: 'The First Gauge',
      sourceLabel: 'Chapter 6: The Frostfire Chasm',
      location: 'Rimeforge Gate',
      category: 'campaign',
      text: 'Rimeforge measured balance before it tried to command it. The first gauge had no ideal mark, only a needle free to answer each season.',
    },
    {
      id: 'chapter-6-sabotage-order',
      title: 'Order for Perfect Winter',
      sourceLabel: 'Chapter 6: The Frostfire Chasm',
      location: 'White-Steam Causeway',
      category: 'campaign',
      text: 'The sabotage order demanded a winter without thaw. Its author feared every change that could not be owned, and called that fear perfection.',
    },
    {
      id: 'chapter-6-changing-balance',
      title: 'Balance Must Move',
      sourceLabel: 'Chapter 6: The Frostfire Chasm',
      location: 'Faultheart Caldera',
      category: 'campaign',
      text: 'The repaired engine keeps no season dominant. Its makers left one final instruction: a balance that cannot move is only a cage with equal walls.',
    },
  ],
} satisfies StoryChapterPack;
