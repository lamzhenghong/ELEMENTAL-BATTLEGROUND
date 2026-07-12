import { getCampaignReward } from '../balance';
import type { StoryChapterPack } from '../types';

export const CHAPTER_10_PACK = {
  chapter: 10,
  stages: {
    '10-1': {
      id: '10-1',
      chapter: 10,
      name: 'Prime Orbit Vestibule',
      location: 'Prime Orbit Vestibule',
      backgroundId: 'chapter-10',
      recommendedLevel: 105,
      difficulty: 'Normal',
      desc: 'Enter the first orbit chamber and read the command that placed Aetheria beneath divine custody.',
      enemies: [
        { name: 'Orbit Custodian', type: 'Normal', element: 'Anemo', level: 105 },
        { name: 'Protocol Shade', type: 'Normal', element: 'Hydro', level: 105 },
      ],
      firstClearRewards: getCampaignReward(10, 1),
      beforeSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Every ring turns around an empty center. This place expected its makers to return.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The vestibule is still issuing their first command to every element below.' },
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'Preserve the world by governing every choice. That command outlived the hands that wrote it.' },
      ],
      afterSlides: [
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The command seal is open. It names custody as the price of survival.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then the final trial is deciding whether survival still requires an owner.' },
      ],
      memoryUnlockIds: ['chapter-10-first-command'],
    },
    '10-2': {
      id: '10-2',
      chapter: 10,
      name: 'Sevenfold Trial',
      location: 'Sevenfold Matrix',
      backgroundId: 'chapter-10',
      recommendedLevel: 107,
      difficulty: 'Normal',
      desc: 'Cross the seven elemental trials and choose what principle will guide the reforged orbit.',
      enemies: [
        { name: 'Divine Simulacrum', type: 'Normal', element: 'Pyro', level: 107 },
        { name: 'Consensus Warden', type: 'Normal', element: 'Geo', level: 107 },
      ],
      firstClearRewards: getCampaignReward(10, 2),
      beforeSlides: [
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The seven trials accept two answers: restore the divine protocol or entrust the orbit to shared mortal stewardship.' },
        { speaker: 'Marina', element: 'Hydro', text: 'One preserves tested order. The other divides responsibility among those who must live with each choice.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'No answer erases risk. We choose who has the right to carry it.' },
      ],
      afterSlides: [
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The matrix has accepted our answer. Stewardship Hall will test its consequences.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Then we meet that test with everything the seven elements taught us.' },
      ],
      decision: {
        id: 'chapter-10-route',
        prompt: 'The prime orbit awaits a governing principle. Who should carry its power?',
        options: [
          { id: 'restore-divine-protocol', label: 'Restore divine protocol', consequence: 'Use ordered paths to slow the hall defenders.' },
          { id: 'shared-mortal-stewardship', label: 'Share mortal stewardship', consequence: 'Reduce defender endurance through shared resolve.' },
        ],
      },
    },
    '10-3': {
      id: '10-3',
      chapter: 10,
      name: 'Hall of Choosing',
      location: 'Stewardship Hall',
      backgroundId: 'chapter-10',
      recommendedLevel: 109,
      difficulty: 'Normal',
      desc: 'Carry the chosen principle through a hall built to reject every hand except its absent creators.',
      enemies: [
        { name: 'Sevenfold Examiner', type: 'Elite', element: 'Anemo', level: 109 },
        { name: 'Protocol Shade', type: 'Normal', element: 'Hydro', level: 109 },
      ],
      firstClearRewards: getCampaignReward(10, 3),
      beforeSlides: [
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The hall measures obedience, judgment, and consequence. Its examiners have never accepted an answer from below.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Then we show them a world is more than a command sent down from an empty throne.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Hold to the choice. We reach the mirror by proving it can bear disagreement.' },
      ],
      afterSlides: [
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The restored paths slowed the examiner without silencing our judgment.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Order can guide a choice. It cannot become an excuse to stop choosing.' },
      ],
      decisionId: 'chapter-10-route',
      variants: [
        {
          optionId: 'restore-divine-protocol',
          enemies: [
            { name: 'Sevenfold Examiner', type: 'Elite', element: 'Anemo', level: 109 },
            { name: 'Protocol Shade', type: 'Normal', element: 'Hydro', level: 109 },
          ],
          modifierId: 'divine-protocol',
          afterSlides: [
            { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The restored paths slowed the examiner without silencing our judgment.' },
            { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Order can guide a choice. It cannot become an excuse to stop choosing.' },
          ],
        },
        {
          optionId: 'shared-mortal-stewardship',
          enemies: [
            { name: 'Catalyst Replica', type: 'Elite', element: 'Dendro', level: 109 },
            { name: 'Consensus Warden', type: 'Normal', element: 'Geo', level: 109 },
          ],
          modifierId: 'mortal-stewardship',
          afterSlides: [
            { speaker: 'Marina', element: 'Hydro', text: 'Every shared answer weakened the replica because no single voice carried the whole burden.' },
            { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The hall has recorded stewardship without a throne. The mirror awaits.' },
          ],
        },
      ],
      memoryUnlockIds: ['chapter-10-empty-throne'],
    },
    '10-4': {
      id: '10-4',
      chapter: 10,
      name: 'Catalyst Mirror',
      location: 'Catalyst Mirror',
      backgroundId: 'chapter-10',
      recommendedLevel: 111,
      difficulty: 'Normal',
      desc: 'Join both routes at the catalyst mirror and return the sevenfold power to Aetheria without naming an owner.',
      enemies: [
        { name: 'Sevenfold Examiner', type: 'Elite', element: 'Anemo', level: 111 },
        { name: 'Catalyst Replica', type: 'Elite', element: 'Dendro', level: 111 },
      ],
      firstClearRewards: getCampaignReward(10, 4),
      beforeSlides: [
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The mirror offers each of us a crown shaped from the choice we made.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Protocol or stewardship, either can become ownership if we accept that reflection.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Break the crowns, keep the responsibility, and open the prime defense core.' },
      ],
      afterSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'The sevenfold current is descending into Aetheria without bending toward a throne.' },
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'The defense core rejects a world it cannot own. Its final guardian is awake.' },
      ],
    },
    '10-5': {
      id: '10-5',
      chapter: 10,
      name: 'Eldric Core Prime Boss',
      location: 'Prime Defense Core',
      backgroundId: 'chapter-10',
      recommendedLevel: 113,
      difficulty: 'Boss',
      desc: 'Defeat the fixed guardian that mistakes absolute custody for the only possible defense of Aetheria.',
      enemies: [
        { name: 'Colossus of Hydro', type: 'Boss', element: 'Hydro', level: 113, bossType: 'ice_golem' },
      ],
      firstClearRewards: getCampaignReward(10, 5),
      beforeSlides: [
        { speaker: 'Colossus of Hydro', element: 'Hydro', text: 'A WORLD WITHOUT AN OWNER CANNOT BE DEFENDED.' },
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'It would freeze every living choice to preserve the shape its makers left behind.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Aetheria belongs to everyone who keeps choosing its future. That is defense enough.' },
      ],
      afterSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'The prime orbit is open. Water, flame, stone, wind, frost, lightning, and root are returning together.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'No creator reclaimed the throne. Aetheria reforged itself through every hand willing to care for it.' },
        { speaker: 'Prime Witness Oren', element: 'Geo', text: 'Then let the empty center remain a promise: power may be shared without being abandoned.' },
      ],
      memoryUnlockIds: ['chapter-10-reforged-aetheria'],
    },
  },
  memories: [
    {
      id: 'chapter-10-first-command',
      title: 'The First Command',
      sourceLabel: 'Chapter 10: Aetheria Reforged',
      location: 'Prime Orbit Vestibule',
      category: 'campaign',
      text: 'The first command promised safety through perfect custody. It endured because no later hand was permitted to answer whether the promise still served the living.',
    },
    {
      id: 'chapter-10-empty-throne',
      title: 'No Hand Owns the Orbit',
      sourceLabel: 'Chapter 10: Aetheria Reforged',
      location: 'Stewardship Hall',
      category: 'campaign',
      text: 'The stewardship record names every hand that carried the orbit and crowns none of them. Responsibility is shared there without becoming possession.',
    },
    {
      id: 'chapter-10-reforged-aetheria',
      title: 'Aetheria Reforged',
      sourceLabel: 'Chapter 10: Aetheria Reforged',
      location: 'Prime Defense Core',
      category: 'campaign',
      text: 'Aetheria was reforged when the seven elements returned without a master. Its empty center is not an absence, but room for every future choice.',
    },
  ],
} satisfies StoryChapterPack;
