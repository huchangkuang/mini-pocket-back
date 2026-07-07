import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { formatHeatScore } from '../../common/utils/heat.util';
import { getShanghaiTodayDate } from '../../common/utils/date.util';
import { PrismaService } from '../../prisma/prisma.service';
import { LevelService } from '../level/level.service';
import {
  XP_DAILY_LIMIT_PER_TOOL,
  XP_FIRST_USE,
  XP_REPEAT_USE,
} from '../level/xp.constants';
import type { RecordToolUseInput } from './dto/record-tool-use.dto';

function isSameDate(a: Date | null | undefined, b: Date): boolean {
  if (!a) return false;
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly levelService: LevelService,
  ) {}

  async getUserStats(userId: number) {
    const [user, activeDaysCount, usedToolsCount, favoriteCount] =
      await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { totalXp: true },
        }),
        this.prisma.userActiveDay.count({ where: { userId } }),
        this.prisma.userToolUsage.count({ where: { userId } }),
        this.prisma.userFavorite.count({ where: { userId } }),
      ]);

    return {
      activeDaysCount,
      usedToolsCount,
      favoriteCount,
      totalXp: user?.totalXp ?? 0,
    };
  }

  async getUserStatsWithLevel(userId: number) {
    const stats = await this.getUserStats(userId);
    const level = await this.levelService.resolveLevel(stats.totalXp);
    return { stats, level };
  }

  async recordActiveDay(userId: number) {
    const activeDate = getShanghaiTodayDate();

    const existing = await this.prisma.userActiveDay.findUnique({
      where: {
        userId_activeDate: {
          userId,
          activeDate,
        },
      },
    });

    if (!existing) {
      await this.prisma.userActiveDay.create({
        data: {
          userId,
          activeDate,
        },
      });
    }

    const { stats, level } = await this.getUserStatsWithLevel(userId);

    return {
      recorded: !existing,
      stats,
      level,
    };
  }

  /** 打开工具：始终加热度；已登录时额外记录个人使用与 XP */
  async recordOpen(dto: RecordToolUseInput, userId?: number) {
    const tool = await this.resolveTool(dto);

    if (!userId) {
      const updatedTool = await this.prisma.tool.update({
        where: { id: tool.id },
        data: { heatScore: { increment: 1 } },
      });

      return {
        toolId: updatedTool.id,
        heatScore: updatedTool.heatScore,
        heat: formatHeatScore(updatedTool.heatScore),
      };
    }

    const today = getShanghaiTodayDate();

    return this.prisma.$transaction(async (tx) => {
      const updatedTool = await tx.tool.update({
        where: { id: tool.id },
        data: { heatScore: { increment: 1 } },
      });

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      const existing = await tx.userToolUsage.findUnique({
        where: {
          userId_toolId: {
            userId,
            toolId: tool.id,
          },
        },
      });

      const isFirstEver = !existing;
      const dailyCountBefore =
        existing && isSameDate(existing.dailyUseDate, today)
          ? existing.dailyUseCount
          : 0;

      let xpGained = 0;
      if (dailyCountBefore < XP_DAILY_LIMIT_PER_TOOL) {
        xpGained = isFirstEver ? XP_FIRST_USE : XP_REPEAT_USE;
      }

      const previousTotalXp = user.totalXp;
      const newTotalXp = previousTotalXp + xpGained;

      if (isFirstEver) {
        await tx.userToolUsage.create({
          data: {
            userId,
            toolId: tool.id,
            dailyUseCount: xpGained > 0 ? 1 : 0,
            dailyUseDate: today,
          },
        });
      } else if (existing) {
        const nextDailyCount =
          xpGained > 0 ? dailyCountBefore + 1 : dailyCountBefore;

        await tx.userToolUsage.update({
          where: { id: existing.id },
          data: {
            dailyUseCount: nextDailyCount,
            dailyUseDate: today,
            lastUsedAt: new Date(),
          },
        });
      }

      if (xpGained > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { totalXp: newTotalXp },
        });
      }

      const previousLevel =
        await this.levelService.resolveLevel(previousTotalXp);
      const currentLevel = await this.levelService.resolveLevel(newTotalXp);
      const leveledUp =
        xpGained > 0 && currentLevel.current > previousLevel.current;

      const [activeDaysCount, usedToolsCount, favoriteCount] =
        await Promise.all([
          tx.userActiveDay.count({ where: { userId } }),
          tx.userToolUsage.count({ where: { userId } }),
          tx.userFavorite.count({ where: { userId } }),
        ]);

      return {
        toolId: updatedTool.id,
        heatScore: updatedTool.heatScore,
        heat: formatHeatScore(updatedTool.heatScore),
        isNew: isFirstEver,
        xpGained,
        leveledUp,
        newTitle: leveledUp ? currentLevel.title : null,
        stats: {
          activeDaysCount,
          usedToolsCount,
          favoriteCount,
          totalXp: newTotalXp,
        },
        level: currentLevel,
      };
    });
  }

  private async resolveTool(dto: RecordToolUseInput) {
    if (!dto.toolId && !dto.routePath) {
      throw new BadRequestException('toolId 或 routePath 必须提供一个');
    }

    const where: Prisma.ToolWhereInput = dto.toolId
      ? { id: dto.toolId, enabled: true }
      : { routePath: dto.routePath, enabled: true };

    const tool = await this.prisma.tool.findFirst({ where });

    if (!tool) {
      throw new NotFoundException('工具不存在');
    }

    return tool;
  }
}
