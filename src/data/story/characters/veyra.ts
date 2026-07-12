import type { StoryCharacterPack } from '../types';

export const VEYRA_STORY_PACK = {
  characterId: 'veyra',
  stages: {
    'char-veyra-1': {
      id: 'char-veyra-1',
      chapter: 0,
      name: 'The Seventh Mirror',
      location: 'Stormglass Calibration Walk',
      backgroundId: 'veyra-memory',
      recommendedLevel: 10,
      difficulty: 'Normal',
      desc: 'Recalibrate the seven storm mirrors where Veyra learned that a perfect shot depends on every imperfect reflection.',
      enemies: [
        { name: 'Stormglass Calibration Drone', type: 'Normal', element: 'Electro', level: 10 },
      ],
      firstClearRewards: { gems: 150, mora: 10000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Veyra Stormglass', element: 'Electro', text: 'Six mirrors agreed with my calculation. The seventh tilted half a degree and saved the whole observatory.' },
        { speaker: 'Engineer Pell', element: 'Geo', text: 'You blamed the mount for a week before admitting it had corrected your shot.' },
        { speaker: 'Veyra Stormglass', element: 'Electro', text: 'I was young. I preferred impossible aim to possible error. Let us see what the drone remembers.' },
      ],
      afterSlides: [
        { speaker: 'Engineer Pell', element: 'Geo', text: 'All seven reflections align, including the one that refuses to flatter you.' },
        { speaker: 'Veyra Stormglass', element: 'Electro', text: 'Keep that one polished. Accuracy needs at least one mirror willing to disagree.' },
      ],
      memoryUnlockIds: ['veyra-six-perfect-reflections'],
    },
    'char-veyra-2': {
      id: 'char-veyra-2',
      chapter: 0,
      name: 'One Shot Too Early',
      location: 'Shattered Forecast Engine',
      backgroundId: 'veyra-memory',
      recommendedLevel: 24,
      difficulty: 'Normal',
      desc: 'Return to the instant Veyra fired before the forecast completed and opened a path for the signal that shattered her home.',
      enemies: [
        { name: 'Prism Sentinel', type: 'Elite', element: 'Electro', level: 24 },
      ],
      firstClearRewards: { gems: 300, mora: 22000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Engineer Pell', element: 'Geo', text: 'Forecast at ninety-nine percent. Wait one more second and the engine can ground the strike.' },
        { speaker: 'Veyra Stormglass', element: 'Electro', text: 'I saw the opening and fired. The arrow landed exactly where I aimed, one second before it should have.' },
        { speaker: 'Unknown Signal', element: 'Electro', text: 'A perfect path arrived early. Through that path, the storm learned how to enter.' },
      ],
      afterSlides: [
        { speaker: 'Veyra Stormglass', element: 'Electro', text: 'I kept calling it bad timing, as though the second had betrayed me.' },
        { speaker: 'Engineer Pell', element: 'Geo', text: 'Timing was part of the shot. Decide what you repair first, then own the whole result.' },
      ],
      decision: {
        id: 'veyra-act-2-route',
        prompt: 'The forecast engine is failing while the unknown signal retreats through the storm. What does Veyra pursue?',
        options: [
          { id: 'repair-engine', label: 'Repair the engine', consequence: 'Stabilize the observatory and fight beside its restored prisms.' },
          { id: 'pursue-signal', label: 'Pursue the signal', consequence: 'Follow the retreating trace before it vanishes into the storm.' },
        ],
      },
      variants: [
        {
          optionId: 'repair-engine',
          enemies: [
            { name: 'Prism Sentinel', type: 'Elite', element: 'Electro', level: 24 },
          ],
          modifierId: 'repaired-engine',
          afterSlides: [
            { speaker: 'Engineer Pell', element: 'Geo', text: 'The engine is grounded. The signal escaped, but it left a clean trace in the restored forecast.' },
            { speaker: 'Veyra Stormglass', element: 'Electro', text: 'Then patience did not cost the trail. It made the trail honest enough to follow.' },
          ],
        },
        {
          optionId: 'pursue-signal',
          enemies: [
            { name: 'Signal Hunter', type: 'Elite', element: 'Electro', level: 24 },
          ],
          modifierId: 'pursued-signal',
          afterSlides: [
            { speaker: 'Unknown Signal', element: 'Electro', text: 'Still quick. Still certain. The broken engine counts the seconds behind you.' },
            { speaker: 'Veyra Stormglass', element: 'Electro', text: 'And I count them too. A necessary pursuit does not erase what I left others to repair.' },
          ],
        },
      ],
      memoryUnlockIds: ['veyra-arrow-between-seconds'],
    },
    'char-veyra-3': {
      id: 'char-veyra-3',
      chapter: 0,
      name: 'Eye of the Shattered Storm',
      location: 'Thunder Spires Storm Eye',
      backgroundId: 'veyra-memory',
      recommendedLevel: 38,
      difficulty: 'Boss',
      desc: 'Take aim at the flawless reflection that tells Veyra precision can excuse every consequence.',
      enemies: [
        { name: 'Veyra Stormglass Trial Boss', type: 'Boss', element: 'Electro', level: 38, bossType: 'thunderbird' },
      ],
      firstClearRewards: { gems: 500, mora: 40000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Stormglass Reflection', element: 'Electro', text: 'You hit the mark. Consequences belong to those who built too slowly around your brilliance.' },
        { speaker: 'Veyra Stormglass', element: 'Electro', text: 'Convenient. Also wrong. A shot includes the world it travels through, not only the point where it lands.' },
        { speaker: 'Engineer Pell', element: 'Geo', text: 'Then wait for the whole storm, archer. Choose the second you can answer for.' },
      ],
      afterSlides: [
        { speaker: 'Stormglass Reflection', element: 'Electro', text: 'Without flawless certainty, what makes you exceptional?' },
        { speaker: 'Veyra Stormglass', element: 'Electro', text: 'I can miss, learn, and take the next shot without lying about the last one.' },
        { speaker: 'Engineer Pell', element: 'Geo', text: 'Thunder has passed. For once, you listened to the silence after it.' },
      ],
      memoryUnlockIds: ['veyra-after-thunder'],
    },
  },
  memories: [
    {
      id: 'veyra-six-perfect-reflections',
      title: 'Six Perfect Reflections',
      sourceLabel: 'Veyra Character Story',
      location: 'Stormglass Calibration Walk',
      category: 'character',
      text: 'Six mirrors confirmed Veyra\'s calculation. The seventh disagreed by half a degree and redirected the fatal charge, becoming the only reflection she learned to trust completely.',
    },
    {
      id: 'veyra-arrow-between-seconds',
      title: 'The Arrow Between Seconds',
      sourceLabel: 'Veyra Character Story',
      location: 'Shattered Forecast Engine',
      category: 'character',
      text: 'Veyra\'s arrow crossed the observatory between warning and certainty. It struck its mark perfectly, proving that precision without patience can still open the wrong door.',
    },
    {
      id: 'veyra-after-thunder',
      title: 'After Thunder',
      sourceLabel: 'Veyra Character Story',
      location: 'Thunder Spires Storm Eye',
      category: 'character',
      text: 'After the last thunder faded, Veyra did not reach for another arrow. She listened to the damage, the repairs, and the people who had lived inside her line of fire.',
    },
  ],
} satisfies StoryCharacterPack;
