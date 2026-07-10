import type { ApiUserLevel } from "@/types/api";
import type { LevelProgressData } from "@/pages/mine/constants";

export const DEFAULT_USER_LEVEL: ApiUserLevel = {
  current: 1,
  title: "工坊学徒",
  totalXp: 0,
  xpCurrent: 0,
  xpTarget: 100,
  percent: 0,
  nextTitle: "见习工匠",
  xpToNextLevel: 100,
  usesToNextLevel: 20,
  hint: "再使用 20 次工具即可晋升「见习工匠」",
  isMaxLevel: false,
};

export function mapLevelToProgressData(level: ApiUserLevel): LevelProgressData {
  return {
    title: "当前等级进度",
    current: level.xpCurrent,
    total: level.xpTarget,
    percent: level.percent,
    hint: level.hint,
    showMedal: false,
  };
}
