import type { ElementType } from '../../types';
import type {
  CampaignBossMechanicId,
  StoryEnemySpec,
} from './types';

export type CampaignBossStageId =
  | '1-5'
  | '2-5'
  | '3-5'
  | '4-5'
  | '5-5'
  | '6-5'
  | '7-5'
  | '8-5'
  | '9-5'
  | '10-5';

export interface CampaignBossDefinition {
  stageId: CampaignBossStageId;
  identityId: string;
  name: string;
  element: ElementType;
  legacyBossType: NonNullable<StoryEnemySpec['bossType']>;
  campaignMechanicId?: CampaignBossMechanicId;
  skillName: string;
  mechanic: string;
  counter: string;
}

export const CAMPAIGN_BOSSES = {
  '1-5': {
    stageId: '1-5',
    identityId: 'campaign-calamity-pyro-dragon',
    name: 'Calamity Pyro Dragon',
    element: 'Pyro',
    legacyBossType: 'fire_dragon',
    skillName: 'Ruins Core Calamity',
    mechanic: 'Launches aimed fireballs. Phase II ignites persistent arena patches, and Phase III calls delayed meteors onto the player.',
    counter: 'Keep moving, leave burning zones immediately, and dash out of every meteor marker before it closes.',
  },
  '2-5': {
    stageId: '2-5',
    identityId: 'campaign-glacial-frost-golem',
    name: 'Glacial Frost Golem',
    element: 'Cryo',
    legacyBossType: 'ice_golem',
    skillName: 'Absolute Zero Lens',
    mechanic: 'Fires a three-shard spread. Phase II creates slowing blizzard fields, and Phase III surrounds itself with a damaging Frozen Tomb aura.',
    counter: 'Sidestep the shard fan, avoid pale ice fields, and fight outside the final close-range aura.',
  },
  '3-5': {
    stageId: '3-5',
    identityId: 'campaign-tempest-thunderbird',
    name: 'Tempest Thunderbird',
    element: 'Electro',
    legacyBossType: 'thunderbird',
    skillName: 'Summit Storm Matrix',
    mechanic: 'Marks the player for lightning strikes. Phase II forms a three-point lightning wall, and Phase III calls rapid repeated bolts.',
    counter: 'Move as soon as a marker appears, preserve Dash for grouped warnings, and never stand still during the final phase.',
  },
  '4-5': {
    stageId: '4-5',
    identityId: 'campaign-void-overlord',
    name: "Nhal'Kyr, Warden of Whispers",
    element: 'Cryo',
    legacyBossType: 'ice_golem',
    campaignMechanicId: 'sepulchral-silence',
    skillName: 'Sepulchral Silence',
    mechanic: 'Releases memory shards through one escape gap, closes silence rings around the player, and awakens a final frozen-heart pulse.',
    counter: 'Read the shard gap, cross the closing ring before impact, and keep away from the frozen heart during its pulse.',
  },
  '5-5': {
    stageId: '5-5',
    identityId: 'campaign-eternity-knight',
    name: 'Aevum, Knight of the Last Vow',
    element: 'Electro',
    legacyBossType: 'thunderbird',
    campaignMechanicId: 'vowclock-edict',
    skillName: 'Vowclock Edict',
    mechanic: 'Draws crossing clock-hand strikes, repeats attacks at recorded positions, and accelerates the vow-clock sequence in its final phase.',
    counter: 'Move diagonally away from the clock hands, leave recorded positions, and avoid doubling back during the final sequence.',
  },
  '6-5': {
    stageId: '6-5',
    identityId: 'campaign-frostfire-wyrm',
    name: 'Rimeflare, Wyrm of Two Seasons',
    element: 'Anemo',
    legacyBossType: 'fire_dragon',
    campaignMechanicId: 'seasonal-convergence',
    skillName: 'Seasonal Convergence',
    mechanic: 'Alternates Flame and Frost attacks, leaves opposing seasonal zones, then combines a meteor with a Frost shard fan.',
    counter: 'Read the active season by color, avoid overlapping zones, and preserve Dash for the combined final attack.',
  },
  '7-5': {
    stageId: '7-5',
    identityId: 'campaign-skyward-avian',
    name: 'Aureolith, the Crownless Skywarden',
    element: 'Geo',
    legacyBossType: 'ice_golem',
    campaignMechanicId: 'seven-anchor-dominion',
    skillName: 'Seven-Anchor Dominion',
    mechanic: 'Drops anchor formations around the player, pulls targets toward its center, and collapses the final sky-anchor pattern.',
    counter: 'Exit through the formation gap, move against the pull early, and never wait inside the final anchor pattern.',
  },
  '8-5': {
    stageId: '8-5',
    identityId: 'campaign-molten-overlord',
    name: 'Verdigris, Root of the First Command',
    element: 'Dendro',
    legacyBossType: 'thunderbird',
    campaignMechanicId: 'worldforge-root',
    skillName: 'Worldforge Root',
    mechanic: 'Closes root cages, grows persistent command zones, and chains worldforge eruptions toward the player.',
    counter: 'Leave each cage before it closes, rotate away from rooted ground, and move sideways across eruption chains.',
  },
  '9-5': {
    stageId: '9-5',
    identityId: 'campaign-chronos-monarch',
    name: 'Solvane, Monarch of the Final Second',
    element: 'Pyro',
    legacyBossType: 'fire_dragon',
    campaignMechanicId: 'one-perfect-second',
    skillName: 'One Perfect Second',
    mechanic: 'Records recent movement and strikes those afterimages, adds a clockface barrage, then repeats the sequence faster.',
    counter: 'Avoid retracing your route, cross between clockface markers, and keep a continuous path in the final phase.',
  },
  '10-5': {
    stageId: '10-5',
    identityId: 'campaign-eldric-core-prime',
    name: 'Orison Prime, Keeper of the Empty Throne',
    element: 'Hydro',
    legacyBossType: 'ice_golem',
    campaignMechanicId: 'sevenfold-convergence',
    skillName: 'Sevenfold Convergence',
    mechanic: 'Sequences seven elemental orbit strikes, collapses orbit rings inward, and combines every warning into a final convergence.',
    counter: 'Follow the strike order, cross orbit rings before they collapse, and save Dash for the sevenfold convergence.',
  },
} as const satisfies Readonly<Record<CampaignBossStageId, CampaignBossDefinition>>;

export const getCampaignBossForStage = (stageId: string): CampaignBossDefinition | undefined =>
  CAMPAIGN_BOSSES[stageId as CampaignBossStageId];

export const createCampaignBossEnemySpec = (
  stageId: CampaignBossStageId,
  level: number
): StoryEnemySpec => {
  const boss: CampaignBossDefinition = CAMPAIGN_BOSSES[stageId];
  return {
    name: boss.name,
    type: 'Boss',
    element: boss.element,
    level,
    bossType: boss.legacyBossType,
    campaignMechanicId: boss.campaignMechanicId,
  };
};
