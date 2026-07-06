import { Injectable } from '@nestjs/common';
import { LevelConfig } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { XP_REPEAT_USE } from './xp.constants';

export type UserLevelInfo = {
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

@Injectable()
export class LevelService {
  private levelsCache: LevelConfig[] | null = null;
  private levelsCacheAt = 0;
  private readonly cacheTtlMs = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  async getLevelConfigs(): Promise<LevelConfig[]> {
    const now = Date.now();
    if (this.levelsCache && now - this.levelsCacheAt < this.cacheTtlMs) {
      return this.levelsCache;
    }

    const levels = await this.prisma.levelConfig.findMany({
      orderBy: { minXp: 'asc' },
    });
    this.levelsCache = levels;
    this.levelsCacheAt = now;
    return levels;
  }

  async resolveLevel(totalXp: number): Promise<UserLevelInfo> {
    const levels = await this.getLevelConfigs();
    if (levels.length === 0) {
      return this.fallbackLevel(totalXp);
    }

    let current = levels[0];
    for (const level of levels) {
      if (totalXp >= level.minXp) {
        current = level;
      } else {
        break;
      }
    }

    const currentIndex = levels.findIndex((item) => item.level === current.level);
    const next = currentIndex >= 0 ? levels[currentIndex + 1] : undefined;
    const isMaxLevel = !next;

    if (isMaxLevel) {
      return {
        current: current.level,
        title: current.title,
        totalXp,
        xpCurrent: totalXp,
        xpTarget: totalXp,
        percent: 100,
        nextTitle: null,
        xpToNextLevel: 0,
        usesToNextLevel: 0,
        hint: `已达最高等级「${current.title}」`,
        isMaxLevel: true,
      };
    }

    const xpToNextLevel = next.minXp - totalXp;
    const usesToNextLevel = Math.ceil(xpToNextLevel / XP_REPEAT_USE);
    const percent = Math.min(100, Math.floor((totalXp / next.minXp) * 100));

    return {
      current: current.level,
      title: current.title,
      totalXp,
      xpCurrent: totalXp,
      xpTarget: next.minXp,
      percent,
      nextTitle: next.title,
      xpToNextLevel,
      usesToNextLevel,
      hint: `再使用 ${usesToNextLevel} 次工具即可晋升「${next.title}」`,
      isMaxLevel: false,
    };
  }

  private fallbackLevel(totalXp: number): UserLevelInfo {
    return {
      current: 1,
      title: '工坊学徒',
      totalXp,
      xpCurrent: totalXp,
      xpTarget: totalXp,
      percent: 0,
      nextTitle: null,
      xpToNextLevel: 0,
      usesToNextLevel: 0,
      hint: '等级配置未初始化',
      isMaxLevel: true,
    };
  }
}
