export type CombatSessionContext =
  | { mode: 'endless-arena'; wave: number; bestWave: number }
  | { mode: 'artifact-grind'; wave: number; bestWave: number }
  | { mode: 'story-campaign'; stageId: string; bestClearSecs?: number }
  | {
      mode: 'character-story';
      stageId: string;
      characterName: string;
      act: number;
      bestClearSecs?: number;
    }
  | {
      mode: 'rogue-ruins';
      room: number;
      roomCount: number;
      roomType: 'battle' | 'elite' | 'boss';
      deepestRoom: number;
      fastestClearSecs?: number;
    };

export interface CombatSessionPresentation {
  eyebrow: string;
  progressLabel: string;
  deploymentLabel: string;
  pauseLabel: string;
  resultLabel: string;
  recordLabel: string;
  recordValue: string;
}

const clampInteger = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const formatRecordTime = (seconds: number | undefined): string => (
  Number.isFinite(seconds) && seconds !== undefined && seconds > 0
    ? formatCombatDuration(seconds)
    : 'NO RECORD'
);

const parseCampaignStage = (stageId: string): string => {
  const match = /^(\d+)-(\d+)$/.exec(stageId);
  if (!match) return stageId.toUpperCase();
  return `CHAPTER ${clampInteger(Number(match[1]))} - STAGE ${clampInteger(Number(match[2]))}`;
};

const formatWave = (wave: number): string => `WAVE ${clampInteger(wave)}`;

export const formatCombatDuration = (seconds: number): string => {
  const wholeSeconds = clampInteger(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

export const getImprovedClearTime = (
  previous: number | undefined,
  candidate: number,
): number | undefined => {
  const next = clampInteger(candidate);
  if (next <= 0 || (previous !== undefined && previous > 0 && next >= previous)) return undefined;
  return next;
};

export const getStoryElapsedSeconds = (
  startedAt: number | null,
  endedAt: number = Date.now(),
): number => {
  if (startedAt === null || !Number.isFinite(startedAt) || !Number.isFinite(endedAt) || endedAt < startedAt) {
    return 0;
  }
  return Math.floor((endedAt - startedAt) / 1000);
};

export const getCombatSessionPresentation = (
  context: CombatSessionContext,
): CombatSessionPresentation => {
  switch (context.mode) {
    case 'endless-arena': {
      const progress = formatWave(context.wave);
      return {
        eyebrow: 'ENDLESS ARENA',
        progressLabel: progress,
        deploymentLabel: `ENDLESS ARENA - ${progress}`,
        pauseLabel: progress,
        resultLabel: progress,
        recordLabel: 'HIGHEST WAVE',
        recordValue: formatWave(context.bestWave),
      };
    }
    case 'artifact-grind': {
      const progress = formatWave(context.wave);
      return {
        eyebrow: 'ARTIFACT GRIND',
        progressLabel: progress,
        deploymentLabel: `ARTIFACT GRIND - ${progress}`,
        pauseLabel: progress,
        resultLabel: progress,
        recordLabel: 'HIGHEST GRIND WAVE',
        recordValue: formatWave(context.bestWave),
      };
    }
    case 'story-campaign': {
      const stage = parseCampaignStage(context.stageId);
      return {
        eyebrow: 'STORY CAMPAIGN',
        progressLabel: stage,
        deploymentLabel: `STORY CAMPAIGN - ${stage}`,
        pauseLabel: stage,
        resultLabel: `STAGE ${context.stageId.toUpperCase()}`,
        recordLabel: 'FASTEST CLEAR',
        recordValue: formatRecordTime(context.bestClearSecs),
      };
    }
    case 'character-story': {
      const character = context.characterName.toUpperCase();
      const act = `ACT ${clampInteger(context.act)}`;
      return {
        eyebrow: 'CHARACTER STORY',
        progressLabel: act,
        deploymentLabel: `CHARACTER STORY - ${character} - ${act}`,
        pauseLabel: `${character} - ${act}`,
        resultLabel: `${character} - ${act}`,
        recordLabel: 'FASTEST CLEAR',
        recordValue: formatRecordTime(context.bestClearSecs),
      };
    }
    case 'rogue-ruins': {
      const progress = `ROOM ${clampInteger(context.room)}/${clampInteger(context.roomCount)} - ${context.roomType.toUpperCase()}`;
      const completedRun = Number.isFinite(context.fastestClearSecs) && context.fastestClearSecs > 0;
      return {
        eyebrow: 'ROGUE RUINS',
        progressLabel: progress,
        deploymentLabel: `ROGUE RUINS - ${progress}`,
        pauseLabel: progress,
        resultLabel: progress,
        recordLabel: completedRun ? 'FASTEST RUN' : 'DEEPEST ROOM',
        recordValue: completedRun
          ? formatRecordTime(context.fastestClearSecs)
          : `ROOM ${clampInteger(context.deepestRoom)}`,
      };
    }
  }
};
