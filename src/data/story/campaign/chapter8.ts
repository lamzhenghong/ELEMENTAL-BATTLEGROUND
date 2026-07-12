import { getCampaignReward } from '../balance';
import type { StoryChapterPack } from '../types';

export const CHAPTER_8_PACK = {
  chapter: 8,
  stages: {
    '8-1': {
      id: '8-1',
      chapter: 8,
      name: 'Cinderlift Descent',
      location: 'Mount Eldruin Cinderlift',
      backgroundId: 'chapter-8',
      recommendedLevel: 85,
      difficulty: 'Normal',
      desc: 'Descend through Mount Eldruin on a cinderlift chained to the ancient Worldforge.',
      enemies: [
        { name: 'Cinder Scavenger', type: 'Normal', element: 'Pyro', level: 85 },
        { name: 'Furnace Husk', type: 'Normal', element: 'Geo', level: 85 },
      ],
      firstClearRewards: getCampaignReward(8, 1),
      beforeSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The lift descends without a counterweight. Something below is pulling every chain.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The mountain is feeding heat into rings that circle far beyond this shaft.' },
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'Those are bound orbits. The Worldforge once tried to command the sky.' },
      ],
      afterSlides: [
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'The lift is clear. Its oldest chain bears the mark of the first captured orbit.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Then the control ring below still holds the key.' },
      ],
      memoryUnlockIds: ['chapter-8-bound-orbits'],
    },
    '8-2': {
      id: '8-2',
      chapter: 8,
      name: 'Worldforge Control',
      location: 'Worldforge Control Ring',
      backgroundId: 'chapter-8',
      recommendedLevel: 87,
      difficulty: 'Normal',
      desc: 'Choose whether to disable the Worldforge or reshape its key before entering Hammerfall Foundry.',
      enemies: [
        { name: 'Chainforged Guard', type: 'Normal', element: 'Geo', level: 87 },
        { name: 'Crucible Artificer', type: 'Normal', element: 'Pyro', level: 87 },
      ],
      firstClearRewards: getCampaignReward(8, 2),
      beforeSlides: [
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'We can disable the forge feeds or reshape the control key to answer a new hand.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Disabling it cools the foundry. Reforging the key opens guarded passages.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Choose the route. The planetary anvil remains our destination.' },
      ],
      afterSlides: [
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'Hammerfall Foundry is open. The old wardens have noticed the change.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Let them come. A tool can outgrow its first command.' },
      ],
      decision: {
        id: 'chapter-8-route',
        prompt: 'The Worldforge still obeys its ancient command. How do you enter the foundry?',
        options: [
          { id: 'disable-forge', label: 'Disable the forge', consequence: 'Slow the foundry defenders.' },
          { id: 'reforge-key', label: 'Reforge the key', consequence: 'Reduce defender endurance in the foundry.' },
        ],
      },
    },
    '8-3': {
      id: '8-3',
      chapter: 8,
      name: 'Hammerfall Foundry',
      location: 'Hammerfall Foundry',
      backgroundId: 'chapter-8',
      recommendedLevel: 89,
      difficulty: 'Normal',
      desc: 'Cross the foundry and recover the refusal left by smiths who rejected the Worldforge command.',
      enemies: [
        { name: 'Worldforge Warden', type: 'Elite', element: 'Pyro', level: 89 },
        { name: 'Chainforged Guard', type: 'Normal', element: 'Geo', level: 89 },
      ],
      firstClearRewards: getCampaignReward(8, 3),
      beforeSlides: [
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'The last free smiths struck their refusal into an anvil near the center line.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The hammers still fall, but no living hand guides them.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'We stop the pattern long enough to hear what they left.' },
      ],
      afterSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'With the feeds disabled, the hammers lost their marching rhythm.' },
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'The refusal reads: We shape fire; fire does not shape our will.' },
      ],
      decisionId: 'chapter-8-route',
      variants: [
        {
          optionId: 'disable-forge',
          enemies: [
            { name: 'Worldforge Warden', type: 'Elite', element: 'Pyro', level: 89 },
            { name: 'Chainforged Guard', type: 'Normal', element: 'Geo', level: 89 },
          ],
          modifierId: 'forge-disabled',
          afterSlides: [
            { speaker: 'Marina', element: 'Hydro', text: 'With the feeds disabled, the hammers lost their marching rhythm.' },
            { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'The refusal reads: We shape fire; fire does not shape our will.' },
          ],
        },
        {
          optionId: 'reforge-key',
          enemies: [
            { name: 'Keyway Adjudicator', type: 'Elite', element: 'Geo', level: 89 },
            { name: 'Crucible Artificer', type: 'Normal', element: 'Pyro', level: 89 },
          ],
          modifierId: 'key-reforged',
          afterSlides: [
            { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The reshaped key turned the guarded passages against their wardens.' },
            { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'And the free smiths left their refusal where every passage could reach it.' },
          ],
        },
      ],
      memoryUnlockIds: ['chapter-8-smiths-refusal'],
    },
    '8-4': {
      id: '8-4',
      chapter: 8,
      name: 'Crucible Keyway',
      location: 'Crucible Keyway',
      backgroundId: 'chapter-8',
      recommendedLevel: 91,
      difficulty: 'Normal',
      desc: 'Join both routes at the final keyway and release the planetary anvil from its ancient command.',
      enemies: [
        { name: 'Worldforge Warden', type: 'Elite', element: 'Pyro', level: 91 },
        { name: 'Keyway Adjudicator', type: 'Elite', element: 'Geo', level: 91 },
      ],
      firstClearRewards: getCampaignReward(8, 4),
      beforeSlides: [
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'Every foundry route joins here. The final lock expects the old command.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The forge can cool or answer a new key, but neither choice gives it a master.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Open the anvil. We return fire to those who choose its purpose.' },
      ],
      afterSlides: [
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'The keyway accepts no owner. The planetary anvil is free.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Something rooted beneath it is waking in the released heat.' },
      ],
    },
    '8-5': {
      id: '8-5',
      chapter: 8,
      name: 'Molten Overlord Boss',
      location: 'Planetary Anvil',
      backgroundId: 'chapter-8',
      recommendedLevel: 93,
      difficulty: 'Boss',
      desc: 'Defeat the fixed guardian that would bind the reclaimed forge to another master.',
      enemies: [
        { name: 'Colossus of Dendro', type: 'Boss', element: 'Dendro', level: 93, bossType: 'thunderbird' },
      ],
      firstClearRewards: getCampaignReward(8, 5),
      beforeSlides: [
        { speaker: 'Colossus of Dendro', element: 'Dendro', text: 'ALL FIRE REQUIRES A MASTER.' },
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'Its roots carried the first command through every orbit chain.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then we sever the command and leave the flame a choice.' },
      ],
      afterSlides: [
        { speaker: 'Forgekeeper Iona', element: 'Pyro', text: 'The anvil burns without chains, crown, or keeper.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Its first free spark has opened a rift beyond the mountain.' },
      ],
      memoryUnlockIds: ['chapter-8-reclaimed-fire'],
    },
  },
  memories: [
    {
      id: 'chapter-8-bound-orbits',
      title: 'When Orbits Were Chained',
      sourceLabel: 'Chapter 8: Heart of the Volcano',
      location: 'Mount Eldruin Cinderlift',
      category: 'campaign',
      text: 'The Worldforge once chained wandering fires above Aetheria and called their fixed paths order. The first cinderlift still bears the captured arc.',
    },
    {
      id: 'chapter-8-smiths-refusal',
      title: "The Smith's Refusal",
      sourceLabel: 'Chapter 8: Heart of the Volcano',
      location: 'Hammerfall Foundry',
      category: 'campaign',
      text: 'The free smiths broke their finest hammer rather than forge another chain. Their refusal survived because each fragment carried the same words.',
    },
    {
      id: 'chapter-8-reclaimed-fire',
      title: 'Fire Without a Master',
      sourceLabel: 'Chapter 8: Heart of the Volcano',
      location: 'Planetary Anvil',
      category: 'campaign',
      text: 'The planetary anvil burns after every command is severed. Its flame offers heat and light, but waits for living hands to decide what comes next.',
    },
  ],
} satisfies StoryChapterPack;
