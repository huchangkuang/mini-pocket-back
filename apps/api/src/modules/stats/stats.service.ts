import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getShanghaiTodayDate } from '../../common/utils/date.util';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordToolUseDto } from './dto/record-tool-use.dto';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: number) {
    const [activeDaysCount, usedToolsCount, favoriteCount] = await Promise.all([
      this.prisma.userActiveDay.count({ where: { userId } }),
      this.prisma.userToolUsage.count({ where: { userId } }),
      this.prisma.userFavorite.count({ where: { userId } }),
    ]);

    return {
      activeDaysCount,
      usedToolsCount,
      favoriteCount,
    };
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

    const stats = await this.getUserStats(userId);

    return {
      recorded: !existing,
      stats,
    };
  }

  async recordToolUse(userId: number, dto: RecordToolUseDto) {
    const tool = await this.resolveTool(dto);

    const existing = await this.prisma.userToolUsage.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId: tool.id,
        },
      },
    });

    if (existing) {
      await this.prisma.userToolUsage.update({
        where: { id: existing.id },
        data: { lastUsedAt: new Date() },
      });
    } else {
      await this.prisma.userToolUsage.create({
        data: {
          userId,
          toolId: tool.id,
        },
      });
    }

    const stats = await this.getUserStats(userId);

    return {
      isNew: !existing,
      toolId: tool.id,
      stats,
    };
  }

  private async resolveTool(dto: RecordToolUseDto) {
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
