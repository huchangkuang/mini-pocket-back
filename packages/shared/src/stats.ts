import type { ApiUserProfile } from "./auth";

export type ApiUserStats = {
  activeDaysCount: number;
  usedToolsCount: number;
  favoriteCount: number;
  totalXp: number;
};

export type ApiUserLevel = {
  current: number;
  title: string;
  totalXp: number;
  xpCurrent: number;
  xpTarget: number;
  percent: number;
  nextTitle: string | null;
  xpToNextLevel: number;
  usesToNextLevel: number;
  hint: string;
  isMaxLevel: boolean;
};

export type ApiLevelConfig = {
  level: number;
  minXp: number;
  title: string;
};

export type ApiUserMe = ApiUserProfile & {
  stats: ApiUserStats;
  level: ApiUserLevel;
};

export type ApiRecordActiveDayResult = {
  recorded: boolean;
  stats: ApiUserStats;
  level: ApiUserLevel;
};

export type ApiRecordToolUseResult = {
  isNew: boolean;
  toolId: number;
  xpGained: number;
  leveledUp: boolean;
  newTitle: string | null;
  stats: ApiUserStats;
  level: ApiUserLevel;
  heatScore?: number;
  heat?: string;
};
