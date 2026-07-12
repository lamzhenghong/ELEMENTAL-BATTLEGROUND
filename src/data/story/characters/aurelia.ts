import type { StoryCharacterPack } from '../types';

export const AURELIA_STORY_PACK = {
  characterId: 'aurelia',
  stages: {
    'char-aurelia-1': {
      id: 'char-aurelia-1',
      chapter: 0,
      name: 'The Unlit Watch',
      location: 'Sun Spindle Service Ring',
      backgroundId: 'aurelia-memory',
      recommendedLevel: 10,
      difficulty: 'Normal',
      desc: 'Return to the service ring where Aurelia first learned that vigilance matters most when nobody is watching.',
      enemies: [
        { name: 'Ashbound Relay Drone', type: 'Normal', element: 'Pyro', level: 10 },
      ],
      firstClearRewards: { gems: 150, mora: 10000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'The court remembers my first parade. I remember this midnight watch, when the Sun Spindle went dark below the banners.' },
        { speaker: 'Forge Worker Nima', element: 'Geo', text: 'We sent three alarms. The officers called it a relay fault and stayed at the feast.' },
        { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'I was still a cadet, but an oath does not wait for rank. Help me clear the ash from the relay.' },
      ],
      afterSlides: [
        { speaker: 'Forge Worker Nima', element: 'Geo', text: 'The lower furnaces have light again. No herald saw you come.' },
        { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'Good. Protection that needs applause has already forgotten whom it serves.' },
      ],
      memoryUnlockIds: ['aurelia-watch-without-witnesses'],
    },
    'char-aurelia-2': {
      id: 'char-aurelia-2',
      chapter: 0,
      name: 'Weight of the Oath',
      location: 'Blackglass Foundry',
      backgroundId: 'aurelia-memory',
      recommendedLevel: 24,
      difficulty: 'Normal',
      desc: 'Relive the order that forced Aurelia to choose between court command and workers trapped inside a sabotaged foundry.',
      enemies: [
        { name: 'Blackglass Saboteur', type: 'Elite', element: 'Pyro', level: 24 },
      ],
      firstClearRewards: { gems: 300, mora: 22000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Sun Court Marshal', element: 'Pyro', text: 'Cadet Sunflare, hold the ceremonial gate. The foundry crews are outside your assigned line.' },
        { speaker: 'Forge Worker Nima', element: 'Geo', text: 'The saboteur sealed twelve workers behind the glass vents. We cannot breathe much longer.' },
        { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'This was the moment I learned an oath can be quoted perfectly and still be used as a shield for cowardice.' },
      ],
      afterSlides: [
        { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'The record preserved the order. It did not preserve the voices behind the furnace door.' },
        { speaker: 'Forge Worker Nima', element: 'Geo', text: 'Then remember us now, and choose what your oath was meant to protect.' },
      ],
      decision: {
        id: 'aurelia-act-2-route',
        prompt: 'The court orders Aurelia to hold the gate while workers remain trapped. Which duty comes first?',
        options: [
          { id: 'protect-workers', label: 'Protect the workers', consequence: 'Enter the foundry with the workers guiding your route.' },
          { id: 'obey-command', label: 'Obey the command', consequence: 'Hold the gate and expose the court enforcer hiding the sabotage.' },
        ],
      },
      variants: [
        {
          optionId: 'protect-workers',
          enemies: [
            { name: 'Blackglass Saboteur', type: 'Elite', element: 'Pyro', level: 24 },
          ],
          modifierId: 'protected-workers',
          afterSlides: [
            { speaker: 'Forge Worker Nima', element: 'Geo', text: 'All twelve are out. You broke formation, but you kept the promise beneath it.' },
            { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'Then let the court mark my record. An oath is measured by the smallest life inside its protection.' },
          ],
        },
        {
          optionId: 'obey-command',
          enemies: [
            { name: 'Sun Court Enforcer', type: 'Elite', element: 'Pyro', level: 24 },
          ],
          modifierId: 'obeyed-command',
          afterSlides: [
            { speaker: 'Sun Court Marshal', element: 'Pyro', text: 'The enforcer carried the vent key. Holding the gate exposed the hand behind the order.' },
            { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'And cost the workers precious air. A lawful result does not make the delay weightless.' },
          ],
        },
      ],
      memoryUnlockIds: ['aurelia-oaths-smallest-line'],
    },
    'char-aurelia-3': {
      id: 'char-aurelia-3',
      chapter: 0,
      name: 'Dawn Without Applause',
      location: 'Crown of the Dawn Furnace',
      backgroundId: 'aurelia-memory',
      recommendedLevel: 38,
      difficulty: 'Boss',
      desc: 'Face the blazing ideal of Aurelia that values a flawless public victory above the quiet work of keeping people warm.',
      enemies: [
        { name: 'Aurelia Sunflare Trial Boss', type: 'Boss', element: 'Pyro', level: 38, bossType: 'fire_dragon' },
      ],
      firstClearRewards: { gems: 500, mora: 40000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Sunflare Reflection', element: 'Pyro', text: 'Stand where Solaris can see you. Glory is proof that the oath was fulfilled.' },
        { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'No. Glory is only the light that reaches the balcony. Duty is the warmth that reaches the lowest room.' },
        { speaker: 'Forge Worker Nima', element: 'Geo', text: 'The dawn furnace is waiting for your answer, not your title.' },
      ],
      afterSlides: [
        { speaker: 'Sunflare Reflection', element: 'Pyro', text: 'Without witnesses, who will name your sacrifice?' },
        { speaker: 'Aurelia Sunflare', element: 'Pyro', text: 'No one needs to. Let them wake warm and complain that dawn arrived too early.' },
        { speaker: 'Forge Worker Nima', element: 'Geo', text: 'Then the furnace knows its warden at last.' },
      ],
      memoryUnlockIds: ['aurelia-warmth-before-glory'],
    },
  },
  memories: [
    {
      id: 'aurelia-watch-without-witnesses',
      title: 'A Watch Without Witnesses',
      sourceLabel: 'Aurelia Character Story',
      location: 'Sun Spindle Service Ring',
      category: 'character',
      text: 'On an unrecorded midnight watch, a cadet relit the lower relay while the court celebrated above. Aurelia kept the soot on her gauntlet as proof that unseen duty still leaves a mark.',
    },
    {
      id: 'aurelia-oaths-smallest-line',
      title: "The Oath's Smallest Line",
      sourceLabel: 'Aurelia Character Story',
      location: 'Blackglass Foundry',
      category: 'character',
      text: 'The official oath filled a marble wall, but Aurelia found its meaning in one short promise from a trapped worker: do not leave the last person behind the furnace door.',
    },
    {
      id: 'aurelia-warmth-before-glory',
      title: 'Warmth Before Glory',
      sourceLabel: 'Aurelia Character Story',
      location: 'Crown of the Dawn Furnace',
      category: 'character',
      text: 'Aurelia chose a dawn with no heralds and no balcony salute. Far below, families woke to warm rooms, never knowing whose hands had kept the furnace burning.',
    },
  ],
} satisfies StoryCharacterPack;
