import { getCampaignReward } from '../balance';
import type { StoryChapterPack } from '../types';

export const CHAPTER_7_PACK = {
  chapter: 7,
  stages: {
    '7-1': {
      id: '7-1',
      chapter: 7,
      name: 'Fallen Sky Dock',
      location: 'Lower Cloud Harbor',
      backgroundId: 'chapter-7',
      recommendedLevel: 75,
      difficulty: 'Normal',
      desc: 'Reach a broken cloud harbor as its bells warn that the sky anchors are failing.',
      enemies: [
        { name: 'Gale Harrier', type: 'Normal', element: 'Anemo', level: 75 },
        { name: 'Skyroad Prowler', type: 'Normal', element: 'Electro', level: 75 },
      ],
      firstClearRewards: getCampaignReward(7, 1),
      beforeSlides: [
        { speaker: 'Marina', element: 'Hydro', text: 'Half the dock hangs below the cloud line. That bell is sounding from the fallen side.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The wind still carries its warning upward. Someone is listening.' },
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'I am. Help me clear the harbor before the next anchor gives way.' },
      ],
      afterSlides: [
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'The bell fell first, but it never stopped marking the strain.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Then its warning can guide us to the break.' },
      ],
      memoryUnlockIds: ['chapter-7-falling-bell'],
    },
    '7-2': {
      id: '7-2',
      chapter: 7,
      name: 'Anchor District',
      location: 'Anchor Ward',
      backgroundId: 'chapter-7',
      recommendedLevel: 77,
      difficulty: 'Normal',
      desc: 'Choose between clearing the settlement and bracing the anchors before the skyroad opens.',
      enemies: [
        { name: 'Anchor Breaker', type: 'Normal', element: 'Geo', level: 77 },
        { name: 'Prism Talon', type: 'Normal', element: 'Anemo', level: 77 },
      ],
      firstClearRewards: getCampaignReward(7, 2),
      beforeSlides: [
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'People remain in the windward homes, and three anchor pylons are slipping.' },
        { speaker: 'Marina', element: 'Hydro', text: 'We can clear the settlement first or brace the pylons before another street falls.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Either choice opens the skyroad. The other cost follows us there.' },
      ],
      afterSlides: [
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'Aethelwing Skyroad is reachable. The upper ward has seen our signal.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Then we climb before the crosswind changes.' },
      ],
      decision: {
        id: 'chapter-7-route',
        prompt: 'The ward is occupied while its anchors slip. What do you secure first?',
        options: [
          { id: 'evacuate-settlement', label: 'Evacuate the settlement', consequence: 'Gain local guidance on the skyroad.' },
          { id: 'stabilize-anchors', label: 'Stabilize the anchors', consequence: 'Weaken the skyroad blockade.' },
        ],
      },
    },
    '7-3': {
      id: '7-3',
      chapter: 7,
      name: 'Aethelwing Causeway',
      location: 'Aethelwing Skyroad',
      backgroundId: 'chapter-7',
      recommendedLevel: 79,
      difficulty: 'Normal',
      desc: 'Cross the exposed skyroad and recover the ledger that records who truly holds the cloud kingdom aloft.',
      enemies: [
        { name: 'Windchain Custodian', type: 'Elite', element: 'Anemo', level: 79 },
        { name: 'Gale Harrier', type: 'Normal', element: 'Anemo', level: 79 },
      ],
      firstClearRewards: getCampaignReward(7, 3),
      beforeSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The causeway bends with every gust. Keep to the anchor shadows.' },
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'The first keeper stored a ledger at the midpoint shrine.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The blockade is closing around it. We take the record with the road.' },
      ],
      afterSlides: [
        { speaker: 'Harbor Guide Pell', element: 'Anemo', text: 'The evacuees marked every steady current. Follow their ribbons.' },
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'The ledger credits dockhands and stonecutters, not kings, for every anchor.' },
      ],
      decisionId: 'chapter-7-route',
      variants: [
        {
          optionId: 'evacuate-settlement',
          enemies: [
            { name: 'Windchain Custodian', type: 'Elite', element: 'Anemo', level: 79 },
            { name: 'Gale Harrier', type: 'Normal', element: 'Anemo', level: 79 },
          ],
          modifierId: 'civilians-evacuated',
          afterSlides: [
            { speaker: 'Harbor Guide Pell', element: 'Anemo', text: 'The evacuees marked every steady current. Follow their ribbons.' },
            { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'The ledger credits dockhands and stonecutters, not kings, for every anchor.' },
          ],
        },
        {
          optionId: 'stabilize-anchors',
          enemies: [
            { name: 'Crownwind Warden', type: 'Elite', element: 'Geo', level: 79 },
            { name: 'Prism Talon', type: 'Normal', element: 'Anemo', level: 79 },
          ],
          modifierId: 'anchors-stabilized',
          afterSlides: [
            { speaker: 'Marina', element: 'Hydro', text: 'The braced pylons pulled the blockade out of formation.' },
            { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'And the ledger names every worker erased from the crown records.' },
          ],
        },
      ],
      memoryUnlockIds: ['chapter-7-anchor-keeper'],
    },
    '7-4': {
      id: '7-4',
      chapter: 7,
      name: 'Crownwind Spire',
      location: 'Crownwind Observatory',
      backgroundId: 'chapter-7',
      recommendedLevel: 81,
      difficulty: 'Normal',
      desc: 'Open the observatory after both routes converge beneath the final crownwind lock.',
      enemies: [
        { name: 'Windchain Custodian', type: 'Elite', element: 'Anemo', level: 81 },
        { name: 'Crownwind Warden', type: 'Elite', element: 'Geo', level: 81 },
      ],
      firstClearRewards: getCampaignReward(7, 4),
      beforeSlides: [
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'Every lower route joins beneath this spire. The crown sealed the observatory from above.' },
        { speaker: 'Marina', element: 'Hydro', text: 'The anchor chart shows no single pillar holding the city.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Open the lock. The sky rests on shared work, not a throne.' },
      ],
      afterSlides: [
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'The Eye Above the Spires is open, and the oldest anchor is moving.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Not an anchor. Wings wrapped in stone.' },
      ],
    },
    '7-5': {
      id: '7-5',
      chapter: 7,
      name: 'Skyward Avian Boss',
      location: 'Eye Above the Spires',
      backgroundId: 'chapter-7',
      recommendedLevel: 83,
      difficulty: 'Boss',
      desc: 'Defeat the fixed guardian whose stone wings keep the cloud kingdom dependent on a single crown.',
      enemies: [
        { name: 'Colossus of Geo', type: 'Boss', element: 'Geo', level: 83, bossType: 'ice_golem' },
      ],
      firstClearRewards: getCampaignReward(7, 5),
      beforeSlides: [
        { speaker: 'Colossus of Geo', element: 'Geo', text: 'ONLY THE CROWN HOLDS THE SKY.' },
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'The ledger proves otherwise. Every district bears the weight.' },
        { speaker: 'Marina', element: 'Hydro', text: 'Then we break the crown lock and leave the anchors joined.' },
      ],
      afterSlides: [
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The stone wings have opened. The city is holding on every anchor at once.' },
        { speaker: 'Anchor-Keeper Tovan', element: 'Geo', text: 'The clear sky reveals Mount Eldruin, and a forge burning beneath it.' },
      ],
      memoryUnlockIds: ['chapter-7-open-sky'],
    },
  },
  memories: [
    {
      id: 'chapter-7-falling-bell',
      title: 'The Falling Bell',
      sourceLabel: 'Chapter 7: Skyward Ascent',
      location: 'Lower Cloud Harbor',
      category: 'campaign',
      text: 'The harbor bell continued ringing after its tower fell below the clouds. Its keepers followed the sound and found the first failing anchor.',
    },
    {
      id: 'chapter-7-anchor-keeper',
      title: "Anchor Keeper's Ledger",
      sourceLabel: 'Chapter 7: Skyward Ascent',
      location: 'Aethelwing Skyroad',
      category: 'campaign',
      text: 'The ledger names generations of dockhands, stonecutters, and wind readers. No crown raised the city alone, though every crown claimed it had.',
    },
    {
      id: 'chapter-7-open-sky',
      title: 'What Holds the Sky',
      sourceLabel: 'Chapter 7: Skyward Ascent',
      location: 'Eye Above the Spires',
      category: 'campaign',
      text: 'The oldest anchor chart has no center. Each ward carries its neighbors, and the open sky endures because the burden travels between them.',
    },
  ],
} satisfies StoryChapterPack;
