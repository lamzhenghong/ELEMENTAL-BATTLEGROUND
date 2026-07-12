import type { StoryCharacterPack } from '../types';

export const MAELIS_STORY_PACK = {
  characterId: 'maelis',
  stages: {
    'char-maelis-1': {
      id: 'char-maelis-1',
      chapter: 0,
      name: 'Sap and Scripture',
      location: 'First-Speaking Grove',
      backgroundId: 'maelis-memory',
      recommendedLevel: 10,
      difficulty: 'Normal',
      desc: 'Enter the living archive where Maelis first heard a tree speak through sap-written memories.',
      enemies: [
        { name: 'Blighted Sapling', type: 'Normal', element: 'Dendro', level: 10 },
      ],
      firstClearRewards: { gems: 150, mora: 10000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'This cedar was the first tree to speak my name. Its sap wrote each syllable across my palm.' },
        { speaker: 'Archivist Eryn', element: 'Dendro', text: 'The elders said you imagined it. Trees were records, they insisted, never voices.' },
        { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'A record is a voice someone agreed to hear. The blight is choking this one before it can finish.' },
      ],
      afterSlides: [
        { speaker: 'Archivist Eryn', element: 'Dendro', text: 'The new sap line says only: listen closer.' },
        { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'It was never asking me to speak for the forest. It was teaching me how not to speak over it.' },
      ],
      memoryUnlockIds: ['maelis-tree-spoke-first'],
    },
    'char-maelis-2': {
      id: 'char-maelis-2',
      chapter: 0,
      name: 'The Page He Cannot Keep',
      location: 'Blackroot Archive Ring',
      backgroundId: 'maelis-memory',
      recommendedLevel: 24,
      difficulty: 'Normal',
      desc: 'Confront a poisoned archive page that holds the last memory of Maelis\'s vanished guardian line.',
      enemies: [
        { name: 'Blackroot Archivist', type: 'Elite', element: 'Dendro', level: 24 },
      ],
      firstClearRewards: { gems: 300, mora: 22000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Archivist Eryn', element: 'Dendro', text: 'The black sap reached your family ring. We can preserve the page, but the poison may follow its roots.' },
        { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'It contains my mother\'s last walk through the canopy. Pruning it would save trees that never knew her.' },
        { speaker: 'Memory of Liora', element: 'Dendro', text: 'My son, no memory should demand that the living become its soil.' },
      ],
      afterSlides: [
        { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'I spent years believing love meant keeping every page unchanged.' },
        { speaker: 'Archivist Eryn', element: 'Dendro', text: 'Love may also be the courage to choose what the archive becomes next.' },
      ],
      decision: {
        id: 'maelis-act-2-route',
        prompt: 'The poisoned page holds Maelis\'s final family memory. What should happen to it?',
        options: [
          { id: 'preserve-memory', label: 'Preserve the memory', consequence: 'Isolate the page and defend its remembered path.' },
          { id: 'prune-memory', label: 'Prune the memory', consequence: 'Cut away the infected ring before the blight spreads.' },
        ],
      },
      variants: [
        {
          optionId: 'preserve-memory',
          enemies: [
            { name: 'Blackroot Archivist', type: 'Elite', element: 'Dendro', level: 24 },
          ],
          modifierId: 'preserved-memory',
          afterSlides: [
            { speaker: 'Archivist Eryn', element: 'Dendro', text: 'The page is sealed in living amber. Its roots can no longer reach the grove.' },
            { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'I can visit without asking the whole forest to carry my grief. That boundary is part of remembering.' },
          ],
        },
        {
          optionId: 'prune-memory',
          enemies: [
            { name: 'Hollow Ring Custodian', type: 'Elite', element: 'Dendro', level: 24 },
          ],
          modifierId: 'pruned-memory',
          afterSlides: [
            { speaker: 'Memory of Liora', element: 'Dendro', text: 'A farewell is not an erasure. It is a door left open toward tomorrow.' },
            { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'The page is gone, but her lesson remains alive in the space it protected.' },
          ],
        },
      ],
      memoryUnlockIds: ['maelis-page-black-sap'],
    },
    'char-maelis-3': {
      id: 'char-maelis-3',
      chapter: 0,
      name: 'Heartwood Farewell',
      location: 'Verdantveil Heartwood',
      backgroundId: 'maelis-memory',
      recommendedLevel: 38,
      difficulty: 'Boss',
      desc: 'Face the guardian shape grown from Maelis\'s fear that every new leaf betrays the memories that fell before it.',
      enemies: [
        { name: 'Maelis Verdantveil Trial Boss', type: 'Boss', element: 'Dendro', level: 38, bossType: 'fire_dragon' },
      ],
      firstClearRewards: { gems: 500, mora: 40000, charXp: 0 },
      beforeSlides: [
        { speaker: 'Heartwood Reflection', element: 'Dendro', text: 'Guard every ring. Let no new root disturb what the vanished entrusted to you.' },
        { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'An archive with no room to grow is only a beautiful tomb.' },
        { speaker: 'Memory of Liora', element: 'Dendro', text: 'The canopy does not betray a fallen leaf by opening again to sunlight.' },
      ],
      afterSlides: [
        { speaker: 'Heartwood Reflection', element: 'Dendro', text: 'If you release us, what remains of your line?' },
        { speaker: 'Maelis Verdantveil', element: 'Dendro', text: 'What I choose to nurture. Inheritance is not a chain of pages; it is room made for new leaves.' },
        { speaker: 'Archivist Eryn', element: 'Dendro', text: 'The heartwood is opening. The first green shoot belongs to no old record.' },
      ],
      memoryUnlockIds: ['maelis-room-new-leaves'],
    },
  },
  memories: [
    {
      id: 'maelis-tree-spoke-first',
      title: 'The Tree That Spoke First',
      sourceLabel: 'Maelis Character Story',
      location: 'First-Speaking Grove',
      category: 'character',
      text: 'A cedar wrote Maelis\'s name in a ribbon of bright sap. He later understood that the miracle was not a tree learning speech, but a sheltered child learning to listen.',
    },
    {
      id: 'maelis-page-black-sap',
      title: 'A Page in Black Sap',
      sourceLabel: 'Maelis Character Story',
      location: 'Blackroot Archive Ring',
      category: 'character',
      text: 'The last memory of Liora Verdantveil darkened as poison entered its roots. Her final message asked that no beloved past be preserved at the cost of a living forest.',
    },
    {
      id: 'maelis-room-new-leaves',
      title: 'Room for New Leaves',
      sourceLabel: 'Maelis Character Story',
      location: 'Verdantveil Heartwood',
      category: 'character',
      text: 'When the sealed canopy opened, an unnamed shoot rose through the old archive floor. Maelis left its first leaf blank so another life could write there freely.',
    },
  ],
} satisfies StoryCharacterPack;
