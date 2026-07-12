import type { StoryCharacterPack } from '../types';

export const KAELEN_STORY_PACK = {
  characterId: 'kaelen',
  stages: {
    'char-kaelen-1': {
      id: 'char-kaelen-1',
      chapter: 0,
      name: 'A Blank Horizon',
      location: 'Nautila Chart House',
      backgroundId: 'kaelen-memory',
      recommendedLevel: 10,
      difficulty: 'Normal',
      desc: 'Return to the morning Kaelen erased his inherited charts and learned to read the living sea for himself.',
      enemies: [
        { name: 'Dockside Reef Scavenger', type: 'Normal', element: 'Hydro', level: 10 },
      ],
      firstClearRewards: { gems: 150, mora: 10000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'My family chart ended here with a warning: beyond this line, the sea has no names.' },
        { speaker: 'Navigator Sori', element: 'Anemo', text: 'You erased three generations of ink. The harbor council called it arrogance.' },
        { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'Old ink cannot command a new current. First, we clear the scavenger from the sounding pier.' },
      ],
      afterSlides: [
        { speaker: 'Navigator Sori', element: 'Anemo', text: 'The horizon is still blank. Does that trouble you?' },
        { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'A blank chart is honest. It leaves room for the sea to answer in its own hand.' },
      ],
      memoryUnlockIds: ['kaelen-chart-zero'],
    },
    'char-kaelen-2': {
      id: 'char-kaelen-2',
      chapter: 0,
      name: "The Admiral's Burden",
      location: 'Breakwater Command Deck',
      backgroundId: 'kaelen-memory',
      recommendedLevel: 24,
      difficulty: 'Normal',
      desc: 'Revisit the storm order that made Kaelen weigh a stranded crew against the defense of an entire harbor.',
      enemies: [
        { name: 'Wakebreaker Marauder', type: 'Elite', element: 'Hydro', level: 24 },
      ],
      firstClearRewards: { gems: 300, mora: 22000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Navigator Sori', element: 'Anemo', text: 'Scout cutter Ilyra is dismasted beyond the reef. Thirty-one crew are signaling through the rain.' },
        { speaker: 'Harbor Warden Tovan', element: 'Geo', text: 'If the flagship leaves formation, the corsairs gain a channel to the civilian docks.' },
        { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'Command turns lives into columns so the hand can remain steady. The names never stop being names.' },
      ],
      afterSlides: [
        { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'The battle ledger calls the outcome acceptable. That word has always sounded like a closed door.' },
        { speaker: 'Navigator Sori', element: 'Anemo', text: 'Open it, Admiral. Read the names again before you choose.' },
      ],
      decision: {
        id: 'kaelen-act-2-route',
        prompt: 'The scout crew is stranded while corsairs test the harbor line. Where does Kaelen send the flagship?',
        options: [
          { id: 'rescue-crew', label: 'Rescue the crew', consequence: 'Sail through the reef with the rescued crew supporting the fight.' },
          { id: 'hold-harbor', label: 'Hold the harbor', consequence: 'Keep formation and meet the corsair assault at the breakwater.' },
        ],
      },
      variants: [
        {
          optionId: 'rescue-crew',
          enemies: [
            { name: 'Wakebreaker Marauder', type: 'Elite', element: 'Hydro', level: 24 },
          ],
          modifierId: 'rescued-crew',
          afterSlides: [
            { speaker: 'Navigator Sori', element: 'Anemo', text: 'Thirty-one aboard. The harbor line bent, but the reserve cutters closed the gap.' },
            { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'Write every reserve captain beside the rescued names. No current carried us alone.' },
          ],
        },
        {
          optionId: 'hold-harbor',
          enemies: [
            { name: 'Breakwater Corsair', type: 'Elite', element: 'Hydro', level: 24 },
          ],
          modifierId: 'held-harbor',
          afterSlides: [
            { speaker: 'Harbor Warden Tovan', element: 'Geo', text: 'The docks stand. A reef patrol reached the Ilyra after the storm turned.' },
            { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'Then record the hours they waited. A sound decision can still leave people alone in the dark.' },
          ],
        },
      ],
      memoryUnlockIds: ['kaelen-names-behind-numbers'],
    },
    'char-kaelen-3': {
      id: 'char-kaelen-3',
      chapter: 0,
      name: 'Sounding the Deep',
      location: 'Leviathan Sounding Trench',
      backgroundId: 'kaelen-memory',
      recommendedLevel: 38,
      difficulty: 'Boss',
      desc: 'Descend beneath Kaelen\'s perfect battle maps and confront the cold certainty that an admiral must carry every burden alone.',
      enemies: [
        { name: 'Kaelen Tidebound Trial Boss', type: 'Boss', element: 'Hydro', level: 38, bossType: 'ice_golem' },
      ],
      firstClearRewards: { gems: 500, mora: 40000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Tidebound Reflection', element: 'Hydro', text: 'An admiral is the fixed point. If you share doubt, the fleet loses its horizon.' },
        { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'A fixed point that cannot listen is only a reef. I mistook silence for steadiness.' },
        { speaker: 'Navigator Sori', element: 'Anemo', text: 'Then sound the deep with more than one voice.' },
      ],
      afterSlides: [
        { speaker: 'Tidebound Reflection', element: 'Hydro', text: 'Who carries the burden when your hands open?' },
        { speaker: 'Kaelen Tidebound', element: 'Hydro', text: 'The fleet carries it together. Command is not solitude; it is the promise to keep listening.' },
        { speaker: 'Navigator Sori', element: 'Anemo', text: 'The trench returns an echo. Every ship is answering.' },
      ],
      memoryUnlockIds: ['kaelen-current-shared'],
    },
  },
  memories: [
    {
      id: 'kaelen-chart-zero',
      title: 'Chart Zero',
      sourceLabel: 'Kaelen Character Story',
      location: 'Nautila Chart House',
      category: 'character',
      text: 'Kaelen called his first blank map Chart Zero. It recorded no coast or depth, only the date he decided inherited certainty was less useful than an honest unanswered horizon.',
    },
    {
      id: 'kaelen-names-behind-numbers',
      title: 'Names Behind the Numbers',
      sourceLabel: 'Kaelen Character Story',
      location: 'Breakwater Command Deck',
      category: 'character',
      text: 'After every battle, Kaelen copied the crew ledger by hand. He said strategy required numbers, but conscience required knowing the names those numbers tried to hide.',
    },
    {
      id: 'kaelen-current-shared',
      title: 'A Current Shared',
      sourceLabel: 'Kaelen Character Story',
      location: 'Leviathan Sounding Trench',
      category: 'character',
      text: 'The deepest sounding returned not one echo but a chord from the fleet above. Kaelen finally understood that command could be shared without becoming uncertain.',
    },
  ],
} satisfies StoryCharacterPack;
